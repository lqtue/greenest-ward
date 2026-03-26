// ============================================================
// DEBUG: Test each step individually
// Paste this first. Check console output before running full script.
// ============================================================

// --- Step 1: Test boundary ---
var hcmc = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_CODE', 3352));
print('Step 1 - Feature count:', hcmc.size());
print('Step 1 - First feature keys:', hcmc.first().propertyNames());

// --- Step 2: Test geometry ---
var aoi = hcmc.geometry();
print('Step 2 - Geometry type:', aoi.type());
print('Step 2 - Area (m²):', aoi.area());

// --- Step 3: Test bounds ---
var aoiBounds = aoi.bounds();
print('Step 3 - Bounds:', aoiBounds.coordinates());

// --- Step 4: Test Landsat 5 collection ---
var L5 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
  .filterBounds(aoi)
  .filterDate('1994-01-01', '1996-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 30));
print('Step 4 - L5 image count (1995):', L5.size());
print('Step 4 - L5 first image bands:', L5.first().bandNames());

// --- Step 5: Test NDVI computation ---
function maskL2clouds(image) {
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(1 << 1).eq(0)
    .and(qa.bitwiseAnd(1 << 3).eq(0))
    .and(qa.bitwiseAnd(1 << 4).eq(0));
  return image.updateMask(mask);
}

var ndviTest = L5.map(function(image) {
  return maskL2clouds(image).normalizedDifference(['SR_B4', 'SR_B3']).rename('NDVI');
}).median();
print('Step 5 - NDVI band names:', ndviTest.bandNames());

// --- Step 6: Test green binary ---
var greenTest = ndviTest.gte(0.4).toFloat().rename('green');
print('Step 6 - Green band names:', greenTest.bandNames());

// --- Step 7: Test reduceResolution ---
var greenAgg = greenTest
  .setDefaultProjection('EPSG:4326', null, 30)
  .reduceResolution({
    reducer: ee.Reducer.mean(),
    bestEffort: true,
    maxPixels: 65536
  })
  .reproject('EPSG:4326', null, 500);
print('Step 7 - Aggregated band names:', greenAgg.bandNames());

// --- Step 8: Test LST ---
var lstTest = L5.map(function(image) {
  return maskL2clouds(image).select('ST_B6')
    .multiply(0.00341802).add(149.0).subtract(273.15).rename('LST');
}).median();
print('Step 8 - LST band names:', lstTest.bandNames());

// --- Step 9: Test stack + clip ---
var lstAgg = lstTest
  .setDefaultProjection('EPSG:4326', null, 100)
  .reduceResolution({
    reducer: ee.Reducer.mean(),
    bestEffort: true,
    maxPixels: 65536
  })
  .reproject('EPSG:4326', null, 500);

var stack = greenAgg.addBands(lstAgg).clip(aoi);
print('Step 9 - Stack band names:', stack.bandNames());

// --- Step 10: Test export (just 1995) ---
Export.image.toDrive({
  image: stack.toFloat(),
  description: 'HCMC_1995_green_lst_500m_TEST',
  folder: 'EarthEngine_Exports',
  region: aoiBounds,
  scale: 500,
  crs: 'EPSG:4326',
  maxPixels: 1e9
});

print('Step 10 - Export queued. Check Tasks tab.');
