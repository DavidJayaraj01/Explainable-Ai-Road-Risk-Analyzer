"""Partial Dependence Plots (PDP), Individual Conditional Expectation (ICE), and Accumulated Local Effects (ALE)."""

from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd


def compute_feature_correlations(
    df: pd.DataFrame, feature_cols: List[str], threshold: float = 0.6
) -> Tuple[pd.DataFrame, List[Tuple[str, str, float]]]:
    """Compute Pearson and Spearman correlation matrices and flag pairs with |rho| > threshold."""
    numeric_df = df[feature_cols].select_dtypes(include=[np.number])
    corr_matrix = numeric_df.corr(method="spearman")

    flagged_pairs = []
    cols = corr_matrix.columns
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            val = corr_matrix.iloc[i, j]
            if abs(val) >= threshold:
                flagged_pairs.append((cols[i], cols[j], float(val)))

    return corr_matrix, flagged_pairs


def compute_pdp_ice(
    model,
    X: pd.DataFrame,
    feature: str,
    grid_points: int = 30,
    subsample_n: int = 1000,
    seed: int = 42,
) -> Dict[str, np.ndarray]:
    """Compute 1D Partial Dependence Plot (PDP) and Individual Conditional Expectation (ICE)."""
    rng = np.random.default_rng(seed)
    if len(X) > subsample_n:
        idx = rng.choice(len(X), size=subsample_n, replace=False)
        X_sub = X.iloc[idx].copy()
    else:
        X_sub = X.copy()

    val_min = np.percentile(X_sub[feature].dropna(), 1)
    val_max = np.percentile(X_sub[feature].dropna(), 99)
    if val_min == val_max:
        grid = np.unique(X_sub[feature].dropna().values)
    else:
        grid = np.linspace(val_min, val_max, grid_points)

    ice_curves = np.zeros((len(X_sub), len(grid)))

    for j, val in enumerate(grid):
        X_temp = X_sub.copy()
        X_temp[feature] = val
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_temp)
            if probs.ndim == 2 and probs.shape[1] > 1:
                preds = probs[:, -1]
            else:
                preds = probs.ravel()
        else:
            preds = model.predict(X_temp)
        ice_curves[:, j] = preds

    pdp_curve = np.mean(ice_curves, axis=0)

    return {
        "feature": feature,
        "grid": grid,
        "pdp": pdp_curve,
        "ice": ice_curves,
        "centered_pdp": pdp_curve - np.mean(pdp_curve),
    }


def compute_ale_1d(
    model,
    X: pd.DataFrame,
    feature: str,
    n_bins: int = 25,
) -> Dict[str, np.ndarray]:
    """Compute first-order Accumulated Local Effects (ALE) for continuous feature.
    
    Isolates local feature effect without evaluating off-manifold combinations.
    """
    x_feat = X[feature].dropna().values
    if len(np.unique(x_feat)) <= 2:
        # Binary feature
        return compute_pdp_ice(model, X, feature, grid_points=2)

    quantiles = np.linspace(0.02, 0.98, n_bins + 1)
    bin_edges = np.unique(np.quantile(x_feat, quantiles))
    if len(bin_edges) < 3:
        bin_edges = np.linspace(np.min(x_feat), np.max(x_feat), n_bins + 1)

    k_bins = len(bin_edges) - 1
    local_effects = np.zeros(k_bins)
    bin_counts = np.zeros(k_bins)

    for k in range(k_bins):
        low, high = bin_edges[k], bin_edges[k + 1]
        mask = (x_feat >= low) & (x_feat <= high)
        if not np.any(mask):
            continue

        X_bin = X[mask].copy()
        X_low = X_bin.copy()
        X_low[feature] = low
        X_high = X_bin.copy()
        X_high[feature] = high

        if hasattr(model, "predict_proba"):
            p_high = model.predict_proba(X_high)[:, -1]
            p_low = model.predict_proba(X_low)[:, -1]
        else:
            p_high = model.predict(X_high)
            p_low = model.predict(X_low)

        diff = p_high - p_low
        local_effects[k] = np.mean(diff)
        bin_counts[k] = len(X_bin)

    # Accumulate effects
    accumulated = np.cumsum(local_effects)
    # Center ALE curve
    mean_effect = np.sum(accumulated * bin_counts) / np.sum(bin_counts) if np.sum(bin_counts) > 0 else 0
    ale_curve = accumulated - mean_effect

    # Grid midpoints
    grid_midpoints = (bin_edges[:-1] + bin_edges[1:]) / 2.0

    return {
        "feature": feature,
        "grid": grid_midpoints,
        "bin_edges": bin_edges,
        "ale": ale_curve,
        "counts": bin_counts,
    }


def compute_curve_distance(
    curve_a: np.ndarray,
    curve_b: np.ndarray,
    grid_a: np.ndarray,
    grid_b: np.ndarray,
    common_grid_points: int = 50,
) -> Tuple[float, bool]:
    """Compute L2 distance between centered curves interpolated onto a standardized [0, 1] grid.
    
    Also checks if the monotonicity/sign of trend changes.
    """
    norm_grid = np.linspace(0.0, 1.0, common_grid_points)

    # Normalize x to [0, 1]
    span_a = grid_a[-1] - grid_a[0] if grid_a[-1] != grid_a[0] else 1.0
    norm_ga = (grid_a - grid_a[0]) / span_a

    span_b = grid_b[-1] - grid_b[0] if grid_b[-1] != grid_b[0] else 1.0
    norm_gb = (grid_b - grid_b[0]) / span_b

    # Interpolate
    interp_a = np.interp(norm_grid, norm_ga, curve_a)
    interp_b = np.interp(norm_grid, norm_gb, curve_b)

    # Center curves
    c_a = interp_a - np.mean(interp_a)
    c_b = interp_b - np.mean(interp_b)

    l2_dist = float(np.sqrt(np.mean((c_a - c_b) ** 2)))

    # Check monotonicity / trend sign (positive slope vs negative slope)
    slope_a = np.polyfit(norm_grid, c_a, 1)[0]
    slope_b = np.polyfit(norm_grid, c_b, 1)[0]
    sign_change = (slope_a * slope_b) < 0

    return l2_dist, sign_change
