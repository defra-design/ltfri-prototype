/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./app/assets/javascripts/maps/nafra2/map-v19.js":
/*!*******************************************************!*\
  !*** ./app/assets/javascripts/maps/nafra2/map-v19.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\nObject(function webpackMissingModule() { var e = new Error(\"Cannot find module '../../src/flood-map.js'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }());\n/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../request.js */ \"./app/assets/javascripts/maps/request.js\");\n\n\n\nconst fm = new Object(function webpackMissingModule() { var e = new Error(\"Cannot find module '../../src/flood-map.js'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }())('map', {\n    behaviour: 'inline',\n    framework: 'esri',\n    place: 'Ambleside',\n    zoom: 16,\n    minZoom: 7,\n    maxZoom: 20,\n    center: [324973, 536891],\n    // extent: [338388, 554644, 340881, 557137],\n    maxExtent: [167161, 13123, 670003, 663805],\n    height: '100%',\n    hasGeoLocation: true,\n    symbols,\n    transformSearchRequest: _request_js__WEBPACK_IMPORTED_MODULE_1__.getRequest,\n    esriConfigCallback: _request_js__WEBPACK_IMPORTED_MODULE_1__.setEsriConfig,\n    // tokenCallback: getEsriToken,\n    // interceptorsCallback: getInterceptors,\n    // hasAutoMode: true,\n    // deviceTestCallback: () => true,\n    // geocodeProvider: 'esri-world-geocoder',\n    backgroundColor: 'default: #f5f5f0, dark: #060606',\n    styles: [{\n      name: 'default',\n      url: ({\"OS_API_KEY\":\"4flNisK69QG6w6NGkDZ4CZz0CObcUA5h\"}).OS_VTAPI_DEFAULT_URL,\n      attribution\n    }, {\n      name: 'dark',\n      url: ({\"OS_API_KEY\":\"4flNisK69QG6w6NGkDZ4CZz0CObcUA5h\"}).OS_VTAPI_DARK_URL,\n      attribution\n    }],\n    search: {\n      country: 'england',\n      isAutocomplete: true,\n      errorText: 'No results available. Enter a town or postcode'\n    }\n  })\n\n//# sourceURL=webpack://cyltfr-prototype/./app/assets/javascripts/maps/nafra2/map-v19.js?");

/***/ }),

/***/ "./app/assets/javascripts/maps/request.js":
/*!************************************************!*\
  !*** ./app/assets/javascripts/maps/request.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getRequest: () => (/* binding */ getRequest),\n/* harmony export */   setEsriConfig: () => (/* binding */ setEsriConfig)\n/* harmony export */ });\nconst osAuth = {}\nconst esriAuth = {}\n\n// All other requests can be asyncronous and return a request object itself\nconst getRequest = async (url) => {\n  let options = {}\n\n  // OS Open Names\n  if (url.startsWith('https://api.os.uk')) {\n    const token = (await getOsToken()).token\n    options = {headers: { Authorization: 'Bearer ' + token }}\n  }\n\n  // ESRI World Geocoder\n  if (url.startsWith('https://geocode-api.arcgis.com')) {\n    const token = (await getEsriToken()).token\n    url = `${url}&token=${token}`\n  }\n\n  return new Request(url, options)\n}\n\nconst getOsToken = async () => {\n  // Check token is valid\n  const isExpired = !Object.keys(osAuth).length || Date.now() >= osAuth?.expiresAt\n\n  if (isExpired) {\n    try {\n      const response = await fetch('/os-token', {\n        method: 'GET',\n        headers: {\n          Accept: 'application/json',\n          'Content-Type': 'application/json'\n        }\n      })\n      const json = JSON.parse(await response.json()) // Requires JSON parse - Webpack issue possibly?\n      osAuth.token = json.access_token\n      osAuth.expiresAt = Date.now() + ((json.expires_in - 30) * 1000)\n    } catch (err) {\n      console.log('Error getting OS access token: ', err)\n    }\n  }\n\n  return osAuth\n}\n\nconst setEsriConfig = async (esriConfig) => {\n  const auth = await getEsriToken()\n  esriConfig.apiKey = auth.token\n  const interceptors = getInterceptors()\n  interceptors.forEach(interceptor => esriConfig.request.interceptors.push(interceptor))\n}\n\n// ESRI return an array of interceptor objects\nconst getInterceptors = () => {\n  return [{\n    urls: 'https://api.os.uk/maps/vector/v1/vts',\n    before: async params => {\n      const token = (await getOsToken()).token\n      params.requestOptions.headers = {\n        Authorization: 'Bearer ' + token\n      }\n    }\n  }]\n}\n\nconst getEsriToken = async () => {\n  // *ESRI manages this somehow?\n  const hasToken = esriAuth.token\n\n  if (!hasToken) {\n    try {\n      const response = await fetch('/esri-token')\n      const json = await response.json()\n      esriAuth.token = json.token\n    } catch (err) {\n      console.log('Error getting ESRI access token: ', err)\n    }\n  }\n\n  return esriAuth\n}\n\n//# sourceURL=webpack://cyltfr-prototype/./app/assets/javascripts/maps/request.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./app/assets/javascripts/maps/nafra2/map-v19.js");
/******/ 	
/******/ })()
;