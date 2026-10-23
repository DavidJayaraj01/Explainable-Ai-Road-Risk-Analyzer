from pathlib import Path
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
import yaml
from src.features.solar import add_solar_features
from src.features.spatial_join import FastSpatialMatcher


def parse_uk_datetime_to_utc(dates: pd.Series, times: pd.Series) -> pd.Series:
    """Parse UK date (DD/MM/YYYY) and time (HH:MM) strings and localize to Europe/London then convert to UTC."""
    dt_str = dates.astype(str).str.strip() + " " + times.astype(str).str.strip()
    # Replace invalid/missing times
    dt_str = dt_str.str.replace(r"\s+-1$", " 12:00", regex=True)
    dt_series = pd.to_datetime(dt_str, format="%d/%m/%Y %H:%M", errors="coerce")
    # For any missing, fallback to flexible parsing
    mask_na = dt_series.isna()
    if mask_na.any():
        dt_series.loc[mask_na] = pd.to_datetime(dt_str.loc[mask_na], errors="coerce")

    # Localize from London time to UTC
    try:
        dt_utc = dt_series.dt.tz_localize("Europe/London", ambiguous="NaT", nonexistent="shift_forward").dt.tz_convert("UTC")
    except Exception:
        # If tz already exists or simple UTC
        dt_utc = pd.to_datetime(dt_series, utc=True)
    return dt_utc


def clean_stats19_collisions(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, int]]:
    """Clean STATS19 collision records, treating missing codes (-1, 9, 99) as NaN and logging drop counts."""
    drop_log = {}
    n_initial = len(df)
    drop_log["initial_rows"] = n_initial

    # Drop missing coordinates
    valid_coords = df["latitude"].notna() & df["longitude"].notna() & (df["latitude"] != 0) & (df["longitude"] != 0)
    drop_log["dropped_missing_coords"] = int((~valid_coords).sum())
    df = df[valid_coords].copy()

    # Drop missing severity
    valid_sev = df["collision_severity"].isin([1, 2, 3])
    drop_log["dropped_missing_severity"] = int((~valid_sev).sum())
    df = df[valid_sev].copy()

    # Treat -1 as NaN for categorical attributes
    categorical_cols = [
        "speed_limit", "road_type", "junction_detail", "first_road_class",
        "light_conditions", "weather_conditions", "road_surface_conditions",
        "urban_or_rural_area"
    ]
    for col in categorical_cols:
        if col in df.columns:
            df[col] = df[col].replace([-1, "-1", 99, "99"], np.nan)

    # Parse datetimes to UTC
    df["datetime_utc"] = parse_uk_datetime_to_utc(df["date"], df["time"])
    valid_dt = df["datetime_utc"].notna()
    drop_log["dropped_unparseable_datetime"] = int((~valid_dt).sum())
    df = df[valid_dt].copy()

    drop_log["final_clean_rows"] = len(df)
    return df, drop_log


def build_task_b_features(
    collisions_df: pd.DataFrame,
    vehicles_df: pd.DataFrame,
    aadf_df: Optional[pd.DataFrame] = None,
) -> pd.DataFrame:
    """Build feature table for Task B (Severity level classification)."""
    df = collisions_df.copy()

    # Targets
    # 3-class: 1=Fatal (High), 2=Serious (Medium), 3=Slight (Low)
    severity_map_3class = {1: "High", 2: "Medium", 3: "Low"}
    df["target_severity_3class"] = df["collision_severity"].map(severity_map_3class)
    # Binary: 1 = Fatal/Serious (Killed or Seriously Injured - KSI), 0 = Slight
    df["target_ksi_binary"] = (df["collision_severity"].isin([1, 2])).astype(int)

    # Time features
    dt = df["datetime_utc"]
    df["hour"] = dt.dt.hour
    df["day_of_week"] = dt.dt.dayofweek
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    df["month"] = dt.dt.month
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24.0)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24.0)
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12.0)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12.0)

    # Solar position and light regime
    df = add_solar_features(df, lat_col="latitude", lon_col="longitude", dt_col="datetime_utc")

    # Aggregate vehicle details if vehicle records provided
    if vehicles_df is not None and not vehicles_df.empty:
        idx_col = "collision_index" if "collision_index" in vehicles_df.columns else "collision_ref_no"
        veh_agg = (
            vehicles_df.groupby(idx_col)
            .agg(
                has_hgv=("vehicle_type", lambda s: int(any(v in [19, 20, 21, 98] for v in s))),
                has_motorcycle=("vehicle_type", lambda s: int(any(v in [2, 3, 4, 5, 23, 97] for v in s))),
                has_pedal_cycle=("vehicle_type", lambda s: int(any(v == 1 for v in s))),
            )
            .reset_index()
        )
        c_idx = "collision_index" if "collision_index" in df.columns else "collision_ref_no"
        df = df.merge(veh_agg, left_on=c_idx, right_on=idx_col, how="left")
        df["has_hgv"] = df["has_hgv"].fillna(0).astype(int)
        df["has_motorcycle"] = df["has_motorcycle"].fillna(0).astype(int)
        df["has_pedal_cycle"] = df["has_pedal_cycle"].fillna(0).astype(int)
    else:
        df["has_hgv"] = 0
        df["has_motorcycle"] = 0
        df["has_pedal_cycle"] = 0

    # Spatial join with AADF traffic counts if provided
    if aadf_df is not None and not aadf_df.empty:
        matcher = FastSpatialMatcher(aadf_df, lat_col="latitude", lon_col="longitude")
        matched = matcher.query_nearest(df["latitude"].values, df["longitude"].values, max_distance_km=2.0)
        df["aadf_all_motor_vehicles"] = matched["all_motor_vehicles"].values
        df["aadf_hgvs"] = matched.get("hgvs", np.nan).values if "hgvs" in matched.columns else np.nan
        df["aadf_hgv_share"] = df["aadf_hgvs"] / df["aadf_all_motor_vehicles"].replace(0, np.nan)
        df["aadf_distance_km"] = matched["spatial_join_distance_km"].values
        df["aadf_estimation_method"] = matched.get("estimation_method", "Unmatched").values
    else:
        df["aadf_all_motor_vehicles"] = np.nan
        df["aadf_hgvs"] = np.nan
        df["aadf_hgv_share"] = np.nan
        df["aadf_distance_km"] = np.nan
        df["aadf_estimation_method"] = "None"

    return df
