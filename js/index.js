var map;

// Utility features for the map
// This is the center of Tennessee
var latlng = {lat: 35.5046, lng: -86.2331};
var zoom = 7;
var mapTypeId = 'hybrid';

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: zoom,
    center: new google.maps.LatLng(latlng['lat'], latlng['lng']),
    mapTypeId: mapTypeId
  });

  // Get JSON Data from scraped web data on github for Tennessee.
  var requestDataURL = 'https://raw.githubusercontent.com/Rhendz/TWeather/master/data/use_this_data.json';
  var cityData = {};
  getJSONData(requestDataURL, function(data) { cityData = data });

  // Get JSON Data from OpenWeatherAPI for Tennessee.
  var requestWeatherURL = 'http://api.openweathermap.org/data/2.5/box/city?bbox=-90.208740,35.003003,-81.661377,36.641978,10&APPID=f9a99216f25450f101c2194df8e56eb0';
  var weatherData = {};
  getJSONData(requestWeatherURL, function(data) { weatherData = data });

  // addMarkers()

}

// Loads in JSON Data from OpenWeatherAPI and Github
function xhrSuccess() {
  console.log("JSON File retrieval success!");
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

function addMarkers(jsonObj) {
  // Adds a city name for each city position
  for (var i = 0; i < jsonObj.cities.length; i++) {
    var cityName = jsonObj.cities[i].cityName;

    var coords = jsonObj.cities[i].coords;
    var latlng = new google.maps.LatLng(coords.lat, coords.lng);

    var marker = new google.maps.Marker({
      position: latlng,
      title: cityName,
      map: map
    });
    console.log("Marker for " + cityName + " has been added!");
  }
}
