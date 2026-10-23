from pathlib import Path
from typing import Dict, List, Optional, Tuple
import holidays
import numpy as np
import pandas as pd
from scipy.spatial import cKDTree
from src.features.solar import add_solar_features
from src.features.spatial_join import lat_lon_to_cartesian_km


def get_uk_traffic_hourly_profile() -> np.ndarray:
    """Standard DfT diurnal traffic multiplier by hour of day (0-23) normalized to mean 1.0.
    
    Source: DfT Table TRA0307 (Hourly traffic distribution on Great Britain roads).
    """
    profile = np.array([
        0.15, 0.10, 0.08, 0.08, 0.15, 0.35,  # 00:00 - 05:00
        0.75, 1.45, 1.65, 1.30, 1.25, 1.30,  # 06:00 - 11:00 (morning peak ~08:00)
        1.35, 1.40, 1.45, 1.60, 1.75, 1.70,  # 12:00 - 17:00 (evening peak ~16:00-17:00)
        1.35, 1.05, 0.80, 0.60, 0.40, 0.25   # 18:00 - 23:00
    ], dtype=float)
    # Normalize to mean = 1.0 so AADF * hourly_factor maintains mean daily volume scale
    return profile / profile.mean()


def sample_controls_for_cases(
    cases_df: pd.DataFrame,
    control_ratio: int = 4,
    rejection_dist_km: float = 0.5,
    rejection_window_hours: float = 1.0,
    seed: int = 42,
) -> pd.DataFrame:
    """Sample non-accident controls for each collision case.
    
    - Controls drawn from the empirical pool of collision locations (preserving static road network context).
    - Random datetime within the same year.
    - Strict rejection rule: candidate control rejected if within 500m AND +/- 1 hour of any actual collision.
    """
    rng = np.random.default_rng(seed)
    controls = []

    # Build spatial KD-tree of all collision locations in km
    all_coords_km = lat_lon_to_cartesian_km(cases_df["latitude"].values, cases_df["longitude"].values)
    collision_tree = cKDTree(all_coords_km)
    all_timestamps = cases_df["datetime_utc"].astype("int64") // 10**9  # unix timestamp in seconds
    window_sec = rejection_window_hours * 3600

    # Group cases by year
    years = cases_df["datetime_utc"].dt.year.unique()

    for y in years:
        year_mask = cases_df["datetime_utc"].dt.year == y
        year_cases = cases_df[year_mask].reset_index(drop=True)
        n_cases_year = len(year_cases)
        target_n_controls = n_cases_year * control_ratio

        # Start and end timestamps for the year in seconds
        start_ts = int(pd.Timestamp(f"{y}-01-01 00:00:00", tz="UTC").timestamp())
        end_ts = int(pd.Timestamp(f"{y}-12-31 23:00:00", tz="UTC").timestamp())

        accepted_controls = []
        max_attempts = target_n_controls * 5
        attempts = 0

        # Location pool indices
        loc_pool_indices = np.arange(len(year_cases))

        while len(accepted_controls) < target_n_controls and attempts < max_attempts:
            batch_size = min(10000, target_n_controls - len(accepted_controls))
            attempts += batch_size

            # Sample locations from pool
            sampled_loc_idx = rng.choice(loc_pool_indices, size=batch_size, replace=True)
            # Sample random timestamps
            sampled_ts = rng.integers(start_ts, end_ts, size=batch_size)

            sampled_lats = year_cases.iloc[sampled_loc_idx]["latitude"].values
            sampled_lons = year_cases.iloc[sampled_loc_idx]["longitude"].values
            sampled_km = lat_lon_to_cartesian_km(sampled_lats, sampled_lons)

            # Query collisions within rejection_dist_km
            neighbors_list = collision_tree.query_ball_point(sampled_km, r=rejection_dist_km)

            for i, neighbors in enumerate(neighbors_list):
                c_ts = sampled_ts[i]
                is_rejected = False
                if len(neighbors) > 0:
                    # Check temporal closeness
                    near_collisions_ts = all_timestamps[neighbors]
                    time_diffs = np.abs(near_collisions_ts - c_ts)
                    if np.any(time_diffs <= window_sec):
                        is_rejected = True

                if not is_rejected:
                    # Accept control
                    loc_row = year_cases.iloc[sampled_loc_idx[i]].to_dict()
                    # Overwrite datetime
                    loc_row["datetime_utc"] = pd.to_datetime(c_ts, unit="s", utc=True)
                    loc_row["is_accident"] = 0
                    accepted_controls.append(loc_row)
                    if len(accepted_controls) >= target_n_controls:
                        break

        controls.extend(accepted_controls)

    controls_df = pd.DataFrame(controls)
    return controls_df


def build_task_a_dataset(
    cases_df: pd.DataFrame,
    weather_df: Optional[pd.DataFrame] = None,
    control_ratio: int = 4,
    seed: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Construct full case-control dataset for Task A and generate feature dictionary."""
    cases_df = cases_df.copy()
    cases_df["is_accident"] = 1

    # Remove case-only subjective attributes to guarantee zero leakage
    leakage_cols = [
        "collision_severity", "number_of_casualties", "number_of_vehicles",
        "weather_conditions", "light_conditions", "road_surface_conditions"
    ]
    for col in leakage_cols:
        if col in cases_df.columns:
            cases_df = cases_df.drop(columns=[col])

    # Sample controls
    print(f"[TASK A] Sampling controls with ratio 1:{control_ratio}...")
    controls_df = sample_controls_for_cases(cases_df, control_ratio=control_ratio, seed=seed)
    print(f"[TASK A] Sampled {len(controls_df)} controls for {len(cases_df)} cases.")

    # Combine cases and controls
    combined = pd.concat([cases_df, controls_df], ignore_index=True)

    # Time features
    dt = combined["datetime_utc"]
    combined["hour"] = dt.dt.hour
    combined["day_of_week"] = dt.dt.dayofweek
    combined["hour_of_week"] = combined["day_of_week"] * 24 + combined["hour"]
    combined["month"] = dt.dt.month
    combined["is_weekend"] = (combined["day_of_week"] >= 5).astype(int)

    # Bank holidays
    uk_holidays = holidays.country_holidays("UK")
    combined["is_bank_holiday"] = dt.dt.date.apply(lambda d: int(d in uk_holidays))

    # Traffic diurnal flow calculation
    hourly_traffic_profile = get_uk_traffic_hourly_profile()
    hourly_multipliers = hourly_traffic_profile[combined["hour"].values]
    if "aadf_all_motor_vehicles" in combined.columns:
        combined["traffic_flow_hourly_est"] = combined["aadf_all_motor_vehicles"].fillna(10000) * hourly_multipliers
    else:
        combined["traffic_flow_hourly_est"] = 10000 * hourly_multipliers

    # Solar position and light regime
    combined = add_solar_features(combined, lat_col="latitude", lon_col="longitude", dt_col="datetime_utc")

    # Join weather if provided
    if weather_df is not None and not weather_df.empty:
        # Match coordinates to nearest available ERA5 weather grid cell via cKDTree
        unique_cells = weather_df[["grid_lat", "grid_lon"]].drop_duplicates().values
        cell_tree = cKDTree(unique_cells)
        target_coords = np.column_stack([combined["latitude"].values, combined["longitude"].values])
        _, cell_indices = cell_tree.query(target_coords)
        combined["grid_lat"] = unique_cells[cell_indices, 0]
        combined["grid_lon"] = unique_cells[cell_indices, 1]
        combined["weather_hour"] = combined["datetime_utc"].dt.floor("h")

        weather_df["weather_hour"] = pd.to_datetime(weather_df["time"], utc=True).dt.floor("h")
        weather_cols = [
            "grid_lat", "grid_lon", "weather_hour",
            "temperature_2m", "relative_humidity_2m", "dew_point_2m",
            "precipitation", "rolling_3h_precip", "rolling_24h_precip",
            "wind_speed_10m", "wind_gusts_10m", "is_freezing", "fog_proxy"
        ]
        available_weather_cols = [c for c in weather_cols if c in weather_df.columns]
        combined = combined.merge(
            weather_df[available_weather_cols],
            on=["grid_lat", "grid_lon", "weather_hour"],
            how="left"
        )
    else:
        # Default fallback placeholders
        for c in ["temperature_2m", "relative_humidity_2m", "precipitation", "rolling_3h_precip", "rolling_24h_precip", "wind_gusts_10m", "is_freezing", "fog_proxy"]:
            if c not in combined.columns:
                combined[c] = 0.0

    # Build feature dictionary
    dict_records = [
        {"feature_name": "traffic_flow_hourly_est", "source": "DfT AADF x Diurnal Profile", "type": "Continuous", "leakage_safe": "Yes", "description": "Hourly traffic exposure estimated from nearest AADF count point"},
        {"feature_name": "aadf_hgv_share", "source": "DfT AADF", "type": "Continuous", "leakage_safe": "Yes", "description": "Heavy Goods Vehicle proportion at nearest count point"},
        {"feature_name": "speed_limit", "source": "STATS19 Road Static", "type": "Categorical/Ordinal", "leakage_safe": "Yes", "description": "Posted road speed limit (mph)"},
        {"feature_name": "road_type", "source": "STATS19 Road Static", "type": "Categorical", "leakage_safe": "Yes", "description": "Dual carriageway, single, roundabout, etc."},
        {"feature_name": "junction_detail", "source": "STATS19 Road Static", "type": "Categorical", "leakage_safe": "Yes", "description": "Junction layout (T-junction, crossroads, etc.)"},
        {"feature_name": "urban_or_rural_area", "source": "STATS19 Road Static", "type": "Binary", "leakage_safe": "Yes", "description": "Urban (1) vs Rural (2)"},
        {"feature_name": "hour", "source": "Datetime UTC", "type": "Discrete", "leakage_safe": "Yes", "description": "Hour of day (0-23)"},
        {"feature_name": "day_of_week", "source": "Datetime UTC", "type": "Discrete", "leakage_safe": "Yes", "description": "Day of week (0=Mon, 6=Sun)"},
        {"feature_name": "month", "source": "Datetime UTC", "type": "Discrete", "leakage_safe": "Yes", "description": "Month of year (1-12)"},
        {"feature_name": "is_weekend", "source": "Datetime UTC", "type": "Binary", "leakage_safe": "Yes", "description": "Weekend indicator"},
        {"feature_name": "is_bank_holiday", "source": "Holidays Library", "type": "Binary", "leakage_safe": "Yes", "description": "UK official bank holiday"},
        {"feature_name": "solar_elevation_deg", "source": "Astral Ephemeris", "type": "Continuous", "leakage_safe": "Yes", "description": "Solar elevation angle in degrees above horizon"},
        {"feature_name": "light_regime", "source": "Astral Ephemeris", "type": "Categorical", "leakage_safe": "Yes", "description": "Day vs Night/Twilight derived strictly from solar angle"},
        {"feature_name": "temperature_2m", "source": "Open-Meteo ERA5", "type": "Continuous", "leakage_safe": "Yes", "description": "Near-surface air temperature at 2m (C)"},
        {"feature_name": "precipitation", "source": "Open-Meteo ERA5", "type": "Continuous", "leakage_safe": "Yes", "description": "Hourly precipitation total (mm)"},
        {"feature_name": "rolling_3h_precip", "source": "Open-Meteo ERA5", "type": "Continuous", "leakage_safe": "Yes", "description": "3-hour cumulative precipitation wet-road proxy (mm)"},
        {"feature_name": "rolling_24h_precip", "source": "Open-Meteo ERA5", "type": "Continuous", "leakage_safe": "Yes", "description": "24-hour cumulative precipitation (mm)"},
        {"feature_name": "wind_gusts_10m", "source": "Open-Meteo ERA5", "type": "Continuous", "leakage_safe": "Yes", "description": "Peak wind gust speed at 10m (km/h)"},
        {"feature_name": "is_freezing", "source": "Open-Meteo ERA5", "type": "Binary", "leakage_safe": "Yes", "description": "Air temperature <= 0 C freezing flag"},
        {"feature_name": "fog_proxy", "source": "Open-Meteo ERA5", "type": "Binary", "leakage_safe": "Yes", "description": "Low visibility proxy: RH >= 95%, dew depression <= 1C, low wind"}
    ]
    feature_dict_df = pd.DataFrame(dict_records)

    return combined, feature_dict_df
