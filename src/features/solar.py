"""Solar position and day/night/twilight calculator using astral."""

from datetime import datetime
from typing import List, Union
import numpy as np
import pandas as pd
from astral import Observer
from astral.sun import elevation


def calculate_solar_elevation(lats: np.ndarray, lons: np.ndarray, datetimes_utc: pd.Series) -> np.ndarray:
    """Vectorized / batch solar elevation calculation.
    
    elevation >= 0: Day
    -12 <= elevation < 0: Twilight (civil and nautical)
    elevation < -12: Night
    """
    elevations = []
    # Convert series to python datetime objects in UTC
    dt_list = pd.to_datetime(datetimes_utc, utc=True).dt.to_pydatetime()

    for lat, lon, dt in zip(lats, lons, dt_list):
        if np.isnan(lat) or np.isnan(lon):
            elevations.append(np.nan)
            continue
        try:
            obs = Observer(latitude=lat, longitude=lon)
            elev = elevation(obs, dt)
            elevations.append(elev)
        except Exception:
            elevations.append(np.nan)

    return np.array(elevations)


def classify_light_regime(elevations: np.ndarray) -> np.ndarray:
    """Classify into Day, Twilight, Night and binary Day vs Night/Twilight.
    
    Returns array of strings: 'day', 'twilight', 'night'
    """
    classes = np.empty(len(elevations), dtype=object)
    classes[elevations >= 0] = "day"
    classes[(elevations >= -12) & (elevations < 0)] = "twilight"
    classes[elevations < -12] = "night"
    classes[np.isnan(elevations)] = "unknown"
    return classes


def add_solar_features(df: pd.DataFrame, lat_col: str = "latitude", lon_col: str = "longitude", dt_col: str = "datetime_utc") -> pd.DataFrame:
    """Add solar_elevation and light_regime columns to DataFrame."""
    df = df.copy()
    elevs = calculate_solar_elevation(df[lat_col].values, df[lon_col].values, df[dt_col])
    df["solar_elevation_deg"] = elevs
    df["solar_light_phase"] = classify_light_regime(elevs)
    # Binary light regime for regime analysis: 'day' vs 'night_twilight'
    df["light_regime"] = np.where(df["solar_light_phase"] == "day", "day", "night_twilight")
    return df


if __name__ == "__main__":
    # Test on London noon vs midnight
    test_df = pd.DataFrame({
        "latitude": [51.5074, 51.5074],
        "longitude": [-0.1278, -0.1278],
        "datetime_utc": ["2023-06-21 12:00:00", "2023-12-21 00:00:00"]
    })
    res = add_solar_features(test_df)
    print("Solar test results:")
    print(res[["datetime_utc", "solar_elevation_deg", "solar_light_phase", "light_regime"]])
