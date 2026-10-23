"""Distribution Shift Control: Propensity-score weighting and covariate-balanced subsampling."""

from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from src.explain.stability import compute_rank_metrics


def build_propensity_balanced_subsample(
    df: pd.DataFrame,
    regime_col: str,
    regime_a: str,
    regime_b: str,
    control_features: List[str],
    seed: int = 42,
) -> Tuple[np.ndarray, np.ndarray, pd.Series]:
    """Perform 1:1 nearest-propensity matching on non-regime control features.
    
    Returns (matched_indices_a, matched_indices_b, propensity_scores).
    """
    mask = df[regime_col].isin([regime_a, regime_b])
    sub_df = df[mask].copy().reset_index(drop=True)

    y_treat = (sub_df[regime_col] == regime_a).astype(int).values
    X_cov = sub_df[control_features].copy()

    # Fill missing values for matching
    for col in X_cov.columns:
        if X_cov[col].dtype == object:
            X_cov[col] = pd.Categorical(X_cov[col]).codes
        else:
            X_cov[col] = X_cov[col].fillna(X_cov[col].median())

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_cov)

    lr = LogisticRegression(max_iter=1000, random_state=seed)
    lr.fit(X_scaled, y_treat)
    propensity = lr.predict_proba(X_scaled)[:, 1]

    idx_a = np.where(y_treat == 1)[0]
    idx_b = np.where(y_treat == 0)[0]

    # Greedy 1:1 matching without replacement
    rng = np.random.default_rng(seed)
    rng.shuffle(idx_a)

    matched_b = []
    used_b = set()

    for i in idx_a:
        p_val = propensity[i]
        # Find closest unused in b
        b_candidates = [b for b in idx_b if b not in used_b]
        if not b_candidates:
            break
        b_candidates = np.array(b_candidates)
        diffs = np.abs(propensity[b_candidates] - p_val)
        best_b = b_candidates[np.argmin(diffs)]
        matched_b.append(best_b)
        used_b.add(best_b)

    matched_a = idx_a[:len(matched_b)]
    matched_b = np.array(matched_b)

    return matched_a, matched_b, pd.Series(propensity, index=sub_df.index)


def evaluate_shift_controlled_stability(
    shap_matrix: np.ndarray,
    regime_labels: np.ndarray,
    regime_a: str,
    regime_b: str,
    feature_names: List[str],
    control_features: List[str],
    raw_df: pd.DataFrame,
    noise_floor: float,
    seed: int = 42,
) -> Dict[str, float]:
    """Test whether explanation shift between regimes survives after controlling for covariate shift."""
    mask = np.isin(regime_labels, [regime_a, regime_b])
    sub_shap = shap_matrix[mask]
    sub_labels = regime_labels[mask]
    sub_raw = raw_df.iloc[mask].reset_index(drop=True)

    matched_a, matched_b, _ = build_propensity_balanced_subsample(
        sub_raw,
        regime_col="regime",
        regime_a=regime_a,
        regime_b=regime_b,
        control_features=control_features,
        seed=seed,
    )

    if len(matched_a) < 50:
        return {
            "balanced_cosine_dist": np.nan,
            "balanced_esr": np.nan,
            "survives_shift_control": False,
        }

    shap_matched_a = sub_shap[matched_a]
    shap_matched_b = sub_shap[matched_b]

    imp_a = pd.Series(np.mean(np.abs(shap_matched_a), axis=0), index=feature_names)
    imp_b = pd.Series(np.mean(np.abs(shap_matched_b), axis=0), index=feature_names)

    metrics = compute_rank_metrics(imp_a, imp_b)
    balanced_dist = metrics["cosine_distance"]
    balanced_esr = balanced_dist / (noise_floor + 1e-9)

    survives = (balanced_esr > 1.0)

    return {
        "balanced_sample_size": len(matched_a) * 2,
        "balanced_cosine_dist": float(balanced_dist),
        "balanced_spearman": float(metrics["spearman_rho"]),
        "balanced_esr": float(balanced_esr),
        "survives_shift_control": bool(survives),
    }
