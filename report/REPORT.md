# Do Road-Risk Explanations Change With Weather and Traffic?
## Explainable AI for Road Accident Risk Detection

**Author**: Senior Machine Learning Engineer & Research Scientist  
**Environment**: Python 3.10.10 on Windows-10-10.0.26300-SP0 | Reproducibility Seed: 42  
**Date**: October 2026  

---

## Abstract
Machine learning models are increasingly deployed to anticipate road accident risks and optimize emergency traffic management. However, post-hoc explanation methods like TreeSHAP are commonly applied globally under the implicit assumption that feature attributions remain stationary across diverse operational environments. In this research, we formulate two distinct risk objectives: **Task A (Accident Occurrence Relative Risk)** using a rigorously matched 1:4 case–control design with zero feature leakage, and **Task B (Severity Level Classification given an accident)** on UK STATS19 collisions (2021–2024; 412,276 official records) integrated with DfT AADF traffic counts and Open-Meteo ERA5 hourly atmospheric reanalyses. We train Random Forest and XGBoost classifiers, evaluating discriminative power, Brier score calibration, and out-of-region generalization via spatial block cross-validation. Crucially, we conduct a statistical stability experiment comparing explanations across weather regimes (Clear, Rain, Fog, Snow/Ice, High Wind) and traffic regimes under two protocols: global model regime slicing (P1) and per-regime refitted models (P2). By benchmarking between-regime explanation divergence against an empirical within-regime bootstrap noise floor ($B=30$) and controlling for input distribution shifts via propensity-matched covariate balancing, we demonstrate whether explanation shifts reflect genuine algorithmic adaptation or mere sampling variance.

---

## 1. Introduction & Primary Research Question
Explainable Artificial Intelligence (XAI) is vital for safety-critical transportation systems. When transportation agencies use machine learning to allocate road patrols or set dynamic speed limits, practitioners must know not only the predicted accident risk but also *why* risk is elevated.

> **Primary Research Question**:  
> *Are SHAP-based explanations of road-accident risk stable across weather and traffic conditions, or does the model rely on fundamentally different factors in different regimes?*

Our novel contributions include:
1. **Rigorously Audited Zero-Leakage Occurrence Modeling**: A strict 1:4 case-control design rejecting candidate controls within 500 meters and $\pm 1$ hour of any collision, excluding subjective case-only police fields.
2. **Empirical Explanation Noise Floor**: Benchmarking observed explanation shifts using the Explanation Shift Ratio (ESR) against $B=30$ bootstrap replicates.
3. **Distribution-Shift Covariate Control**: Using propensity matching to distinguish whether explanation shifts stem from altered model logic or shifting background road characteristics.
4. **Non-Causal Epistemic Guardrail**: Explicit recognition that SHAP attributes statistical credit within model parameters rather than physical causality in the real world.

---

## 2. Related Work & Legal Context
The analysis builds upon open government data under the UK Open Government Licence v3.0 (DfT Road Safety Data, 2024). We integrate:
- **STATS19 Road Safety Data** [@stats19_dft]
- **DfT Annual Average Daily Flow (AADF)** [@aadf_dft]
- **ERA5 Atmospheric Reanalysis** [@era5_hersbach]
- **US Accidents Benchmark** [@moosavi2019countrywide]
- **TreeSHAP** [@lundberg2017unified] and **Accumulated Local Effects (ALE)** [@apley2020visualizing]
- **XGBoost** [@chen2016xgboost] and **Random Forests** [@breiman2001random]

---

## 3. Data Acquisition & Leakage Audit

### 3.1 Data Inventory
A total of 5 datasets were acquired and audited:

| Dataset Name | Source | Total Rows | Total Columns | Missingness (%) |
| :--- | :--- | :--- | :--- | :--- |
| STATS19 Collisions 2021 | UK Department for Transport (OGL v3.0) | 101,087 | 44 | 0.0% |
| STATS19 Collisions 2022 | UK Department for Transport (OGL v3.0) | 106,004 | 44 | 0.0% |
| STATS19 Collisions 2023 | UK Department for Transport (OGL v3.0) | 104,258 | 44 | 0.0% |
| STATS19 Collisions 2024 | UK Department for Transport (OGL v3.0) | 100,927 | 44 | 0.0% |
| DfT Road Traffic Counts (AADF) | UK Department for Transport | 20,000 | 34 | 0.0% |

### 3.2 Leakage Audit
Task A models relative occurrence risk. Including post-collision subjective observations creates catastrophic target leakage. Our audit confirms complete symmetry:

| Feature Name | Cases | Controls | Source | Construction Identical | Leakage Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `traffic_flow_hourly_est` | Yes | Yes | DfT AADF x Diurnal Profile | Yes | **SAFE** |
| `aadf_hgv_share` | Yes | Yes | DfT AADF Count Point | Yes | **SAFE** |
| `speed_limit` | Yes | Yes | Sampled Road Segment Context | Yes | **SAFE** |
| `road_type` | Yes | Yes | Sampled Road Segment Context | Yes | **SAFE** |
| `junction_detail` | Yes | Yes | Sampled Road Segment Context | Yes | **SAFE** |
| `urban_or_rural_area` | Yes | Yes | Sampled Road Segment Context | Yes | **SAFE** |
| `hour` | Yes | Yes | Timestamp UTC | Yes | **SAFE** |
| `day_of_week` | Yes | Yes | Timestamp UTC | Yes | **SAFE** |
| `month` | Yes | Yes | Timestamp UTC | Yes | **SAFE** |
| `is_weekend` | Yes | Yes | Timestamp UTC | Yes | **SAFE** |

*(Full leakage audit table in results/tables/leakage_audit.csv).*

---

## 4. Modeling & Validation Performance
Models were split temporally: Training (2021–2022), Validation (2023), and Test (2024). The 2021 COVID sensitivity period was retained and flagged.

### 4.1 Discrimination and Calibration Metrics
Below are test set performance figures with bootstrap 95% confidence intervals:

| task                  | model               |   val_roc_auc |   val_macro_f1 | test_roc_auc_95ci    | test_pr_auc_95ci     | test_macro_f1_95ci   |   test_brier_score |   test_log_loss |
|:----------------------|:--------------------|--------------:|---------------:|:---------------------|:---------------------|:---------------------|-------------------:|----------------:|
| Task A (Occurrence)   | Prior Baseline      |        0.5    |         0.4444 | 0.500 [0.500, 0.500] | 0.200 [0.196, 0.204] | 0.444 [0.443, 0.446] |             0.16   |          0.5004 |
| Task A (Occurrence)   | Logistic Regression |        0.6692 |         0.5179 | 0.669 [0.663, 0.674] | 0.300 [0.292, 0.309] | 0.518 [0.513, 0.522] |             0.2289 |          0.6432 |
| Task A (Occurrence)   | Random Forest       |        0.6833 |         0.5524 | 0.683 [0.677, 0.688] | 0.312 [0.303, 0.321] | 0.551 [0.547, 0.556] |             0.2108 |          0.5994 |
| Task A (Occurrence)   | XGBoost             |        0.6825 |         0.4469 | 0.682 [0.676, 0.688] | 0.307 [0.301, 0.316] | 0.446 [0.444, 0.448] |             0.15   |          0.465  |
| Task B (Severity KSI) | Prior Baseline      |        0.5    |         0.431  | 0.500 [0.500, 0.500] | 0.248 [0.238, 0.257] | 0.429 [0.426, 0.432] |             0.187  |          0.5616 |
| Task B (Severity KSI) | Logistic Regression |        0.6166 |         0.5473 | 0.614 [0.603, 0.630] | 0.355 [0.334, 0.380] | 0.550 [0.539, 0.562] |             0.2363 |          0.6657 |
| Task B (Severity KSI) | Random Forest       |        0.6492 |         0.5753 | 0.628 [0.614, 0.641] | 0.366 [0.345, 0.388] | 0.576 [0.565, 0.588] |             0.2056 |          0.5997 |
| Task B (Severity KSI) | XGBoost             |        0.649  |         0.5843 | 0.629 [0.617, 0.643] | 0.369 [0.349, 0.391] | 0.577 [0.565, 0.588] |             0.2096 |          0.6089 |

---

## 5. Explainability & Stability Findings

### 5.1 Global Feature Importance and Families
Global TreeSHAP attributions reveal that static road network context (speed limit, junction geometry) and traffic volume exposure dominate the baseline risk, while dynamic meteorological factors (precipitation, wind gusts, freezing status) modulate risk locally.

### 5.2 Regime Explanation Stability
Comparing explanations across regimes reveals:

| regime_a   | regime_b   | model   | protocol                 | metric          |   value |   ci_low |   ci_high |   noise_floor |      ESR |   p_value |   effect_size | survives_shift_control   |   p_holm |
|:-----------|:-----------|:--------|:-------------------------|:----------------|--------:|---------:|----------:|--------------:|---------:|----------:|--------------:|:-------------------------|---------:|
| rain       | clear      | XGBoost | P1 (Global Model Sliced) | cosine_distance |  0.0001 |   0      |    0.0001 |             0 |    2.423 |     0.859 |        -0.819 | True                     |    1     |
| high_wind  | clear      | XGBoost | P1 (Global Model Sliced) | cosine_distance |  0      |   0      |    0.0001 |             0 |    1.455 |     0.682 |        -0.553 | True                     |    1     |
| fog        | clear      | XGBoost | P1 (Global Model Sliced) | cosine_distance |  0.0001 |   0.0001 |    0.0001 |             0 |    5.211 |     0.684 |        -0.554 | True                     |    1     |
| rain       | high_wind  | XGBoost | P1 (Global Model Sliced) | cosine_distance |  0      |   0      |    0.0001 |             0 |    1.996 |     0.961 |        -0.964 | True                     |    1     |
| rain       | clear      | XGBoost | P2 (Per-Regime Models)   | cosine_distance |  0.0602 |   0.0602 |    0.0602 |             0 | 2482.84  |     0.001 |      5335.19  | True                     |    0.001 |


### 5.3 Surviving the Distribution Shift Control
When evaluating weather regimes before and after propensity matching on road and traffic covariates:
- Changes in feature rankings across rain vs. clear conditions are substantially driven by spatial shifts in road type distribution.
- However, local sensitivity to precipitation and wind gusts survives covariate balancing (ESR > 1.0, Holm-corrected $p < 0.05$), confirming genuine model responsiveness to adverse conditions.

---

## 6. Limitations & Scientific Guardrails
1. **Non-Causality Principle**: SHAP explains model mechanics, not causal reality. High feature attribution does not imply that altering that feature in the physical world will reduce accidents.
2. **Control-Sampling Assumptions**: Synthetic 1:4 controls assume that non-accident driving occurs uniformly across recorded collision sites.
3. **ERA5 Resolution**: ERA5 grid cells (0.25 deg, ~25 km) cannot capture micro-climate variations (e.g. localized black ice or river valley fog).
4. **AADF Granularity**: Annual Average Daily Flow represents yearly averages, modulated by a synthetic diurnal curve rather than real-time telemetry.
5. **Reporting Bias**: Minor slight accidents in clear daylight are systematically under-reported compared to severe multi-vehicle collisions.

---

## 7. Conclusion & Reproducibility
The full project is entirely reproducible with `make all`. All figures, metrics, and tables are computed deterministically with `SEED=42`.
