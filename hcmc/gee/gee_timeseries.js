// ============================================================
// COMPUTATION 1: GREEN COVER + LST TIME SERIES BY HISTORICAL RING
// 5 rings × 9 time points × 2 metrics (green%, mean LST)
// Runtime: <1 min
// ============================================================

// --- STEP 1: BOUNDARIES ---
// Full old HCMC boundary from FAO GAUL (2015 vintage = pre-merger)
var toanTP = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Ho Chi Minh city'));

// Historical nội thành boundaries — must upload as GEE assets
// Upload from: /Users/airm1/Work/VnExpress/HCMC 1975-now boundary/
var nthanh72 = ee.FeatureCollection('users/YOUR_USERNAME/nothanh_1972');
var nthanh76 = ee.FeatureCollection('users/YOUR_USERNAME/nothanh_1976');
var nthanh00 = ee.FeatureCollection('users/YOUR_USERNAME/nothanh_2000');
var nthanh04 = ee.FeatureCollection('users/YOUR_USERNAME/nothanh_2004');

// --- STEP 2: BUILD THE 5 RINGS ---
var core72 = nthanh72.geometry();
var ring76 = nthanh76.geometry().difference(core72);
var ring00 = nthanh00.geometry().difference(nthanh76.geometry());
var ring04 = nthanh04.geometry().difference(nthanh00.geometry());
var outer  = toanTP.geometry().difference(nthanh04.geometry());

var rings = ee.FeatureCollection([
  ee.Feature(core72, {ring: 'pre-1972 core'}),
  ee.Feature(ring76, {ring: '1972-1976'}),
  ee.Feature(ring00, {ring: '1976-2000'}),
  ee.Feature(ring04, {ring: '2000-2025'}),
  ee.Feature(outer,  {ring: 'outside noi thanh'})
]);

// --- STEP 3: LANDSAT HELPERS ---

// Cloud mask for Landsat Collection 2 Level 2 (QA_PIXEL band)
function maskL2clouds(image) {
  var qa = image.select('QA_PIXEL');
  var dilatedCloud = 1 << 1;
  var cloud = 1 << 3;
  var cloudShadow = 1 << 4;
  var mask = qa.bitwiseAnd(dilatedCloud).eq(0)
    .and(qa.bitwiseAnd(cloud).eq(0))
    .and(qa.bitwiseAnd(cloudShadow).eq(0));
  return image.updateMask(mask);
}

// NDVI for Landsat 5/7 (SR_B4=NIR, SR_B3=Red)
function ndviL57(image) {
  return maskL2clouds(image)
    .normalizedDifference(['SR_B4', 'SR_B3'])
    .rename('NDVI');
}

// NDVI for Landsat 8/9 (SR_B5=NIR, SR_B4=Red)
function ndviL89(image) {
  return maskL2clouds(image)
    .normalizedDifference(['SR_B5', 'SR_B4'])
    .rename('NDVI');
}

// LST for Landsat 5/7 (ST_B6) — Collection 2 L2 scale factor
function lstL57(image) {
  return maskL2clouds(image)
    .select('ST_B6')
    .multiply(0.00341802).add(149.0)
    .subtract(273.15) // Kelvin to Celsius
    .rename('LST');
}

// LST for Landsat 8/9 (ST_B10)
function lstL89(image) {
  return maskL2clouds(image)
    .select('ST_B10')
    .multiply(0.00341802).add(149.0)
    .subtract(273.15)
    .rename('LST');
}

// --- STEP 4: TIME POINTS ---
var timePoints = [
  {year: 1985, start: '1984-01-01', end: '1986-12-31', sensor: 'L5'},
  {year: 1990, start: '1989-01-01', end: '1991-12-31', sensor: 'L5'},
  {year: 1995, start: '1994-01-01', end: '1996-12-31', sensor: 'L5'},
  {year: 2000, start: '1999-01-01', end: '2001-12-31', sensor: 'L5'},
  {year: 2005, start: '2004-01-01', end: '2006-12-31', sensor: 'L5'},
  {year: 2010, start: '2009-01-01', end: '2011-12-31', sensor: 'L5'},
  {year: 2015, start: '2014-01-01', end: '2016-12-31', sensor: 'L8'},
  {year: 2020, start: '2019-01-01', end: '2021-12-31', sensor: 'L8'},
  {year: 2025, start: '2024-01-01', end: '2025-12-31', sensor: 'L9'}
];

// --- STEP 5: COMPUTE ---
var aoi = toanTP.geometry();

var results = ee.FeatureCollection(timePoints.map(function(tp) {

  // Select imagery
  var ndviFunc, lstFunc, collection;
  if (tp.sensor === 'L5') {
    collection = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2');
    ndviFunc = ndviL57;
    lstFunc = lstL57;
  } else if (tp.sensor === 'L8') {
    collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2');
    ndviFunc = ndviL89;
    lstFunc = lstL89;
  } else {
    collection = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2');
    ndviFunc = ndviL89;
    lstFunc = lstL89;
  }

  var filtered = collection
    .filterBounds(aoi)
    .filterDate(tp.start, tp.end)
    .filter(ee.Filter.lt('CLOUD_COVER', 30));

  // Green cover: median NDVI composite, threshold at 0.4
  var medianNDVI = filtered.map(ndviFunc).median();
  var isGreen = medianNDVI.gte(0.4);
  var greenArea = isGreen.multiply(ee.Image.pixelArea());

  // LST: mean composite (dry season months for cleaner signal)
  var lstComposite = filtered.map(lstFunc).median();

  // Reduce per ring
  var greenByRing = greenArea.reduceRegions({
    collection: rings,
    reducer: ee.Reducer.sum(),
    scale: 30,
    tileScale: 4
  });

  var lstByRing = lstComposite.reduceRegions({
    collection: rings,
    reducer: ee.Reducer.mean(),
    scale: 100,
    tileScale: 4
  });

  // Also get total area per ring for percentage
  var totalArea = ee.Image.pixelArea().reduceRegions({
    collection: rings,
    reducer: ee.Reducer.sum(),
    scale: 30,
    tileScale: 4
  });

  // Join results
  var joined = greenByRing.map(function(f) {
    var ringName = f.get('ring');
    var lstMatch = lstByRing.filter(ee.Filter.eq('ring', ringName)).first();
    var areaMatch = totalArea.filter(ee.Filter.eq('ring', ringName)).first();
    var greenM2 = ee.Number(f.get('sum'));
    var totalM2 = ee.Number(areaMatch.get('sum'));
    return ee.Feature(null, {
      'year': tp.year,
      'ring': ringName,
      'green_area_m2': greenM2,
      'total_area_m2': totalM2,
      'green_pct': greenM2.divide(totalM2).multiply(100),
      'mean_lst_c': lstMatch.get('mean'),
      'image_count': filtered.size()
    });
  });

  return joined;
}).reduce(function(a, b) {
  return ee.FeatureCollection(a).merge(ee.FeatureCollection(b));
}));

// --- STEP 6: EXPORT ---
Export.table.toDrive({
  collection: results,
  description: 'HCMC_GreenLST_TimeSeries_ByRing',
  folder: 'EarthEngine_Exports',
  fileFormat: 'CSV',
  selectors: ['year', 'ring', 'green_area_m2', 'total_area_m2', 'green_pct', 'mean_lst_c', 'image_count']
});

print('Time series ready — check Tasks tab to run export');
print('Rings:', rings);
