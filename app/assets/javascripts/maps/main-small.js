
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

// 64 West Park, Selby YO8 4JN
// 53.778665757350986, -1.0903354469749404


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
    mapCenter = [ -1.0903354469749404, 53.778665757350986 ]
  } else {
    mapCenter = center.split(',');
  }

  return mapCenter

};



//map colours
const lightBlue = '219,222,255,235'
const midBlue = '154,160,222,235'
const darkBlue = '85,92,157,235'
const layerColors = [lightBlue, midBlue, darkBlue] 




//grab api key
const apiKey = process.env.OS_API_KEY

//base map
const base = new TileLayer({
name: 'base',
 source: new XYZ({
   url: `https://api.os.uk/maps/raster/v1/zxy/Road_27700/{z}/{x}/{y}.png?key=${apiKey}`,
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
 function surfaceWater (liklihood) {
  const layerIds = [2, 4, 6]
  return new TileLayer({
    ref: `surfaceWater${liklihood}`,
    name: `surfaceWater${liklihood}`,
    className: 'defra-map-raster-canvas',
    layerCodes: `se${liklihood},ae${liklihood}`,
    source: new TileArcGISRest({
      url: 'https://environment.data.gov.uk/arcgis/rest/services/EA/RiskOfFloodingFromSurfaceWaterBasic/MapServer',
      projection: 'EPSG:27700',
      params: {
        'TRANSPARENT': true,
        'FORMAT': 'GIF',
        'dynamicLayers' : `[{"id":${layerIds[liklihood - 1]},"source":{"type":"mapLayer","mapLayerId":${layerIds[liklihood - 1]}},"drawingInfo":{"renderer":{"type":"simple","symbol":{"color":[${darkBlue}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}}}}]`
      }
    }),
    minZoom: 8,
    zIndex: 0
  })
}


//surface water depth - not inclueded on map at the mo
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
        'dynamicLayers': `[{"id":0,"source":{"type":"mapLayer","mapLayerId":0},"drawingInfo":{"renderer":{"type":"uniqueValue","field1":"prob_4band","uniqueValueInfos":[{"value":"High","symbol":{"color":[${darkBlue}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}},{"value":"Medium","symbol":{"color":[${liklihood > 1 ? darkBlue : '0,0,0,0'}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}},{"value":"Low","symbol":{"color":[${liklihood > 2 ? darkBlue : '0,0,0,0'}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}},{"value":"Very Low","symbol":{"color":[${liklihood > 3 ? darkBlue : '0,0,0,0'}],"outline":{"width":0,"type":"esriSLS"},"type":"esriSFS","style":"esriSFSSolid"}}]}}}]`
      }
    }),
    minZoom: 8,
    zIndex: 0
  })
}

// radius style
var rStyle = new Style ({
  image: new Circle ({
  radius: 10,
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

// Marker style with img src

 var mStyle = new Style({ 
  image: new Icon({ 
  anchor: [0.5, 40],
  anchorXUnits: 'fraction',
  anchorYUnits: 'pixels',
  src: '/public/images/map-marker-40px.png'
}),
zIndex: 2
}); 

/* var wStyle = new Style({ 
  image: new Icon({ 
  anchor: [0.5, 110],
  anchorXUnits: 'fraction',
  anchorYUnits: 'pixels',
  src: '/public/images/window-address.png'
})
});  */

// window (will include image)
 
/*  var address = new Feature({
  geometry: new Point(setCenter()),
  type: 'test',
  name: 'something'
});    */
 
// marker (will include image)

var marker = new Feature({
  geometry: new Point([-1.0903354469749404, 53.778665757350986]),
  type: 'test',
  name: 'something'
});

// radius 

var radius = new Feature({
  geometry: new Point([-1.0903354469749404, 53.778665757350986]),
  type: 'test',
  name: 'something'
});

// split vectorLayer into radius/marker/window as they will have different styling
 
/*  var addressLayer = new VectorLayer({
  minZoom: 10,
  maxZoom: 16,
  source: new VectorSource({
    features: [address]
  })
});   */

var radiusLayer = new VectorLayer({
  minZoom: 14,
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
/* address.setStyle(wStyle); */






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
          map.removeLayer(markerLayer);
/*           map.removeLayer(addressLayer); */
        } 
        else {
          map.addLayer(markerLayer);
         /*  map.addLayer(addressLayer); */
        }
        });







 // Checkbox toggle for surface water
 var checkBox = document.getElementById("toggle");
 $('input[name="map-toggle"]').change(function(){
   if (checkBox.checked == false){
     map.removeLayer(markerLayer),
     map.removeLayer(radiusLayer);
    /*  map.removeLayer(addressLayer); */
   } 
   else {
     map.addLayer(radiusLayer),
     map.addLayer(markerLayer);/* ,
     map.addLayer(addressLayer); */
   }
   });


//add marker and address
function markerAddress() {
  map.addLayer(markerLayer);/* ,
  map.addLayer(addressLayer); */
};

//remove marker, address and radius
function removemarkerAddress() {
  map.removeLayer(markerLayer);/* ,
  map.removeLayer(addressLayer); */
};

//add marker, address and radius
function markerAddressRadius() {
  map.addLayer(radiusLayer),
  map.addLayer(markerLayer);/* ,
  map.addLayer(addressLayer); */
};

//remove marker, address and radius
function removeMarkerAddressRadius() {
  map.removeLayer(radiusLayer),
  map.removeLayer(markerLayer);/* ,
  map.removeLayer(addressLayer); */
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
  let x = 3
  if (scenario == '4' || scenario == '10' || scenario == '13' || scenario == '17' ) {
  x=1 } 
  else if (scenario == '5' || scenario == '11' || scenario == '14' || scenario == '18' ) {
   x=2 
  }


  if (pathname == '/map-small/surface-water'){
    map.addLayer(surfaceWater(x))
    markerAddressRadius();
  } else if (pathname == '/map-small/surface-water-depth'){
    map.addLayer(surfaceWaterDepth(x)),
    markerAddressRadius();
  } else if (pathname == '/map-small/surface-water-velocity'){
    map.addLayer(surfaceWaterSpeed(x)),
    markerAddressRadius();
  } else if (pathname == '/map-small/rivers-sea'){
    map.addLayer(riverSea(x)),
    markerAddress();
  } else if (pathname == '/map-small/reservoirs'){
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

//add back in the layer based on the radio button value
    if (this.value == '4' ){

    //suraface water extent high risk
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
  markerAddressRadius()
}
else if (this.value == '14') {
  //suraface water speed medium risk
  map.addLayer(surfaceWaterSpeed(2)),
  markerAddressRadius()

} else if (this.value == '15') {
  //suraface water speed low risk
  map.addLayer(surfaceWaterSpeed(3)),
  markerAddressRadius()
} 
else if (this.value == '17') {
  //River and sea high risk
  map.addLayer(riverSea(1)),
  markerAddress();
}
else if (this.value == '18') {
  //River and sea medium risk
  map.addLayer(riverSea(2)),
  markerAddress();
} else if (this.value == '19') {
  //River and sea low risk
  map.addLayer(riverSea(3)),
  markerAddress();
} else if (this.value == '20') {
  //River and sea very low risk
  map.addLayer(riverSea(4)),
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
      window.location.href = "/map-small/surface-water?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center
    }
    else if (this.value == '2') {

      // rivers and sea
      window.location.href = "/map-small/rivers-sea?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center
    } else if (this.value == '3') {
    
      //reservoirs
      window.location.href = "/map-small/reservoirs?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center
      
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
  window.location.href = "/map-small/surface-water?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center

}
else if (this.value == '8') {

  //Surface water depth
  window.location.href = "/map-small/surface-water-depth?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center

} else if (this.value == '9') {

  //Surface water speed
  window.location.href = "/map-small/surface-water-velocity?marker="+setCheckbox+"&scenario="+setRadio+"&center="+center
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

// scroll position preserve
document.addEventListener("DOMContentLoaded", function(event) { 
  var scrollpos = localStorage.getItem('scrollpos');
  if (scrollpos) window.scrollTo(0, scrollpos);
});

window.onbeforeunload = function(e) {
  localStorage.setItem('scrollpos', window.scrollY);
};


// full screen 
var elem = document.getElementById("maphigh");

function openFullscreen() {
 if (elem.requestFullscreen) {
   elem.requestFullscreen();
 } else if (elem.webkitRequestFullscreen) { /* Safari */
   elem.webkitRequestFullscreen();
 } else if (elem.msRequestFullscreen) { /* IE11 */
   elem.msRequestFullscreen();
 }
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}

$('.defra-map__exit').on('click', function() {
 if (document.fullscreenElement) {
  closeFullscreen();
 }
 else {
  openFullscreen();
 }
});  