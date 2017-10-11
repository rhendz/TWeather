var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: new google.maps.LatLng(35.5046, -86.2331),
    mapTypeId: 'hybrid'
  });

  // // Get JSON Data from OpenWeatherAPI for Tennessee.
  // var requestURL = 'http://api.openweathermap.org/data/2.5/box/city?bbox=-90.208740,35.003003,-81.661377,36.641978,10&APPID=f9a99216f25450f101c2194df8e56eb0';
  // var request = new XMLHttpRequest();
  // request.open('GET', requestURL);
  //
  // request.responseType = 'json';
  // request.send();
  //
  // request.onload = function() {
  // 	var weather = request.response;
  //   addMarkers(weather);
  // }

  // Get JSON Data from OpenWeatherAPI for Tennessee.
  var requestURL = 'https://raw.githubusercontent.com/Rhendz/TWeather/master/dev/data.json';
  var request = new XMLHttpRequest();
  request.open('GET', requestURL);

  request.responseType = 'json';
  request.send();

  request.onload = function() {
  	var json = request.response;
    addMarkers(json);
  }
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
