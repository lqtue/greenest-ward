// Quick check: how many images per time window for HCMC?
var hcmc = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_CODE', 3352));
var aoi = hcmc.geometry();

print('HCMC feature count:', hcmc.size());
print('HCMC area (km²):', aoi.area().divide(1e6));

var L5 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2');
var L89 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2').merge(ee.ImageCollection('LANDSAT/LC09/C02/T1_L2'));
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');

// Count per window
print('L5 1984-1986:', L5.filterBounds(aoi).filterDate('1984-01-01', '1986-12-31').filter(ee.Filter.lt('CLOUD_COVER', 30)).size());
print('L5 1989-1991:', L5.filterBounds(aoi).filterDate('1989-01-01', '1991-12-31').filter(ee.Filter.lt('CLOUD_COVER', 30)).size());
print('L5 1994-1996:', L5.filterBounds(aoi).filterDate('1994-01-01', '1996-12-31').filter(ee.Filter.lt('CLOUD_COVER', 30)).size());
print('L5 1999-2001:', L5.filterBounds(aoi).filterDate('1999-01-01', '2001-12-31').filter(ee.Filter.lt('CLOUD_COVER', 30)).size());
print('L5 2004-2006:', L5.filterBounds(aoi).filterDate('2004-01-01', '2006-12-31').filter(ee.Filter.lt('CLOUD_COVER', 30)).size());
print('L5 2009-2011:', L5.filterBounds(aoi).filterDate('2009-01-01', '2011-12-31').filter(ee.Filter.lt('CLOUD_COVER', 30)).size());
print('L89 2014-2016:', L89.filterBounds(aoi).filterDate('2014-01-01', '2016-12-31').filter(ee.Filter.lt('CLOUD_COVER', 30)).size());
print('L89 2019-2021:', L89.filterBounds(aoi).filterDate('2019-01-01', '2021-12-31').filter(ee.Filter.lt('CLOUD_COVER', 30)).size());
print('S2 2024-2025:', S2.filterBounds(aoi).filterDate('2024-01-01', '2025-12-31').filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)).size());
print('L89 2024-2025 (for LST):', L89.filterBounds(aoi).filterDate('2024-01-01', '2025-12-31').filter(ee.Filter.lt('CLOUD_COVER', 30)).size());

// Also test: does L5 have ST_B6?
var testL5 = L5.filterBounds(aoi).filterDate('1994-01-01', '1996-12-31').filter(ee.Filter.lt('CLOUD_COVER', 30));
print('L5 bands:', testL5.first().bandNames());
