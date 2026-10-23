"""Publication-ready figure generation (300 DPI PNG and SVG)."""

import json
from pathlib import Path
from typing import Dict, List, Optional
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns


# Configure publication style
plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
plt.rcParams.update({
    "font.size": 10,
    "axes.labelsize": 11,
    "axes.titlesize": 12,
    "xtick.labelsize": 9,
    "ytick.labelsize": 9,
    "legend.fontsize": 9,
    "figure.titlesize": 14,
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
})


def save_plot(fig: plt.Figure, name: str, figures_dir: Path):
    """Save plot as both 300 DPI PNG and vectorized SVG."""
    figures_dir.mkdir(parents=True, exist_ok=True)
    png_path = figures_dir / f"{name}.png"
    svg_path = figures_dir / f"{name}.svg"
    fig.savefig(png_path, dpi=300, bbox_inches="tight")
    fig.savefig(svg_path, format="svg", bbox_inches="tight")
    plt.close(fig)
    print(f"[FIGURE SAVED] {png_path.name} & {svg_path.name}")


def plot_data_overview(collisions_df: pd.DataFrame, figures_dir: Path):
    """Figure 1: Temporal collision distributions and severity breakdown with COVID period flagged."""
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))

    # Time series of monthly collisions
    monthly = collisions_df.set_index("datetime_utc").resample("M").size()
    ax1 = axes[0]
    ax1.plot(monthly.index, monthly.values, color="#1f77b4", lw=2, marker="o", ms=4, label="Monthly Collisions")
    # Flag COVID sensitivity period (March 2020 - Dec 2021)
    ax1.axvspan(pd.Timestamp("2020-03-01"), pd.Timestamp("2021-12-31"), color="#d62728", alpha=0.15, label="COVID Period (Flagged)")
    ax1.set_title("UK Road Collisions Over Time (STATS19)")
    ax1.set_xlabel("Date")
    ax1.set_ylabel("Monthly Collisions Count")
    ax1.legend(loc="upper right")

    # Severity distribution
    ax2 = axes[1]
    sev_counts = collisions_df["collision_severity"].value_counts().sort_index()
    labels = ["Fatal (1)", "Serious (2)", "Slight (3)"]
    colors = ["#d62728", "#ff7f0e", "#2ca02c"]
    bars = ax2.bar(labels, sev_counts.values, color=colors, edgecolor="black", alpha=0.85)
    for bar in bars:
        h = bar.get_height()
        ax2.annotate(f"{h:,}", xy=(bar.get_x() + bar.get_width() / 2, h), xytext=(0, 3),
                     textcoords="offset points", ha="center", va="bottom", fontsize=9)
    ax2.set_title("Severity Level Distribution")
    ax2.set_ylabel("Number of Collisions")

    plt.tight_layout()
    save_plot(fig, "fig1_data_overview", figures_dir)


def plot_model_calibration_and_roc(
    task_a_results: Dict, task_b_results: Dict, figures_dir: Path
):
    """Figure 2: Discrimination (ROC) and Calibration curves for Task A and Task B."""
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))

    # Task A ROC & Calibration
    ax_a_roc = axes[0, 0]
    ax_a_cal = axes[0, 1]

    # Task B ROC & Calibration
    ax_b_roc = axes[1, 0]
    ax_b_cal = axes[1, 1]

    for model_name, col in [("Random Forest", "#1f77b4"), ("XGBoost", "#2ca02c")]:
        if model_name in task_a_results:
            res = task_a_results[model_name]
            ax_a_roc.plot(res.get("fpr", [0, 1]), res.get("tpr", [0, 1]), label=f"{model_name} (AUC={res.get('roc_auc', 0):.3f})", color=col, lw=2)
            ax_a_cal.plot(res.get("cal_pred", [0, 1]), res.get("cal_true", [0, 1]), "s-", label=f"{model_name} (Brier={res.get('brier', 0):.3f})", color=col)

        if model_name in task_b_results:
            res = task_b_results[model_name]
            ax_b_roc.plot(res.get("fpr", [0, 1]), res.get("tpr", [0, 1]), label=f"{model_name} (AUC={res.get('roc_auc', 0):.3f})", color=col, lw=2)
            ax_b_cal.plot(res.get("cal_pred", [0, 1]), res.get("cal_true", [0, 1]), "s-", label=f"{model_name} (Brier={res.get('brier', 0):.3f})", color=col)

    # Reference lines
    for ax in [ax_a_roc, ax_b_roc]:
        ax.plot([0, 1], [0, 1], "k--", alpha=0.6, label="Chance")
        ax.set_xlabel("False Positive Rate")
        ax.set_ylabel("True Positive Rate")
        ax.legend(loc="lower right")

    for ax in [ax_a_cal, ax_b_cal]:
        ax.plot([0, 1], [0, 1], "k--", alpha=0.6, label="Perfect Calibration")
        ax.set_xlabel("Mean Predicted Probability")
        ax.set_ylabel("Fraction of Positives")
        ax.legend(loc="upper left")

    ax_a_roc.set_title("Task A: Accident Occurrence - ROC Curves")
    ax_a_cal.set_title("Task A: Accident Occurrence - Calibration")
    ax_b_roc.set_title("Task B: Severity (KSI) - ROC Curves")
    ax_b_cal.set_title("Task B: Severity (KSI) - Calibration")

    plt.tight_layout()
    save_plot(fig, "fig2_model_performance_calibration", figures_dir)


def plot_shap_global_summary(imp_df: pd.DataFrame, figures_dir: Path):
    """Figure 3: Global TreeSHAP feature importance bar plot with feature family color coding."""
    fig, ax = plt.subplots(figsize=(10, 7))
    family_palette = {"Weather": "#3498db", "Road": "#e67e22", "Traffic": "#e74c3c", "Time/Light": "#9b59b6", "Other": "#95a5a6"}

    top_df = imp_df.head(15).copy()
    colors = [family_palette.get(fam, "#95a5a6") for fam in top_df["family"]]

    bars = ax.barh(top_df["feature"][::-1], top_df["mean_abs_shap"][::-1], color=colors[::-1], edgecolor="black", alpha=0.85)
    ax.set_xlabel("Mean |SHAP Value| (Impact on Model Log-Odds)")
    ax.set_title("Global Feature Importance (TreeSHAP) by Feature Family")

    # Legend for families
    handles = [plt.Rectangle((0, 0), 1, 1, color=color, label=fam) for fam, color in family_palette.items() if fam in top_df["family"].values]
    ax.legend(handles=handles, title="Feature Family", loc="lower right")

    plt.tight_layout()
    save_plot(fig, "fig3_shap_global_summary", figures_dir)


def plot_family_shares_across_regimes(shares_df: pd.DataFrame, figures_dir: Path):
    """Figure 4: Stacked bar chart showing feature family importance shares across weather & traffic regimes."""
    fig, ax = plt.subplots(figsize=(11, 6))
    shares_df.plot(kind="bar", stacked=True, ax=ax, colormap="tab10", edgecolor="black", alpha=0.85)
    ax.set_ylabel("Importance Share (%)")
    ax.set_xlabel("Regime")
    ax.set_title("Feature Family Importance Share Across Environmental & Operational Regimes")
    ax.legend(title="Family", bbox_to_anchor=(1.02, 1), loc="upper left")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    save_plot(fig, "fig4_feature_families_regimes", figures_dir)


def plot_pdp_ale_comparison(pdp_dict: Dict, ale_dict: Dict, feature_name: str, figures_dir: Path):
    """Figure 5: Side-by-side comparison of PDP vs ALE curves for a top feature."""
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    # PDP
    axes[0].plot(pdp_dict["grid"], pdp_dict["pdp"], color="#2980b9", lw=2.5, label="PDP Average")
    axes[0].set_title(f"Partial Dependence Plot (PDP): {feature_name}")
    axes[0].set_xlabel(feature_name)
    axes[0].set_ylabel("Predicted Risk Log-Odds / Prob")

    # ALE
    axes[1].plot(ale_dict["grid"], ale_dict["ale"], color="#27ae60", lw=2.5, label="ALE Main Effect")
    axes[1].set_title(f"Accumulated Local Effects (ALE): {feature_name}")
    axes[1].set_xlabel(feature_name)
    axes[1].set_ylabel("Centered ALE Value")

    for ax in axes:
        ax.axhline(0, color="gray", linestyle="--", alpha=0.6)
        ax.legend()

    plt.tight_layout()
    save_plot(fig, f"fig5_pdp_ale_{feature_name}", figures_dir)


def plot_stability_esr(stability_df: pd.DataFrame, figures_dir: Path):
    """Figure 6: Explanation Shift Ratio (ESR) per regime pair against the noise floor (ESR = 1.0)."""
    fig, ax = plt.subplots(figsize=(11, 6))

    sub = stability_df[stability_df["metric"] == "cosine_distance"].copy()
    if sub.empty:
        sub = stability_df.copy()

    pairs = sub["regime_a"] + " vs " + sub["regime_b"]
    esr_vals = sub["ESR"].values

    colors = np.where(esr_vals > 1.0, "#e74c3c", "#3498db")
    bars = ax.barh(pairs, esr_vals, color=colors, edgecolor="black", alpha=0.85)

    ax.axvline(1.0, color="black", linestyle="--", lw=2, label="Noise Floor (ESR = 1.0)")
    ax.set_xlabel("Explanation Shift Ratio (ESR = Between-Regime Distance / Noise Floor)")
    ax.set_title("Explanation Shift Ratio Across Regimes (Red: Detectable Shift > Noise Floor)")
    ax.legend(loc="lower right")

    plt.tight_layout()
    save_plot(fig, "fig6_stability_esr_noise_floor", figures_dir)


def main():
    base_dir = Path(__file__).resolve().parent.parent.parent
    results_dir = base_dir / "results"
    figures_dir = base_dir / "figures"
    figures_dir.mkdir(parents=True, exist_ok=True)

    print("[FIGURES] Generating publication figures (300 DPI PNG & SVG)...")

    # Fig 1: Data Overview
    task_b_path = base_dir / "data" / "processed" / "task_b_dataset.parquet"
    if task_b_path.exists():
        task_b_df = pd.read_parquet(task_b_path)
        plot_data_overview(task_b_df, figures_dir)

    # Fig 2: Model Performance & Calibration
    task_a_m_path = results_dir / "metrics" / "task_a_metrics.json"
    task_b_m_path = results_dir / "metrics" / "task_b_metrics.json"
    if task_a_m_path.exists() and task_b_m_path.exists():
        with open(task_a_m_path) as f:
            t_a = json.load(f)
        with open(task_b_m_path) as f:
            t_b = json.load(f)

        # Structure metrics for plot
        a_res = {}
        for m_name in ["Random Forest", "XGBoost"]:
            if m_name in t_a:
                cal = t_a[m_name].get("calibration_curve", {})
                a_res[m_name] = {
                    "roc_auc": t_a[m_name]["test_with_ci"]["roc_auc"]["value"],
                    "brier": t_a[m_name]["brier_score"],
                    "cal_pred": cal.get("prob_pred", [0, 1]),
                    "cal_true": cal.get("prob_true", [0, 1]),
                }
        b_res = {}
        for m_name in ["Random Forest", "XGBoost"]:
            if m_name in t_b:
                cal = t_b[m_name].get("calibration_curve", {})
                b_res[m_name] = {
                    "roc_auc": t_b[m_name]["test_with_ci"]["roc_auc"]["value"],
                    "brier": t_b[m_name]["brier_score"],
                    "cal_pred": cal.get("prob_pred", [0, 1]),
                    "cal_true": cal.get("prob_true", [0, 1]),
                }
        plot_model_calibration_and_roc(a_res, b_res, figures_dir)

    # Fig 3: Global TreeSHAP Summary
    imp_path = results_dir / "shap" / "task_a_xgb_global_importance.csv"
    if imp_path.exists():
        imp_df = pd.read_csv(imp_path)
        plot_shap_global_summary(imp_df, figures_dir)

    # Fig 4: Feature Family Shares Across Regimes
    fam_path = results_dir / "tables" / "feature_family_shares.csv"
    if fam_path.exists():
        fam_df = pd.read_csv(fam_path).set_index("regime")[["Traffic", "Time/Light", "Weather", "Road"]]
        plot_family_shares_across_regimes(fam_df, figures_dir)

    # Fig 5: PDP vs ALE for top features
    pdp_ale_path = results_dir / "pdp_ale" / "pdp_ale_top_features.json"
    if pdp_ale_path.exists():
        with open(pdp_ale_path) as f:
            pdp_ale = json.load(f)
        for feat, d in pdp_ale.items():
            plot_pdp_ale_comparison(
                {"pdp": np.array(d["pdp"]), "grid": np.array(d["pdp_grid"])},
                {"ale": np.array(d["ale"]), "grid": np.array(d["ale_grid"])},
                feat,
                figures_dir
            )

    # Fig 6: Stability ESR & Noise Floor
    stab_path = results_dir / "tables" / "stability_summary.csv"
    if stab_path.exists():
        stab_df = pd.read_csv(stab_path)
        plot_stability_esr(stab_df, figures_dir)

    print("[FIGURES] All publication figures successfully generated.")


if __name__ == "__main__":
    main()
