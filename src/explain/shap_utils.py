"""SHAP computation utilities, feature family grouping, and local waterfall extraction."""

from pathlib import Path
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
import shap


# Feature families definition
FEATURE_FAMILIES = {
    "Weather": [
        "temperature_2m", "precipitation", "rolling_3h_precip", "rolling_24h_precip",
        "wind_gusts_10m", "is_freezing", "fog_proxy", "weather_conditions",
        "road_surface_conditions", "dew_point_depression", "wind_speed_10m"
    ],
    "Road": [
        "speed_limit", "road_type", "junction_detail", "urban_or_rural_area",
        "first_road_class"
    ],
    "Traffic": [
        "traffic_flow_hourly_est", "aadf_all_motor_vehicles", "aadf_hgvs",
        "aadf_hgv_share", "has_hgv", "has_motorcycle", "has_pedal_cycle",
        "number_of_vehicles"
    ],
    "Time/Light": [
        "hour", "day_of_week", "hour_of_week", "month", "is_weekend",
        "is_bank_holiday", "solar_elevation_deg", "light_regime", "light_conditions"
    ],
}


def get_feature_family(feature_name: str) -> str:
    """Map a single feature name to its family."""
    for family, feats in FEATURE_FAMILIES.items():
        if feature_name in feats:
            return family
    return "Other"


def compute_family_importance_shares(mean_abs_shap: pd.Series) -> Dict[str, float]:
    """Compute percentage share of total importance by feature family."""
    total_imp = mean_abs_shap.sum()
    if total_imp == 0:
        return {f: 0.0 for f in FEATURE_FAMILIES}

    family_sums = {f: 0.0 for f in FEATURE_FAMILIES}
    family_sums["Other"] = 0.0

    for feat, val in mean_abs_shap.items():
        fam = get_feature_family(feat)
        family_sums[fam] += val

    shares = {fam: float((val / total_imp) * 100.0) for fam, val in family_sums.items() if val > 0 or fam != "Other"}
    return shares


def compute_tree_shap_values(
    model,
    X: pd.DataFrame,
    max_samples: int = 15000,
    seed: int = 42,
    check_additivity: bool = False,
) -> Tuple[np.ndarray, np.ndarray]:
    """Compute TreeSHAP values and expected values on stratified or random subsample."""
    if len(X) > max_samples:
        rng = np.random.default_rng(seed)
        sample_indices = rng.choice(len(X), size=max_samples, replace=False)
        X_sub = X.iloc[sample_indices]
    else:
        X_sub = X

    explainer = shap.TreeExplainer(model)
    shap_vals = explainer.shap_values(X_sub, check_additivity=check_additivity)

    # For binary classification with XGBoost, shap_values might be 1D or 2D
    # For RF multiclass, shap_values is a list of arrays [n_samples, n_features] per class
    if isinstance(shap_vals, list):
        # Multi-class: use the High severity class (index 0 or last depending on classes)
        # Primary class: highest index (Fatal / High)
        primary_shap = shap_vals[-1]
    elif len(shap_vals.shape) == 3:
        # Array shape (samples, features, classes)
        primary_shap = shap_vals[:, :, -1]
    else:
        primary_shap = shap_vals

    expected_val = explainer.expected_value
    if isinstance(expected_val, (list, np.ndarray)):
        expected_val = expected_val[-1]

    return primary_shap, np.array(expected_val)


def get_global_importance(
    shap_values: np.ndarray, feature_names: List[str]
) -> pd.DataFrame:
    """Compute mean(|SHAP|) and signed mean(SHAP) per feature."""
    mean_abs = np.mean(np.abs(shap_values), axis=0)
    mean_signed = np.mean(shap_values, axis=0)

    df_imp = pd.DataFrame({
        "feature": feature_names,
        "mean_abs_shap": mean_abs,
        "mean_signed_shap": mean_signed,
        "family": [get_feature_family(f) for f in feature_names],
    })
    df_imp = df_imp.sort_values("mean_abs_shap", ascending=False).reset_index(drop=True)
    df_imp["normalized_share"] = df_imp["mean_abs_shap"] / df_imp["mean_abs_shap"].sum()
    df_imp["rank"] = np.arange(1, len(df_imp) + 1)
    return df_imp


def extract_local_waterfall_cases(
    model,
    X: pd.DataFrame,
    y_true: np.ndarray,
    y_prob: np.ndarray,
    shap_values: np.ndarray,
    expected_value: float,
) -> Dict[str, Dict]:
    """Identify and extract 6 representative local waterfall cases:
    1. Typical High-Risk (True Positive)
    2. Typical Low-Risk (True Negative)
    3. Borderline Case (y_prob ~ 0.5)
    4. Hard False Positive (y_true = 0, y_prob high)
    5. Hard False Negative (y_true = 1, y_prob low)
    6. Extreme Weather Case (high wind or freezing rain)
    """
    cases = {}

    # 1. Typical High Risk (TP)
    pos_mask = (y_true == 1)
    if np.any(pos_mask):
        top_tp_idx = np.where(pos_mask)[0][np.argmax(y_prob[pos_mask])]
        cases["typical_high_risk_tp"] = {
            "index": int(top_tp_idx),
            "prob": float(y_prob[top_tp_idx]),
            "true_label": int(y_true[top_tp_idx]),
            "shap": shap_values[top_tp_idx].tolist(),
            "inputs": X.iloc[top_tp_idx].to_dict(),
        }

    # 2. Typical Low Risk (TN)
    neg_mask = (y_true == 0)
    if np.any(neg_mask):
        top_tn_idx = np.where(neg_mask)[0][np.argmin(y_prob[neg_mask])]
        cases["typical_low_risk_tn"] = {
            "index": int(top_tn_idx),
            "prob": float(y_prob[top_tn_idx]),
            "true_label": int(y_true[top_tn_idx]),
            "shap": shap_values[top_tn_idx].tolist(),
            "inputs": X.iloc[top_tn_idx].to_dict(),
        }

    # 3. Borderline Case (closest to 0.5)
    border_idx = int(np.argmin(np.abs(y_prob - 0.5)))
    cases["borderline_case"] = {
        "index": border_idx,
        "prob": float(y_prob[border_idx]),
        "true_label": int(y_true[border_idx]),
        "shap": shap_values[border_idx].tolist(),
        "inputs": X.iloc[border_idx].to_dict(),
    }

    # 4. Hard False Positive (neg with highest predicted prob)
    if np.any(neg_mask):
        fp_idx = np.where(neg_mask)[0][np.argmax(y_prob[neg_mask])]
        cases["hard_false_positive"] = {
            "index": int(fp_idx),
            "prob": float(y_prob[fp_idx]),
            "true_label": int(y_true[fp_idx]),
            "shap": shap_values[fp_idx].tolist(),
            "inputs": X.iloc[fp_idx].to_dict(),
        }

    # 5. Hard False Negative (pos with lowest predicted prob)
    if np.any(pos_mask):
        fn_idx = np.where(pos_mask)[0][np.argmin(y_prob[pos_mask])]
        cases["hard_false_negative"] = {
            "index": int(fn_idx),
            "prob": float(y_prob[fn_idx]),
            "true_label": int(y_true[fn_idx]),
            "shap": shap_values[fn_idx].tolist(),
            "inputs": X.iloc[fn_idx].to_dict(),
        }

    # 6. Extreme Weather Collision
    if "wind_gusts_10m" in X.columns:
        weather_idx = int(np.argmax(X["wind_gusts_10m"].values))
        cases["extreme_weather_case"] = {
            "index": weather_idx,
            "prob": float(y_prob[weather_idx]),
            "true_label": int(y_true[weather_idx]),
            "shap": shap_values[weather_idx].tolist(),
            "inputs": X.iloc[weather_idx].to_dict(),
        }

    return cases
