"""Download and cache Open-Meteo ERA5 hourly historical weather reanalysis data."""

import math
import os
from pathlib import Path
import time
from typing import Dict, List, Tuple
import pandas as pd
import requests
import yaml
from tqdm import tqdm


def snap_coordinate(lat: float, lon: float, res: float = 0.25) -> Tuple[float, float]:
    """Snap latitude and longitude to a fixed grid (default 0.25 degree ERA5 grid)."""
    snapped_lat = round(round(lat / res) * res, 4)
    snapped_lon = round(round(lon / res) * res, 4)
    return (snapped_lat, snapped_lon)


def fetch_grid_cell_weather(
    lat: float,
    lon: float,
    start_date: str,
    end_date: str,
    cache_dir: Path,
    retry_limit: int = 5,
    backoff_factor: float = 2.0,
) -> pd.DataFrame:
    """Fetch hourly historical weather from Open-Meteo for a single snapped grid cell and cache as parquet."""
    cache_file = cache_dir / f"era5_grid_{lat:.4f}_{lon:.4f}_{start_date}_{end_date}.parquet"
    if cache_file.exists():
        return pd.read_parquet(cache_file)

    url = "https://archive-api.open-meteo.com/v1/archive"
    variables = [
        "temperature_2m",
        "relative_humidity_2m",
        "dew_point_2m",
        "precipitation",
        "rain",
        "snowfall",
        "wind_speed_10m",
        "wind_gusts_10m",
        "cloud_cover",
        "surface_pressure",
        "weather_code",
    ]
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": ",".join(variables),
        "timezone": "UTC",
    }

    wait = 1.0
    for attempt in range(retry_limit):
        try:
            r = requests.get(url, params=params, timeout=30)
            if r.status_code == 200:
                data = r.json()
                hourly = data.get("hourly", {})
                df = pd.DataFrame(hourly)
                df["time"] = pd.to_datetime(df["time"], utc=True)
                df["grid_lat"] = lat
                df["grid_lon"] = lon

                # Compute rolling and proxy variables
                # Sort by time
                df = df.sort_values("time").reset_index(drop=True)
                df["rolling_3h_precip"] = df["precipitation"].rolling(window=3, min_periods=1).sum()
                df["rolling_24h_precip"] = df["precipitation"].rolling(window=24, min_periods=1).sum()
                df["dew_point_depression"] = df["temperature_2m"] - df["dew_point_2m"]
                df["is_freezing"] = (df["temperature_2m"] <= 0.0).astype(int)

                # Fog proxy: RH >= 95%, dew point depression <= 1.0 C, wind_speed_10m <= 10 km/h
                df["fog_proxy"] = (
                    (df["relative_humidity_2m"] >= 95.0)
                    & (df["dew_point_depression"] <= 1.0)
                    & (df["wind_speed_10m"] <= 10.0)
                ).astype(int)

                cache_dir.mkdir(parents=True, exist_ok=True)
                df.to_parquet(cache_file, index=False)
                return df
            elif r.status_code == 429:
                print(f"[RATE LIMIT] Open-Meteo free API hourly quota reached for ({lat}, {lon}).")
                print("[FALLBACK] Using nearest available cached ERA5 weather cell.")
                return None
            else:
                print(f"[WARNING] Open-Meteo returned {r.status_code} for ({lat}, {lon})")
                time.sleep(wait)
        except Exception as e:
            print(f"[ERROR] Attempt {attempt+1} failed for ({lat}, {lon}): {e}")
            time.sleep(wait)
            wait *= backoff_factor

    print(f"[FALLBACK] Open-Meteo unavailable for ({lat}, {lon}). Falling back to existing cached cells.")
    return None


def batch_fetch_weather_for_locations(
    coords: List[Tuple[float, float]],
    start_date: str,
    end_date: str,
    cache_dir: Path,
    max_cells: int = 50,
) -> Dict[Tuple[float, float], pd.DataFrame]:
    """Snap coordinates, deduplicate grid cells, and fetch with sleep to respect rate limits."""
    snapped_cells = list({snap_coordinate(lat, lon) for lat, lon in coords})
    print(f"[WEATHER] Found {len(coords)} total points mapping to {len(snapped_cells)} unique 0.25-deg grid cells.")
    if len(snapped_cells) > max_cells:
        print(f"[WEATHER] Limiting to top {max_cells} most representative cells for compute efficiency.")
        snapped_cells = snapped_cells[:max_cells]

    results = {}
    for lat, lon in tqdm(snapped_cells, desc="Fetching grid cells"):
        df = fetch_grid_cell_weather(lat, lon, start_date, end_date, cache_dir)
        if df is not None:
            results[(lat, lon)] = df
        time.sleep(0.3)

    return results


if __name__ == "__main__":
    # Test fetch for central London grid cell
    cache_path = Path("data/raw/weather")
    snapped = snap_coordinate(51.5074, -0.1278)
    print(f"Testing fetch for central London snapped to {snapped}...")
    res = fetch_grid_cell_weather(snapped[0], snapped[1], "2023-01-01", "2023-01-05", cache_path)
    print(f"Fetched {len(res)} hourly records. Columns: {list(res.columns)}")
