"""Comprehensive evaluation metrics with bootstrap 95% confidence intervals."""

from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.metrics import (
    average_precision_score,
    balanced_accuracy_score,
    brier_score_loss,
    f1_score,
    log_loss,
    roc_auc_score,
)


def compute_binary_metrics(
    y_true: np.ndarray, y_prob: np.ndarray, threshold: float = 0.5
) -> Dict[str, float]:
    """Compute binary discrimination, calibration, and classification metrics."""
    y_pred = (y_prob >= threshold).astype(int)
    eps = 1e-7
    y_prob_clipped = np.clip(y_prob, eps, 1.0 - eps)

    roc_auc = float(roc_auc_score(y_true, y_prob)) if len(np.unique(y_true)) > 1 else np.nan
    pr_auc = float(average_precision_score(y_true, y_prob)) if len(np.unique(y_true)) > 1 else np.nan
    macro_f1 = float(f1_score(y_true, y_pred, average="macro"))
    bal_acc = float(balanced_accuracy_score(y_true, y_pred))
    brier = float(brier_score_loss(y_true, y_prob))
    ll = float(log_loss(y_true, y_prob_clipped))

    return {
        "roc_auc": roc_auc,
        "pr_auc": pr_auc,
        "macro_f1": macro_f1,
        "balanced_accuracy": bal_acc,
        "brier_score": brier,
        "log_loss": ll,
    }


def compute_multiclass_metrics(
    y_true: np.ndarray, y_probs: np.ndarray, classes: List[str]
) -> Dict[str, float]:
    """Compute multiclass discrimination and calibration metrics for 3-class Task B."""
    y_pred = np.argmax(y_probs, axis=1)
    # Convert y_true to numeric if string
    if y_true.dtype == object or isinstance(y_true[0], str):
        class_to_idx = {c: i for i, c in enumerate(classes)}
        y_true_num = np.array([class_to_idx[y] for y in y_true])
    else:
        y_true_num = y_true

    roc_auc = float(roc_auc_score(y_true_num, y_probs, multi_class="ovr", average="macro"))
    macro_f1 = float(f1_score(y_true_num, y_pred, average="macro"))
    bal_acc = float(balanced_accuracy_score(y_true_num, y_pred))
    ll = float(log_loss(y_true_num, np.clip(y_probs, 1e-7, 1 - 1e-7)))

    # Multiclass Brier score
    y_true_onehot = np.zeros_like(y_probs)
    for i, val in enumerate(y_true_num):
        y_true_onehot[i, val] = 1.0
    brier = float(np.mean(np.sum((y_probs - y_true_onehot) ** 2, axis=1)))

    return {
        "roc_auc_macro": roc_auc,
        "macro_f1": macro_f1,
        "balanced_accuracy": bal_acc,
        "brier_score": brier,
        "log_loss": ll,
    }


def compute_bootstrap_cis(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    n_bootstraps: int = 500,
    seed: int = 42,
    alpha: float = 0.05,
) -> Dict[str, Dict[str, float]]:
    """Compute 95% bootstrap confidence intervals for all metrics on the test set."""
    rng = np.random.default_rng(seed)
    n = len(y_true)
    point_estimates = compute_binary_metrics(y_true, y_prob)

    bootstrap_metrics = {m: [] for m in point_estimates.keys()}

    for _ in range(n_bootstraps):
        boot_idx = rng.integers(0, n, size=n)
        b_true = y_true[boot_idx]
        if len(np.unique(b_true)) < 2:
            continue
        b_prob = y_prob[boot_idx]
        b_metrics = compute_binary_metrics(b_true, b_prob)
        for m, val in b_metrics.items():
            if not np.isnan(val):
                bootstrap_metrics[m].append(val)

    summary = {}
    lower_p = 100 * (alpha / 2.0)
    upper_p = 100 * (1.0 - alpha / 2.0)

    for m, point_val in point_estimates.items():
        vals = np.array(bootstrap_metrics[m])
        if len(vals) > 0:
            ci_low = float(np.percentile(vals, lower_p))
            ci_high = float(np.percentile(vals, upper_p))
        else:
            ci_low, ci_high = point_val, point_val
        summary[m] = {
            "value": point_val,
            "ci_lower": ci_low,
            "ci_upper": ci_high,
        }

    return summary
