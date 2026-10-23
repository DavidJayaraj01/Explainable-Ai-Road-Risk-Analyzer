import requests

years = [2019, 2020, 2021, 2022, 2023, 2024]
print("--- Checking STATS19 collisions ---")
for y in years:
    url = f"https://data.dft.gov.uk/road-accidents-safety-data/dft-road-casualty-statistics-collision-{y}.csv"
    try:
        r = requests.head(url, timeout=10, allow_redirects=True)
        print(f"{y}: status {r.status_code}, content-length: {r.headers.get('content-length', 'unknown')}")
    except Exception as e:
        print(f"{y}: error {e}")

print("--- Checking AADF ---")
aadf_urls = [
    "https://storage.googleapis.com/dft-statistics/road-traffic/downloads/aadf/dft_aadf_uk.csv",
    "https://storage.googleapis.com/dft-statistics/road-traffic/downloads/aadf/dft_aadf_region_id_1.csv",
    "https://roadtraffic.dft.gov.uk/api/average-annual-daily-flow-csv"
]
for u in aadf_urls:
    try:
        r = requests.head(u, timeout=10, allow_redirects=True)
        print(f"{u}: status {r.status_code}, length: {r.headers.get('content-length', 'unknown')}")
    except Exception as e:
        print(f"{u}: error {e}")

print("--- Checking Open-Meteo ---")
om_url = "https://archive-api.open-meteo.com/v1/archive?latitude=51.5074&longitude=-0.1278&start_date=2023-01-01&end_date=2023-01-02&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation,rain,snowfall,wind_speed_10m,wind_gusts_10m,cloud_cover,surface_pressure,weather_code"
try:
    r = requests.get(om_url, timeout=10)
    print(f"Open-Meteo status: {r.status_code}, json keys: {list(r.json().keys())}")
    if "hourly" in r.json():
        print(f"Hourly variables: {list(r.json()['hourly'].keys())}")
except Exception as e:
    print(f"Open-Meteo error: {e}")
