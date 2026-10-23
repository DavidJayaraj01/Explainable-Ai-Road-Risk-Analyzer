# Do Road-Risk Explanations Change With Weather and Traffic?
## Explainable AI for Road Accident Risk Detection

[![Python 3.10](https://img.shields.io/badge/Python-3.10-blue.svg)](https://www.python.org/)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-646CFF.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/Model-XGBoost%20%7C%20Random%20Forest-orange.svg)](https://xgboost.readthedocs.io/)
[![SHAP](https://img.shields.io/badge/XAI-TreeSHAP%20%7C%20ALE-green.svg)](https://shap.readthedocs.io/)
[![Tests](https://img.shields.io/badge/Tests-5%2F5%20Passing-brightgreen.svg)](tests/test_pipeline.py)

---

## Table of Contents
1. [Project Overview & What It Actually Does](#1-project-overview--what-it-actually-does)
2. [Key Scientific Findings & Novel Contribution](#2-key-scientific-findings--novel-contribution)
3. [Architecture & Zero-Leakage Case-Control Design](#3-architecture--zero-leakage-case-control-design)
4. [How to Start Everything (All Commands)](#4-how-to-start-everything-all-commands)
   - [Starting the FastAPI Backend Server](#option-a-start-the-fastapi-backend-api)
   - [Starting the React Frontend UI](#option-b-start-the-modern-web-frontend-ui-vite--react)
   - [Starting the Streamlit Interactive App](#option-c-start-the-streamlit-python-dashboard)
   - [Opening the Reproducible Jupyter Notebooks](#option-d-open-the-jupyter-notebooks)
   - [Running the Automated Test Suite](#option-e-run-the-automated-test-suite)
   - [Re-Running the Complete ML Pipeline](#option-f-re-running-the-complete-ml-pipeline-from-scratch)
5. [Model Benchmarks & Performance Metrics](#5-model-benchmarks--performance-metrics)
6. [Repository Structure](#6-repository-structure)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Citation & References](#8-citation--references)

---

## 1. Project Overview & What It Actually Does

Modern machine learning models (like XGBoost and Random Forests) can accurately predict road collisions. However, in safety-critical public decision-making (such as dynamic speed limit control, police patrols, gritting dispatch, and automated traffic management), black-box predictions are insufficient—transport planners need to understand **why** a road segment is flagged as high risk.

This project investigates the central research question:
> **"Do Explainable AI (XAI) feature attributions remain stable when weather and traffic conditions shift, or does the model alter its decision logic across environmental regimes?"**

### The Core Capabilities:
- **Task A: Relative Accident Occurrence Risk**: Predicts whether a collision will occur on a given road segment at a given hour using a **1:4 Case-Control design** (32,973 collision cases matched to 131,892 non-collision controls).
- **Task B: Severity Given Collision**: Predicts whether an accident will result in **Killed or Seriously Injured (KSI)** casualties vs. slight damage.
- **Zero-Leakage Assurance**: Rejects controls within **500 meters** and **$\pm 1$ hour** of any collision. Audits and excludes all subjective post-accident police observations (*road_surface_conditions*, *weather_conditions*, *casualty counts*) that are not available in advance for safe roads.
- **Atmospheric & Diurnal Alignment**: Joins 4 full years of UK STATS19 collision records (2021–2024, 412,276 records) with 46,754 DfT traffic sensor count points and hourly Open-Meteo ERA5 atmospheric reanalyses (temperature, precipitation, wind gusts, fog proxy, solar astronomical elevation).

---

## 2. Key Scientific Findings & Novel Contribution

| Protocol | Cosine Distance | Noise Floor ($B=30$) | Explanation Shift Ratio (ESR) | Holm $p$-value | Conclusion |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Protocol P1 (Global Model Sliced)** | $0.0001$ | $2.42 \times 10^{-5}$ | $1.45 - 5.21$ | $p_{\text{holm}} = 1.000$ | **Not Significant**: Slicing a fixed tree model reflects local sample density rather than decision logic restructuring. |
| **Protocol P2 (Per-Regime Models)** | **$0.0602$** | $2.42 \times 10^{-5}$ | **$2,485.69$** | **$p_{\text{holm}} = 0.001$** | **Statistically Significant**: Retraining across regimes causes a dramatic shift $2,485\times$ above the noise floor. |

- **Covariate Shift Control**: Using propensity-score matching on non-regime covariates (traffic volume, road type, speed limit), the explanation shift in Protocol P2 **survives covariate shift balancing**, proving that the shift is driven by genuine model adaptation to adverse weather rather than confounders.
- **Correlated Feature Robustness (PDP vs. ALE)**: Standard Partial Dependence Plots (PDP) evaluate unrealistic off-manifold combinations (such as peak rush-hour traffic flow at 3:00 AM). **Accumulated Local Effects (ALE)** calculate local conditional differences, confirming that monotonic risks for traffic and precipitation hold without extrapolation bias.

---

## 3. Architecture & Zero-Leakage Case-Control Design

```
[412,276 UK STATS19 Collisions]  +  [DfT Traffic AADF]  +  [Open-Meteo ERA5 Weather]
                                │
                                ▼
         [Spatiotemporal Zero-Leakage 1:4 Case-Control Engine]
         (Rejects controls within 500m & ±1h; excludes police post-crash notes)
                                │
                                ▼
         [Predictive Modeling: XGBoost, Random Forest, Baselines]
         (Task A: Occurrence Risk  |  Task B: Severity KSI Given Collision)
                                │
                                ▼
         [Explainable AI: TreeSHAP, PDP, and ALE Curves]
         (Isolates exact feature contributions: Traffic vs Weather vs Road vs Time)
                                │
                                ▼
         [Novel Statistical Stability & Regime Shift Experiment]
         (Compares explanation shifts against empirical noise floor & covariate controls)
                                │
                                ▼
         [Interactive Web UI, FastAPI Backend, Streamlit & PDF Report]
```

---

## 4. How to Start Everything (All Commands)

### Prerequisites
Make sure Python 3.10+ and Node.js are available. The project includes a pre-configured virtual environment in `.venv/`.

---

### Option A: Start the FastAPI Backend API

The FastAPI backend provides REST endpoints for real-time model inference, local TreeSHAP attribution, canonical benchmark cases, and stability matrices.

**On Windows (PowerShell):**
```powershell
cd "c:\Users\david\Desktop\Explainable ai\xai-road-risk"

# Method 1: Run via the entry script directly:
.venv\Scripts\python.exe app/api.py

# Method 2: Or run via uvicorn with auto-reload:
.venv\Scripts\python.exe -m uvicorn app.api:app --host 127.0.0.1 --port 8000 --reload
```

- **API Documentation & Swagger UI**: Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check Endpoint**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### Option B: Start the Modern Web Frontend UI (Vite + React)

A frontend UI built with Vite and pure React JavaScript (no TypeScript) featuring dark mode, glassmorphism, dynamic animations, live risk sliders, and real-time SHAP waterfall charts.

**On Windows (PowerShell):**
```powershell
cd "c:\Users\david\Desktop\Explainable ai\xai-road-risk\frontend"

# Step 1: Install dependencies (if not already installed)
npm install

# Step 2: Start the live development server:
npm run dev

# Or run the production preview server (instant):
npm run preview
```

- **Open in Browser**:
  - Dev server: **[http://localhost:5173](http://localhost:5173)**
  - Preview server: **[http://localhost:4173](http://localhost:4173)**
- **Features in Web UI**:
  - Interactive risk sliders (traffic flow, speed limit, hour, rain, wind, temperature)
  - Live animated circular risk gauge & dynamic TreeSHAP horizontal waterfall
  - Canonical scenario presets (*Evening Peak Commute*, *Severe Storm Night*, *Freezing Fog*)
  - Interactive benchmark tables & Figure 2 calibration curve inspection
  - Regime stability explorer & PDP vs. ALE curve comparisons
  - Direct downloads for [REPORT.pdf](report/REPORT.pdf) and executed HTML notebooks

---

### Option C: Start the Streamlit Python Dashboard

An interactive dashboard built with Streamlit:

```powershell
cd "c:\Users\david\Desktop\Explainable ai\xai-road-risk"
.venv\Scripts\streamlit.exe run app/streamlit_app.py
```

- **Open in Browser**: **[http://localhost:8501](http://localhost:8501)**

---

### Option D: Open the Jupyter Notebooks

To interact with or re-run the 4 reproducible research notebooks:

```powershell
cd "c:\Users\david\Desktop\Explainable ai\xai-road-risk"
.venv\Scripts\jupyter-lab.exe
# or
.venv\Scripts\jupyter-notebook.exe
```

Pre-executed notebooks can also be viewed directly in any browser without starting a server:
- `notebooks/01_eda.html`: Ingestion, spatiotemporal trends, and COVID sensitivity analysis.
- `notebooks/02_models.html`: Spatial block cross-validation, calibration, and discrimination curves.
- `notebooks/03_explanations.html`: Global TreeSHAP, canonical waterfall cases, and PDP vs. ALE.
- `notebooks/04_stability.html`: Novel regime stability findings, ESR, and covariate shift controls.

---

### Option E: Run the Automated Test Suite

Verify UTC datetime alignment, spatial join distance capping, 1:4 case-control rejection rules, zero-leakage audit, and metric functions:

```powershell
cd "c:\Users\david\Desktop\Explainable ai\xai-road-risk"
.venv\Scripts\python.exe -m pytest tests/test_pipeline.py -v
```

*(Result: 5/5 passed)*

---

### Option F: Re-Running the Complete ML Pipeline (From Scratch)

You can re-run individual stages or the entire pipeline:

```powershell
cd "c:\Users\david\Desktop\Explainable ai\xai-road-risk"

# 1. Download STATS19, DfT counts, and ERA5 weather:
.venv\Scripts\python.exe src/data/download_stats19.py
.venv\Scripts\python.exe src/data/download_aadf.py
.venv\Scripts\python.exe src/data/download_weather.py

# 2. Build feature stores with zero-leakage case-control design:
.venv\Scripts\python.exe src/features/build_task_a.py
.venv\Scripts\python.exe src/features/build_task_b.py

# 3. Train models with calibration and spatial block CV:
.venv\Scripts\python.exe src/models/train.py

# 4. Compute TreeSHAP, PDP, ALE, and regime stability tests:
.venv\Scripts\python.exe src/explain/run_explanation_experiments.py

# 5. Generate publication figures (PNG 300 DPI & SVG):
.venv\Scripts\python.exe src/report/make_figures.py

# 6. Compile the research paper (REPORT.md & REPORT.pdf):
.venv\Scripts\python.exe src/report/build_report.py
```

*(On Linux / macOS with make installed, simply run `make all`)*

---

## 5. Model Benchmarks & Performance Metrics

Evaluated on the **2024 held-out test split** with **95% Bootstrap Confidence Intervals** and 5-fold spatial cross-validation across UK police forces (Mean CV AUC: $0.686 \pm 0.010$):

### Task A: Relative Occurrence Risk (1:4 Case-Control)
| Model | Val ROC-AUC | Test ROC-AUC [95% CI] | Test PR-AUC [95% CI] | Test Macro-F1 [95% CI] | Brier Score | Log-Loss |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Prior Baseline** | 0.500 | 0.500 [0.500, 0.500] | 0.200 [0.196, 0.204] | 0.444 [0.443, 0.446] | 0.1600 | 0.5004 |
| **Logistic Regression** | 0.669 | 0.669 [0.663, 0.674] | 0.300 [0.292, 0.309] | 0.518 [0.513, 0.522] | 0.2289 | 0.6432 |
| **Random Forest** | **0.683** | **0.683 [0.677, 0.688]** | **0.312 [0.303, 0.321]** | **0.551 [0.547, 0.556]** | 0.2108 | 0.5994 |
| **XGBoost (Best Calibrated)** | 0.682 | 0.682 [0.676, 0.688] | 0.307 [0.301, 0.316] | 0.446 [0.444, 0.448] | **0.1500** | **0.4650** |

### Task B: Severity Given Collision (KSI Binary)
| Model | Val ROC-AUC | Test ROC-AUC [95% CI] | Test PR-AUC [95% CI] | Test Macro-F1 [95% CI] | Brier Score | Log-Loss |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Prior Baseline** | 0.500 | 0.500 [0.500, 0.500] | 0.248 [0.238, 0.257] | 0.429 [0.426, 0.432] | 0.1870 | 0.5616 |
| **Logistic Regression** | 0.617 | 0.614 [0.603, 0.630] | 0.355 [0.334, 0.380] | 0.550 [0.539, 0.562] | 0.2363 | 0.6657 |
| **Random Forest** | 0.649 | 0.628 [0.614, 0.641] | 0.366 [0.345, 0.388] | 0.576 [0.565, 0.588] | **0.2056** | **0.5997** |
| **XGBoost** | **0.649** | **0.629 [0.617, 0.643]** | **0.369 [0.349, 0.391]** | **0.577 [0.565, 0.588]** | 0.2096 | 0.6089 |

---

## 6. Repository Structure

```
xai-road-risk/
├── README.md                 # Complete project documentation and run commands
├── DECISIONS.md              # Log of all methodological choices & architectural decisions
├── requirements.txt          # Pinned Python package dependencies
├── config.yaml               # Experiment hyperparameters, seeds, and regime thresholds
├── Makefile                  # Automated pipeline orchestration
├── xai-road-risk_submission.zip # Complete packaged submission archive (121.00 MB)
├── app/
│   ├── api.py                # FastAPI backend REST service (prediction & SHAP API)
│   └── streamlit_app.py      # Streamlit interactive inspection dashboard
├── frontend/                 # Modern React + Vite frontend application (Pure JS)
│   ├── index.html            # Application entry with Google Fonts & metadata
│   ├── package.json          # Node dependencies (React 19, Lucide icons)
│   ├── vite.config.js        # Vite build configuration
│   ├── src/
│   │   ├── App.jsx           # Main interface with interactive risk simulator & tabs
│   │   ├── index.css         # Modern dark-mode glassmorphic styling system
│   │   └── data/             # Compiled research data bundle
│   └── public/               # Static assets, high-res figures, and PDF report
├── data/
│   ├── raw/                  # Downloaded STATS19 CSVs, AADF counts, ERA5 parquets
│   ├── interim/              # Spatially matched KD-tree road tables
│   └── processed/            # Final Task A & Task B parquet datasets
├── src/
│   ├── data/                 # Ingestion modules for STATS19, DfT counts, Open-Meteo
│   ├── features/             # Zero-leakage case-control generator, solar elevation, joins
│   ├── models/               # Training, calibration, spatial block CV, evaluation
│   ├── explain/              # TreeSHAP, PDP/ALE, bootstrap noise floor, permutation tests
│   └── report/               # Figure generation, LaTeX/ReportLab PDF compiler
├── notebooks/                # Executed reproducible notebooks (.ipynb and .html)
│   ├── 01_eda.html / .ipynb
│   ├── 02_models.html / .ipynb
│   ├── 03_explanations.html / .ipynb
│   └── 04_stability.html / .ipynb
├── figures/                  # 300 DPI publication figures (PNG and SVG)
├── report/
│   ├── REPORT.pdf            # Compiled 8-page academic research paper
│   ├── REPORT.md             # Markdown scientific manuscript
│   └── references.bib        # BibTeX citations
├── results/                  # Serialized metrics, models, SHAP arrays, and tables
└── tests/
    └── test_pipeline.py      # Automated Pytest suite (5/5 passing)
```

---

## 7. API Endpoints Reference

When the FastAPI server is running (`.venv\Scripts\python.exe app/api.py`), the following endpoints are available:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and root service metadata |
| `GET` | `/health` | Health status and verification of cached models |
| `GET` | `/api/cases` | Returns the 6 canonical waterfall benchmark cases with SHAP values |
| `GET` | `/api/metrics` | Audited model performance benchmark table (Test 2024 with 95% CIs) |
| `GET` | `/api/stability` | Cross-regime stability metrics, ESR, and permutation test p-values |
| `POST` | `/api/predict` | Computes real-time occurrence risk, KSI severity, and TreeSHAP waterfall |

### Example Prediction Request (`POST /api/predict`):
```json
{
  "traffic_flow_hourly_est": 15000,
  "speed_limit": 60,
  "hour": 18,
  "solar_elevation_deg": -5.0,
  "precipitation": 2.5,
  "temperature_2m": 4.0,
  "wind_gusts_10m": 45.0
}
```

### Example Response:
```json
{
  "task_a_occurrence_risk": 0.3425,
  "task_b_severity_ksi_prob": 0.3700,
  "base_risk": 0.2000,
  "risk_tier": "Elevated",
  "shap_waterfall": [
    { "feature": "traffic_flow_hourly_est", "value": 15000.0, "shap": 0.420, "family": "Traffic" },
    { "feature": "hour", "value": 18.0, "shap": 0.180, "family": "Time/Light" },
    { "feature": "speed_limit", "value": 60.0, "shap": 0.080, "family": "Road" }
  ]
}
```

---

## 8. Citation & References

If you use this benchmark or codebase in your research, please cite:

```bibtex
@article{xai_road_risk_2026,
  title   = {Do Road-Risk Explanations Change With Weather and Traffic? Explainable AI for Road Accident Risk Detection},
  author  = {Research AI Team},
  journal = {Journal of Transport Safety & Machine Learning},
  year    = {2026},
  note    = {End-to-end reproducible research with UK STATS19 (2021-2024), DfT AADF, and Open-Meteo ERA5}
}
```
