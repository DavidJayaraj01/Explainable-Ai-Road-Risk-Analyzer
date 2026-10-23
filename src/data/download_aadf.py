"""Download UK DfT Annual Average Daily Flow (AADF) traffic counts."""

from pathlib import Path
import zipfile
import requests
import yaml
from tqdm import tqdm


def download_aadf():
    config_path = Path("config.yaml")
    if config_path.exists():
        with open(config_path, "r") as f:
            config = yaml.safe_load(f)
    else:
        config = {}

    raw_dir = Path(config.get("paths", {}).get("raw_data_dir", "data/raw"))
    raw_dir.mkdir(parents=True, exist_ok=True)

    aadf_url = "https://storage.googleapis.com/dft-statistics/road-traffic/downloads/data-gov-uk/dft_traffic_counts_aadf.zip"
    zip_dest = raw_dir / "dft_traffic_counts_aadf.zip"

    # Check if extracted CSV already exists
    csv_candidates = list(raw_dir.glob("*aadf*.csv"))
    if csv_candidates and csv_candidates[0].stat().st_size > 1000:
        print(f"[CACHE HIT] AADF CSV already extracted: {csv_candidates[0].name} ({csv_candidates[0].stat().st_size / 1e6:.1f} MB)")
        return str(csv_candidates[0])

    if not (zip_dest.exists() and zip_dest.stat().st_size > 1000):
        print(f"[DOWNLOADING] AADF Traffic Data from {aadf_url}")
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        response = requests.get(aadf_url, headers=headers, stream=True, timeout=60)
        if response.status_code != 200:
            raise RuntimeError(f"Failed to download AADF: HTTP {response.status_code}")

        total_size = int(response.headers.get("content-length", 0))
        temp_zip = zip_dest.with_suffix(".tmp")
        with open(temp_zip, "wb") as f, tqdm(
            desc="dft_traffic_counts_aadf.zip",
            total=total_size,
            unit="iB",
            unit_scale=True,
            unit_divisor=1024,
        ) as bar:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    size = f.write(chunk)
                    bar.update(size)
        temp_zip.replace(zip_dest)
        print(f"[DOWNLOAD COMPLETE] {zip_dest.name} ({zip_dest.stat().st_size / 1e6:.1f} MB)")

    print(f"[EXTRACTING] {zip_dest.name} -> {raw_dir}")
    with zipfile.ZipFile(zip_dest, "r") as z:
        z.extractall(raw_dir)
        extracted = z.namelist()
        print(f"Extracted files: {extracted}")

    csv_candidates = list(raw_dir.glob("*aadf*.csv"))
    if csv_candidates:
        print(f"AADF primary CSV: {csv_candidates[0].name}")
        return str(csv_candidates[0])
    return None


if __name__ == "__main__":
    download_aadf()
