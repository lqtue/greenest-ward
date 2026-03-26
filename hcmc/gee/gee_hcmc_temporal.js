// ============================================================
// HCMC TEMPORAL NDVI + LST — NATIVE RESOLUTION EXPORT
// Export green binary + LST at native res. Downsample to 500m in Python.
// No reduceResolution/reproject — fast, simple exports.
// ============================================================

// --- BOUNDARY ---
var hcmc = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_CODE', 3352));
var aoi = hcmc.geometry();
var aoiBounds = aoi.bounds();

// --- CLOUD MASKING ---
function maskL2clouds(image) {
  var qa = image.select('QA_PIXEL');
  return image.updateMask(
    qa.bitwiseAnd(1 << 1).eq(0)
      .and(qa.bitwiseAnd(1 << 3).eq(0))
      .and(qa.bitwiseAnd(1 << 4).eq(0))
  );
}
function maskS2clouds(image) {
  var scl = image.select('SCL');
  return image.updateMask(
    scl.neq(3).and(scl.neq(8)).and(scl.neq(9)).and(scl.neq(10))
  );
}

// --- REFLECTANCE SCALING (C2 L2: scale=0.0000275, offset=-0.2) ---
function scaleL57(img) {
  var m = maskL2clouds(img);
  var sr = m.select(['SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','SR_B7'])
    .multiply(0.0000275).add(-0.2);
  return m.addBands(sr, null, true);
}
function scaleL89(img) {
  var m = maskL2clouds(img);
  var sr = m.select(['SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','SR_B7'])
    .multiply(0.0000275).add(-0.2);
  return m.addBands(sr, null, true);
}

// --- NDVI + LST ---
function ndviL57(img) { return scaleL57(img).normalizedDifference(['SR_B4', 'SR_B3']).rename('NDVI'); }
function ndviL89(img) { return scaleL89(img).normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI'); }
function ndviS2(img)  { return maskS2clouds(img).normalizedDifference(['B8', 'B4']).rename('NDVI'); }
function lstL57(img)  { return maskL2clouds(img).select('ST_B6').multiply(0.00341802).add(149.0).subtract(273.15).rename('LST'); }
function lstL89(img)  { return maskL2clouds(img).select('ST_B10').multiply(0.00341802).add(149.0).subtract(273.15).rename('LST'); }

// --- COLLECTIONS ---
var L5 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2').filter(ee.Filter.lt('CLOUD_COVER', 30));
var L89 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .merge(ee.ImageCollection('LANDSAT/LC09/C02/T1_L2'))
  .filter(ee.Filter.lt('CLOUD_COVER', 30));

// --- LANDSAT EXPORTS (30m green, 100m LST) ---
// Each year: 2-band image (green binary 0/1 + LST celsius)
// Export at 30m — Python will aggregate to 500m

function exportLandsat(year, start, end, col, ndviFn, lstFn) {
  var f = col.filterBounds(aoi).filterDate(start, end);
  var green = f.map(ndviFn).median().gte(0.4).toFloat().rename('green');
  var lst = f.map(lstFn).median().rename('LST');
  var stack = green.addBands(lst).clip(aoi);

  Export.image.toDrive({
    image: stack.toFloat(),
    description: 'HCMC_' + year + '_green_lst_30m',
    folder: 'EarthEngine_Exports',
    region: aoiBounds,
    scale: 30,
    crs: 'EPSG:32648',  // UTM 48N for meter-accurate pixels
    maxPixels: 1e10
  });
}

exportLandsat(1990, '1989-01-01', '1991-12-31', L5, ndviL57, lstL57);
exportLandsat(1995, '1994-01-01', '1996-12-31', L5, ndviL57, lstL57);
exportLandsat(2000, '1999-01-01', '2001-12-31', L5, ndviL57, lstL57);
exportLandsat(2005, '2004-01-01', '2006-12-31', L5, ndviL57, lstL57);
exportLandsat(2010, '2009-01-01', '2011-12-31', L5, ndviL57, lstL57);
exportLandsat(2015, '2014-01-01', '2016-12-31', L89, ndviL89, lstL89);
exportLandsat(2020, '2019-01-01', '2021-12-31', L89, ndviL89, lstL89);

// --- 2025: Sentinel-2 NDVI (10m) + Landsat LST (100m) ---
// Export NDVI at 10m, LST separately at 100m
var s2f = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .filterBounds(aoi).filterDate('2024-01-01', '2025-12-31');
var l89f = L89.filterBounds(aoi).filterDate('2024-01-01', '2025-12-31');

var green2025 = s2f.map(ndviS2).median().gte(0.4).toFloat().rename('green');
var lst2025 = l89f.map(lstL89).median().rename('LST');

// Export green at 10m (Sentinel native)
Export.image.toDrive({
  image: green2025.clip(aoi).toFloat(),
  description: 'HCMC_2025_green_10m',
  folder: 'EarthEngine_Exports',
  region: aoiBounds,
  scale: 10,
  crs: 'EPSG:32648',
  maxPixels: 1e10
});

// Export LST at 100m (Landsat thermal native)
Export.image.toDrive({
  image: lst2025.clip(aoi).toFloat(),
  description: 'HCMC_2025_lst_100m',
  folder: 'EarthEngine_Exports',
  region: aoiBounds,
  scale: 100,
  crs: 'EPSG:32648',
  maxPixels: 1e10
});

print('9 exports queued:');
print('  7× Landsat years at 30m (1990-2020): ~2M pixels each');
print('  1× S2 green 2025 at 10m: ~20M pixels');
print('  1× LST 2025 at 100m: ~200K pixels');
print('Downsample to 500m grid in Python after download.');
