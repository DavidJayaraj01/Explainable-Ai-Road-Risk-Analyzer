import json
import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from typing import Dict, List, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GroupKFold
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

from src.models.calibrate import apply_prior_correction, compute_calibration_diagnostics
from src.models.evaluate import compute_binary_metrics, compute_bootstrap_cis, compute_multiclass_metrics


def prepare_features(
    df: pd.DataFrame, feature_cols: List[str]
) -> Tuple[np.ndarray, List[str], Dict]:
    """Clean, impute, and encode feature matrix for estimators."""
    X = df[feature_cols].copy()
    preprocessors = {}

    for col in feature_cols:
        if X[col].dtype == object or str(X[col].dtype) == "category":
            cat_type = pd.Categorical(X[col].fillna("Unknown"))
            X[col] = cat_type.codes
            preprocessors[col] = list(cat_type.categories)
        else:
            median_val = float(X[col].median()) if not X[col].isna().all() else 0.0
            X[col] = X[col].fillna(median_val)
            preprocessors[col] = median_val

    return X.values, feature_cols, preprocessors


def train_and_evaluate_task_a(
    df: pd.DataFrame,
    feature_cols: List[str],
    output_dir: Path,
    seed: int = 42,
) -> Dict:
    """Train models for Task A (Accident Occurrence Risk)."""
    print("\n================== TRAINING TASK A (Occurrence Risk) ==================")
    years = df["datetime_utc"].dt.year
    train_mask = years <= 2022
    val_mask = years == 2023
    test_mask = years == 2024

    X_all, feats, prep = prepare_features(df, feature_cols)
    y_all = df["is_accident"].values

    X_train, y_train = X_all[train_mask], y_all[train_mask]
    X_val, y_val = X_all[val_mask], y_all[val_mask]
    X_test, y_test = X_all[test_mask], y_all[test_mask]

    print(f"Task A Split Sizes - Train: {len(X_train):,}, Val: {len(X_val):,}, Test: {len(X_test):,}")

    # Spatial block CV on train set
    if "police_force" in df.columns:
        groups = df.loc[train_mask, "police_force"].fillna(-1).values
        gkf = GroupKFold(n_splits=5)
        cv_scores = []
        for fold, (tr_idx, val_idx) in enumerate(gkf.split(X_train, y_train, groups=groups)):
            clf = XGBClassifier(n_estimators=50, max_depth=5, tree_method="hist", random_state=seed, n_jobs=-1)
            clf.fit(X_train[tr_idx], y_train[tr_idx])
            p_val = clf.predict_proba(X_train[val_idx])[:, 1]
            cv_scores.append(compute_binary_metrics(y_train[val_idx], p_val)["roc_auc"])
        print(f"Task A 5-Fold Spatial CV (by Police Force) Mean ROC-AUC: {np.mean(cv_scores):.4f} +/- {np.std(cv_scores):.4f}")

    models = {
        "Prior Baseline": DummyClassifier(strategy="prior"),
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight="balanced", random_state=seed),
        "Random Forest": RandomForestClassifier(n_estimators=150, max_depth=12, class_weight="balanced", n_jobs=-1, random_state=seed),
        "XGBoost": XGBClassifier(n_estimators=150, max_depth=6, learning_rate=0.08, tree_method="hist", random_state=seed, n_jobs=-1),
    }

    # Standardize for Logistic Regression
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    results = {}
    models_dir = output_dir / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    for name, model in models.items():
        print(f"Fitting {name}...")
        tr_X = X_train_scaled if name == "Logistic Regression" else X_train
        v_X = X_val_scaled if name == "Logistic Regression" else X_val
        te_X = X_test_scaled if name == "Logistic Regression" else X_test

        model.fit(tr_X, y_train)

        # Validation
        p_val = model.predict_proba(v_X)[:, 1] if hasattr(model, "predict_proba") else np.full(len(v_X), 0.5)
        val_metrics = compute_binary_metrics(y_val, p_val)

        # Test
        p_test = model.predict_proba(te_X)[:, 1] if hasattr(model, "predict_proba") else np.full(len(te_X), 0.5)
        test_cis = compute_bootstrap_cis(y_test, p_test, n_bootstraps=200, seed=seed)

        # Prior correction
        p_test_pop = apply_prior_correction(p_test, sample_case_fraction=0.2, population_case_fraction=0.01)
        prob_true, prob_pred, brier, ll = compute_calibration_diagnostics(y_test, p_test)

        results[name] = {
            "validation": val_metrics,
            "test_with_ci": test_cis,
            "brier_score": brier,
            "log_loss": ll,
            "calibration_curve": {"prob_pred": prob_pred.tolist(), "prob_true": prob_true.tolist()},
        }

        # Save model
        joblib.dump(model, models_dir / f"task_a_{name.lower().replace(' ', '_')}.joblib")

    # Save metrics JSON
    with open(output_dir / "metrics" / "task_a_metrics.json", "w") as f:
        json.dump(results, f, indent=2)

    return results


def train_and_evaluate_task_b(
    df: pd.DataFrame,
    feature_cols: List[str],
    output_dir: Path,
    seed: int = 42,
) -> Dict:
    """Train models for Task B (Severity level classification given accident)."""
    print("\n================== TRAINING TASK B (Severity Given Accident) ==================")
    years = df["datetime_utc"].dt.year
    train_mask = years <= 2022
    val_mask = years == 2023
    test_mask = years == 2024

    X_all, feats, prep = prepare_features(df, feature_cols)
    y_binary = df["target_ksi_binary"].values

    X_train, y_train = X_all[train_mask], y_binary[train_mask]
    X_val, y_val = X_all[val_mask], y_binary[val_mask]
    X_test, y_test = X_all[test_mask], y_binary[test_mask]

    print(f"Task B Split Sizes - Train: {len(X_train):,}, Val: {len(X_val):,}, Test: {len(X_test):,}")

    models = {
        "Prior Baseline": DummyClassifier(strategy="prior"),
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight="balanced", random_state=seed),
        "Random Forest": RandomForestClassifier(n_estimators=150, max_depth=12, class_weight="balanced", n_jobs=-1, random_state=seed),
        "XGBoost": XGBClassifier(n_estimators=150, max_depth=6, learning_rate=0.08, tree_method="hist", scale_pos_weight=3.0, random_state=seed, n_jobs=-1),
    }

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    results = {}
    models_dir = output_dir / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    for name, model in models.items():
        print(f"Fitting {name}...")
        tr_X = X_train_scaled if name == "Logistic Regression" else X_train
        v_X = X_val_scaled if name == "Logistic Regression" else X_val
        te_X = X_test_scaled if name == "Logistic Regression" else X_test

        model.fit(tr_X, y_train)

        p_val = model.predict_proba(v_X)[:, 1] if hasattr(model, "predict_proba") else np.full(len(v_X), 0.5)
        val_metrics = compute_binary_metrics(y_val, p_val)

        p_test = model.predict_proba(te_X)[:, 1] if hasattr(model, "predict_proba") else np.full(len(te_X), 0.5)
        test_cis = compute_bootstrap_cis(y_test, p_test, n_bootstraps=200, seed=seed)

        prob_true, prob_pred, brier, ll = compute_calibration_diagnostics(y_test, p_test)

        results[name] = {
            "validation": val_metrics,
            "test_with_ci": test_cis,
            "brier_score": brier,
            "log_loss": ll,
            "calibration_curve": {"prob_pred": prob_pred.tolist(), "prob_true": prob_true.tolist()},
        }

        joblib.dump(model, models_dir / f"task_b_{name.lower().replace(' ', '_')}.joblib")

    with open(output_dir / "metrics" / "task_b_metrics.json", "w") as f:
        json.dump(results, f, indent=2)

    return results


def main():
    results_dir = Path("results")
    proc_dir = Path("data/processed")
    tables_dir = results_dir / "tables"
    tables_dir.mkdir(parents=True, exist_ok=True)
    (results_dir / "metrics").mkdir(parents=True, exist_ok=True)

    print("[LOADING] Processed datasets for modeling...")
    task_a_df = pd.read_parquet(proc_dir / "task_a_dataset.parquet")
    task_b_df = pd.read_parquet(proc_dir / "task_b_dataset.parquet")

    # Feature lists
    task_a_features = [
        "traffic_flow_hourly_est", "aadf_hgv_share", "speed_limit",
        "road_type", "junction_detail", "urban_or_rural_area",
        "hour", "day_of_week", "hour_of_week", "month", "is_weekend", "is_bank_holiday",
        "solar_elevation_deg", "light_regime",
        "temperature_2m", "precipitation", "rolling_3h_precip", "rolling_24h_precip",
        "wind_gusts_10m", "is_freezing", "fog_proxy"
    ]
    # Filter only existing columns
    task_a_features = [f for f in task_a_features if f in task_a_df.columns]

    task_b_features = [
        "aadf_all_motor_vehicles", "aadf_hgv_share", "speed_limit",
        "road_type", "junction_detail", "urban_or_rural_area",
        "hour", "day_of_week", "month", "is_weekend",
        "solar_elevation_deg", "light_regime",
        "weather_conditions", "light_conditions", "road_surface_conditions",
        "has_hgv", "has_motorcycle", "has_pedal_cycle", "number_of_vehicles"
    ]
    task_b_features = [f for f in task_b_features if f in task_b_df.columns]

    # Train Task A
    res_a = train_and_evaluate_task_a(task_a_df, task_a_features, results_dir, seed=42)

    # Train Task B
    res_b = train_and_evaluate_task_b(task_b_df, task_b_features, results_dir, seed=42)

    # Compile model performance summary table
    rows = []
    for task_name, res_dict in [("Task A (Occurrence)", res_a), ("Task B (Severity KSI)", res_b)]:
        for model_name, m_data in res_dict.items():
            val_m = m_data.get("validation", {})
            test_ci = m_data.get("test_with_ci", {})

            auc_info = test_ci.get("roc_auc", {})
            pr_info = test_ci.get("pr_auc", {})
            f1_info = test_ci.get("macro_f1", {})

            auc_str = f"{auc_info.get('value', 0):.3f} [{auc_info.get('ci_lower', 0):.3f}, {auc_info.get('ci_upper', 0):.3f}]" if auc_info else "N/A"
            pr_str = f"{pr_info.get('value', 0):.3f} [{pr_info.get('ci_lower', 0):.3f}, {pr_info.get('ci_upper', 0):.3f}]" if pr_info else "N/A"
            f1_str = f"{f1_info.get('value', 0):.3f} [{f1_info.get('ci_lower', 0):.3f}, {f1_info.get('ci_upper', 0):.3f}]" if f1_info else "N/A"

            rows.append({
                "task": task_name,
                "model": model_name,
                "val_roc_auc": round(float(val_m.get("roc_auc", 0)), 4),
                "val_macro_f1": round(float(val_m.get("macro_f1", 0)), 4),
                "test_roc_auc_95ci": auc_str,
                "test_pr_auc_95ci": pr_str,
                "test_macro_f1_95ci": f1_str,
                "test_brier_score": round(float(m_data.get("brier_score", 0)), 4),
                "test_log_loss": round(float(m_data.get("log_loss", 0)), 4),
            })

    perf_df = pd.DataFrame(rows)
    perf_path = tables_dir / "model_performance.csv"
    perf_df.to_csv(perf_path, index=False)
    print(f"\n[TABLE SAVED] {perf_path.name}:\n{perf_df[['task', 'model', 'val_roc_auc', 'test_roc_auc_95ci', 'test_brier_score']]}")


if __name__ == "__main__":
    main()
