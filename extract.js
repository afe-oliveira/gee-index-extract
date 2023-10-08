// https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LC08_C02_T1_TOA

function simple_index (index_name, roi, collection, expression, palette) {
  var dataset = ee.ImageCollection(collection).filterDate(ee.DateRange('2018-01-01', '2018-12-31')).filterBounds(roi).sort('CLOUD_COVER', false).mosaic();
  
  var blue = dataset.select('B2');
  var green = dataset.select('B3');
  var red = dataset.select('B4');
  var nir = dataset.select('B5');
  var red_edge = red
  var swir_1 = dataset.select('B6');
  var swir_2 = dataset.select('B7');
  var thermal = dataset.select('B10');
    
  // Calculate Index
  var index = dataset.expression(
    expression, {
      'BLUE': blue,
      'GREEN': green,
      'RED': red,
      'NIR': nir,
      'RE': red_edge,
      'SWIR1': swir_1,
      'SWIR2': swir_2,
      'THERMAL': thermal,
  }).rename('B');
  
  var mean = index.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: roi,
    scale: 30,
    maxPixels: 1e10
  })
  
  var std_dev = index.reduceRegion({
    reducer: ee.Reducer.stdDev(),
    geometry: roi,
    scale: 30,
    maxPixels: 1e10
  })

  var lim_min = ee.Number(mean.get('B')).subtract(ee.Number(std_dev.get('B')).multiply(1))
  var lim_max = ee.Number(mean.get('B')).add(ee.Number(std_dev.get('B')).multiply(1))

  index = index.visualize({min: lim_min, max: lim_max, palette: palette});
  
  print(index_name + ':');
  print(index.getThumbURL({region: roi, dimensions: '500x500', format: 'png'}));
  print('\n');
}

var lat = [38.717925331952756,37.445243447582314,39.949444444444]
var long = [-9.188555569220487,-8.013146625564051,-8.2455555555556]

var i = 2
var roi = ee.Geometry.Point(long[i], lat[i]).buffer({'distance': 20000}).bounds();

// Extract RGB and CIR
var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA').filterDate(ee.DateRange('2018-01-01', '2018-12-31')).filterBounds(roi).sort('CLOUD_COVER', false).mosaic();

var rgb = dataset.visualize({bands: ['B4', 'B3', 'B2'], min: 0, max: 0.4});
var cir = dataset.visualize({bands: ['B5', 'B4', 'B3'], min: 0, max: 0.4});

print('RGB:');
print(rgb.getThumbURL({region: roi, dimensions: '500x500', format: 'png'}));
print('\n');

print('CIR:');
print(cir.getThumbURL({region: roi, dimensions: '500x500', format: 'png'}));
print('\n');

// Palettes
var palette_veg = 'black,white'

// SR
simple_index('SR', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              'NIR / RED',
              palette_veg
            )
            
// NDVI
simple_index('NDVI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(NIR - RED) / (NIR + RED)',
              palette_veg
            )

// DVI
simple_index('DVI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              'NIR - RED',
              palette_veg
            )

// RDVI
simple_index('RDVI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(NIR - RED) / sqrt(NIR + RED)',
              palette_veg
            )
 
// MSR
simple_index('MSR', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '((NIR / RED) - 1) / (sqrt(NIR / RED) + 1)',
              palette_veg
            )

// GNDVI
simple_index('GNDVI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(NIR - GREEN) / (NIR + GREEN)',
              palette_veg
            )

// GARI
simple_index('GARI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(NIR - (GREEN - ((BLUE - RED)))) / 10000*(NIR - (GREEN + ((BLUE - RED))))',
              palette_veg
            )

// NDRE
simple_index('NDRE', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(NIR - RE) / (NIR + RE)',
              palette_veg
            )
            
// GDVI
simple_index('GDVI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              'NIR - GREEN',
              palette_veg
            )

// GRVI
simple_index('GRVI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              'NIR / GREEN',
              palette_veg
            )

// IDVI
simple_index('IDVI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(1 + (NIR - RED)) / (1 - (NIR -RED))',
              palette_veg
            )
            
// ************************************************************************
            
// ARI
simple_index('ARI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(1 / GREEN) - (1 / RE)',
              palette_veg
            )

// MARI
simple_index('MARI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '((1 / GREEN) - (1 / RE)) * RED',
              palette_veg
            )

// ************************************************************************

// EVI
simple_index('EVI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(2.5 * (NIR - RED)) / (NIR + 6 * RED - 7.5 * RED + 1)',
              palette_veg
            )

// EVI2
simple_index('EVI2', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(2.5 * (NIR - RED)) / (NIR + 2.4 * RED + 1)',
              palette_veg
            )
            
// ************************************************************************

// SAVI
simple_index('SAVI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '1.5 * ((NIR - RED) / (NIR + RED + 0.5))',
              palette_veg
            )

// MSAVI
simple_index('MSAVI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(2 * NIR + 1 - sqrt((2 * NIR + 1)**2) - 8 * (NIR - RED)) / (2)',
              palette_veg
            )   

// OSAVI
simple_index('OSAVI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '1.15 * ((NIR - RED) / (NIR + RED + 0.16))',
              palette_veg
            )
            
// ************************************************************************

// TAVI
var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA').filterBounds(roi).sort('CLOUD_COVER', false).mosaic();
  
var red = dataset.select('B4');
var nir = dataset.select('B5');

var max_red = red.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: roi,
  scale: 30,
  maxPixels: 10e9
}); 
max_red = ee.Number(max_red.get('B4_max'));
  
var index = dataset.expression(
  '((NIR + 2.280 * (M - RED)) / (RED))', {
    'RED': red,
    'NIR': nir,
    'M': max_red, 
});

var minMax = index.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: roi,
  scale: 30,
  maxPixels: 10e9
}); 
index = ee.ImageCollection.fromImages(
  index.bandNames().map(function(name){
    name = ee.String(name);
    var band = index.select(name);
    return band.unitScale(ee.Number(minMax.get(name.cat('_min'))), ee.Number(minMax.get(name.cat('_max'))))
})).toBands().rename(index.bandNames());

index = index.visualize({palette: palette_veg});

print('TAVI:');
print(index.getThumbURL({region: roi, dimensions: '500x500', format: 'png'}));
print('\n');
            
// ************************************************************************

// NDWI
simple_index('NDWI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(GREEN - NIR) / (GREEN + NIR)',
              palette_veg
            )
            
// NDMI
simple_index('NDMI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(NIR - SWIR1) / (NIR + SWIR1)',
              palette_veg
            )
            
// MNDWI
simple_index('MNDWI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '((GREEN - SWIR1) / (GREEN + SWIR1))',
              palette_veg
            )
            
// ************************************************************************

// MBI
simple_index('MBI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(((SWIR1 - SWIR2 - NIR) / (SWIR1 + SWIR2 + NIR)) + 0.5)',
              palette_veg
            )
            
// EMBI
simple_index('EMBI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '((((SWIR1 - SWIR2 - NIR) / (SWIR1 + SWIR2 + NIR)) + 0.5) - ((GREEN - SWIR1) / (GREEN + SWIR1)) - 0.5) / ((((SWIR1 - SWIR2 - NIR) / (SWIR1 + SWIR2 + NIR)) + 0.5) + ((GREEN - SWIR1) / (GREEN + SWIR1)) + 1.5)',
              palette_veg
            )
            
// ************************************************************************

// NBR
simple_index('NBR', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(NIR - SWIR1) / (NIR + SWIR1)',
              palette_veg
            )
            
// BAI
simple_index('BAI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '1 / ((0.1 - RED)**2 + (0.06 - NIR)**2)',
              palette_veg
            )

// NBRT1
simple_index('NBRT1', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(NIR - SWIR1*(THERMAL / 1000)) / (NIR + SWIR1*(THERMAL / 1000))',
              palette_veg
            )
            
// ************************************************************************

// ASI
simple_index('ASI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(1 / 16) * (((NIR - BLUE) / (NIR + BLUE)) + 1) * (1 - (((NIR - RED) / (NIR + RED)) * ((2 * NIR + 1 - sqrt((2 * NIR + 1)**2) - 8 * (NIR - RED)) / (2)))) * (1 - (((((SWIR1 - SWIR2 - NIR) / (SWIR1 + SWIR2 + NIR)) + 0.5) - ((GREEN - SWIR1) / (GREEN + SWIR1)) - 0.5) / ((((SWIR1 - SWIR2 - NIR) / (SWIR1 + SWIR2 + NIR)) + 0.5) + ((GREEN - SWIR1) / (GREEN + SWIR1)) + 1.5))) * (((BLUE + GREEN - NIR - SWIR1) / (BLUE + GREEN + NIR + SWIR1)) + 1)',
              palette_veg
            )

// ************************************************************************

// REI
simple_index('REI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '(NIR - BLUE) / (NIR + BLUE * NIR)',
              palette_veg
            )
            
// RI
simple_index('RI', 
              roi,
              'LANDSAT/LC08/C02/T1_TOA',
              '1 - (3 * BLUE)/(SWIR1 + NIR + BLUE)',
              palette_veg
            )
            
