"""Download UK STATS19 collision and vehicle data (2021-2024) from DfT."""

import os
from pathlib import Path
import requests
import yaml
from tqdm import tqdm


def download_file(url: str, dest_path: Path, chunk_size: int = 1024 * 1024):
    """Download a file with streaming and progress bar if not already present."""
    if dest_path.exists() and dest_path.stat().st_size > 1000:
        print(f"[CACHE HIT] {dest_path.name} already exists ({dest_path.stat().st_size / 1e6:.1f} MB). Skipping download.")
        return True

    print(f"[DOWNLOADING] {url} -> {dest_path}")
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    try:
        response = requests.get(url, headers=headers, stream=True, timeout=30)
        if response.status_code != 200:
            print(f"[ERROR] Failed to download {url}: HTTP {response.status_code}")
            return False

        total_size = int(response.headers.get("content-length", 0))
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        temp_dest = dest_path.with_suffix(".tmp")

        with open(temp_dest, "wb") as f, tqdm(
            desc=dest_path.name,
            total=total_size,
            unit="iB",
            unit_scale=True,
            unit_divisor=1024,
        ) as bar:
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    size = f.write(chunk)
                    bar.update(size)

        temp_dest.replace(dest_path)
        print(f"[DOWNLOAD COMPLETE] {dest_path.name} ({dest_path.stat().st_size / 1e6:.1f} MB)")
        return True
    except Exception as e:
        print(f"[EXCEPTION] Failed to download {url}: {e}")
        return False


def main():
    config_path = Path("config.yaml")
    if config_path.exists():
        with open(config_path, "r") as f:
            config = yaml.safe_load(f)
    else:
        config = {}

    raw_dir = Path(config.get("paths", {}).get("raw_data_dir", "data/raw"))
    raw_dir.mkdir(parents=True, exist_ok=True)

    base_url = config.get("data", {}).get(
        "stats19_base_url", "https://data.dft.gov.uk/road-accidents-safety-data"
    )
    years = config.get("data", {}).get("years", [2021, 2022, 2023, 2024])

    downloaded = {}
    for y in years:
        collision_url = f"{base_url}/dft-road-casualty-statistics-collision-{y}.csv"
        vehicle_url = f"{base_url}/dft-road-casualty-statistics-vehicle-{y}.csv"

        c_dest = raw_dir / f"stats19_collision_{y}.csv"
        v_dest = raw_dir / f"stats19_vehicle_{y}.csv"

        c_ok = download_file(collision_url, c_dest)
        v_ok = download_file(vehicle_url, v_dest)
        downloaded[y] = {"collision": c_ok, "vehicle": v_ok}

    print("\n--- STATS19 Download Summary ---")
    for y, status in downloaded.items():
        print(f"Year {y}: Collisions {'OK' if status['collision'] else 'FAILED'}, Vehicles {'OK' if status['vehicle'] else 'FAILED'}")


if __name__ == "__main__":
    main()
