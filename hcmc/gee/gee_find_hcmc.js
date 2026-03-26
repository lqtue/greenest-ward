// Find HCMC in FAO GAUL — search by name substring
var gaul = ee.FeatureCollection('FAO/GAUL/2015/level1');

// All Vietnam provinces with their codes
var vietnam = gaul.filter(ee.Filter.eq('ADM0_NAME', 'Viet Nam'));

// Print name + code pairs
var namesAndCodes = vietnam.map(function(f) {
  return f.set('label', ee.String(f.get('ADM1_NAME')).cat(' | code=').cat(ee.Number(f.get('ADM1_CODE')).format('%d')));
});
print('All Vietnam ADM1:', namesAndCodes.aggregate_array('label'));

// Also try searching for "Ho Chi" or "Minh"
var hcmSearch = gaul.filter(ee.Filter.stringContains('ADM1_NAME', 'Ho Chi'));
print('Search "Ho Chi":', hcmSearch.aggregate_array('ADM1_NAME'));

var hcmSearch2 = gaul.filter(ee.Filter.stringContains('ADM1_NAME', 'Minh'));
print('Search "Minh":', hcmSearch2.aggregate_array('ADM1_NAME'));

var hcmSearch3 = gaul.filter(ee.Filter.stringContains('ADM1_NAME', 'Saigon'));
print('Search "Saigon":', hcmSearch3.aggregate_array('ADM1_NAME'));
