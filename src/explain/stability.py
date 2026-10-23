"""Stability Experiment: Metrics, Noise Floor, ESR, Permutation Tests, and Holm-Bonferroni Correction."""

from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from scipy.spatial.distance import cosine
from scipy.stats import kendalltau, spearmanr, wasserstein_distance


def compute_rank_metrics(
    importance_a: pd.Series, importance_b: pd.Series, top_k_list: List[int] = [3, 5, 10]
) -> Dict[str, float]:
    """Compute Spearman rho, Kendall tau, cosine similarity, and top-k Jaccard overlaps."""
    common_features = list(set(importance_a.index) & set(importance_b.index))
    if len(common_features) < 2:
        return {"spearman": np.nan, "kendall": np.nan, "cosine_sim": np.nan}

    vals_a = importance_a[common_features].values
    vals_b = importance_b[common_features].values

    # Spearman and Kendall
    spear_res = spearmanr(vals_a, vals_b)
    spear_corr = float(spear_res.statistic) if hasattr(spear_res, "statistic") else float(spear_res[0])

    kend_res = kendalltau(vals_a, vals_b)
    kend_corr = float(kend_res.statistic) if hasattr(kend_res, "statistic") else float(kend_res[0])

    # Cosine similarity
    norm_a = vals_a / (np.linalg.norm(vals_a) + 1e-9)
    norm_b = vals_b / (np.linalg.norm(vals_b) + 1e-9)
    cos_sim = float(np.dot(norm_a, norm_b))

    results = {
        "spearman_rho": spear_corr,
        "kendall_tau": kend_corr,
        "cosine_similarity": cos_sim,
        "cosine_distance": 1.0 - cos_sim,
    }

    # Top-k Jaccard
    sorted_a = importance_a.sort_values(ascending=False).index.tolist()
    sorted_b = importance_b.sort_values(ascending=False).index.tolist()

    for k in top_k_list:
        set_a = set(sorted_a[:k])
        set_b = set(sorted_b[:k])
        inter = len(set_a & set_b)
        union = len(set_a | set_b)
        results[f"top_{k}_jaccard"] = float(inter / union) if union > 0 else 1.0

    return results


def compute_wasserstein_feature_distances(
    shap_a: np.ndarray, shap_b: np.ndarray, feature_names: List[str]
) -> Dict[str, float]:
    """Compute Wasserstein-1 distance per feature SHAP distribution between regimes."""
    w_dists = {}
    for j, feat in enumerate(feature_names):
        w = float(wasserstein_distance(shap_a[:, j], shap_b[:, j]))
        w_dists[feat] = w
    w_dists["mean_wasserstein"] = float(np.mean(list(w_dists.values())))
    return w_dists


def estimate_within_regime_noise_floor(
    shap_matrix: np.ndarray,
    feature_names: List[str],
    B: int = 30,
    seed: int = 42,
) -> Dict[str, float]:
    """Estimate explanation noise floor by computing pairwise distance between bootstrap resamples within regime."""
    rng = np.random.default_rng(seed)
    n = len(shap_matrix)

    cos_distances = []
    spearman_distances = []

    for _ in range(B):
        idx1 = rng.integers(0, n, size=n)
        idx2 = rng.integers(0, n, size=n)

        imp1 = pd.Series(np.mean(np.abs(shap_matrix[idx1]), axis=0), index=feature_names)
        imp2 = pd.Series(np.mean(np.abs(shap_matrix[idx2]), axis=0), index=feature_names)

        metrics = compute_rank_metrics(imp1, imp2)
        cos_distances.append(metrics["cosine_distance"])
        spearman_distances.append(1.0 - metrics["spearman_rho"])

    return {
        "noise_floor_cosine_dist": float(np.mean(cos_distances)),
        "noise_floor_spearman_dist": float(np.mean(spearman_distances)),
        "noise_floor_std": float(np.std(cos_distances)),
    }


def run_regime_permutation_test(
    shap_matrix: np.ndarray,
    regime_labels: np.ndarray,
    regime_a: str,
    regime_b: str,
    feature_names: List[str],
    n_permutations: int = 1000,
    seed: int = 42,
) -> Tuple[float, float, float]:
    """Permutation test shuffling regime labels to test null hypothesis of equal explanation distributions.
    
    Returns (observed_cosine_distance, p_value, effect_size).
    """
    rng = np.random.default_rng(seed)
    mask = np.isin(regime_labels, [regime_a, regime_b])
    sub_shap = shap_matrix[mask]
    sub_labels = regime_labels[mask]

    mask_a = sub_labels == regime_a
    mask_b = sub_labels == regime_b

    imp_a = pd.Series(np.mean(np.abs(sub_shap[mask_a]), axis=0), index=feature_names)
    imp_b = pd.Series(np.mean(np.abs(sub_shap[mask_b]), axis=0), index=feature_names)
    obs_dist = compute_rank_metrics(imp_a, imp_b)["cosine_distance"]

    shuffled_dists = []
    n_sub = len(sub_labels)
    n_a = int(np.sum(mask_a))

    for _ in range(n_permutations):
        perm_idx = rng.permutation(n_sub)
        p_mask_a = np.zeros(n_sub, dtype=bool)
        p_mask_a[perm_idx[:n_a]] = True
        p_mask_b = ~p_mask_a

        p_imp_a = pd.Series(np.mean(np.abs(sub_shap[p_mask_a]), axis=0), index=feature_names)
        p_imp_b = pd.Series(np.mean(np.abs(sub_shap[p_mask_b]), axis=0), index=feature_names)
        p_dist = compute_rank_metrics(p_imp_a, p_imp_b)["cosine_distance"]
        shuffled_dists.append(p_dist)

    shuffled_dists = np.array(shuffled_dists)
    p_value = float(np.mean(shuffled_dists >= obs_dist))
    # Effect size: Cohen-style standardized difference above permutation mean
    effect_size = float((obs_dist - np.mean(shuffled_dists)) / (np.std(shuffled_dists) + 1e-9))

    return obs_dist, p_value, effect_size


def apply_holm_bonferroni(p_values: List[float]) -> List[float]:
    """Apply Holm-Bonferroni stepwise adjustment to control Family-Wise Error Rate (FWER)."""
    m = len(p_values)
    if m == 0:
        return []

    sorted_indices = np.argsort(p_values)
    sorted_p = np.array(p_values)[sorted_indices]

    adjusted = np.empty(m)
    current_max = 0.0

    for i in range(m):
        rank = i + 1
        adj_p = min(1.0, (m - rank + 1) * sorted_p[i])
        current_max = max(current_max, adj_p)
        adjusted[sorted_indices[i]] = current_max

    return [float(p) for p in adjusted]
