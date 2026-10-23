"""Calibration utilities and prior correction for case-control risk modeling."""

from typing import Tuple
import numpy as np
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import brier_score_loss, log_loss


def apply_prior_correction(
    predicted_probs: np.ndarray,
    sample_case_fraction: float = 0.2,
    population_case_fraction: float = 0.01,
    eps: float = 1e-7,
) -> np.ndarray:
    """Apply log-odds prior correction to convert sample case-control probabilities to population risk.
    
    Formula:
    logit(p_pop) = logit(p_sample) - log(p_sample / (1 - p_sample)) + log(p_pop / (1 - p_pop))
    """
    p = np.clip(predicted_probs, eps, 1.0 - eps)
    sample_odds = sample_case_fraction / (1.0 - sample_case_fraction)
    pop_odds = population_case_fraction / (1.0 - population_case_fraction)

    logit_p = np.log(p / (1.0 - p))
    adjusted_logit = logit_p - np.log(sample_odds) + np.log(pop_odds)
    adjusted_p = 1.0 / (1.0 + np.exp(-adjusted_logit))
    return adjusted_p


def compute_calibration_diagnostics(
    y_true: np.ndarray, y_prob: np.ndarray, n_bins: int = 10
) -> Tuple[np.ndarray, np.ndarray, float, float]:
    """Compute calibration curve, Brier score, and log loss."""
    prob_true, prob_pred = calibration_curve(y_true, y_prob, n_bins=n_bins, strategy="uniform")
    brier = float(brier_score_loss(y_true, y_prob))
    ll = float(log_loss(y_true, np.clip(y_prob, 1e-7, 1 - 1e-7)))
    return prob_true, prob_pred, brier, ll


def assign_risk_bands(calibrated_probs: np.ndarray) -> np.ndarray:
    """Discretize calibrated relative risk into Low, Medium, High risk bands via quantile thresholds."""
    q_low = np.percentile(calibrated_probs, 60)
    q_high = np.percentile(calibrated_probs, 90)

    bands = np.full(len(calibrated_probs), "Medium", dtype=object)
    bands[calibrated_probs < q_low] = "Low"
    bands[calibrated_probs >= q_high] = "High"
    return bands
