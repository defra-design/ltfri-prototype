
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
  zoom: 15, // Set the zoom level from sessionStorage
  minZoom: 8,
  maxZoom: 16,
  extent: [ -5.75447, 49.93027, 1.799683, 55.84093],
});


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
          map.removeLayer(markerLayer)
        } 
        else {
          map.addLayer(markerLayer)
        }
        });







 // Checkbox toggle for surface water
 var checkBox = document.getElementById("toggle");
 $('input[name="map-toggle"]').change(function(){
   if (checkBox.checked == false){
     map.removeLayer(markerLayer)
   } 
   else {
     map.addLayer(markerLayer)
   }
   });


//add marker and address
function markerAddress() {
  map.addLayer(markerLayer)
};

//remove marker, address and radius
function removemarkerAddress() {
  map.removeLayer(markerLayer)
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

  if (pathname == '/version_14/nafra2/surface-water'){
    // nafra2 to show less risk (current)
    map.addLayer(surfaceWaterDepth(2)),
    markerAddress();
  /*   map.addLayer(surfaceWater(3))
    map.addLayer(surfaceWater(2))
    map.addLayer(surfaceWater(1))
    markerAddress(); */
  } 
   else if (pathname == '/version_14/nafra2/rivers-sea'){
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

   else if (pathname == '/version_14/nafra2/reservoirs'){
    map.addLayer(reservoirRiver('DryDay')),
    map.addLayer(reservoirRiver('WetDay')),
    markerAddress();
  }

  //remove marker if not checked
  if(checkBox.checked == false) {
    removemarkerAddress()
  }

});





// Zoom out on page load for technical map
$(document).ready(function() {
  // Check if the current page is /version_14/nafra2/technical-map.html
  if (window.location.pathname === '/version_14/nafra2/technical-map') {
      // Get the current zoom level
      var currentZoom = map.getView().getZoom();

      // Calculate the target zoom level
      var targetZoom = currentZoom - 6;

      // Animate the zoom to the target zoom level
      map.getView().animate({
          zoom: targetZoom,
          duration: 200
      });
  }
});


// zoom out button
$('#zoomOut').on('click', function() {
  map.getView().animate({
   zoom: map.getView().getZoom() - 1,
    duration: 200
  });
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
      if (currentPath === '/version_14/nafra2/surface-water' || currentPath === '/version_14/nafra2/rivers-sea' || currentPath === '/version_14/nafra2/reservoirs') {
      removeLayers();
      markerAddress();
    }
  }
    // end of if that removes layers

    // if checkbox checked again, return correct layers
    else if (currentPath === '/version_14/nafra2/surface-water') {
    removeLayers();
    map.addLayer(surfaceWaterDepth(2));
    /* map.addLayer(surfaceWater(3)),
    map.addLayer(surfaceWater(2)),
    map.addLayer(surfaceWater(1)), */
    markerAddress();
    }
    else if (currentPath === '/version_14/nafra2/rivers-sea') {
      removeLayers();
      map.addLayer(surfaceWaterDepthRos(1));
     /*  map.addLayer(riverSea(4)),
      map.addLayer(riverSea(3)),
      map.addLayer(riverSea(2)),
      map.addLayer(riverSea(1)), */
      markerAddress();
      }
      else if (currentPath === '/version_14/nafra2/reservoirs') {
        removeLayers();
        map.addLayer(reservoirRiver('DryDay')),
        map.addLayer(reservoirRiver('WetDay')),
        markerAddress();
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
    window.location.href = 'results-full-sw.html';
  });
});

// exit map button ros
$(document).ready(function () {
  var exitButton = $('#exit-map-ros');

  exitButton.on('click', function () {
    // Navigate to another page
    window.location.href = 'results-full-ros.html';
  });
});


$(document).ready(function () {
  var velocityExit = $('#advanced-map-button-velocity');
  velocityExit.on('click', function () {

    // Navigate to another page
    window.location.href = 'surface-water.html';
  });
});


// add viewport styling to map

// Get the viewport element of the map
var viewport = map.getViewport();

// Add a CSS class to the viewport
viewport.classList.add('defra-map-viewport');


// cannot get focus state to work effectively with the ol-viewport
// Set the tabindex attribute to 0
/* viewport.setAttribute('tabindex', '0');
viewport.setAttribute('z-index', '1');

// Set the width attribute to 100%
viewport.style.width = '100%'; */


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


// Scenarios change on surface water
$('.timeline-btn-left, .timeline-btn-right').click(function(){

  removeLayers();

  var displayOptionCheckbox = $('#display-option');

  var selectedValue = $(this).val();

  if ([10, 11, 12, 13, 14, 15].includes(Number(selectedValue))) {
    // Check the 'display options' checkbox if it's not already checked
    // To work with display options checkbox if user unchecks box and then presses a scenario
    // checks the checkbox again, as layers will display
    if (!displayOptionCheckbox.prop('checked')) {
      displayOptionCheckbox.prop('checked', true);
    }
  }

  //add back in the layer based on the button value
   if (selectedValue == '10') {
    // surface water depth high risk
    map.addLayer(surfaceWaterDepth(1));
    markerAddress();
  }
  else if (selectedValue == '11') {
    // surface water depth medium risk
    map.addLayer(surfaceWaterDepth(2));
    markerAddress();
  }
  else if (selectedValue == '12') {
    // surface water depth low risk
    map.addLayer(surfaceWaterDepth(3));
    markerAddress();
  }
  else if (selectedValue == '13') {
    // rivers current (depth)
    map.addLayer(surfaceWaterDepthRos(1));
    markerAddress();
  }
  else if (selectedValue == '14') {
    // rivers future (depth sw)
    map.addLayer(surfaceWaterDepthRos(2));
    markerAddress();
  }
  else if (selectedValue == '31') {
    // Reservoirs scenario on
    map.addLayer(reservoirRiver('DryDay'));
    map.addLayer(reservoirRiver('WetDay'));
    markerAddress();
  }
  // remove marker if not checked
  if (!displayOptionCheckbox.prop('checked')) {
    removeMarkerAddress();
  }

});


// close button on mobile map
$('.defra-map-info__close').on('click', function() {
  const screenWidth = $(window).width();
  console.log('something');
  // Hide the map key container when the close button is clicked
  $('.panel').css('display', 'none');
  if (screenWidth < 520) {
  $('#mobile-key-panel-bottom').css('display', 'none');
  }
  $('#open-key').css('display', 'block');
  $('#open-key').focus();
});


$('#open-key').on('click', function() {
  const screenWidth = $(window).width();
  $('.panel').css('display', 'block');
  if (screenWidth < 520) {
    $('#mobile-key-panel-bottom').css('display', 'block');
    $('.panel').css('display', 'none');
  }
  $('#open-key').css('display', 'none');
  $('.panel').focus();
});


// Panel buttons
// Used classes instead of IDs on elements because of shortcut using a mobile panel and a separate desktop panel

$(document).ready(function () {
  var resButton = $('.res-btn');
  var rosButton = $('.ros-btn');
  var swButton = $('.sw-btn');
  var extentButton = $('.ext-btn')
  var depthButton = $('.depth-btn')
  var d20Button = $('.d20-btn')
  var d30Button = $('.d30-btn')
  var d60Button = $('.d60-btn')
  var d90Button = $('.d90-btn')
  var buttonMore = $('.btn-more');

  resButton.on('click', function () {
    // Check if the left button is not pressed
    if (resButton.attr('aria-pressed') === 'false') {
      // Set aria-pressed to true for the left button
      resButton.attr('aria-pressed', 'true');
      
      // Set aria-pressed to false for other sources
      rosButton.attr('aria-pressed', 'false');
      swButton.attr('aria-pressed', 'false');

      removeLayers();
      map.addLayer(reservoirRiver('DryDay'));
      map.addLayer(reservoirRiver('WetDay'));
      markerAddress();

         // Hide unrelated containers
         $('.measurement-container').css('display', 'none');
         $('.sw-key-row').css('display', 'none');
         $('.ros-key-row').css('display', 'none');
         $('.timeline').css('display', 'none');
         $('.btn-more').css('display', 'none');
         $('.depths-container').css('display', 'none');

         // Show reservoir key
         $('.res-key-row').css('display', 'block');
         

         //Styling for res panel
         $('.src-container').css('margin-top', '0px');

      // Log the click event
      console.log('RES. aria-pressed: true');
    }
  });

  rosButton.on('click', function () {
    // Check if the right button is not pressed
    if (rosButton.attr('aria-pressed') === 'false') {
      // Set aria-pressed to true for the right button
      rosButton.attr('aria-pressed', 'true');
      
      // Set aria-pressed to false for the left button
      resButton.attr('aria-pressed', 'false');
      swButton.attr('aria-pressed', 'false');

      // Show related containers
      $('.measurement-container').css('display', 'block');
      $('.ros-key-row').css('display', 'block');
      $('.timeline').css('display', 'block');
      $('.btn-more').css('display', 'block');

      removeLayers();
      map.addLayer(surfaceWaterDepthRos(1));
      markerAddress();

      if (depthButton.attr('aria-pressed') === 'true') {
        $('.depths-container').css('display', 'block');
        removeLayers();
        map.addLayer(surfaceWaterDepthRos(3));
        markerAddress();
      }

       if (buttonMore.attr('aria-expanded') === 'false' && rosButton.attr('aria-pressed') === 'true'){
        $('.ros-key-row').css('display', 'none');
      }

      // Hide other key
      $('.res-key-row').css('display', 'none');
      $('.sw-key-row').css('display', 'none');
      //Styling for res panel
      $('.src-container').css('margin-top', '10px');

      $('#mobile-key-panel-bottom .timeline-btn-right').css('margin-right', '30px');


      // Log the click event
      console.log('ROS aria-pressed: true');
    }
  });

  swButton.on('click', function () {
    // Check if the right button is not pressed
    if (swButton.attr('aria-pressed') === 'false') {
      // Set aria-pressed to true for the right button
      swButton.attr('aria-pressed', 'true');
      
      // Set aria-pressed to false for the left button
      resButton.attr('aria-pressed', 'false');
      rosButton.attr('aria-pressed', 'false');

      // Show related containers
      $('.measurement-container').css('display', 'block');
      $('.sw-key-row').css('display', 'block');
      $('.timeline').css('display', 'block');
      $('.btn-more').css('display', 'block');

      removeLayers();
      map.addLayer(surfaceWaterDepth(2));
      markerAddress();

      if (depthButton.attr('aria-pressed') === 'true') {
        $('.depths-container').css('display', 'block');
    
        if (d30Button.attr('aria-pressed') === 'true') {
            removeLayers();
            map.addLayer(surfaceWaterDepth(2));
            markerAddress();
        } else if (d60Button.attr('aria-pressed') === 'true') {
            removeLayers();
            map.addLayer(surfaceWaterDepth(1));
            markerAddress();
        } else if (d90Button.attr('aria-pressed') === 'true') {
            removeLayers();
            map.addLayer(surfaceWaterDepth(0));
            markerAddress();
        } else {
            removeLayers();
            map.addLayer(surfaceWaterDepth(3));
            markerAddress();
        }
    }
      
      
      if (buttonMore.attr('aria-expanded') === 'false' && swButton.attr('aria-pressed') === 'true'){
            $('.sw-key-row').css('display', 'none');
        }

      // Hide other key
      $('.res-key-row').css('display', 'none');
      $('.ros-key-row').css('display', 'none');

      //Styling for res panel
      $('.src-container').css('margin-top', '10px');
      $('#mobile-key-panel-bottom .timeline-btn-right').css('margin-right', '30px');

      // Log the click event
      console.log('SW aria-pressed: true');
    }
  });


  extentButton.on('click', function () {
    // Check if the left button is not pressed
    if (extentButton.attr('aria-pressed') === 'false') {
      // Set aria-pressed to true for the left button
      extentButton.attr('aria-pressed', 'true');
      depthButton.attr('aria-pressed', 'false');
      // hide depth levels container
      $('.depths-container').css('display', 'none');
    }
    });
    depthButton.on('click', function () {
      // Check if the left button is not pressed
      if (depthButton.attr('aria-pressed') === 'false') {
        // Set aria-pressed to true for the left button
        depthButton.attr('aria-pressed', 'true');
        extentButton.attr('aria-pressed', 'false');

        // show depth levels container
        $('.depths-container').css('display', 'block');
      }
      });

      d20Button.on('click', function () {
        // Check if the left button is not pressed
        if (d20Button.attr('aria-pressed') === 'false') {
          // Set aria-pressed to true for the left button
          d20Button.attr('aria-pressed', 'true');
          d30Button.attr('aria-pressed', 'false');
          d60Button.attr('aria-pressed', 'false');
          d90Button.attr('aria-pressed', 'false');
        }
        });

        d30Button.on('click', function () {
          // Check if the left button is not pressed
          if (d30Button.attr('aria-pressed') === 'false') {
            // Set aria-pressed to true for the left button
            d30Button.attr('aria-pressed', 'true');
            d20Button.attr('aria-pressed', 'false');
            d60Button.attr('aria-pressed', 'false');
            d90Button.attr('aria-pressed', 'false');
          }
          });

          d60Button.on('click', function () {
            // Check if the left button is not pressed
            if (d60Button.attr('aria-pressed') === 'false') {
              // Set aria-pressed to true for the left button
              d60Button.attr('aria-pressed', 'true');
              d20Button.attr('aria-pressed', 'false');
              d30Button.attr('aria-pressed', 'false');
              d90Button.attr('aria-pressed', 'false');
            }
            });

            d90Button.on('click', function () {
              // Check if the left button is not pressed
              if (d90Button.attr('aria-pressed') === 'false') {
                // Set aria-pressed to true for the left button
                d90Button.attr('aria-pressed', 'true');
                d20Button.attr('aria-pressed', 'false');
                d30Button.attr('aria-pressed', 'false');
                d60Button.attr('aria-pressed', 'false');
              }
              });
  });

  $(document).ready(function() {
    $('.btn-more').click(function() {
        $('.key-chev').toggleClass('fm-c-btn-more__chevron--active');
        var buttonText = $('#btn-more-text').text();
        var desktopButtonText = $('#btn-more-text-desktop').text();
        var buttonMore = $('.btn-more');
        var rosButton = $('.ros-btn');
        var swButton = $('.sw-btn');

        if (buttonText === 'Show map key') {
            $('#btn-more-text').text('Hide map key');
        } else {
            $('#btn-more-text').text('Show map key');
        }

        if (desktopButtonText === 'Show map key') {
          $('#btn-more-text-desktop').text('Hide map key');
      } else {
          $('#btn-more-text-desktop').text('Show map key');
      }


        if (buttonMore.attr('aria-expanded') === 'false' && swButton.attr('aria-pressed') === 'true')  {
            $('.sw-key-row').css('display', 'block');
            buttonMore.attr('aria-expanded', 'true'); // Update aria-expanded attribute
        } else if (buttonMore.attr('aria-expanded') === 'true' && swButton.attr('aria-pressed') === 'true'){
            $('.sw-key-row').css('display', 'none');
            buttonMore.attr('aria-expanded', 'false'); // Update aria-expanded attribute
        }

        if (buttonMore.attr('aria-expanded') === 'false' && rosButton.attr('aria-pressed') === 'true')  {
          $('.sw-key-row').css('display', 'none');
          $('.ros-key-row').css('display', 'block');
          buttonMore.attr('aria-expanded', 'true'); // Update aria-expanded attribute
      } else if (buttonMore.attr('aria-expanded') === 'true' && rosButton.attr('aria-pressed') === 'true'){
          $('.sw-key-row').css('display', 'none');
          $('.ros-key-row').css('display', 'none');
          buttonMore.attr('aria-expanded', 'false'); // Update aria-expanded attribute
      }

    });
});

$(document).ready(function() {
  $('.adv-btn-more').click(function() {
      $('.adv-chev').toggleClass('fm-c-btn-more__chevron--active');
      var buttonText = $('#adv-btn-more-text').text();
      var desktopButtonText = $('#adv-btn-more-text-desktop').text();
      var buttonMore = $('.adv-btn-more');
   

      if (buttonText === 'Show advanced options') {
          $('#adv-btn-more-text').text('Hide advanced options');
      } else {
          $('#adv-btn-more-text').text('Show advanced options');
      }

      if (desktopButtonText === 'Show advanced options') {
        $('#adv-btn-more-text-desktop').text('Hide advanced options');
    } else {
        $('#adv-btn-more-text-desktop').text('Show advanced options');
    }


      if (buttonMore.attr('aria-expanded') === 'false') {
          $('.map-options-container').css('display', 'block');
          buttonMore.attr('aria-expanded', 'true'); // Update aria-expanded attribute
      } else if (buttonMore.attr('aria-expanded') === 'true'){
          $('.map-options-container').css('display', 'none');
          buttonMore.attr('aria-expanded', 'false'); // Update aria-expanded attribute
      }

  });
});