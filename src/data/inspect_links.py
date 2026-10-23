import requests
from bs4 import BeautifulSoup
import re

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

print("--- Testing STATS19 with GET (stream) ---")
test_url = "https://data.dft.gov.uk/road-accidents-safety-data/dft-road-casualty-statistics-collision-2022.csv"
try:
    r = requests.get(test_url, headers=headers, stream=True, timeout=10)
    print(f"GET status: {r.status_code}")
    print(f"Headers: {dict(list(r.headers.items())[:5])}")
    # read first 200 bytes
    first_chunk = next(r.iter_content(chunk_size=200))
    print(f"First 200 bytes: {first_chunk[:200]}")
except Exception as e:
    print(f"Error: {e}")

print("\n--- Inspecting data.gov.uk dataset page for collisions ---")
page_url = "https://www.data.gov.uk/dataset/cb7ae6f0-4be6-4935-9277-47e5ce24a11f/road-accidents-safety-data"
try:
    r = requests.get(page_url, headers=headers, timeout=15)
    print(f"Page status: {r.status_code}")
    links = re.findall(r'href=[\'"](https?://[^\'"]+dft[^\'"]*collision[^\'"]*\.csv)[\'"]', r.text, re.IGNORECASE)
    print(f"Found collision CSV links ({len(links)}):")
    for l in links[:10]:
        print(" ", l)
except Exception as e:
    print(f"Error scraping page: {e}")

print("\n--- Inspecting DfT Road Traffic Downloads page ---")
traffic_page = "https://roadtraffic.dft.gov.uk/downloads"
try:
    r = requests.get(traffic_page, headers=headers, timeout=15)
    print(f"Traffic page status: {r.status_code}")
    links = re.findall(r'href=[\'"]([^\'"]+aadf[^\'"]*)[\'"]', r.text, re.IGNORECASE)
    print(f"Found AADF links ({len(links)}):")
    for l in links[:10]:
        print(" ", l)
except Exception as e:
    print(f"Traffic page error: {e}")
