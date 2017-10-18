var map;

// Settings for the map
// This is the center of Tennessee
var latlng = {
  lat: 35.5046,
  lng: -86.2331
};
var zoom = 8;
var mapTypeId = 'terrain';
var API_CALL_LIMIT = 60; // Apparently there is not...
var BASE_MAP_ZOOM = 8;
var BASE_MAP_LOCATIONS = 50;
var BASE_MAP_MARKER_WEIGHT = 7; // Markers dissapear if zoom < 7
var bounds;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: zoom,
    center: new google.maps.LatLng(latlng['lat'], latlng['lng']),
    mapTypeId: mapTypeId
  });

  // Get JSON Data from scraped web data on github for Tennessee.
  var requestDataURL = 'https://raw.githubusercontent.com/Rhendz/TWeather/master/data/use_this_data.json';
  var cityData = {};
  var weatherData = {};
  getJSONData(requestDataURL, function(data) {
    cityData = data;

    // Population based weather calling because of API_CALL_LIMIT
    cityDataLength = Object.keys(cityData).length;

    dataByPopulation = getDataByPopulation(data, BASE_MAP_LOCATIONS);

    for(i = 0; i < BASE_MAP_LOCATIONS; i++) {
      cityName = Object.keys(dataByPopulation)[i];
      coords = dataByPopulation[cityName].coords;
      var requestWeatherURL = 'http://api.openweathermap.org/data/2.5/weather' + '?lat=' + coords.lat + '&lon=' + coords.lng + '&APPID=f9a99216f25450f101c2194df8e56eb0';

      // Because getJSONData() is an async function,
      // it will not operate along with the for loop;
      // therefore, the cityName for each iteration
      // must be preserved by changing the scope.

      // getJSONData() will hold onto the cityName
      // even after the execution of re_scope()
      // has been completed. This is called closure.
      ! function re_scope(markerCityName) {
        getJSONData(requestWeatherURL, function(data) {
          weatherData = data;
          addMarker(weatherData, markerCityName, BASE_MAP_MARKER_WEIGHT);
        });
      }(cityName)
    }

    // If the map bounds change, add more cities based on zoom level.
    var bounds = map.getBounds();

    var currZoom = zoom;
    var currBounds = bounds;

    map.addListener('bounds_changed', function() {
      currZoom = map.getZoom();
      currBounds = map.getBounds();

      if((currZoom != zoom || currBounds != bounds) && currZoom > BASE_MAP_ZOOM) {
        // zoom = currZoom;
        // bounds = currBounds;
        // Use currZoom as the weight

        dataByBounds = getDataByBounds(cityData, currZoom, currBounds);

        for(i = 0; i < Object.keys(dataByBounds).length; i++) {
          cityName = Object.keys(dataByBounds)[i];
          coords = dataByBounds[cityName].coords;
          var requestWeatherURL = 'http://api.openweathermap.org/data/2.5/weather' + '?lat=' + coords.lat + '&lon=' + coords.lng + '&APPID=f9a99216f25450f101c2194df8e56eb0';

          // Because getJSONData() is an async function,
          // it will not operate along with the for loop;
          // therefore, the cityName for each iteration
          // must be preserved by changing the scope.

          // getJSONData() will hold onto the cityName
          // even after the execution of re_scope()
          // has been completed. This is called closure.
          ! function re_scope(markerCityName) {
            getJSONData(requestWeatherURL, function(data) {
              weatherData = data;
              addMarker(weatherData, markerCityName, currZoom);
            });
          }(cityName)
        }

        zoom = currZoom;
        bounds = currBounds;
      }
    });

  });
}

function getDataByPopulation(data, location_num) {
  var dataByPopulation = {};
  var tempPop = parseInt(data[Object.keys(data)[0]].population);

  // data key val of large city pop.
  var dataVal = 0;

  for (i = 0; i < location_num; i++) {
    for (j = 0; j < Object.keys(data).length; j++) {
      data_pop = parseInt(data[Object.keys(data)[j]].population);
      if (tempPop < data_pop) {
        tempPop = data_pop;
        dataVal = j;
      }
    }
    // Add population based city
    dataByPopulation[Object.keys(data)[dataVal]] = data[Object.keys(data)[dataVal]];

    tempPop = parseInt(data[Object.keys(data)[0]].population);
    delete data[Object.keys(data)[dataVal]];
  }
  return dataByPopulation;
}


// Gets all cities within boundaries, then
// returns cities based on weight factor and population.
// Zoom = 9 : 50% of cities in bounds
// Zoom = 10: 75% of cities in bounds
// Zoom = 11: 100% of cities in bounds
function getDataByBounds(data, zoom, bounds) {
  var dataByBounds = {};

  for(i = 0; i < Object.keys(data).length; i++) {
    var coords = data[Object.keys(data)[i]].coords;
    var lat = parseInt(coords.lat);
    var lng = parseInt(coords.lng);
    if((lat < bounds.f.f && lat > bounds.f.b) && (lng < bounds.b.f && lng > bounds.b.b)) {
      dataByBounds[Object.keys(data)[i]] = data[Object.keys(data)[i]];
    }
  }

  var boundCityDensity = Object.keys(dataByBounds).length;
  switch(zoom) {
    case 9:
      boundCityDensity *= 0.5;
      break;
    case 10:
      boundCityDensity *= 0.75;
      break;
    default:
      boundCityDensity *= 1;
  }


  if(Object.keys(dataByBounds).length != 0) {
    dataByBounds = getDataByPopulation(dataByBounds, Math.round(boundCityDensity));
  }

  return dataByBounds;
}

// Loads in JSON Data from OpenWeatherAPI and Github
function xhrSuccess() {
  // console.log("JSON File retrieval success!");
  this.callback(this.response);
}

function xhrError() {
  console.log("JSON File retrieval failed!");
  console.error(this.statusText);
}

function loadJSONFile(requestURL, fCallback) {
  var req = new XMLHttpRequest();
  req.callback = fCallback;
  req.onload = xhrSuccess;
  req.onerror = xhrError;
  req.responseType = 'json';
  req.open('get', requestURL, true);
  req.send(null);
}

function getJSONData(requestURL, fCallback) {
  loadJSONFile(requestURL, function(jsonObj) {
    fCallback(jsonObj);
  });
}

function addMarker(jsonObj, cityName, weight) {

  var latlng = {
    lat: jsonObj.coord.lat,
    lng: jsonObj.coord.lon
  };

  var image = {
    url: 'http://openweathermap.org/img/w/' + jsonObj.weather[0].icon + '.png',
    size: new google.maps.Size(125, 125),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(0, 32)
  };

  var marker = new google.maps.Marker({
    icon: image,
    position: latlng,
    title: cityName,
    map: map,
    markerZoomWeight: weight
  });

  marker.addListener('click', function() {
    map.setCenter(marker.getPosition());
    map.setZoom(11);
  });

  // Markers hide themselves based on zoom level
  map.addListener('zoom_changed', function() {
    if(marker.markerZoomWeight <= map.getZoom()) marker.setVisible(true);
    else marker.setVisible(false);
  });
  // console.log("Marker for " + cityName + " has been added!");
}
