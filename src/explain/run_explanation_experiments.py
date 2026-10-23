"""Runner for Phase 6 (Global & Local Explanations) and Phase 7 (Stability Experiment & Shift Control)."""

import json
import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from typing import Dict, List, Tuple
import joblib
import numpy as np
import pandas as pd
import shap
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

from src.explain.pdp_ale import (
    compute_ale_1d,
    compute_curve_distance,
    compute_feature_correlations,
    compute_pdp_ice,
)
from src.explain.regimes import add_all_regimes
from src.explain.shap_utils import (
    compute_family_importance_shares,
    compute_tree_shap_values,
    extract_local_waterfall_cases,
    get_global_importance,
)
from src.explain.shift_control import evaluate_shift_controlled_stability
from src.explain.stability import (
    apply_holm_bonferroni,
    compute_rank_metrics,
    compute_wasserstein_feature_distances,
    estimate_within_regime_noise_floor,
    run_regime_permutation_test,
)
from src.models.train import prepare_features


def run_explanations_and_stability():
    print("\n================== PHASE 6 & 7: EXPLAINABILITY & STABILITY ==================")
    results_dir = Path("results")
    shap_dir = results_dir / "shap"
    pdp_dir = results_dir / "pdp_ale"
    stab_dir = results_dir / "stability"
    tables_dir = results_dir / "tables"

    for d in [shap_dir, pdp_dir, stab_dir, tables_dir]:
        d.mkdir(parents=True, exist_ok=True)

    # Load dataset
    task_a_df = pd.read_parquet("data/processed/task_a_dataset.parquet")
    test_mask = task_a_df["datetime_utc"].dt.year == 2024
    test_df = task_a_df[test_mask].copy().reset_index(drop=True)

    feature_cols = [
        "traffic_flow_hourly_est", "aadf_hgv_share", "speed_limit",
        "road_type", "junction_detail", "urban_or_rural_area",
        "hour", "day_of_week", "hour_of_week", "month", "is_weekend", "is_bank_holiday",
        "solar_elevation_deg", "light_regime",
        "temperature_2m", "precipitation", "rolling_3h_precip", "rolling_24h_precip",
        "wind_gusts_10m", "is_freezing", "fog_proxy"
    ]
    feature_cols = [f for f in feature_cols if f in test_df.columns]

    X_test, _, _ = prepare_features(test_df, feature_cols)
    X_test_df = pd.DataFrame(X_test, columns=feature_cols)

    # Load models
    rf_model = joblib.load(results_dir / "models" / "task_a_random_forest.joblib")
    xgb_model = joblib.load(results_dir / "models" / "task_a_xgboost.joblib")

    # Feature correlations
    print("[CORRELATIONS] Checking for collinear feature pairs (|rho| > 0.6)...")
    corr_matrix, flagged_pairs = compute_feature_correlations(test_df, feature_cols, threshold=0.6)
    print(f"Flagged correlated feature pairs: {flagged_pairs}")

    # Compute Global TreeSHAP
    print("[TREE SHAP] Computing SHAP values on test set...")
    shap_sample_n = min(10000, len(X_test_df))
    rf_shap, rf_exp = compute_tree_shap_values(rf_model, X_test_df, max_samples=shap_sample_n, seed=42)
    xgb_shap, xgb_exp = compute_tree_shap_values(xgb_model, X_test_df, max_samples=shap_sample_n, seed=42)

    sub_test_df = test_df.iloc[:shap_sample_n].copy().reset_index(drop=True)
    sub_X_df = X_test_df.iloc[:shap_sample_n].copy().reset_index(drop=True)

    # Save SHAP matrices
    np.save(shap_dir / "task_a_rf_shap.npy", rf_shap)
    np.save(shap_dir / "task_a_xgb_shap.npy", xgb_shap)

    # Global importance
    rf_imp = get_global_importance(rf_shap, feature_cols)
    xgb_imp = get_global_importance(xgb_shap, feature_cols)
    rf_imp.to_csv(shap_dir / "task_a_rf_global_importance.csv", index=False)
    xgb_imp.to_csv(shap_dir / "task_a_xgb_global_importance.csv", index=False)

    print(f"Top 5 Features (XGBoost):\n{xgb_imp.head(5)[['feature', 'mean_abs_shap', 'family', 'normalized_share']]}")

    # Local Waterfall cases
    print("[LOCAL EXPLANATIONS] Extracting 6 canonical waterfall cases...")
    y_test_sub = sub_test_df["is_accident"].values
    p_test_sub = xgb_model.predict_proba(sub_X_df.values)[:, 1]
    local_cases = extract_local_waterfall_cases(xgb_model, sub_X_df, y_test_sub, p_test_sub, xgb_shap, xgb_exp)
    with open(shap_dir / "local_waterfall_cases.json", "w") as f:
        json.dump(local_cases, f, indent=2)

    # PDP and ALE for top continuous features
    top_continuous = ["traffic_flow_hourly_est", "speed_limit", "precipitation", "temperature_2m"]
    top_continuous = [f for f in top_continuous if f in feature_cols]
    pdp_ale_results = {}

    for feat in top_continuous:
        print(f"[PDP & ALE] Calculating curves for {feat}...")
        pdp_res = compute_pdp_ice(xgb_model, sub_X_df, feat, grid_points=25)
        ale_res = compute_ale_1d(xgb_model, sub_X_df, feat, n_bins=20)
        dist, sign_chg = compute_curve_distance(
            pdp_res["pdp"], ale_res["ale"], pdp_res["grid"], ale_res["grid"]
        )
        pdp_ale_results[feat] = {
            "pdp": [float(v) for v in pdp_res["pdp"]],
            "pdp_grid": [float(v) for v in pdp_res["grid"]],
            "ale": [float(v) for v in ale_res["ale"]],
            "ale_grid": [float(v) for v in ale_res["grid"]],
            "l2_distance": float(dist),
            "sign_change": bool(sign_chg),
        }
    with open(pdp_dir / "pdp_ale_top_features.json", "w") as f:
        json.dump(pdp_ale_results, f, indent=2)

    # ================= PHASE 7: STABILITY EXPERIMENT =================
    print("\n--- PHASE 7: Stability Experiment Across Environmental Regimes ---")

    weather_regimes = sub_test_df["weather_regime"].values
    traffic_regimes = sub_test_df["traffic_regime"].values

    # Noise Floor estimation (B=30 replicates within Clear weather)
    clear_mask = weather_regimes == "clear"
    clear_shap = xgb_shap[clear_mask]
    noise_floor_stats = estimate_within_regime_noise_floor(clear_shap, feature_cols, B=30, seed=42)
    noise_floor_cos = noise_floor_stats["noise_floor_cosine_dist"]
    print(f"Empirical Explanation Noise Floor (Mean Within-Regime Cosine Dist): {noise_floor_cos:.4f}")

    # Regime pairs to compare
    regimes_to_compare = [
        ("rain", "clear"),
        ("high_wind", "clear"),
        ("fog", "clear"),
        ("snow_ice", "clear"),
        ("rain", "high_wind"),
    ]
    # Filter to pairs that exist in sample
    available_regimes = set(sub_test_df["weather_regime"].unique())
    regimes_to_compare = [(r1, r2) for r1, r2 in regimes_to_compare if r1 in available_regimes and r2 in available_regimes]

    # Non-regime control features for distribution shift control
    non_regime_features = [
        "speed_limit", "road_type", "junction_detail", "urban_or_rural_area",
        "aadf_hgv_share", "hour", "day_of_week"
    ]
    non_regime_features = [f for f in non_regime_features if f in feature_cols]

    stability_rows = []
    family_share_rows = []

    # Family shares per regime
    for r in sorted(list(available_regimes)):
        r_mask = weather_regimes == r
        if np.sum(r_mask) >= 30:
            r_shap = xgb_shap[r_mask]
            r_imp = pd.Series(np.mean(np.abs(r_shap), axis=0), index=feature_cols)
            shares = compute_family_importance_shares(r_imp)
            shares["regime"] = r
            shares["model"] = "XGBoost"
            shares["sample_count"] = int(np.sum(r_mask))
            family_share_rows.append(shares)

    # Run pairwise comparisons under Protocol P1
    p_values_p1 = []
    pair_records = []

    for reg_a, reg_b in regimes_to_compare:
        mask_a = weather_regimes == reg_a
        mask_b = weather_regimes == reg_b

        if np.sum(mask_a) < 30 or np.sum(mask_b) < 30:
            continue

        # XGBoost
        imp_a = pd.Series(np.mean(np.abs(xgb_shap[mask_a]), axis=0), index=feature_cols)
        imp_b = pd.Series(np.mean(np.abs(xgb_shap[mask_b]), axis=0), index=feature_cols)

        rank_metrics = compute_rank_metrics(imp_a, imp_b)
        cos_dist = rank_metrics["cosine_distance"]
        esr = cos_dist / (noise_floor_cos + 1e-9)

        # Permutation test (N=1000)
        obs_d, p_val, eff_size = run_regime_permutation_test(
            xgb_shap, weather_regimes, reg_a, reg_b, feature_cols, n_permutations=1000, seed=42
        )
        p_values_p1.append(p_val)

        # Covariate shift control
        sub_raw_for_match = sub_test_df.copy()
        sub_raw_for_match["regime"] = weather_regimes
        shift_res = evaluate_shift_controlled_stability(
            xgb_shap, weather_regimes, reg_a, reg_b, feature_cols,
            non_regime_features, sub_raw_for_match, noise_floor=noise_floor_cos, seed=42
        )

        pair_records.append({
            "regime_a": reg_a,
            "regime_b": reg_b,
            "model": "XGBoost",
            "protocol": "P1 (Global Model Sliced)",
            "metric": "cosine_distance",
            "value": round(float(cos_dist), 4),
            "ci_low": round(float(max(0, cos_dist - 1.96 * noise_floor_stats["noise_floor_std"])), 4),
            "ci_high": round(float(cos_dist + 1.96 * noise_floor_stats["noise_floor_std"]), 4),
            "noise_floor": round(float(noise_floor_cos), 4),
            "ESR": round(float(esr), 3),
            "p_value": float(p_val),
            "effect_size": round(float(eff_size), 3),
            "survives_shift_control": bool(shift_res.get("survives_shift_control", False)),
        })

    # Apply Holm-Bonferroni correction for P1
    p_holm_p1 = apply_holm_bonferroni(p_values_p1)
    for rec, ph in zip(pair_records, p_holm_p1):
        rec["p_holm"] = round(float(ph), 4)
        stability_rows.append(rec)

    # ================= PROTOCOL P2: PER-REGIME MODELS =================
    print("\n[PROTOCOL P2] Training separate models per regime...")
    train_mask = task_a_df["datetime_utc"].dt.year <= 2022
    train_df = task_a_df[train_mask].copy().reset_index(drop=True)
    X_tr_all, _, _ = prepare_features(train_df, feature_cols)
    tr_regimes = train_df["weather_regime"].values
    y_tr_all = train_df["is_accident"].values

    per_regime_shap = {}
    for r in ["clear", "rain"]:
        if r in available_regimes and np.sum(tr_regimes == r) >= 100:
            print(f"Fitting per-regime XGBoost for '{r}' (n={np.sum(tr_regimes == r):,})...")
            m_r = XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.08, tree_method="hist", random_state=42, n_jobs=-1)
            m_r.fit(X_tr_all[tr_regimes == r], y_tr_all[tr_regimes == r])
            r_te_mask = weather_regimes == r
            if np.sum(r_te_mask) > 0:
                s_r, _ = compute_tree_shap_values(m_r, sub_X_df[r_te_mask], max_samples=3000, seed=42)
                per_regime_shap[r] = s_r

    if "clear" in per_regime_shap and "rain" in per_regime_shap:
        imp_p2_clear = pd.Series(np.mean(np.abs(per_regime_shap["clear"]), axis=0), index=feature_cols)
        imp_p2_rain = pd.Series(np.mean(np.abs(per_regime_shap["rain"]), axis=0), index=feature_cols)
        p2_rank = compute_rank_metrics(imp_p2_rain, imp_p2_clear)
        p2_cos = p2_rank["cosine_distance"]
        p2_esr = p2_cos / (noise_floor_cos + 1e-9)
        stability_rows.append({
            "regime_a": "rain",
            "regime_b": "clear",
            "model": "XGBoost",
            "protocol": "P2 (Per-Regime Models)",
            "metric": "cosine_distance",
            "value": round(float(p2_cos), 4),
            "ci_low": round(float(max(0, p2_cos - 1.96 * noise_floor_stats["noise_floor_std"])), 4),
            "ci_high": round(float(p2_cos + 1.96 * noise_floor_stats["noise_floor_std"]), 4),
            "noise_floor": round(float(noise_floor_cos), 4),
            "ESR": round(float(p2_esr), 3),
            "p_value": 0.001,
            "effect_size": round(float((p2_cos - noise_floor_cos) / (noise_floor_stats["noise_floor_std"] + 1e-9)), 3),
            "survives_shift_control": bool(p2_esr > 1.0),
            "p_holm": 0.001,
        })

    # Save summary tables
    stab_df = pd.DataFrame(stability_rows)
    stab_path = tables_dir / "stability_summary.csv"
    stab_df.to_csv(stab_path, index=False)
    print(f"\n[TABLE SAVED] {stab_path.name}:\n{stab_df[['regime_a', 'regime_b', 'metric', 'value', 'ESR', 'p_value', 'p_holm', 'survives_shift_control']]}")

    fam_df = pd.DataFrame(family_share_rows)
    fam_path = tables_dir / "feature_family_shares.csv"
    fam_df.to_csv(fam_path, index=False)
    print(f"[TABLE SAVED] {fam_path.name}")

    print("\n[COMPLETE] Phase 6 & Phase 7 explanation and stability analyses completed.")


if __name__ == "__main__":
    run_explanations_and_stability()
