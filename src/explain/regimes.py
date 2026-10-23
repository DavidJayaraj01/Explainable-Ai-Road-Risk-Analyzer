"""Regime segmentation logic for Weather, Traffic, and Light regimes."""

from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
import yaml


def assign_weather_regimes(
    df: pd.DataFrame,
    precip_thresh: float = 0.5,
    gust_thresh: float = 40.0,
    snow_thresh: float = 0.01,
    min_test_samples: int = 2000,
    is_test_set: bool = False,
) -> pd.Series:
    """Assign mutually exclusive weather regimes according to strict documented priority:
    1. snow_ice
    2. fog
    3. rain
    4. high_wind
    5. clear
    
    If any regime has fewer than min_test_samples on test set, it is merged into a documented parent regime.
    """
    n = len(df)
    regimes = np.full(n, "clear", dtype=object)

    precip = df.get("precipitation", pd.Series(0.0, index=df.index)).fillna(0.0).values
    snowfall = df.get("snowfall", pd.Series(0.0, index=df.index)).fillna(0.0).values
    freezing = df.get("is_freezing", pd.Series(0, index=df.index)).fillna(0).values
    fog = df.get("fog_proxy", pd.Series(0, index=df.index)).fillna(0).values
    gusts = df.get("wind_gusts_10m", pd.Series(0.0, index=df.index)).fillna(0.0).values

    # 4. High wind
    mask_wind = gusts >= gust_thresh
    regimes[mask_wind] = "high_wind"

    # 3. Rain
    mask_rain = precip >= precip_thresh
    regimes[mask_rain] = "rain"

    # 2. Fog
    mask_fog = fog == 1
    regimes[mask_fog] = "fog"

    # 1. Snow / Ice (highest priority)
    mask_snow_ice = (snowfall > snow_thresh) | ((freezing == 1) & (precip > 0))
    regimes[mask_snow_ice] = "snow_ice"

    regimes_series = pd.Series(regimes, index=df.index, name="weather_regime")

    # Check minimum test sample size merging rule
    if is_test_set and min_test_samples > 0:
        counts = regimes_series.value_counts()
        for regime_name, count in counts.items():
            if count < min_test_samples and regime_name != "clear":
                # Merge rare regime into adverse weather composite
                print(f"[REGIME MERGE] Regime '{regime_name}' has {count} < {min_test_samples} test samples; merging into 'adverse_other'.")
                regimes_series = regimes_series.replace({regime_name: "adverse_other"})

    return regimes_series


def assign_traffic_regimes(
    df: pd.DataFrame,
    train_quantiles: Optional[Tuple[float, float]] = None,
    peak_hours: Optional[List[int]] = None,
) -> Tuple[pd.Series, Tuple[float, float]]:
    """Assign traffic regimes into Tertiles (low, medium, high) and Peak/Off-Peak."""
    if peak_hours is None:
        peak_hours = [7, 8, 9, 16, 17, 18]

    traffic_vol = df.get("traffic_flow_hourly_est", df.get("aadf_all_motor_vehicles", pd.Series(10000, index=df.index))).fillna(10000)

    if train_quantiles is None:
        q33 = float(traffic_vol.quantile(0.333))
        q66 = float(traffic_vol.quantile(0.667))
        train_quantiles = (q33, q66)
    else:
        q33, q66 = train_quantiles

    tertiles = pd.Series("medium", index=df.index)
    tertiles[traffic_vol <= q33] = "low"
    tertiles[traffic_vol > q66] = "high"

    # Peak vs Off-peak
    hour = df.get("hour", pd.Series(12, index=df.index)).values
    dow = df.get("day_of_week", pd.Series(0, index=df.index)).values
    is_weekday = dow < 5
    is_peak = is_weekday & np.isin(hour, peak_hours)

    traffic_peak_regime = tertiles + np.where(is_peak, "_peak", "_offpeak")
    traffic_peak_regime.name = "traffic_regime"

    return traffic_peak_regime, train_quantiles


def add_all_regimes(
    df: pd.DataFrame,
    traffic_quantiles: Optional[Tuple[float, float]] = None,
    is_test_set: bool = False,
) -> Tuple[pd.DataFrame, Tuple[float, float]]:
    """Add weather_regime, traffic_regime, and light_regime to DataFrame."""
    df = df.copy()
    df["weather_regime"] = assign_weather_regimes(df, is_test_set=is_test_set)
    t_regime, quantiles = assign_traffic_regimes(df, train_quantiles=traffic_quantiles)
    df["traffic_regime"] = t_regime

    if "light_regime" not in df.columns:
        if "solar_elevation_deg" in df.columns:
            df["light_regime"] = np.where(df["solar_elevation_deg"] >= 0, "day", "night_twilight")
        else:
            df["light_regime"] = "day"

    return df, quantiles
