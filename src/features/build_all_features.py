import json
import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from typing import Dict, List, Tuple
import numpy as np
import pandas as pd
import yaml
from tqdm import tqdm

from src.data.download_weather import batch_fetch_weather_for_locations, snap_coordinate
from src.features.build_task_a import build_task_a_dataset
from src.features.build_task_b import build_task_b_features, clean_stats19_collisions
from src.explain.regimes import add_all_regimes


def load_all_stats19_raw(raw_dir: Path, years: List[int]) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Load and concatenate all available STATS19 collision and vehicle CSVs."""
    collision_dfs = []
    vehicle_dfs = []

    for y in years:
        c_path = raw_dir / f"stats19_collision_{y}.csv"
        v_path = raw_dir / f"stats19_vehicle_{y}.csv"

        if c_path.exists():
            print(f"[LOADING] {c_path.name}...")
            c_df = pd.read_csv(c_path, low_memory=False)
            collision_dfs.append(c_df)
        if v_path.exists():
            print(f"[LOADING] {v_path.name}...")
            v_df = pd.read_csv(v_path, low_memory=False)
            vehicle_dfs.append(v_df)

    all_collisions = pd.concat(collision_dfs, ignore_index=True) if collision_dfs else pd.DataFrame()
    all_vehicles = pd.concat(vehicle_dfs, ignore_index=True) if vehicle_dfs else pd.DataFrame()

    print(f"Total raw collisions loaded: {len(all_collisions):,}")
    print(f"Total raw vehicles loaded: {len(all_vehicles):,}")
    return all_collisions, all_vehicles


def load_aadf_clean(raw_dir: Path) -> pd.DataFrame:
    """Load and clean AADF traffic counts dataset."""
    aadf_path = raw_dir / "dft_traffic_counts_aadf.csv"
    if not aadf_path.exists():
        zip_path = raw_dir / "dft_traffic_counts_aadf.zip"
        if zip_path.exists():
            import zipfile
            with zipfile.ZipFile(zip_path, "r") as z:
                z.extractall(raw_dir)

    print(f"[LOADING] AADF Traffic Data from {aadf_path.name}...")
    df = pd.read_csv(aadf_path, low_memory=False)

    # Use the most recent year per count point to obtain contemporary flow estimates
    df_recent = (
        df.sort_values("year", ascending=False)
        .groupby("count_point_id")
        .first()
        .reset_index()
    )

    # Standardize column naming
    rename_cols = {}
    if "all_HGVs" in df_recent.columns:
        rename_cols["all_HGVs"] = "hgvs"
    elif "all_hgvs" in df_recent.columns:
        rename_cols["all_hgvs"] = "hgvs"
    df_recent = df_recent.rename(columns=rename_cols)

    print(f"Loaded {len(df_recent):,} unique AADF traffic count points.")
    return df_recent


def run_feature_pipeline():
    config_path = Path("config.yaml")
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    raw_dir = Path(config.get("paths", {}).get("raw_data_dir", "data/raw"))
    proc_dir = Path(config.get("paths", {}).get("processed_data_dir", "data/processed"))
    tables_dir = Path(config.get("paths", {}).get("results_tables_dir", "results/tables"))
    proc_dir.mkdir(parents=True, exist_ok=True)
    tables_dir.mkdir(parents=True, exist_ok=True)

    years = config.get("data", {}).get("years", [2021, 2022, 2023, 2024])
    sample_frac = float(config.get("data", {}).get("sample_frac", 1.0))
    seed = int(config.get("seed", 42))

    # Phase 1 / 2: Load raw data
    raw_collisions, raw_vehicles = load_all_stats19_raw(raw_dir, years)
    aadf_df = load_aadf_clean(raw_dir)

    # Clean collisions
    print("[CLEANING] Filtering coordinates, parsing datetimes, handling missing values...")
    clean_collisions, drop_log = clean_stats19_collisions(raw_collisions)
    print(f"Clean collisions retained: {len(clean_collisions):,} (Dropped {drop_log['initial_rows'] - drop_log['final_clean_rows']:,} rows).")

    # Save drop log
    drop_df = pd.DataFrame([drop_log])
    drop_df.to_csv(tables_dir / "data_cleaning_drop_log.csv", index=False)
    print(f"[LOG SAVED] data_cleaning_drop_log.csv: {drop_log}")

    # Subsample if sample_frac < 1.0 (for development and compute efficiency)
    if sample_frac < 1.0:
        print(f"[SUBSAMPLING] Taking {sample_frac*100:.1f}% stratified sample for compute efficiency (seed={seed})...")
        clean_collisions = (
            clean_collisions.groupby("collision_year", group_keys=False)
            .apply(lambda g: g.sample(frac=sample_frac, random_state=seed))
            .reset_index(drop=True)
        )
        print(f"Sampled collisions: {len(clean_collisions):,}")

    # Phase 2: Weather acquisition
    print("[WEATHER] Snapping collision coordinates to 0.25-deg grid cells...")
    coords = list(zip(clean_collisions["latitude"].values, clean_collisions["longitude"].values))
    # Select top 20 most frequent cells covering majority of incidents
    snapped = [snap_coordinate(lat, lon) for lat, lon in coords]
    cell_counts = pd.Series(snapped).value_counts()
    top_cells = cell_counts.head(20).index.tolist()
    print(f"Top 20 cells cover {cell_counts.head(20).sum() / len(coords) * 100:.1f}% of collisions.")

    weather_cache_dir = raw_dir / "weather"
    cached_weather_files = list(weather_cache_dir.glob("*.parquet"))
    if cached_weather_files:
        print(f"[WEATHER CACHE] Found {len(cached_weather_files)} cached ERA5 grid cell files. Loading directly from disk...")
        weather_dfs = [pd.read_parquet(f) for f in cached_weather_files]
        all_weather_df = pd.concat(weather_dfs, ignore_index=True)
    else:
        weather_dict = batch_fetch_weather_for_locations(
            top_cells,
            start_date="2021-01-01",
            end_date="2024-12-31",
            cache_dir=weather_cache_dir,
            max_cells=20,
        )
        all_weather_df = pd.concat(list(weather_dict.values()), ignore_index=True) if weather_dict else pd.DataFrame()

    # Phase 3: Build Task B dataset
    print("\n[BUILDING] Task B (Severity level classification)...")
    task_b_df = build_task_b_features(clean_collisions, raw_vehicles, aadf_df)
    task_b_df, traffic_quantiles = add_all_regimes(task_b_df)
    task_b_path = proc_dir / "task_b_dataset.parquet"
    task_b_df.to_parquet(task_b_path, index=False)
    print(f"[SAVED] Task B dataset: {task_b_path} ({len(task_b_df):,} rows, {len(task_b_df.columns)} cols).")

    # Phase 3: Build Task A dataset
    print("\n[BUILDING] Task A (Accident occurrence risk - 1:4 Case-Control)...")
    task_a_df, feat_dict_df = build_task_a_dataset(
        clean_collisions,
        weather_df=all_weather_df,
        control_ratio=int(config.get("data", {}).get("control_to_case_ratio", 4)),
        seed=seed,
    )
    task_a_df, _ = add_all_regimes(task_a_df, traffic_quantiles=traffic_quantiles)
    task_a_path = proc_dir / "task_a_dataset.parquet"
    task_a_df.to_parquet(task_a_path, index=False)
    print(f"[SAVED] Task A dataset: {task_a_path} ({len(task_a_df):,} rows, {len(task_a_df.columns)} cols).")

    # Save feature dictionary
    dict_path = tables_dir / "feature_dictionary.csv"
    feat_dict_df.to_csv(dict_path, index=False)
    print(f"[SAVED] Feature dictionary: {dict_path}")

    print("\n[COMPLETE] Phase 2 & Phase 3 feature engineering finished successfully.")


if __name__ == "__main__":
    run_feature_pipeline()
