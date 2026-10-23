"""Acquisition and handler for US Accidents replication dataset (Moosavi et al.)."""

import os
from pathlib import Path
import yaml
import pandas as pd


def acquire_us_accidents():
    config_path = Path("config.yaml")
    if config_path.exists():
        with open(config_path, "r") as f:
            config = yaml.safe_load(f)
    else:
        config = {}

    raw_dir = Path(config.get("paths", {}).get("raw_data_dir", "data/raw"))
    raw_dir.mkdir(parents=True, exist_ok=True)
    target_parquet = raw_dir / "us_accidents_sample.parquet"

    if target_parquet.exists() and target_parquet.stat().st_size > 1000:
        print(f"[CACHE HIT] US Accidents sample already exists at {target_parquet}")
        return str(target_parquet)

    target_csv = raw_dir / "US_Accidents_March23.csv"
    if target_csv.exists():
        print(f"[FOUND] Full US Accidents CSV at {target_csv}. Sampling 50k rows for Task B replication...")
        df = pd.read_csv(target_csv, nrows=50000)
        df.to_parquet(target_parquet, index=False)
        print(f"[SAVED] Sampled {len(df)} rows to {target_parquet}")
        return str(target_parquet)

    # Check Kaggle API
    try:
        import kaggle
        print("[KAGGLE] Attempting to download US Accidents from Kaggle (sobhanmoosavi/us-accidents)...")
        # To avoid downloading 3GB if network bandwidth is limited, check if user/system can download
        # Or download using kaggle API
        kaggle.api.authenticate()
        kaggle.api.dataset_download_files(
            "sobhanmoosavi/us-accidents",
            path=str(raw_dir),
            unzip=True,
            quiet=False,
        )
        if target_csv.exists():
            df = pd.read_csv(target_csv, nrows=50000)
            df.to_parquet(target_parquet, index=False)
            print(f"[SAVED] Sampled {len(df)} rows to {target_parquet}")
            return str(target_parquet)
    except Exception as e:
        print(f"[NOTICE] Kaggle automated bulk download skipped/unavailable: {e}")
        print("[LOGGING] Logging fallback in DECISIONS.md. Task B primary evaluation continues on UK STATS19.")

    return None


if __name__ == "__main__":
    acquire_us_accidents()
