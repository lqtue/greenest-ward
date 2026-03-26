VIETNAM URBAN GREEN SPACE ANALYSIS (2025)
Project Overview & Methodological Framework

==================================================
1. PROJECT OVERVIEW
==================================================
This project measures green space distribution across 687 newly structured
urban wards (phường) in Vietnam, using satellite imagery and administrative
data. It then focuses on Ho Chi Minh City to investigate how four political
regimes — French colonial, wartime, post-reunification, and market era —
each left a "green debt" that is still visible from space.

The analysis operates at three levels:
  1. National snapshot: ward-level green cover for all 687 phường (2025)
  2. HCMC deep dive: historical boundary analysis + accessibility modeling
  3. HCMC temporal: 500m grid of green cover + surface temperature,
     1985-2025, for change detection across regime eras


==================================================
2. DATA SOURCES
==================================================

2.1 Satellite Imagery
- Sentinel-2 SR Harmonized (10m) — 2025 ward-level green cover
- Landsat 5 TM Collection 2 L2 (30m) — historical NDVI 1985-2010
- Landsat 8/9 OLI Collection 2 L2 (30m) — historical NDVI 2015-2025
- Landsat 8/9 thermal (ST_B10, 100m native) — land surface temperature

2.2 Administrative Boundaries
- 687 ward boundaries (2025 post-merger, shapefile in VNWard.zip)
- Ward merger records (Sáp nhập từ — which old phường/xã merged)
- Population per ward (administrative census data)

2.3 HCMC Historical Boundaries (external)
- Nội thành 1972 (71 km²) — French colonial + early war-era core
- Nội thành 1976 (126 km²) — post-reunification expansion
- Nội thành 2000 (442 km²) — industrial/Đổi Mới era expansion
- Nội thành 2004-2025 (493 km²) — modern nội thành
- Toàn TP 1978-2025 (2,021 km²) — full HCMC (pre-merger)
  Also available via GEE: FAO/GAUL/2015/level1 (ADM1_NAME = 'Ho Chi Minh city')


==================================================
3. METHODOLOGY
==================================================

3.1 National Ward-Level Analysis (Sentinel-2, GEE)
- Imagery: COPERNICUS/S2_SR_HARMONIZED, Jan-Dec 2025, <20% cloud filter
- Composite: temporal median() to remove clouds/shadows
- NDVI: normalizedDifference(B8, B4), threshold >= 0.4
- Aggregation: reduceRegions at 10m scale within ward boundaries
- Metrics: Green Cover %, Green Per Capita (m²), Green Area (ha)
- Area fix: 91 wards had erroneous area values; analysis uses the
  corrected "Diện tích tham khảo (m2)" reference column

3.2 Ward Classification
Wards classified by pre-merger composition (Sáp nhập từ field):
- Pure urban (317 wards): merged only from phường
- Mixed (368 wards): merged from phường + xã (rural communes)
- Pure xã (2 wards): merged only from xã
This distinction is critical: mixed wards absorbed rural/peri-urban land,
inflating green metrics. Pure-urban wards are the honest measure of city
green space.

3.3 Accessibility Analysis (Python + GeoPandas)
- For each ward, a 1km buffer was computed around the boundary
- Green area accessible = sum of (neighbor green × overlap fraction
  with the buffer)
- Accessible per capita = total accessible green / ward population
- This identifies "green deserts" — wards where even walking 1km
  in any direction does not reach WHO's 9 m²/cap threshold

3.4 Historical Ring Analysis (Python)
Wards classified by which HCMC historical boundary contains their centroid:
- Pre-1972 core (French colonial Saigon)
- 1972-1976 ring (war-era expansion)
- 1976-2000 ring (post-reunification industrial)
- 2000-2025 ring (market-era planned development)
- Outside nội thành (rural/peri-urban)

3.5 HCMC Temporal Analysis (GEE → Python)
GEE exports native-resolution rasters over old HCMC (FAO/GAUL/2015/level1,
ADM1_CODE=3352, ~2,000 km²). Each export is a 2-band GeoTIFF (green
binary + LST). Downsampling to 500m grid and all boundary slicing is done
in Python — no need to re-run GEE for different analysis units.

Exports (9 tasks, run in parallel, ~30 min total):
  7× Landsat years (1990-2020) at 30m, CRS EPSG:32648 (UTM 48N)
     Each: ~2.2M pixels, 2 bands (green 0/1 + LST Celsius)
  1× Sentinel-2 green 2025 at 10m (~20M pixels, 1 band)
  1× Landsat LST 2025 at 100m (~200K pixels, 1 band)

Note: 1985 was dropped — Landsat 5 has 0 images for HCMC in 1984-1986.

Sensors by period:
- 1990-2010: Landsat 5 C2 L2 (SR_B4/SR_B3 for NDVI, ST_B6 for LST)
- 2015-2020: Landsat 8/9 C2 L2 (SR_B5/SR_B4 for NDVI, ST_B10 for LST)
- 2025: Sentinel-2 for NDVI (10m), Landsat 8/9 for LST (no thermal on S2)
- Cloud masking: QA_PIXEL bitwise for Landsat, SCL band for Sentinel-2
- NDVI threshold: 0.4 consistently across all sensors and years
- Time windows: 2-year centered windows for robust compositing
- LST conversion: Collection 2 L2 scale factor (×0.00341802 + 149.0 - 273.15)

GEE boundary note: FAO/GAUL uses 'Ho Chi Minh City' (ADM1_CODE=3352).
String matching ('Ho Chi Minh city') fails — use code filter instead.


==================================================
4. KEY FINDINGS
==================================================

4.1 National
- 687 wards, 39.6M urban population covered
- 79 wards fail WHO 9 m²/cap threshold (8M people, 20.3%)
- Median green cover: 46.5% (inflated by mixed wards)
- Pure-urban median: 33.3%, with 25.6% failing WHO

4.2 HCMC Concrete Belt
- 3 true green deserts: Phú Thọ Hòa, Tân Phú, Tân Hòa
  (327,000 people, <9 m²/cap even with 1km buffer)
- 36-ward concrete belt: 3.5M people below 20 m²/cap accessible
- No other Vietnamese city has a comparable concrete zone

4.3 Historical Pattern
  Ring                  Wards  Med Green%  Med 1km Access  Density   WHO Fail
  Pre-1972 core           29      11.3%      15.6 m²/cap   46k/km²     90%
  1972-1976 expansion     19       8.7%      22.1 m²/cap   35k/km²     89%
  1976-2000 expansion     25      24.5%      58.4 m²/cap   13k/km²     28%
  2000-2025 expansion      5      19.1%      27.6 m²/cap   17k/km²     40%
  Outside nội thành       35      40.9%     417.2 m²/cap    2k/km²      0%

4.4 Accessibility Reframe
- 79 wards fail WHO by own boundary
- Only 3 fail when considering 1km walkable access
- 76 wards "rescued" by neighboring green (7.7M people)
- The ward boundary is the wrong unit for lived experience

4.5 City Comparison
  City          Wards Fail WHO   Pop Below WHO
  HCMC          52/113           46% of pop
  Hanoi         19/51            46% of pop
  Da Nang        1/23            12% of pop
  Hai Phong      4/45            20% of pop
  Can Tho        1/31             8% of pop


==================================================
5. DATA ACCURACY & QUALITY CONTROL
==================================================

5.1 Boundary Area Discrepancy Fix
91 wards had >5% variance between stated area (Diện tích km2) and
surveyed reference area (Diện tích tham khảo). Extreme cases included
zero-values and typographical errors. The algorithm uses the reference
area column exclusively.

5.2 Satellite City Exclusion
The 2025 merger absorbed wards from Bình Dương (19 wards),
Bà Rịa-Vũng Tàu (11 wards), and Đồng Nai (1 ward) into "HCMC."
These are excluded from the HCMC historical analysis since they were
not part of HCMC during any prior regime. The FAO/GAUL/2015/level1
boundary for HCMC (pre-merger, ~2,095 km²) is used as the canonical
extent for all temporal and heatmap computations.

5.3 Encoding Fix
Ward boundary shapefile had double-encoded UTF-8 strings. Fixed via
.encode('latin-1').decode('utf-8') in Python before joining to green
cover data.


==================================================
6. KNOWN LIMITATIONS
==================================================

1. Mixed Pixel Effect: Sentinel-2 10m pixels in dense urban cores may
   average tree canopy with rooftop/road, suppressing NDVI below threshold.
   Isolated street trees may be undercounted.

2. NDVI Threshold Sensitivity: 0.4 captures healthy dense vegetation but
   excludes sparse lawns and drought-stressed plants.

3. Landsat vs Sentinel Comparability: Landsat 30m has more mixed pixels
   than Sentinel 10m. Absolute green area values differ between sensors;
   relative trends within the same sensor family are valid.

4. Cloud Cover: Monsoon season reduces clear imagery days. 2-year
   composite windows and median() mitigate but don't eliminate this.

5. Topographic Shadow: Mountain wards may have suppressed NDVI on
   north-facing slopes (Lâm Đồng, northern highlands).

6. Static Population: Per-capita metrics use census data, not accounting
   for migrant workers, commuters, or tourism pressure.

7. Access ≠ Public Access: The 1km buffer measures geographic proximity
   to green pixels, not whether that green is a public park, private
   compound, military base, or golf course.

8. LST vs Air Temperature: Landsat thermal measures surface temperature.
   Concrete surfaces can read 10-20°C hotter than ambient air.

9. Historical Boundary Classification: Uses ward centroid to assign to
   historical ring. Wards straddling a boundary edge are classified by
   center point only.


==================================================
7. FILE INVENTORY
==================================================

Source Data:
  Vietnam_Green_Space_By_Ward_2025.csv  — Raw GEE export (687 wards)
  WardBoundary (Filter By Attribute) (1).csv — Admin boundary attributes
  VNWard.zip — Ward boundary shapefile (EPSG:4326)

Computed:
  green_data_full.json — Merged ward data with all metrics
  access_data.json — 1km accessibility analysis results
  hcm_historical.json — HCMC wards classified by historical ring

Story & Planning:
  STORY.md — Editorial plan (7-act narrative structure)
  README.txt — This file

GEE Scripts:
  gee_hcmc_temporal.js — Main GEE script: native-resolution exports
    of green binary + LST over old HCMC, 8 time points (1990-2025).
    9 parallel export tasks (~30 min total). Boundary from
    FAO/GAUL/2015/level1 ADM1_CODE=3352 (no upload needed).
    Downsampling to 500m done in Python post-export.
  gee_hcmc_debug.js — Step-by-step boundary/collection diagnostic
  gee_hcmc_debug2.js — Image count per time window
  gee_find_hcmc.js — FAO GAUL name/code lookup
  gee_timeseries.js — (Superseded) Ring-level time series
  gee_heatmap.js — (Superseded) 500m grid with reduceResolution

GEE Export Outputs (in Google Drive > EarthEngine_Exports/):
  HCMC_1990_green_lst_30m.tif — Band 1: green (0/1), Band 2: LST (°C)
  HCMC_1995_green_lst_30m.tif
  HCMC_2000_green_lst_30m.tif
  HCMC_2005_green_lst_30m.tif
  HCMC_2010_green_lst_30m.tif
  HCMC_2015_green_lst_30m.tif
  HCMC_2020_green_lst_30m.tif
  HCMC_2025_green_10m.tif    — Band 1: green (0/1), Sentinel-2 10m
  HCMC_2025_lst_100m.tif     — Band 1: LST (°C), Landsat thermal 100m

Visualization:
  index.html — National ward-level data story page
  scatter.html — Ward size vs green cover scatter analysis

External (not in this directory):
  /Users/airm1/Work/VnExpress/HCMC 1975-now boundary/
    Nội thành 1972.geojson
    Nội thành 1976.geojson
    Nội thành 2000.geojson
    Nội thành 2004 - 2025.geojson
    Toàn TP 1978 - 2025.geojson


==================================================
8. BENCHMARKS
==================================================
- WHO: 9 m² green space per capita (international standard)
- Vietnam TCXDVN 362:2005: 7-9 m²/cap depending on city tier
- UN SDG 11.7.1: Proportion of urban open space for public use


==================================================
9. ANALYSIS PIPELINE
==================================================

Phase 1 (Complete): National ward snapshot
  GEE (Sentinel-2) → CSV → Python merge/clean → ward metrics

Phase 2 (Complete): HCMC accessibility + historical classification
  Ward shapefile + green data → 1km buffer analysis → access_data.json
  HCMC boundary GeoJSONs → centroid classification → hcm_historical.json

Phase 3 (Running): HCMC temporal rasters
  gee_hcmc_temporal.js → 9 GeoTIFFs at native resolution → Google Drive
    7× Landsat 30m (1990-2020), 1× S2 10m green, 1× Landsat 100m LST
  Python (rasterio) → downsample to 500m grid
  Python (rasterstats + geopandas) → zonal stats by any boundary
  No GEE re-runs needed for different boundary slicing


==================================================
10. CODE IMPLEMENTATION
==================================================

10.1 National Green Cover Extraction (GEE — Phase 1)

// Sentinel-2 median NDVI composite, threshold 0.4, reduceRegions at 10m
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(allWards)
  .filterDate('2025-01-01', '2025-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

var medianNDVI = s2.map(function(image) {
  return image.normalizedDifference(['B8', 'B4']).rename('NDVI');
}).median();

var greenArea_m2 = medianNDVI.gte(0.4).multiply(ee.Image.pixelArea());

var results = greenArea_m2.reduceRegions({
  collection: allWards,
  reducer: ee.Reducer.sum(),
  scale: 10,
  tileScale: 16
});

Export.table.toDrive({
  collection: results,
  description: 'Vietnam_Green_Space_By_Ward_2025',
  folder: 'EarthEngine_Exports',
  fileFormat: 'CSV'
});


10.2 HCMC Temporal Rasters (GEE — Phase 3)
See gee_hcmc_temporal.js for full implementation.

Summary:
- AOI: FAO/GAUL/2015/level1, ADM1_CODE = 3352
- 8 time points: 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025
  (1985 dropped: Landsat 5 has 0 images for HCMC in 1984-1986)
- Per Landsat year: median NDVI composite → green binary (>=0.4) + LST
  Exported at 30m native resolution, CRS EPSG:32648 (UTM 48N)
- 2025: Sentinel-2 green at 10m + Landsat LST at 100m (separate files)
- Cloud masking: QA_PIXEL bitwise (Landsat), SCL band (Sentinel-2)
- No reduceResolution/reproject in GEE — downsample to 500m in Python
- Previous approach (500m reduceResolution) caused GEE tasks to stall
  with 0 EECU-seconds; native export + Python aggregation is reliable


10.3 Data Cleaning & Metrics (Python — Phase 1)

import pandas as pd
import numpy as np

df_green = pd.read_csv('Vietnam_Green_Space_By_Ward_2025.csv')
df_bounds = pd.read_csv('WardBoundary_Filtered.csv')

# Population cleaning
df_green['Dân_số_'] = pd.to_numeric(
    df_green['Dân_số_'].replace(r'[^\d.]', '', regex=True), errors='coerce')

# Merge on province + ward name
merged = pd.merge(df_green, df_bounds,
    left_on=['Tỉnh_th', 'Phường_'],
    right_on=['Tỉnh thành mới', 'Phường xã mới'], how='inner')

# Green Cover % (using reference area, capped at 100%)
merged['Green_Cover_Percent'] = (
    merged['Green_Area_m2'] / merged['Diện tích tham khảo (m2)'] * 100
).clip(upper=100).round(2)

# Green Per Capita
merged['Green_Per_Capita_m2'] = (
    merged['Green_Area_m2'] / merged['Dân_số_']
).round(2).replace([np.inf, -np.inf], np.nan)


10.4 Accessibility Analysis (Python — Phase 2)

import geopandas as gpd

wards_utm = wards.to_crs(epsg=32648)  # UTM 48N for meter-based buffer

for idx, row in wards_utm.iterrows():
    buffered = row.geometry.buffer(1000)  # 1km
    candidates = spatial_index.intersection(buffered.bounds)
    for neighbor in candidates:
        overlap = buffered.intersection(neighbor.geometry)
        accessible_green += neighbor_green * (overlap.area / neighbor.area)
    accessible_per_capita = accessible_green / population


10.5 Phase 3 Python Analysis (after GEE export)

import rasterio
from rasterio.enums import Resampling
from rasterstats import zonal_stats
import numpy as np

# --- Step 1: Downsample 30m GeoTIFF to 500m ---
with rasterio.open('HCMC_1995_green_lst_30m.tif') as src:
    scale_factor = src.res[0] / 500  # 30/500
    green_500m = src.read(1, out_shape=(
        1, int(src.height * scale_factor), int(src.width * scale_factor)
    ), resampling=Resampling.average)  # average of binary = green fraction

# --- Step 2: Zonal stats by any boundary ---
rings = gpd.read_file('nothanh_1972.geojson')
stats = zonal_stats(rings, 'HCMC_1995_green_lst_30m.tif',
    stats=['mean', 'count'], band=1)  # band 1 = green, mean = fraction
