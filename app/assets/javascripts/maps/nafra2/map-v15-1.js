
import Map from 'ol/Map.js';
import {XYZ, TileArcGISRest} from 'ol/source.js';
import {Group as LayerGroup, Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js'
import View from 'ol/View.js';
import {defaults as defaultControls} from 'ol/control.js';

// geometry import

import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import VectorSource from 'ol/source/Vector.js';
import {Circle, Fill, Stroke, Style, Icon} from 'ol/style.js';

import TileGrid from 'ol/tilegrid/TileGrid'

import * as proj4 from 'proj4'
import { register as registerProj4 } from 'ol/proj/proj4'

// Proj4 defs
proj4.default.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs')
registerProj4(proj4.default)

import { transformWithProjections, useGeographic, fromLonLat, toLonLat} from 'ol/proj'
/* import { Circle } from 'ol/geom'; */

useGeographic(); 



  // Remove default controls
  const controls = defaultControls({
    zoom: false,
    rotate: false,
    attribution: false
  })

// 27A Market St, Hebden Bridge HX7 6EU
// 53.74123069144088, -2.0159323734242225

// 50.763644264752486, -1.2976826232991163
//50.76294638841714, -1.2979017577697058

//centre of the map
let mapCenter = []



//view extent and centre and zoom levels
const view = new View({
  center: setCenter(),
  zoom: setStoredZoom() || 15, // Set the zoom level from sessionStorage
  minZoom: 8,
  maxZoom: 16,
  extent: [ -5.75447, 49.93027, 1.799683, 55.84093],
});

// Function to get stored zoom level from sessionStorage
function setStoredZoom() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('zoom');
}

//set center of map
function setCenter(){

  //get scenario parameter
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const center = urlParams.get('center')
  

  if (center == undefined){
    mapCenter = [-1.2977592816816998, 50.763465355051004]
  } else {
    mapCenter = center.split(',');
  }

  return mapCenter

};

//52.24377500667143, 0.4040511246045124
// 3 Rockingham Villas, Church Lane, 

// 52.24389889541271, 0.4031600308058314

//map colours
//accessible
const lightestBlue = '201, 248, 255,255'
const lightBlue = '196,225,255,255'
const midBlue = '154,160,222,255'
const darkBlue = '85,92,157,255'

const layerColors = [darkBlue, midBlue, lightBlue, lightestBlue] 

// red hues
//accessible
const lightP = '255, 191, 201, 255'
const midP = '230, 119, 46, 255'
const darkP = '153, 0, 77, 255'

const layerColorsP = [darkP, midP, lightP, lightestBlue] 





//grab api key
const apiKey = process.env.OS_API_KEY

//base map
const base = new TileLayer({
name: 'base',
 source: new XYZ({
   url: `https://api.os.uk/maps/raster/v1/zxy/Outdoor_27700/{z}/{x}/{y}.png?key=${apiKey}`,
   projection: 'EPSG:27700',
  tileGrid: new TileGrid({
   resolutions: [ 896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75 ],
   origin: [ -238375.0, 1376256.0 ]
 }),
   attributions: `Contains OS data<br/>&copy; Crown copyright and database rights ${(new Date()).getFullYear()}`
 }),
 visible: true,
 minZoom: 8,
 zIndex: -1
});

//surface water extent
function surfaceWater(likelihood) {
  const layerIds = [2, 4, 6];
  return new TileLayer({
    ref: `surfaceWater${likelihood}`,
    name: `surfaceWater${likelihood}`,
    className: 'defra-map-raster-canvas',
    layerCodes: `se${likelihood},ae${likelihood}`,
    source: new TileArcGISRest({
      url: 'https://environment.data.gov.uk/arcgis/rest/services/EA/RiskOfFloodingFromSurfaceWaterBasic/MapServer',
      projection: 'EPSG:27700',
      params: {
        'TRANSPARENT': true,
        'FORMAT': 'GIF',
        'dynamicLayers': `[{"id":${layerIds[likelihood - 1]},"source":{"type":"mapLayer","mapLayerId":${layerIds[likelihood - 1]}},"drawingInfo":{"renderer":{"type":"simple","symbol":{"color":[${layerColors[likelihood - 1]}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}}}}]`
      }
    }),
    minZoom: 8,
    zIndex: 0,
    interactive: true // Enable interactivity for the layer
  });
}

function surfaceWaterRos(likelihood) {
  const layerIds = [2, 4, 6];
  return new TileLayer({
    ref: `surfaceWater${likelihood}`,
    name: `surfaceWater${likelihood}`,
    className: 'defra-map-raster-canvas',
    layerCodes: `se${likelihood},ae${likelihood}`,
    source: new TileArcGISRest({
      url: 'https://environment.data.gov.uk/arcgis/rest/services/EA/RiskOfFloodingFromSurfaceWaterBasic/MapServer',
      projection: 'EPSG:27700',
      params: {
        'TRANSPARENT': true,
        'FORMAT': 'GIF',
        'dynamicLayers': `[{"id":${layerIds[likelihood - 1]},"source":{"type":"mapLayer","mapLayerId":${layerIds[likelihood - 1]}},"drawingInfo":{"renderer":{"type":"simple","symbol":{"color":[${layerColorsP[likelihood - 1]}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}}}}]`
      }
    }),
    minZoom: 8,
    zIndex: 0,
    interactive: true // Enable interactivity for the layer
  });
}

//surface water depth
 function surfaceWaterDepth (liklihood) {
  const bands = ['RoFSWDepth1in30', 'RoFSWDepth1in100', 'RoFSWDepth1in1000']
  return new TileLayer({
    ref: `surfaceWaterDepth${liklihood}`,
    name: `surfaceWaterDepth${liklihood}`,
    className: 'defra-map-raster-canvas',
    layerCodes: `sd${liklihood}`,
    source: new TileArcGISRest({
      url: `https://environment.data.gov.uk/arcgis/rest/services/EA/${bands[liklihood - 1]}/MapServer`,
      projection: 'EPSG:27700',
      params: {
        'TRANSPARENT': true,
        'FORMAT': 'GIF',
        'dynamicLayers' : `[{"id":0,"source":{"type":"mapLayer","mapLayerId":0},"drawingInfo":{"renderer":{"type":"uniqueValue","field1":"depth","uniqueValueInfos":[{"value":"0.00 - 0.15","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${lightBlue}],"outline":{"type":"esriSLS","width":0}}},{"value":"0.15 - 0.30","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${lightBlue}],"outline":{"type":"esriSLS","width":0}}},{"value":"0.30 - 0.60","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${midBlue}],"outline":{"type":"esriSLS","width":0}}},{"value":"0.60 - 0.90","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${midBlue}],"outline":{"type":"esriSLS","width":0}}},{"value":"0.90 - 1.20","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${darkBlue}],"outline":{"type":"esriSLS","width":0}}},{"value":"> 1.20","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${darkBlue}],"outline":{"type":"esriSLS","width":0}}}]},"transparency":0}}]`
      }
    }),
    minZoom: 8,
    zIndex: 0
  })
}

//Rivers and the sea version 9 extent and CC extent - to test green colour
 function surfaceWaterDepthRos (liklihood) {
  const bands = ['RoFSWDepth1in30', 'RoFSWDepth1in100', 'RoFSWDepth1in1000']
  return new TileLayer({
    ref: `surfaceWaterDepth${liklihood}`,
    name: `surfaceWaterDepth${liklihood}`,
    className: 'defra-map-raster-canvas',
    layerCodes: `sd${liklihood}`,
    source: new TileArcGISRest({
      url: `https://environment.data.gov.uk/arcgis/rest/services/EA/${bands[liklihood - 1]}/MapServer`,
      projection: 'EPSG:27700',
      params: {
        'TRANSPARENT': true,
        'FORMAT': 'GIF',
        'dynamicLayers' : `[{"id":0,"source":{"type":"mapLayer","mapLayerId":0},"drawingInfo":{"renderer":{"type":"uniqueValue","field1":"depth","uniqueValueInfos":[{"value":"0.00 - 0.15","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${lightBlue}],"outline":{"type":"esriSLS","width":0}}},{"value":"0.15 - 0.30","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${lightBlue}],"outline":{"type":"esriSLS","width":0}}},{"value":"0.30 - 0.60","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${midBlue}],"outline":{"type":"esriSLS","width":0}}},{"value":"0.60 - 0.90","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${midBlue}],"outline":{"type":"esriSLS","width":0}}},{"value":"0.90 - 1.20","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${darkBlue}],"outline":{"type":"esriSLS","width":0}}},{"value":"> 1.20","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${darkBlue}],"outline":{"type":"esriSLS","width":0}}}]},"transparency":0}}]`
      }
    }),
    minZoom: 8,
    zIndex: 0
  })
}

// surface water - speed
function surfaceWaterSpeed (liklihood) {
  const bands = ['RoFSWSpeed1in30', 'RoFSWSpeed1in100', 'RoFSWSpeed1in1000']
  return new TileLayer({
    ref: `surfaceWaterSpeed${liklihood}`,
    className: 'defra-map-raster-canvas',
    layerCodes: `ss${liklihood}`,
    source: new TileArcGISRest({
      url: `https://environment.data.gov.uk/arcgis/rest/services/EA/${bands[liklihood - 1]}/MapServer`,
      projection: 'EPSG:27700',
      params: {
        'TRANSPARENT': true,
        'FORMAT': 'GIF',
        'dynamicLayers' : `[{"id":0,"source":{"type":"mapLayer","mapLayerId":0},"drawingInfo":{"renderer":{"type":"uniqueValue","field1":"velocity","uniqueValueInfos":[{"value":"0.00 - 0.25","symbol":{"color":[${lightBlue}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}},{"value":"0.25 - 0.50","symbol":{"color":[${darkBlue}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}},{"value":"0.50 - 1.00","symbol":{"color":[${darkBlue}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}},{"value":"1.00 - 2.00","symbol":{"color":[${darkBlue}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}},{"value":"> 2.00","symbol":{"color":[${darkBlue}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}}]}}}]`
      }
    }),
    minZoom: 8,
    zIndex: 0
  })
}

// surface water - direction
  function surfaceWaterDirection (liklihood) {
  const bands = ['RoFSWDirection25m1in30', 'RoFSWDirection25m1in100', 'RoFSWDirection25m1in1000']
  return new TileLayer({
    ref: `surfaceWaterDirection${liklihood}`,
    className: 'defra-map-raster-canvas',
    layerCodes: `ss${liklihood}`,
    source: new TileArcGISRest({
      url: `https://environment.data.gov.uk/arcgis/rest/services/EA/${bands[liklihood - 1]}/MapServer`,
      projection: 'EPSG:27700',
      params: {
        'TRANSPARENT': true,
        'FORMAT': 'GIF'}}),
  minZoom: 14,
  zIndex: 0
})
}  
    


// reservoir
function reservoirRiver (state) {
  const fillColour = state === 'DryDay' ? darkBlue : lightBlue
  return new TileLayer({
    ref: `reservoirRiver${state}`,
    className: 'defra-map-raster-canvas',
    layerCodes: 'rr4',
    source: new TileArcGISRest({
      url: `https://environment.data.gov.uk/arcgis/rest/services/EA/ReservoirFloodExtents${state}/MapServer`,
      projection: 'EPSG:27700',
      params: {
        'TRANSPARENT': true,
        'FORMAT': 'GIF',
        'dynamicLayers': `[{"id":0,"source":{"type":"mapLayer","mapLayerId":0},"drawingInfo":{"renderer":{"type":"simple","symbol":{"color":[${fillColour}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}}}}]`
      }
    }),
    minZoom: 8,
    zIndex: state === 'DryDay' ? 0 : -1
  })
}

// rivers and the sea
function riverSea (liklihood) {
  return new TileLayer({
    ref: `riverSea${liklihood}`,
    className: 'defra-map-raster-canvas',
    layerCodes: `re${liklihood},ae${liklihood}`,
    source: new TileArcGISRest({
      url: 'https://environment.data.gov.uk/arcgis/rest/services/EA/RiskOfFloodingFromRiversAndSea/MapServer',
      projection: 'EPSG:27700',
      params: {
        'TRANSPARENT': true,
        'FORMAT': 'GIF',
        'dynamicLayers': `[{"id":0,"source":{"type":"mapLayer","mapLayerId":0},"drawingInfo":{"renderer":{"type":"uniqueValue","field1":"prob_4band","uniqueValueInfos":[{"value":"High","symbol":{"color":[${liklihood > 0 ? layerColors[liklihood - 1] : '0,0,0,0'}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}},{"value":"Medium","symbol":{"color":[${liklihood > 1 ? layerColors[liklihood - 1] : '0,0,0,0'}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}},{"value":"Low","symbol":{"color":[${liklihood > 2 ? layerColors[liklihood - 1] : '0,0,0,0'}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}},{"value":"Very Low","symbol":{"color":[${liklihood > 3 ? layerColors[liklihood - 1] : '0,0,0,0'}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}}]}}}]`
      }
    }),
    minZoom: 8,
    zIndex: 0
  })
}

// radius style
var rStyle = new Style ({
  image: new Circle ({
  radius: 12,
  fill: new Fill({
    color: 'rgba(237, 231, 46, 0.6)'
  }),
  stroke: new Stroke({
    color: 'rgba(237, 231, 46, 1)',
    width: 2
  })
}),
zIndex: 2
});

// Marker style

 var mStyle = new Style({ 
  image: new Icon({ 
  anchor: [0.5, 40],
  anchorXUnits: 'fraction',
  anchorYUnits: 'pixels',
  src: '/public/images/marker-black.png'
}),
zIndex: 2
}); 

// Address window style
var wStyle = new Style({ 
  image: new Icon({ 
  anchor: [0.5, 110],
  anchorXUnits: 'fraction',
  anchorYUnits: 'pixels',
  src: '/public/images/pin.png'
})
}); 

// Address window var

 var address = new Feature({
  geometry: new Point([-2.0159323734242225,
    53.74123069144088]),
  type: 'test',
  name: 'something'
}); 
 
// Marker var
// 52.24389889541271, 0.4031600308058314
//50.763465355051004, -1.2977592816816998
var marker = new Feature({
  geometry: new Point([-1.2977592816816998, 50.763465355051004]),
  type: 'test',
  name: 'something'
});

// radius 

var radius = new Feature({
  geometry: new Point([0.4040511246045124,52.24377500667143]),
  type: 'test',
  name: 'something'
});

// Create vector layers for markers

 var addressLayer = new VectorLayer({
  minZoom: 10,
  maxZoom: 16,
  source: new VectorSource({
    features: [address]
  })
}); 

var radiusLayer = new VectorLayer({
  minZoom: 15,
  maxZoom: 16,
  source: new VectorSource({
    features: [radius]
  })
});

var markerLayer = new VectorLayer({
  title: 'point',
  source: new VectorSource({
    features: [marker]
  })
});

radius.setStyle(rStyle);
marker.setStyle(mStyle);
address.setStyle(wStyle);


//the map

const map = new Map({
  layers: [ base ],
  target: 'maphigh',
  view: view,
  controls: controls
});


//Remove the map layers
function removeLayers() {

  //remove all layers
  map.getLayers().getArray()
  .filter(layer => layer !== base) 
  .forEach(layer => map.removeLayer(layer));
  
  };

      // Toggle for ROS and Res

      var checkBox = document.getElementById("toggle");
      $('input[name="ros-map-toggle"]').change(function(){
        if (checkBox.checked == false){
          map.removeLayer(markerLayer)/* ,
          map.removeLayer(addressLayer); */
        } 
        else {
          map.addLayer(markerLayer)/* ,
          map.addLayer(addressLayer); */
        }
        });







 // Checkbox toggle for surface water
 var checkBox = document.getElementById("toggle");
 $('input[name="map-toggle"]').change(function(){
   if (checkBox.checked == false){
     map.removeLayer(markerLayer)
     /* map.removeLayer(radiusLayer) *//* ,
     map.removeLayer(addressLayer) */;
   } 
   else {
     /* map.addLayer(radiusLayer), */
     map.addLayer(markerLayer)/* ,
     map.addLayer(addressLayer) */;
   }
   });


//add marker and address
function markerAddress() {
  map.addLayer(markerLayer)/* ,
  map.addLayer(addressLayer) */;
};

//remove marker, address and radius
function removemarkerAddress() {
  map.removeLayer(markerLayer)/* ,
  map.removeLayer(addressLayer) */;
};

//add marker, address and radius
function markerAddressRadius() {
  map.addLayer(radiusLayer),
  map.addLayer(markerLayer),
  map.addLayer(addressLayer);
};

//remove marker, address and radius
function removeMarkerAddressRadius() {
  map.removeLayer(radiusLayer),
  map.removeLayer(markerLayer)/* ,
  map.removeLayer(addressLayer) */;
};


//Add the correct layers on page load
$( window ).on( "load", function() {

removeLayers();
  
  // get path
  var pathname = window.location.pathname;
  

  //get scenario parameter
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const scenario = urlParams.get('scenario')
  

   //high risk and med risk comparison
   //default to low risk unless a high or med risk scenario selected
  let x = 1
  if (scenario == '4' || scenario == '10' || scenario == '13' || scenario == '17' ) {
  x=1 } 
  else if (scenario == '5' || scenario == '11' || scenario == '14' || scenario == '18') {
   x=2 
  }
  else if (scenario == '6' || scenario == '12' || scenario == '15' || scenario == '19') {
    x=3 
   }

  if (pathname == '/version_15-1/nafra2/Maps/surface-water'){
    // nafra2 to show less risk (current)
    map.addLayer(surfaceWaterDepth(2)),
    markerAddress();
  /*   map.addLayer(surfaceWater(3))
    map.addLayer(surfaceWater(2))
    map.addLayer(surfaceWater(1))
    markerAddress(); */
  } else if (pathname == '/version_15-1/nafra2/Maps/surface-water-depth'){
    map.addLayer(surfaceWaterDepth(x)),
    markerAddress();
  } else if (pathname == '/version_15-1/nafra2/Maps/surface-water-velocity'){
    map.addLayer(surfaceWaterSpeed(x)),
    map.addLayer(surfaceWaterDirection(x)),
    markerAddress();
  } else if (pathname == '/version_15-1/nafra2/Maps/rivers-sea'){
   /*  map.addLayer(surfaceWaterRos(3))
    map.addLayer(surfaceWaterRos(2))
    map.addLayer(surfaceWaterRos(1))
    markerAddress(); */
    map.addLayer(surfaceWaterDepthRos(1)),
    /* map.addLayer(riverSea(4)),
    map.addLayer(riverSea(3)),
    map.addLayer(riverSea(2)),
    map.addLayer(riverSea(1)), */
    markerAddress();
  }
  else if (pathname == '/version_15-1/nafra2/Maps/rivers-sea-cc'){
    map.addLayer(surfaceWaterDepthRos(2)),
    /* map.addLayer(riverSea(4)),
    map.addLayer(riverSea(3)),
    map.addLayer(riverSea(2)),
    map.addLayer(riverSea(1)), */
    markerAddress();
  } else if (pathname == '/version_15-1/nafra2/Maps/reservoirs'){
    map.addLayer(reservoirRiver('DryDay')),
    map.addLayer(reservoirRiver('WetDay')),
    markerAddress();
  }
  else if (pathname == '/version_15-1/nafra2/Maps/surface-water-cc'){
    // nafra2 to show more risk (2050)
    map.addLayer(surfaceWaterDepth(3)),
    markerAddress();
  }

  //remove marker if not checked
  if(checkBox.checked == false) {
    removemarkerAddress()
  }


});


// Scenarios change on surface water
$('input[name="scenarios"]').change(function(){

  removeLayers();

  var displayOptionCheckbox = $('#display-option');

  if ([10, 11, 12, 13, 14, 15].includes(Number(this.value))) {
    // Check the 'display options' checkbox if it's not already checked
    // To work with display options checkbox if user unchecks box and then presses a scenario
    // checks the checkbox again, as layers will display
    if (!displayOptionCheckbox.prop('checked')) {
      displayOptionCheckbox.prop('checked', true);
    }
  }

//add back in the layer based on the radio button value
if (this.value == '4') {
  map.addLayer(surfaceWaterDepth(1)),
  /* map.addLayer(surfaceWater(3)),
  map.addLayer(surfaceWater(2)),
  map.addLayer(surfaceWater(1)), */
  markerAddress();
}
  else if (this.value == '5' ) {

     //suraface water extent medium risk
    map.addLayer(surfaceWater(2)),
    markerAddress();
  }
  else if (this.value == '6' ) {

    //suraface water extent low risk
    map.addLayer(surfaceWater(3)),
    markerAddress();
  } //add back in the layer based on the radio button value
  else if (this.value == '10') {

  //suraface water depth high risk
  map.addLayer(surfaceWaterDepth(1)),
  markerAddress();
}
else if (this.value == '11') {

  //suraface water depth medium risk
  map.addLayer(surfaceWaterDepth(2)),
  markerAddress();
} else if (this.value == '12') {

  //suraface water depth low risk
  map.addLayer(surfaceWaterDepth(3)),
  markerAddress();
}  else   if (this.value == '13') {
  // rivers current (depth)
  map.addLayer(surfaceWaterDepthRos(1)),
  markerAddress();
}
else if (this.value == '14') {
  // rivers future (depth sw)
  map.addLayer(surfaceWaterDepthRos(2)),
  markerAddress();

} else if (this.value == '15') {
  //suraface water speed low risk
  map.addLayer(surfaceWaterSpeed(3)),
  map.addLayer(surfaceWaterDirection(3)),
  markerAddress();
} 
else if (this.value == '17') {
  //River and sea high risk
  map.addLayer(riverSea(4)),
  map.addLayer(riverSea(3)),
  map.addLayer(riverSea(2)),
  map.addLayer(riverSea(1)),
  markerAddress();
}
else if (this.value == '18') {
  //River and sea medium risk
  map.addLayer(riverSea(2)),
  markerAddress();
} else if (this.value == '19') {
  //River and sea low risk
  map.addLayer(riverSea(4)),
  map.addLayer(riverSea(3)),
  markerAddress();
}
  else if (this.value == '31') {
    // Reservoirs scenario on
    map.addLayer(reservoirRiver('DryDay')),
    map.addLayer(reservoirRiver('WetDay')),
    markerAddress();
}
 else if (this.value == '20') {
  // Base map only selection for surface water
  removeLayers();
  markerAddress();
} 
else if (this.value == '30') {
  // Base map only selection for others
  removeLayers();
  markerAddress();
}
  //remove marker if not checked
  if(checkBox.checked == false) {
    removeMarkerAddress()
  }

});


// switch between risk types
$('input[name="risk-type"]').change(function(){
//get whether checkbox has been checked
var setCheckbox = document.getElementById("toggle").checked;
//get radio value
  var setRadio =  $('input[name="scenarios"]:checked').val()
  //get Center of map
  let center = map.getView().getCenter()
  var zoom = map.getView().getZoom(); // Get the current zoom level



      if (this.value == '1') {

        //surface water
        // v8 this now goes to the cc page
      window.location.href = "/version_15-1/nafra2/Maps/surface-water-cc?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;
    }
    else if (this.value == '2') {

      // rivers and sea
      window.location.href = "/version_15-1/nafra2/Maps/rivers-sea?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;
    } else if (this.value == '3') {
    
      //reservoirs
      window.location.href = "/version_15-1/nafra2/Maps/rivers-sea-cc?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;
      
    } 
  });

  // switch between measurements
$('input[name="measurements"]').change(function(){
//get whether checkbox has been checked
  var setCheckbox = document.getElementById("toggle").checked;
//get radio value
  var setRadio =  $('input[name="scenarios"]:checked').val()
 //get Center of map
 let center = map.getView().getCenter()
 var zoom = map.getView().getZoom(); // Get the current zoom level

  if (this.value == '7') {

  //Surface water extent
  window.location.href = "/version_15-1/nafra2/Maps/surface-water?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;

}
else if (this.value == '8') {

  //Surface water depth
  window.location.href = "/version_15-1/nafra2/Maps/surface-water-depth?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;

} else if (this.value == '9') {

  //Surface water speed
  window.location.href = "/version_15-1/nafra2/Maps/surface-water-velocity?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;
} 
});

// zoom out button

$('#zoomOut').on('click', function() {
  map.getView().animate({
   zoom: map.getView().getZoom() - 1,
    duration: 200
  });
});

// Add blue bottom border to scenario when radio checked
function handleRadioSelection() {
  // Get all the radio buttons within the scenarios ID
  const radioButtons = document.querySelectorAll('.defra-map-scenarios__container input[name="scenarios"]');

  // Store the initially checked radio button
  let initiallyCheckedRadioButton = null;

  // Find the initially checked radio button
  radioButtons.forEach((radioButton) => {
    if (radioButton.checked) {
      initiallyCheckedRadioButton = radioButton;
    }
  });

  // Apply the blue bottom border to the initially checked radio button's parent element
  if (initiallyCheckedRadioButton !== null) {
    initiallyCheckedRadioButton.parentElement.style.borderBottom = '7px solid #1D70B8';
  }

  // Store the previously selected radio button
  let previousRadioButton = initiallyCheckedRadioButton;

  // Add event listener to each radio button
  radioButtons.forEach((radioButton) => {
    radioButton.addEventListener('change', () => {
      // Get the parent element (govuk-radios__item) of the radio button
      const parentElement = radioButton.parentElement;

      // Check if the current radio button is checked
      if (radioButton.checked) {
        // Add a blue bottom border to the parent element
        parentElement.style.borderBottom = '7px solid #1D70B8';

        // Remove the styling from the previously selected radio button
        if (previousRadioButton !== null && previousRadioButton !== radioButton) {
          previousRadioButton.parentElement.style.borderBottom = 'none';
        }

        // Update the previousRadioButton variable with the current radio button
        previousRadioButton = radioButton;
      } else {
        // Remove the bottom border if the radio button is not checked
        parentElement.style.borderBottom = 'none';
      }
    });
  });
}

// Call the function to enable radio button selection handling
handleRadioSelection();

// page load, show key, hide scenarios
$(document).ready(function() {
  if ($(window).width() < 769) {
    // Show the map key container on page load
    $('#defra-map-key__container').css('display', 'block');
    // Hide the other elements on page load
    $('#reset-key').css('display', 'none');
    $('#zoomIn').css('display', 'none');
    $('#zoomOut').css('display', 'none');
  }
});

// close button on mobile map
$('#close-key').on('click', function() {
  // Hide the map key container when the close button is clicked
  $('#defra-map-key__container').css('display', 'none');
  // Show the other elements when the close button is clicked
  $('#scenarios-controls').css('display', 'block');
  $('#open-key').css('display', 'block');
  $('#att-key').css('display', 'block'); 
});



// open key
$('#open-key').on('click', function() {
  if ($('#defra-map-key__container').css('display') === 'none') {
  // Show the map key container when the open button is clicked
  $('#defra-map-key__container').css('display', 'block');
  // Hide the other elements when the open button is clicked
  }
  else if ($('#defra-map-key__container').css('display') === 'block') {
    $('#defra-map-key__container').css('display', 'none');
  }
});

// attribution button

$('#att-key').on('click', function() {
  if ($('#scenarios-controls').css('display') === 'block') {
    // If scenarios-controls is displayed, hide it and show #info
    $('#scenarios-controls').css('display', 'none');
    $('#info').css('display', 'block');

    // Check if the screen width is 769 pixels or less
    if ($(window).width() <= 641) {
      // Add margin-bottom to .defra-map-attribution if the screen width is 769 or less
      $('#att-key').css('margin-bottom', '60px');
    }
  } else if ($('#info').css('display') === 'block') {
    // If #info is displayed, hide it and show scenarios-controls
    $('#info').css('display', 'none');
    $('#scenarios-controls').css('display', 'block');
    if ($(window).width() <= 641) {
    // Remove the margin-bottom from .defra-map-attribution
    $('#att-key').css('margin-bottom', '0');
    $('#info').css('display', 'none');
    }
  }
});

  $('.defra-map-info__close').on('click', function() {

      // If #info is displayed, hide it and show scenarios-controls
      $('#info').css('display', 'none');
      $('#scenarios-controls').css('display', 'block');

      if ($(window).width() <= 641) {
        // Remove the margin-bottom from .defra-map-attribution
        $('#att-key').css('margin-bottom', '0');
        }
    
  });



// Scenario control arrows 

if (window.location.pathname.includes("/version_15-1/nafra2/Maps/surface-water") || window.location.pathname.includes("/version_15-1/nafra2/Maps/surface-water-cc") || window.location.pathname.includes("/version_15-1/nafra2/Maps/rivers-sea") || window.location.pathname.includes("/version_15-1/nafra2/Maps/rivers-sea-cc")) {
  const btnLeft = document.querySelector(".left-btn");
  const btnRight = document.querySelector(".right-btn");
  const scenarioContainer = document.querySelector(".defra-map-scenarios-depth-v4");

  const IconVisibility = () => {
    let scrollLeftValue = Math.ceil(scenarioContainer.scrollLeft);
    let scrollableWidth = scenarioContainer.scrollWidth - scenarioContainer.clientWidth;
    let isAtLeftEdge = scrollLeftValue < 10; // Check if within 10 pixels of the left side

    btnLeft.style.display = isAtLeftEdge ? "none" : "block";
    btnRight.style.display = scrollableWidth > scrollLeftValue ? "block" : "none";
  }

  btnLeft.addEventListener("click", () => {
    scenarioContainer.scrollLeft -= 150;
    IconVisibility();
  });

  btnRight.addEventListener("click", () => {
    scenarioContainer.scrollLeft += 150;
    IconVisibility();
  });

  // Listen to the scroll event to update arrow visibility
  scenarioContainer.addEventListener("scroll", () => {
    IconVisibility();
  });

  // Work with drag interaction
  let activeDrag = false;

  scenarioContainer.addEventListener("mousedown", (e) => {
    e.preventDefault(); // Prevent accidental text selection during drag
    activeDrag = true;
    startX = e.pageX - scenarioContainer.offsetLeft;
    scrollLeft = scenarioContainer.scrollLeft;
  });

  scenarioContainer.addEventListener("mousemove", (e) => {
    if (!activeDrag) return;
    e.preventDefault(); // Prevent accidental text selection during drag
    const x = e.pageX - scenarioContainer.offsetLeft;
    const walk = (x - startX) * 2; // Adjust drag sensitivity
    scenarioContainer.scrollLeft = scrollLeft - walk;
  });

  document.addEventListener("mouseup", () => {
    activeDrag = false;
  });
}


// Fix CSS and display left arrow none + display right button none above tablet width

$(document).ready(function() {
  $('.left-btn').css('display', 'none');
  if ($(window).width() >= 821) {
    $('.right-btn').css('display', 'none');
  }
});



  
// Remove layers checkbox

$(document).ready(function () {
  // Get the checkbox element
  var displayLayersCheckbox = $('#display-option');
  var currentPath = window.location.pathname;
  // Function to handle the "Display layers on map" checkbox
  function handleDisplayLayersCheckbox() {
    var isChecked = displayLayersCheckbox.prop('checked');
    var scenarioValue = $('input[name="scenarios"]:checked').val();
    // If unchecked, call the removeLayers() function
    if (!isChecked) {
      if (currentPath === '/version_15-1/nafra2/Maps/surface-water' || currentPath === '/version_15-1/nafra2/Maps/surface-water-cc' || currentPath === '/version_15-1/nafra2/Maps/surface-water-velocity') {
      removeLayers();
      markerAddress();
    }
    else if (currentPath === '/version_15-1/nafra2/Maps/rivers-sea' || currentPath === '/version_15-1/nafra2/Maps/reservoirs' || currentPath === '/version_15-1/nafra2/Maps/rivers-sea-cc')
      removeLayers();
      markerAddress();
    }
    // end of if that removes layers

    // if checkbox checked again, return correct layers
    else if (currentPath === '/version_15-1/nafra2/Maps/surface-water') {
    removeLayers();
    map.addLayer(surfaceWaterDepth(2));
    /* map.addLayer(surfaceWater(3)),
    map.addLayer(surfaceWater(2)),
    map.addLayer(surfaceWater(1)), */
    markerAddress();
    }
    else if (currentPath === '/version_15-1/nafra2/Maps/surface-water-cc') {
      removeLayers();
      map.addLayer(surfaceWaterDepth(3));
      /* map.addLayer(surfaceWater(3)),
      map.addLayer(surfaceWater(2)),
      map.addLayer(surfaceWater(1)), */
      markerAddress();
      }
    else if (currentPath === '/version_15-1/nafra2/Maps/rivers-sea') {
      removeLayers();
      map.addLayer(surfaceWaterDepthRos(1));
     /*  map.addLayer(riverSea(4)),
      map.addLayer(riverSea(3)),
      map.addLayer(riverSea(2)),
      map.addLayer(riverSea(1)), */
      markerAddress();
      }
      else if (currentPath === '/version_15-1/nafra2/Maps/rivers-sea-cc') {
        removeLayers();
        map.addLayer(surfaceWaterDepthRos(2));
       /*  map.addLayer(riverSea(4)),
        map.addLayer(riverSea(3)),
        map.addLayer(riverSea(2)),
        map.addLayer(riverSea(1)), */
        markerAddress();
        }
      else if (currentPath === '/version_15-1/nafra2/Maps/reservoirs') {
        removeLayers();
        map.addLayer(reservoirRiver('DryDay')),
        map.addLayer(reservoirRiver('WetDay')),
        markerAddress();
        }
        else if (currentPath === '/version_15-1/nafra2/Maps/surface-water-depth') {
          //surface water depth high risk
           if (scenarioValue == '10') {
            removeLayers();
            map.addLayer(surfaceWaterDepth(1));
            markerAddress();
          }
          //surface water depth medium risk
          else if (scenarioValue == '11') {
            removeLayers();
            map.addLayer(surfaceWaterDepth(2));
            markerAddress();
            //surface water depth low risk
          } else if (scenarioValue == '12') {
            removeLayers();
            map.addLayer(surfaceWaterDepth(3));
            markerAddress();
          } 
          }
          else if (currentPath === '/version_15-1/nafra2/Maps/surface-water-velocity') {
            //surface water velocity high risk
             if (scenarioValue == '13') {
              removeLayers();
              map.addLayer(surfaceWaterSpeed(1));
              markerAddress();
            }
            //surface water velocity medium risk
            else if (scenarioValue == '14') {
              removeLayers();
              map.addLayer(surfaceWaterSpeed(2));
              markerAddress();
              //surface water velocity low risk
            } else if (scenarioValue == '15') {
              removeLayers();
              map.addLayer(surfaceWaterSpeed(3));
              markerAddress();
            } 
            }
  }
  // Handle checkbox change event by calling the function
  displayLayersCheckbox.on('change', handleDisplayLayersCheckbox);
});

// exit map button sw
$(document).ready(function () {
  var exitButton = $('#exit-map-sw');

  exitButton.on('click', function () {
    // Navigate to another page
    window.location.href = '/version_15-1/nafra2/Design/Desktop/surface-water-result.html';
  });
});

// exit map button ros
$(document).ready(function () {
  var exitButton = $('#exit-map-ros');

  exitButton.on('click', function () {
    // Navigate to another page
    window.location.href = '/version_15-1/nafra2/Design/Desktop/rivers-and-seas-result.html';
  });
});


$(document).ready(function () {
  var velocityExit = $('#advanced-map-button-velocity');
  velocityExit.on('click', function () {

    // Navigate to another page
    window.location.href = 'surface-water.html';
  });
});

// Check the previous URL on page load and hide form groups if needed
/* $(document).ready(function () {
  hideFormGroupsBasedOnPreviousURL();
});

// Update the previous URL in localStorage when the page changes
$(window).on('beforeunload', function () {
  localStorage.setItem('previousURL', window.location.pathname);
});

 */
// add viewport styling to map

// Get the viewport element of the map
var viewport = map.getViewport();

// Add a CSS class to the viewport
viewport.classList.add('defra-map-viewport');


// cannot get focus state to work effectively with the ol-viewport
// Set the tabindex attribute to 0
/* viewport.setAttribute('tabindex', '0');

// Set the width attribute to 100%
viewport.style.width = '90%'; */

// remove skip link on map

// Get elements with the ".govuk-skip-link" class
var skipLinkElements = document.querySelectorAll('.govuk-skip-link');

// Check if any elements with the class exist
if (skipLinkElements.length > 0) {
  // Loop through the elements and add a CSS class to each of them
  skipLinkElements.forEach(function(element) {
    element.classList.add('defra-map-visibility-hidden');
  });
}

var skipLinkElements = document.querySelectorAll('.govuk-template');

// Check if any elements with the class exist
if (skipLinkElements.length > 0) {
  // Loop through the elements and add a CSS class to each of them
  skipLinkElements.forEach(function(element) {
    element.classList.add('defra-map-html');
  });
}

var skipLinkElements = document.querySelectorAll('.govuk-template__body');

// Check if any elements with the class exist
if (skipLinkElements.length > 0) {
  // Loop through the elements and add a CSS class to each of them
  skipLinkElements.forEach(function(element) {
    element.classList.add('defra-map-body');
  });
}

// disable zoom in on max zoom
const elementToStyle = $('#zoomIn');

// Listen for the "change:resolution" event, triggered when the zoom level changes
map.getView().on('change:resolution', function () {
  const currentZoom = map.getView().getZoom();
  // Log the current zoom level to the console
  console.log('Current Zoom Level:', currentZoom);

  // Check if the current zoom level is equal to the maxZoom (16 in this case)
  if (currentZoom >= 16) {
    // Apply your desired class to the element
    elementToStyle.addClass('zoom-disable');
     // Set aria-hidden attribute to true
     elementToStyle.attr('aria-disabled', 'true');
     elementToStyle.attr('aria-label', 'Zoom in disabled because max zoom has been reached');
  } else {
     // Remove the class if the zoom level is not maxZoom
     elementToStyle.removeClass('zoom-disable');
     // Set aria-hidden attribute to false
     elementToStyle.attr('aria-disabled', 'false');
     elementToStyle.attr('aria-label', 'Zoom in');
  }
});


// Zoom controls
$('#zoomIn').on('click', function() {
  // Check the current zoom level
  const currentZoom = map.getView().getZoom();

  // Only allow zooming in if the current zoom level is less than 16
  if (currentZoom < 16) {
    map.getView().animate({
      zoom: currentZoom + 1,
      duration: 200
    });
  }
});


// timeline 
$(document).ready(function () {
  var leftButton = $('.timeline-btn-left');
  var rightButton = $('.timeline-btn-right');

  leftButton.on('click', function () {
    // Check if the left button is not pressed
    if (leftButton.attr('aria-pressed') === 'false') {
      // Set aria-pressed to true for the left button
      leftButton.attr('aria-pressed', 'true');
      
      // Set aria-pressed to false for the right button
      rightButton.attr('aria-pressed', 'false');

      // Log the click event
      console.log('Left button clicked. aria-pressed: true');
    }
  });

  rightButton.on('click', function () {
    // Check if the right button is not pressed
    if (rightButton.attr('aria-pressed') === 'false') {
      // Set aria-pressed to true for the right button
      rightButton.attr('aria-pressed', 'true');
      
      // Set aria-pressed to false for the left button
      leftButton.attr('aria-pressed', 'false');

      // Log the click event
      console.log('Right button clicked. aria-pressed: true');
    }
  });
});