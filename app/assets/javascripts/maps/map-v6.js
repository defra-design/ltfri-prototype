
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
  zoom: 16,
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
    mapCenter = [0.4040511246045124,52.24377500667143]
  } else {
    mapCenter = center.split(',');
  }

  return mapCenter

};

//52.24377500667143, 0.4040511246045124
// 3 Rockingham Villas, Church Lane, 

//map colours
const lightestBlue = '201, 248, 255,255'
const lightBlue = '196,225,255,255'
const midBlue = '154,160,222,255'
const darkBlue = '85,92,157,245'

const layerColors = [darkBlue, midBlue, lightBlue, lightestBlue] 




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
  src: '/public/images/pin.png'
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

var marker = new Feature({
  geometry: new Point([0.4040511246045124,52.24377500667143]),
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
     map.removeLayer(markerLayer),
     map.removeLayer(radiusLayer)/* ,
     map.removeLayer(addressLayer) */;
   } 
   else {
     map.addLayer(radiusLayer),
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
  map.addLayer(markerLayer)/* ,
  map.addLayer(addressLayer) */;
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

  if (pathname == '/version_7/map-v6/surface-water'){
    map.addLayer(surfaceWater(3))
    map.addLayer(surfaceWater(2))
    map.addLayer(surfaceWater(1))
    markerAddressRadius();
  } else if (pathname == '/version_7/map-v6/surface-water-depth'){
    map.addLayer(surfaceWaterDepth(x)),
    markerAddressRadius();
  } else if (pathname == '/version_7/map-v6/surface-water-velocity'){
    map.addLayer(surfaceWaterSpeed(x)),
    map.addLayer(surfaceWaterDirection(x)),
    markerAddressRadius();
  } else if (pathname == '/version_7/map-v6/rivers-sea'){
    map.addLayer(riverSea(4)),
    map.addLayer(riverSea(3)),
    map.addLayer(riverSea(2)),
    map.addLayer(riverSea(1)),
    markerAddress();
  } else if (pathname == '/version_7/map-v6/reservoirs'){
    map.addLayer(reservoirRiver('DryDay')),
    map.addLayer(reservoirRiver('WetDay')),
    markerAddress();
  }

  //remove marker if not checked
  if(checkBox.checked == false) {
    removeMarkerAddressRadius()
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
  map.addLayer(surfaceWater(3)),
  map.addLayer(surfaceWater(2)),
  map.addLayer(surfaceWater(1)),
  markerAddressRadius()
}
  else if (this.value == '5' ) {

     //suraface water extent medium risk
    map.addLayer(surfaceWater(2)),
    markerAddressRadius()
  }
  else if (this.value == '6' ) {

    //suraface water extent low risk
    map.addLayer(surfaceWater(3)),
    markerAddressRadius()
  } //add back in the layer based on the radio button value
  else if (this.value == '10') {

  //suraface water depth high risk
  map.addLayer(surfaceWaterDepth(1)),
  markerAddressRadius()
}
else if (this.value == '11') {

  //suraface water depth medium risk
  map.addLayer(surfaceWaterDepth(2)),
  markerAddressRadius()
} else if (this.value == '12') {

  //suraface water depth low risk
  map.addLayer(surfaceWaterDepth(3)),
  markerAddressRadius()
}  else   if (this.value == '13') {
  //suraface water speed high risk
  map.addLayer(surfaceWaterSpeed(1)),
  map.addLayer(surfaceWaterDirection(1)),
  markerAddressRadius()
}
else if (this.value == '14') {
  //suraface water speed medium risk
  map.addLayer(surfaceWaterSpeed(2)),
  map.addLayer(surfaceWaterDirection(2)),
  markerAddressRadius()

} else if (this.value == '15') {
  //suraface water speed low risk
  map.addLayer(surfaceWaterSpeed(3)),
  map.addLayer(surfaceWaterDirection(3)),
  markerAddressRadius()
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
  markerAddressRadius();
} 
else if (this.value == '30') {
  // Base map only selection for others
  removeLayers();
  markerAddress();
}
  //remove marker if not checked
  if(checkBox.checked == false) {
    removeMarkerAddressRadius()
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



      if (this.value == '1') {

        //surface water
      window.location.href = "/version_7/map-v6/surface-water?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center
    }
    else if (this.value == '2') {

      // rivers and sea
      window.location.href = "/version_7/map-v6/rivers-sea?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center
    } else if (this.value == '3') {
    
      //reservoirs
      window.location.href = "/version_7/map-v6/reservoirs?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center
      
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

  if (this.value == '7') {

  //Surface water extent
  window.location.href = "/version_7/map-v6/surface-water?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center

}
else if (this.value == '8') {

  //Surface water depth
  window.location.href = "/version_7/map-v6/surface-water-depth?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center

} else if (this.value == '9') {

  //Surface water speed
  window.location.href = "/version_7/map-v6/surface-water-velocity?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center
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
    $('#scenarios-controls').css('display', 'none');
    $('#open-key').css('display', 'none');
    $('#reset-key').css('display', 'none');
    $('#att-key').css('display', 'none');
    $('#zoomIn').css('display', 'none');
    $('#zoomOut').css('display', 'none');
    $('#advanced-map-button').css('display', 'none');
    $('#advanced-map-button-velocity').css('display', 'none');
  }
});

// close button on mobile map
$('#close-key').on('click', function() {
  // Hide the map key container when the close button is clicked
  $('#defra-map-key__container').css('display', 'none');
  // Show the other elements when the close button is clicked
  $('#scenarios-controls').css('display', 'block');
  $('#open-key').css('display', 'block');
  $('#reset-key').css('display', 'block');
  $('#att-key').css('display', 'block');
  $('#advanced-map-button').css('display', 'block');
  $('#advanced-map-button-velocity').css('display', 'block');
});

$(document).on('click', function(e) {
  // Check if the clicked element is not a child of #defra-map-key__container, open-key, reset-key, or att-key
  if (
    !$(e.target).closest('#defra-map-key__container').length &&
    !$(e.target).closest('#open-key').length &&
    !$(e.target).closest('#reset-key').length &&
    !$(e.target).closest('#att-key').length &&
    !$(e.target).closest('#info').length &&
    ($(window).width() <= 769)
  ) {
    $('#defra-map-key__container').css('display', 'none');
    // Show the other elements when clicking outside of #defra-map-key__container
    $('#scenarios-controls').css('display', 'block');
    $('#open-key').css('display', 'block');
    $('#reset-key').css('display', 'block');
    $('#advanced-map-button').css('display', 'block');
    $('#advanced-map-button-velocity').css('display', 'block');
    $('#att-key').css('display', 'block');
    $('#att-key').css('margin-bottom', '0');
  }
});

// open key

$('#open-key').on('click', function() {
  // Show the map key container when the open button is clicked
  $('#defra-map-key__container').css('display', 'block');
  // Hide the other elements when the open button is clicked
  $('#scenarios-controls').css('display', 'none');
  $('#open-key').css('display', 'none');
  $('#reset-key').css('display', 'none');
  $('#att-key').css('display', 'none');
  $('#info').css('display', 'none');
  $('#advanced-map-button').css('display', 'none');
  $('#advanced-map-button-velocity').css('display', 'none');
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
      $('#att-key').css('margin-bottom', '70px');
    }
  } else if ($('#info').css('display') === 'block') {
    // If #info is displayed, hide it and show scenarios-controls
    $('#info').css('display', 'none');
    $('#scenarios-controls').css('display', 'block');
    if ($(window).width() <= 641) {
    // Remove the margin-bottom from .defra-map-attribution
    $('#att-key').css('margin-bottom', '0');
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

if (window.location.pathname.includes("/version_7/map-v6/surface-water-depth") || window.location.pathname.includes("/version_7/map-v6/surface-water-velocity")) {
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

// load less options for each separate map, advanced options can toggle features back on
$(document).ready(function () {
  // Get the current page path
  var currentPath = window.location.pathname;

  // Select the necessary elements using jQuery
  var techOptionsCheckbox = $('#tech-option');
  var radioInputs = $('.govuk-radios__input[name="risk-type"]');
  var swVelocityInput = $('#sw-velocity');
  var mapButton = $('#advanced-map-button');

  // Load the stored checkbox state on page load
  var storedCheckboxState = localStorage.getItem('techOptionsCheckboxState');
  if (storedCheckboxState === 'checked') {
    techOptionsCheckbox.prop('checked', true);
  }

  // Function to show or hide content based on checkbox state
  function toggleContent(isChecked) {
    var formGroup = null;
    var swVelocityFormGroup = null;

    // Determine which form groups to target based on the current page path
    if (currentPath === '/version_7/map-v6/surface-water' || currentPath === '/version_7/map-v6/surface-water-depth') {
      formGroup = radioInputs.filter('[value="3"], [value="2"]').closest('.govuk-form-group');
      swVelocityFormGroup = swVelocityInput.closest('.govuk-radios__item');
    } else if (currentPath === '/version_7/map-v6/rivers-sea') {
      formGroup = radioInputs.filter('[value="3"]').closest('.govuk-form-group');
      swVelocityFormGroup = swVelocityInput.closest('.govuk-form-group');
    } else if (currentPath === '/version_7/map-v6/reservoirs') {
      formGroup = radioInputs.filter('[value="2"]').closest('.govuk-form-group');
      swVelocityFormGroup = swVelocityInput.closest('.govuk-form-group');
    }

    // Show or hide content based on the checkbox state
    if (isChecked) {
      formGroup.show();
      swVelocityFormGroup.show();
      } 
     else {
      formGroup.hide();
      swVelocityFormGroup.hide();
    }
  }

  // Check the checkbox state on page load and show/hide content accordingly
  toggleContent(techOptionsCheckbox.prop('checked'));

  // Handle checkbox change event
  techOptionsCheckbox.on('change', function () {
    var isChecked = $(this).prop('checked');

    // Store the checkbox state when changed
    if (isChecked) {
      localStorage.setItem('techOptionsCheckboxState', 'checked');
    } else {
      localStorage.removeItem('techOptionsCheckboxState');
    }

    // Show/hide content based on checkbox state
    toggleContent(isChecked);
  });

  // Function to update button text and SVG based on checkbox state
function updateButtonState() {
  // Get the SVG element
  const svgElement = $('#map-button-svg');
  if (techOptionsCheckbox.prop('checked')) {
      // Update the SVG path for "Go to simple map"
      svgElement.find('path').attr('d', 'M565.6 36.2C572.1 40.7 576 48.1 576 56V392c0 10-6.2 18.9-15.5 22.4l-168 64c-5.2 2-10.9 2.1-16.1 .3L192.5 417.5l-160 61c-7.4 2.8-15.7 1.8-22.2-2.7S0 463.9 0 456V120c0-10 6.1-18.9 15.5-22.4l168-64c5.2-2 10.9-2.1 16.1-.3L383.5 94.5l160-61c7.4-2.8 15.7-1.8 22.2 2.7zM48 136.5V421.2l120-45.7V90.8L48 136.5zM360 422.7V137.3l-144-48V374.7l144 48zm48-1.5l120-45.7V90.8L408 136.5V421.2z'); 
      $('#map-button-text').text('Go to simple map');
  } else {
      // Update the SVG path for "Go to advanced map"
      svgElement.find('path').attr('d', 'M408 120c0 54.6-73.1 151.9-105.2 192c-7.7 9.6-22 9.6-29.6 0C241.1 271.9 168 174.6 168 120C168 53.7 221.7 0 288 0s120 53.7 120 120zm8 80.4c3.5-6.9 6.7-13.8 9.6-20.6c.5-1.2 1-2.5 1.5-3.7l116-46.4C558.9 123.4 576 135 576 152V422.8c0 9.8-6 18.6-15.1 22.3L416 503V200.4zM137.6 138.3c2.4 14.1 7.2 28.3 12.8 41.5c2.9 6.8 6.1 13.7 9.6 20.6V451.8L32.9 502.7C17.1 509 0 497.4 0 480.4V209.6c0-9.8 6-18.6 15.1-22.3l122.6-49zM327.8 332c13.9-17.4 35.7-45.7 56.2-77V504.3L192 449.4V255c20.5 31.3 42.3 59.6 56.2 77c20.5 25.6 59.1 25.6 79.6 0zM288 152a40 40 0 1 0 0-80 40 40 0 1 0 0 80z'); 
      $('#map-button-text').text('Go to advanced map');
  }
}

// Check the initial state of the checkbox on page load and update the button accordingly
$(document).ready(function () {
  updateButtonState();
});

// Attach the click event handler to the button
mapButton.on('click', function () {
  // Toggle the checkbox state
  techOptionsCheckbox.prop('checked', !techOptionsCheckbox.prop('checked'));

// add a way to open key here to show use that the options have changed when in mobile mode

  // Update the button text and SVG based on the checkbox state
  updateButtonState();

  // Trigger the checkbox change event to update content visibility
  techOptionsCheckbox.trigger('change');
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
      if (currentPath === '/version_7/map-v6/surface-water' || currentPath === '/version_7/map-v6/surface-water-depth' || currentPath === '/version_7/map-v6/surface-water-velocity') {
      removeLayers();
      markerAddressRadius();
    }
    else if (currentPath === '/version_7/map-v6/rivers-sea' || currentPath === '/version_7/map-v6/reservoirs')
      removeLayers();
      markerAddress();
    }
    // end of if that removes layers

    // if checkbox checked again, return correct layers
    else if (currentPath === '/version_7/map-v6/surface-water') {
    removeLayers();
    map.addLayer(surfaceWater(3)),
    map.addLayer(surfaceWater(2)),
    map.addLayer(surfaceWater(1)),
    markerAddressRadius()
    }
    else if (currentPath === '/version_7/map-v6/rivers-sea') {
      removeLayers();
      map.addLayer(riverSea(4)),
      map.addLayer(riverSea(3)),
      map.addLayer(riverSea(2)),
      map.addLayer(riverSea(1)),
      markerAddress();
      }
      else if (currentPath === '/version_7/map-v6/reservoirs') {
        removeLayers();
        map.addLayer(reservoirRiver('DryDay')),
        map.addLayer(reservoirRiver('WetDay')),
        markerAddress();
        }
        else if (currentPath === '/version_7/map-v6/surface-water-depth') {
          //surface water depth high risk
           if (scenarioValue == '10') {
            removeLayers();
            map.addLayer(surfaceWaterDepth(1));
            markerAddressRadius();
          }
          //surface water depth medium risk
          else if (scenarioValue == '11') {
            removeLayers();
            map.addLayer(surfaceWaterDepth(2));
            markerAddressRadius();
            //surface water depth low risk
          } else if (scenarioValue == '12') {
            removeLayers();
            map.addLayer(surfaceWaterDepth(3));
            markerAddressRadius();
          } 
          }
          else if (currentPath === '/version_7/map-v6/surface-water-velocity') {
            //surface water velocity high risk
             if (scenarioValue == '13') {
              removeLayers();
              map.addLayer(surfaceWaterSpeed(1));
              markerAddressRadius();
            }
            //surface water velocity medium risk
            else if (scenarioValue == '14') {
              removeLayers();
              map.addLayer(surfaceWaterSpeed(2));
              markerAddressRadius();
              //surface water velocity low risk
            } else if (scenarioValue == '15') {
              removeLayers();
              map.addLayer(surfaceWaterSpeed(3));
              markerAddressRadius();
            } 
            }
  }

  // Handle checkbox change event by calling the function
  displayLayersCheckbox.on('change', handleDisplayLayersCheckbox);
});

// exit map button
$(document).ready(function () {
  var exitButton = $('#exit-map');

  exitButton.on('click', function () {
    // Navigate to another page
    window.location.href = 'results-hx7.html';
  });
});


$(document).ready(function () {
  var velocityExit = $('#advanced-map-button-velocity');
  velocityExit.on('click', function () {

    // Navigate to another page
    window.location.href = 'surface-water.html';
  });
});

// Function to jump to surface water extent if user presses simple map on velocity
function hideFormGroupsBasedOnPreviousURL() {
  // Check if the current page is '/version_7/map-v6/surface-water'
  if (window.location.pathname === '/version_7/map-v6/surface-water') {
    var previousURL = localStorage.getItem('previousURL');
    var radioInputs = $('.govuk-radios__input[name="risk-type"]');
    var swVelocityInput = $('#sw-velocity');
    var techOptionsCheckbox = $('#tech-option');
    
    // Check if the checkbox was previously unchecked
    var storedCheckboxState = localStorage.getItem('techOptionsCheckboxState');
    
    if (previousURL === '/version_7/map-v6/surface-water-velocity') {
      // Uncheck the tech-options checkbox
      techOptionsCheckbox.prop('checked', false);

      // Store the checkbox state as unchecked
      localStorage.setItem('techOptionsCheckboxState', 'unchecked');

      // Hide the form groups for this specific URL
      var formGroup = radioInputs.closest('.govuk-form-group');
      var swVelocityFormGroup = swVelocityInput.closest('.govuk-radios__item');
      formGroup.hide();
      swVelocityFormGroup.hide();
    } else {
      // Check the checkbox if it was previously unchecked
      if (storedCheckboxState === 'unchecked') {
        techOptionsCheckbox.prop('checked', false);
      }
    }
  }
}

// Check the previous URL on page load and hide form groups if needed
$(document).ready(function () {
  hideFormGroupsBasedOnPreviousURL();
});

// Update the previous URL in localStorage when the page changes
$(window).on('beforeunload', function () {
  localStorage.setItem('previousURL', window.location.pathname);
});

