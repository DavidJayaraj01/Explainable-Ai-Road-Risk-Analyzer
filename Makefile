PYTHON = .venv/Scripts/python.exe

.PHONY: all data features train explain stability report test clean

all: data features train explain stability report test

data:
	$(PYTHON) src/data/download_stats19.py
	$(PYTHON) src/data/download_aadf.py
	$(PYTHON) src/data/download_weather.py
	$(PYTHON) src/data/download_us_accidents.py

features:
	$(PYTHON) src/features/spatial_join.py
	$(PYTHON) src/features/solar.py
	$(PYTHON) src/features/build_task_b.py
	$(PYTHON) src/features/build_task_a.py

train:
	$(PYTHON) src/models/train.py
	$(PYTHON) src/models/calibrate.py
	$(PYTHON) src/models/evaluate.py

explain:
	$(PYTHON) src/explain/shap_utils.py
	$(PYTHON) src/explain/pdp_ale.py

stability:
	$(PYTHON) src/explain/regimes.py
	$(PYTHON) src/explain/stability.py
	$(PYTHON) src/explain/shift_control.py

report:
	$(PYTHON) src/report/make_figures.py
	$(PYTHON) src/report/make_tables.py
	$(PYTHON) src/report/build_report.py

test:
	$(PYTHON) -m pytest tests/

clean:
	rm -rf data/interim/* data/processed/* results/metrics/* results/shap/* results/pdp_ale/* results/stability/* results/tables/* figures/*
