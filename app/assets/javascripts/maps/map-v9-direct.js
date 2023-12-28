
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



//centre of the map
let mapCenter = []



//view extent and centre and zoom levels
const view = new View({
  center: setCenter(),
  zoom: setStoredZoom() || 9, // Set the zoom level from sessionStorage or use a default value (e.g., 9)
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
    mapCenter = [0.4040511246045124,52.24377500667143]
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
const lightestBlue = '107, 120, 255, 255'
const lightBlue = '191, 197, 255, 255'
const midBlue = '89, 158, 255, 255'
const darkBlue = '0, 102, 204, 255'

const layerColors = [darkBlue, midBlue, lightBlue, lightestBlue] 

// red hues
//accessible
const lightP = '255, 191, 201, 255'
const midP = '230, 119, 46, 255'
const darkP = '153, 0, 77, 255'






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
        'dynamicLayers' : `[{"id":0,"source":{"type":"mapLayer","mapLayerId":0},"drawingInfo":{"renderer":{"type":"uniqueValue","field1":"depth","uniqueValueInfos":[{"value":"0.00 - 0.15","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${lightP}],"outline":{"type":"esriSLS","width":0}}},{"value":"0.15 - 0.30","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${lightP}],"outline":{"type":"esriSLS","width":0}}},{"value":"0.30 - 0.60","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${midP}],"outline":{"type":"esriSLS","width":0}}},{"value":"0.60 - 0.90","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${midP}],"outline":{"type":"esriSLS","width":0}}},{"value":"0.90 - 1.20","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${darkP}],"outline":{"type":"esriSLS","width":0}}},{"value":"> 1.20","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[${darkP}],"outline":{"type":"esriSLS","width":0}}}]},"transparency":0}}]`
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
        'dynamicLayers': `[{"id":0,"source":{"type":"mapLayer","mapLayerId":0},"drawingInfo":{"renderer":{"type":"uniqueValue","field1":"prob_4band","uniqueValueInfos":[{"value":"High","symbol":{"color":[${liklihood > 0 ? layerColorsG[liklihood - 1] : '0,0,0,0'}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}},{"value":"Medium","symbol":{"color":[${liklihood > 1 ? layerColorsG[liklihood - 1] : '0,0,0,0'}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}},{"value":"Low","symbol":{"color":[${liklihood > 2 ? layerColorsG[liklihood - 1] : '0,0,0,0'}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}},{"value":"Very Low","symbol":{"color":[${liklihood > 3 ? layerColorsG[liklihood - 1] : '0,0,0,0'}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}}]}}}]`
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
var marker = new Feature({
  geometry: new Point([0.4031600308058314,52.24389889541271]),
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

  if (pathname == '/version_10/nafra2-direct-map/surface-water'){
    // nafra2-direct-map to show less risk (current)
    map.addLayer(surfaceWaterDepth(2));
    /* map.addLayer(surfaceWater(3))
    map.addLayer(surfaceWater(2))
    map.addLayer(surfaceWater(1))
    markerAddress(); */
  }
  else if (pathname == '/version_10/nafra2-direct-map/surface-water-cc'){
    // nafra2-direct-map to show more risk (2050)
    map.addLayer(surfaceWaterDepth(3));
  }
  else if (pathname == '/version_10/nafra2-direct-map/surface-water-depth'){
    map.addLayer(surfaceWaterDepth(3));
  }
  else if (pathname == '/version_10/nafra2-direct-map/surface-water-depth-future'){
      map.addLayer(surfaceWaterDepth(3));
  } 
  else if (pathname == '/version_10/nafra2-direct-map/surface-water-velocity'){
    map.addLayer(surfaceWaterSpeed(x)),
    map.addLayer(surfaceWaterDirection(x));
  } 
  else if (pathname == '/version_10/nafra2-direct-map/rivers-sea'){
    map.addLayer(surfaceWaterDepthRos(1));
  }
  else if (pathname == '/version_10/nafra2-direct-map/rivers-sea-cc'){
    map.addLayer(surfaceWaterDepthRos(2));
  }
  else if (pathname == '/version_10/nafra2-direct-map/rivers-sea-depth'){
    map.addLayer(surfaceWaterDepthRos(3));
  }
  else if (pathname == '/version_10/nafra2-direct-map/rivers-sea-depth-future'){
      map.addLayer(surfaceWaterDepthRos(3));
  }
  else if (pathname == '/version_10/nafra2-direct-map/reservoirs'){
    map.addLayer(reservoirRiver('DryDay')),
    map.addLayer(reservoirRiver('WetDay'));
    
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
  map.addLayer(surfaceWaterDepth(1));
  /* map.addLayer(surfaceWater(3)),
  map.addLayer(surfaceWater(2)),
  map.addLayer(surfaceWater(1)), */
  /* markerAddress(); */
}
  else if (this.value == '5' ) {

     //suraface water extent medium risk
    map.addLayer(surfaceWater(2));
  }
  else if (this.value == '6' ) {

    //suraface water extent low risk
    map.addLayer(surfaceWater(3));
  } //add back in the layer based on the radio button value
  else if (this.value == '10') {

  //suraface water depth high risk
  map.addLayer(surfaceWaterDepth(1));
}
else if (this.value == '11') {

  //suraface water depth medium risk
  map.addLayer(surfaceWaterDepth(2));
} else if (this.value == '12') {

  //suraface water depth low risk
  map.addLayer(surfaceWaterDepth(3));
}  else   if (this.value == '13') {
  // rivers current (depth)
  map.addLayer(surfaceWaterDepthRos(1));
}
else if (this.value == '14') {
  // rivers future (depth sw)
  map.addLayer(surfaceWaterDepthRos(2));

} else if (this.value == '15') {
  //suraface water speed low risk
  map.addLayer(surfaceWaterDepthRos(3));
} 
else if (this.value == '17') {
  //River and sea high risk
  map.addLayer(riverSea(4)),
  map.addLayer(riverSea(3)),
  map.addLayer(riverSea(2)),
  map.addLayer(riverSea(1));
}
else if (this.value == '18') {
  //River and sea medium risk
  map.addLayer(riverSea(2));
} else if (this.value == '19') {
  //River and sea low risk
  map.addLayer(riverSea(4)),
  map.addLayer(riverSea(3));
}
  else if (this.value == '31') {
    // Reservoirs scenario on
    map.addLayer(reservoirRiver('DryDay')),
    map.addLayer(reservoirRiver('WetDay'));
}
 else if (this.value == '20') {
  // Base map only selection for surface water
  removeLayers();
  
} 
else if (this.value == '30') {
  // Base map only selection for others
  removeLayers();
  
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

      if (this.value == '32') {

        //surface water
        // v8 this now goes to the cc page
      window.location.href = "/version_10/nafra2-direct-map/surface-water-cc?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;
    }
    else if (this.value == '33') {
    
      window.location.href = "/version_10/nafra2-direct-map/surface-water-depth-future?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;
      
    } 
    // rivers and the sea 2050 
    else if (this.value == '34') {
    
      window.location.href = "/version_10/nafra2-direct-map/rivers-sea-cc?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;
      
    } 
    else if (this.value == '35') {
    
      window.location.href = "/version_10/nafra2-direct-map/rivers-sea-depth-future?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;
      
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
  window.location.href = "/version_10/nafra2-direct-map/surface-water?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;

}
else if (this.value == '8') {

  //Surface water depth
  window.location.href = "/version_10/nafra2-direct-map/surface-water-depth?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;

} else if (this.value == '9') {

  //Surface water speed
  window.location.href = "/version_10/nafra2-direct-map/rivers-sea?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;
} 
else if (this.value == '10') {

  //Surface water speed
  window.location.href = "/version_10/nafra2-direct-map/rivers-sea-depth?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center+ "&zoom=" + zoom;
} 
});
  
//Zoom controls
$('#zoomIn').on('click', function() {
  map.getView().animate({
    zoom: map.getView().getZoom() + 1,
     duration: 200
   });
});

$('#zoomOut').on('click', function() {
  map.getView().animate({
   zoom: map.getView().getZoom() - 1,
    duration: 200
  });
});

// Add blue bottom border to scenario when radio checked
function handleRadioSelection() {
  // Get all the radio buttons within the scenarios ID
  const radioButtons = document.querySelectorAll('.defra-map-scenarios-v3_container input[name="scenarios"]');

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
    $('#rivers-btn').css('margin-top', '195px');
    $('#sw-btn').css('margin-top', '235px');
    $('#rivers-btn-res').css('margin-top', '170px');
    $('#sw-btn-res').css('margin-top', '10px');
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
  $('#rivers-btn').css('margin-top', '10px');
  $('#sw-btn').css('margin-top', '10px');
  $('#rivers-btn-res').css('margin-top', '10px');
  $('#sw-btn-res').css('margin-top', '10px');
});



// open key
$('#open-key').on('click', function() {
  if ($('#defra-map-key__container').css('display') === 'none') {
  // Show the map key container when the open button is clicked
  $('#defra-map-key__container').css('display', 'block');
  $('#rivers-btn').css('margin-top', '195px');
  $('#sw-btn').css('margin-top', '235px');
  $('#rivers-btn-res').css('margin-top', '170px');
  $('#sw-btn-res').css('margin-top', '10px');
  // Hide the other elements when the open button is clicked
  }
  else if ($('#defra-map-key__container').css('display') === 'block') {
    $('#defra-map-key__container').css('display', 'none');
    $('#rivers-btn').css('margin-top', '10px');
    $('#sw-btn').css('margin-top', '10px');
    $('#rivers-btn-res').css('margin-top', '10px');
    $('#sw-btn-res').css('margin-top', '10px');
  }
});

// attribution button

$('#att-key').on('click', function() {
  if ($('#scenarios-controls').css('display') === 'block') {
    // If scenarios-controls is displayed, hide it and show #info
    $('#scenarios-controls').css('display', 'none');
    $('#tabs-group').css('display', 'none');
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
    $('#tabs-group').css('display', 'flex');
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

if (window.location.pathname.includes("/version_10/nafra2-direct-map/surface-water") || window.location.pathname.includes("/version_10/nafra2-direct-map/surface-water-depth") || window.location.pathname.includes("/version_10/nafra2-direct-map/surface-water-cc") || window.location.pathname.includes("/version_10/nafra2-direct-map/rivers-sea") || window.location.pathname.includes("/version_10/nafra2-direct-map/rivers-sea-cc")) {
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
      if (currentPath === '/version_10/nafra2-direct-map/surface-water' || currentPath === '/version_10/nafra2-direct-map/surface-water-cc' || currentPath === '/version_10/nafra2-direct-map/surface-water-velocity' || currentPath === '/version_10/nafra2-direct-map/surface-water-depth' || currentPath === '/version_10/nafra2-direct-map/surface-water-depth-future' || currentPath === '/version_10/nafra2-direct-map/rivers-sea-depth' || currentPath === '/version_10/nafra2-direct-map/rivers-sea-depth-future') {
      removeLayers();
    }
    else if (currentPath === '/version_10/nafra2-direct-map/rivers-sea' || currentPath === '/version_10/nafra2-direct-map/reservoirs' || currentPath === '/version_10/nafra2-direct-map/rivers-sea-cc')
      removeLayers();
    }
    // end of if that removes layers

    // if checkbox checked again, return correct layers
    else if (currentPath === '/version_10/nafra2-direct-map/surface-water') {
    removeLayers();
    map.addLayer(surfaceWaterDepth(2));
    /* map.addLayer(surfaceWater(3)),
    map.addLayer(surfaceWater(2)),
    map.addLayer(surfaceWater(1)), */
    }
    else if (currentPath === '/version_10/nafra2-direct-map/surface-water-cc') {
      removeLayers();
      map.addLayer(surfaceWaterDepth(3));
      /* map.addLayer(surfaceWater(3)),
      map.addLayer(surfaceWater(2)),
      map.addLayer(surfaceWater(1)), */
      
      }
    else if (currentPath === '/version_10/nafra2-direct-map/rivers-sea') {
      removeLayers();
      map.addLayer(surfaceWaterDepthRos(1));
     /*  map.addLayer(riverSea(4)),
      map.addLayer(riverSea(3)),
      map.addLayer(riverSea(2)),
      map.addLayer(riverSea(1)), */
  
      }
      else if (currentPath === '/version_10/nafra2-direct-map/rivers-sea-cc') {
        removeLayers();
        map.addLayer(surfaceWaterDepthRos(2));
       /*  map.addLayer(riverSea(4)),
        map.addLayer(riverSea(3)),
        map.addLayer(riverSea(2)),
        map.addLayer(riverSea(1)), */
        
        }
      else if (currentPath === '/version_10/nafra2-direct-map/reservoirs') {
        removeLayers();
        map.addLayer(reservoirRiver('DryDay'));
        map.addLayer(reservoirRiver('WetDay'));
        
        }
        else if (currentPath === '/version_10/nafra2-direct-map/surface-water-depth') {
          //surface water depth high risk
           if (scenarioValue == '10') {
            removeLayers();
            map.addLayer(surfaceWaterDepth(1));
            
          }
          //surface water depth medium risk
          else if (scenarioValue == '11') {
            removeLayers();
            map.addLayer(surfaceWaterDepth(2));
            
            //surface water depth low risk
          } else if (scenarioValue == '12') {
            removeLayers();
            map.addLayer(surfaceWaterDepth(3));
            
          } 
          }
          else if (currentPath === '/version_10/nafra2-direct-map/surface-water-depth-future') {
            //surface water depth high risk
             if (scenarioValue == '10') {
              removeLayers();
              map.addLayer(surfaceWaterDepth(1));
              
            }
            //surface water depth medium risk
            else if (scenarioValue == '11') {
              removeLayers();
              map.addLayer(surfaceWaterDepth(2));
              
              //surface water depth low risk
            } else if (scenarioValue == '12') {
              removeLayers();
              map.addLayer(surfaceWaterDepth(3));
              
            } 
            }
          else if (currentPath === '/version_10/nafra2-direct-map/rivers-sea-depth') {
            //surface water velocity high risk
             if (scenarioValue == '13') {
              removeLayers();
              map.addLayer(surfaceWaterSpeed(1));
              
            }
            //surface water velocity medium risk
            else if (scenarioValue == '14') {
              removeLayers();
              map.addLayer(surfaceWaterSpeed(2));
              
              //surface water velocity low risk
            } else if (scenarioValue == '15') {
              removeLayers();
              map.addLayer(surfaceWaterSpeed(3));
              
            } 
            }
            else if (currentPath === '/version_10/nafra2-direct-map/rivers-sea-depth-future') {
              //surface water velocity high risk
               if (scenarioValue == '13') {
                removeLayers();
                map.addLayer(surfaceWaterSpeed(1));
                
              }
              //surface water velocity medium risk
              else if (scenarioValue == '14') {
                removeLayers();
                map.addLayer(surfaceWaterSpeed(2));
                
                //surface water velocity low risk
              } else if (scenarioValue == '15') {
                removeLayers();
                map.addLayer(surfaceWaterSpeed(3));
                
              } 
              }
  }
  // Handle checkbox change event by calling the function
  displayLayersCheckbox.on('change', handleDisplayLayersCheckbox);
});

// exit map button
$(document).ready(function () {

  // exit map button
  $('#exit-map').on('click', function () {
    window.location.href = '/version_10/nafra2/where-do-you-want-to-check.html.html';
  });

  // rivers map button
  $('#rivers-btn').on('click', function () {
    window.location.href = '/version_10/nafra2-direct-map/rivers-sea.html';
  });

  // rivers map button on res
  $('#rivers-btn-res').on('click', function () {
    window.location.href = '/version_10/nafra2-direct-map/rivers-sea.html';
  });

  // reservoir map button
  $('#res-btn').on('click', function () {
    window.location.href = '/version_10/nafra2-direct-map/reservoirs.html';
  });

  // surface water map button
  $('#sw-btn').on('click', function () {
    window.location.href = '/version_10/nafra2-direct-map/surface-water.html';
  });

  // surface water map button on res
  $('#sw-btn-res').on('click', function () {
    window.location.href = '/version_10/nafra2-direct-map/surface-water.html';
  });

});


// Check the previous URL on page load and hide form groups if needed
/* $(document).ready(function () {
  hideFormGroupsBasedOnPreviousURL();
}); */

// Update the previous URL in localStorage when the page changes
$(window).on('beforeunload', function () {
  localStorage.setItem('previousURL', window.location.pathname);
});


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



// tests for tabs on technical map
/* 
$(document).ready(function () {
    var tab2 = $('#tab2');

    tab2.on('click', function () {
        // Hide tabContent1
        $('#tabContent1').css('display', 'none');
        $('#tab1').addClass('tab-inactive');

        // Show tabContent2
        $('#tabContent2').css('display', 'block');
        $('#tab2').removeClass('tab-inactive');
    });
});

$(document).ready(function () {
  var tab1 = $('#tab1');

  tab1.on('click', function () {
      // Hide tabContent1
      $('#tabContent2').css('display', 'none');
      $('#tab2').addClass('tab-inactive');

      // Show tabContent2
      $('#tabContent1').css('display', 'block');
      $('#tab1').removeClass('tab-inactive');
  });
}); */

// For the surface water map button tabs
$(document).ready(function () {
  var tab1 = $('#tab1');
  var tab2 = $('#tab2');
  var tab3 = $('#tab3');

  
  tab1.on('click', function () {
      // Fetch the current center and zoom when the tab is clicked
      let center = map.getView().getCenter();
      var zoom = map.getView().getZoom();
      
      // Navigate to the surface water page with updated center and zoom values
      window.location.href = "/version_10/nafra2-direct-map/surface-water.html?center=" + center + "&zoom=" + zoom;
  });

  tab2.on('click', function () {
      // Fetch the current center and zoom when the tab is clicked
      let center = map.getView().getCenter();
      var zoom = map.getView().getZoom();

      // Navigate to the surface water depth page with updated center and zoom values
      window.location.href = "/version_10/nafra2-direct-map/surface-water-depth.html?center=" + center + "&zoom=" + zoom;
  });

  tab3.on('click', function () {
      // Fetch the current center and zoom when the tab is clicked
      let center = map.getView().getCenter();
      var zoom = map.getView().getZoom();

      // Navigate to the surface water depth future page with updated center and zoom values
      window.location.href = "/version_10/nafra2-direct-map/surface-water-depth-future.html?center=" + center + "&zoom=" + zoom;
  });
});

$(document).ready(function () {
  var tab1 = $('#tab1-rs');
  var tab2 = $('#tab2-rs');
  var tab3 = $('#tab3-rs');
  
  function convertCenterToString(center) {
    return center.join(','); // Convert array [x, y] to string "x,y"
  }

  tab1.on('click', function () {
    let center = map.getView().getCenter();
    var zoom = map.getView().getZoom(); 
    let centerString = convertCenterToString(center); // Convert center to string format
    console.log("Tab 1 clicked - Center:", centerString, "Zoom:", zoom);
    window.location.href = "/version_10/nafra2-direct-map/rivers-sea.html?center=" + centerString + "&zoom=" + zoom;
  });

  tab2.on('click', function () {
    let center = map.getView().getCenter();
    var zoom = map.getView().getZoom(); 
    let centerString = convertCenterToString(center); // Convert center to string format
    console.log("Tab 2 clicked - Center:", centerString, "Zoom:", zoom);
    window.location.href = "/version_10/nafra2-direct-map/rivers-sea-depth.html?center=" + centerString + "&zoom=" + zoom;
  });

  tab3.on('click', function () {
    let center = map.getView().getCenter();
    var zoom = map.getView().getZoom(); 
    let centerString = convertCenterToString(center); // Convert center to string format
    console.log("Tab 3 clicked - Center:", centerString, "Zoom:", zoom);
    window.location.href = "/version_10/nafra2-direct-map/rivers-sea-depth-future.html?center=" + centerString + "&zoom=" + zoom;
  });
});



