import { FloodMap } from '../../src/flood-map.js'
import { setEsriConfig, getRequest } from '../request.js'

const fm = new FloodMap('map', {
    behaviour: 'inline',
    framework: 'esri',
    place: 'Ambleside',
    zoom: 16,
    minZoom: 7,
    maxZoom: 20,
    center: [324973, 536891],
    // extent: [338388, 554644, 340881, 557137],
    maxExtent: [167161, 13123, 670003, 663805],
    height: '100%',
    hasGeoLocation: true,
    symbols,
    transformSearchRequest: getRequest,
    esriConfigCallback: setEsriConfig,
    // tokenCallback: getEsriToken,
    // interceptorsCallback: getInterceptors,
    // hasAutoMode: true,
    // deviceTestCallback: () => true,
    // geocodeProvider: 'esri-world-geocoder',
    backgroundColor: 'default: #f5f5f0, dark: #060606',
    styles: [{
      name: 'default',
      url: process.env.OS_VTAPI_DEFAULT_URL,
      attribution
    }, {
      name: 'dark',
      url: process.env.OS_VTAPI_DARK_URL,
      attribution
    }],
    search: {
      country: 'england',
      isAutocomplete: true,
      errorText: 'No results available. Enter a town or postcode'
    }
  })