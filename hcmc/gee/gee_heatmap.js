// ============================================================
// COMPUTATION 2 & 3: HCMC GREEN COVER + LST HEATMAP (500m GRID)
// Current state (Sentinel-2 2025) + Change (Landsat 1995 vs 2025)
// Runtime: ~10 min total (parallel exports)
// ============================================================

// --- BOUNDARY ---
// Full old HCMC from FAO GAUL (2015 vintage = pre-merger, no Bình Dương/BR-VT)
var toanTP = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Ho Chi Minh city'));
var aoi = toanTP.geometry();
var aoiBounds = aoi.bounds();

// ============================================================
// PART A: CURRENT GREEN COVER (Sentinel-2, 10m → export at 500m)
// ============================================================

var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi)
  .filterDate('2024-01-01', '2025-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

function s2CloudMask(image) {
  var scl = image.select('SCL');
  var mask = scl.neq(3)  // cloud shadow
    .and(scl.neq(8))     // cloud medium prob
    .and(scl.neq(9))     // cloud high prob
    .and(scl.neq(10));   // cirrus
  return image.updateMask(mask);
}

var ndvi2025 = s2.map(function(img) {
  return s2CloudMask(img)
    .normalizedDifference(['B8', 'B4'])
    .rename('NDVI');
}).median();

var green2025 = ndvi2025.gte(0.4).rename('green').clip(aoi);

// Export green fraction at 500m (mean of 10m binary = fraction)
Export.image.toDrive({
  image: green2025.toFloat(),
  description: 'HCMC_Green_500m_2025',
  folder: 'EarthEngine_Exports',
  region: aoiBounds,
  scale: 500,
  crs: 'EPSG:4326',
  maxPixels: 1e9
});

// ============================================================
// PART B: CURRENT LST (Landsat 8/9 thermal, 100m → export at 500m)
// ============================================================

// Use dry season (Jan-Apr) for clearest thermal signal
var l89 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .merge(ee.ImageCollection('LANDSAT/LC09/C02/T1_L2'))
  .filterBounds(aoi)
  .filterDate('2024-01-01', '2025-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 30))
  .filter(ee.Filter.calendarRange(1, 4, 'month')); // dry season

function maskL2clouds(image) {
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(1 << 1).eq(0)
    .and(qa.bitwiseAnd(1 << 3).eq(0))
    .and(qa.bitwiseAnd(1 << 4).eq(0));
  return image.updateMask(mask);
}

var lst2025 = l89.map(function(img) {
  return maskL2clouds(img)
    .select('ST_B10')
    .multiply(0.00341802).add(149.0)
    .subtract(273.15)
    .rename('LST');
}).median().clip(aoi);

Export.image.toDrive({
  image: lst2025.toFloat(),
  description: 'HCMC_LST_500m_2025',
  folder: 'EarthEngine_Exports',
  region: aoiBounds,
  scale: 500,
  crs: 'EPSG:4326',
  maxPixels: 1e9
});

// ============================================================
// PART C: HISTORICAL GREEN (Landsat 5, 30m → export at 500m)
// For 1995 vs 2025 change map
// ============================================================

var l5 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
  .filterBounds(aoi)
  .filterDate('1994-01-01', '1996-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 30));

var ndvi1995 = l5.map(function(img) {
  return maskL2clouds(img)
    .normalizedDifference(['SR_B4', 'SR_B3'])
    .rename('NDVI');
}).median();

var green1995 = ndvi1995.gte(0.4).rename('green').clip(aoi);

Export.image.toDrive({
  image: green1995.toFloat(),
  description: 'HCMC_Green_500m_1995',
  folder: 'EarthEngine_Exports',
  region: aoiBounds,
  scale: 500,
  crs: 'EPSG:4326',
  maxPixels: 1e9
});

// Historical LST 1995 (dry season)
var l5dry = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
  .filterBounds(aoi)
  .filterDate('1994-01-01', '1996-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 30))
  .filter(ee.Filter.calendarRange(1, 4, 'month'));

var lst1995 = l5dry.map(function(img) {
  return maskL2clouds(img)
    .select('ST_B6')
    .multiply(0.00341802).add(149.0)
    .subtract(273.15)
    .rename('LST');
}).median().clip(aoi);

Export.image.toDrive({
  image: lst1995.toFloat(),
  description: 'HCMC_LST_500m_1995',
  folder: 'EarthEngine_Exports',
  region: aoiBounds,
  scale: 500,
  crs: 'EPSG:4326',
  maxPixels: 1e9
});

// ============================================================
// PART D: CHANGE MAP (precomputed for convenience)
// ============================================================

// Green change: positive = greening, negative = lost green
// Using Landsat for both years for consistency
var l89_2025 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .merge(ee.ImageCollection('LANDSAT/LC09/C02/T1_L2'))
  .filterBounds(aoi)
  .filterDate('2024-01-01', '2025-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 30));

var green2025_landsat = l89_2025.map(function(img) {
  return maskL2clouds(img)
    .normalizedDifference(['SR_B5', 'SR_B4'])
    .rename('NDVI');
}).median().gte(0.4).rename('green').clip(aoi);

var greenChange = green2025_landsat.subtract(green1995).rename('green_change').clip(aoi);
// Values: -1 = lost green, 0 = no change, +1 = gained green

Export.image.toDrive({
  image: greenChange.toFloat(),
  description: 'HCMC_GreenChange_500m_1995_2025',
  folder: 'EarthEngine_Exports',
  region: aoiBounds,
  scale: 500,
  crs: 'EPSG:4326',
  maxPixels: 1e9
});

var lstChange = lst2025.subtract(lst1995).rename('lst_change').clip(aoi);

Export.image.toDrive({
  image: lstChange.toFloat(),
  description: 'HCMC_LSTChange_500m_1995_2025',
  folder: 'EarthEngine_Exports',
  region: aoiBounds,
  scale: 500,
  crs: 'EPSG:4326',
  maxPixels: 1e9
});

print('All exports queued — check Tasks tab');
print('Exports: Green 2025, LST 2025, Green 1995, LST 1995, Green Change, LST Change');
print('Available Sentinel-2 images:', s2.size());
print('Available Landsat 1995 images:', l5.size());
