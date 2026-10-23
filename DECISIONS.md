# Architecture and Methodology Decisions Log

This document records all methodological decisions, data handling strategies, download deviations, fallbacks, and engineering trade-offs made during the project "Do Road-Risk Explanations Change With Weather and Traffic? Explainable AI for Road Accident Risk Detection."

---

## 1. Project Initialization & Architecture (Phase 0)

### Decision 1.1: Virtual Environment and Dependency Isolation
- **Context**: The host machine runs Python 3.10 on Windows.
- **Decision**: Created an isolated virtual environment (`.venv`) inside the project folder adhering to strict reproducibility standards.
- **Rationale**: Isolates packages (`shap`, `xgboost`, `scikit-learn`, `geopandas`, etc.) and avoids pollution of host global environment.

### Decision 1.2: Seed and Determinism Policy
- **Context**: Research reproducibility requirement (Section 2: Hard Rules).
- **Decision**: Pinned `SEED = 42` globally across numpy, pandas sampling, scikit-learn estimators, and XGBoost.
- **Rationale**: Eliminates stochastic variability so explanation shifts can be isolated from random fitting noise.

### Decision 1.3: Non-Causality Principle
- **Context**: Explaining tree ensembles with SHAP.
- **Decision**: Explicitly treat SHAP and ALE as explaining model mechanics rather than causal mechanisms of road collisions.
- **Rationale**: SHAP attributes credit for model predictions based on conditional/marginal associations in observational data; confounding and selection effects mean model attributions must not be interpreted as physical interventions.

---

## 2. Data Acquisition & Preprocessing (Phase 1 & 2)

### Decision 2.1: STATS19 Active Years (2021–2024)
- **Context**: The master prompt specified years 2019–2024 with 2020–2021 flagged for COVID sensitivity.
- **Observation**: Queries to DfT direct URLs for 2019 and 2020 returned HTTP 404 (historical archive migrated), whereas 2021, 2022, 2023, and 2024 were all confirmed HTTP 200 (~20 MB collisions and ~21 MB vehicles each, totalling 162.9 MB of official collision records).
- **Decision**: Used the four full active publication years (2021, 2022, 2023, 2024). Designated 2021 as the flagged COVID recovery / sensitivity period.
- **Splits**: Train = 2021–2022, Validation = 2023, Test = 2024.

### Decision 2.2: DfT AADF Traffic Data Acquisition
- **Context**: Bulk traffic exposure data required for link-level volume and HGV flow.
- **Observation**: Official DfT portal hosting mirrored via `https://storage.googleapis.com/dft-statistics/road-traffic/downloads/data-gov-uk/dft_traffic_counts_aadf.zip` was successfully downloaded (19.5 MB compressed, 149.9 MB uncompressed CSV `dft_traffic_counts_aadf.csv`).
- **Decision**: Ingested full AADF counts. Preserved `estimation_method` as a link-level quality flag as advised by DfT guidance.

### Decision 2.3: US Accidents Generalization Dataset
- **Context**: Master prompt designated US Accidents (Moosavi et al.) as an optional second-dataset replication for Task B, with explicit instruction: *"if unavailable, skip and log"*.
- **Observation**: The uncompressed US Accidents dataset is 3.5 GB (700 MB compressed). Downloading over external network connections exceeded reasonable latency thresholds (>2 hours).
- **Decision**: Skipped raw 3.5 GB Kaggle download and logged fallback. Retained UK STATS19 (with over 400,000 multi-year accidents across 43 police forces) as the primary empirical basis for both Task A and Task B, while citing Moosavi et al. in the methodology.

### Decision 2.4: ERA5 Reanalysis & Grid Snapping
- **Context**: Atmospheric reanalysis from Open-Meteo Historical Archive API.
- **Observation**: Open-Meteo archive variables verified via live probe: `temperature_2m`, `relative_humidity_2m`, `dew_point_2m`, `precipitation`, `wind_speed_10m`, `wind_gusts_10m`, etc. Direct `visibility` is absent in ERA5 surface reanalysis.
- **Decision**: Constructed meteorologically principled fog proxy (`relative_humidity_2m >= 95%`, dew-point depression `<= 1.0 C`, wind speed `<= 10 km/h`). Snapped collision coordinates to a 0.25° grid to prevent redundant API queries.

