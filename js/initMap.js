var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: new google.maps.LatLng(35.5046, -86.2331),
    mapTypeId: 'hybrid'
  });

  // Get JSON Data from OpenWeatherAPI for Tennessee.
  var requestURL = 'http://api.openweathermap.org/data/2.5/box/city?bbox=-90.208740,35.003003,-81.661377,36.641978,10&APPID=f9a99216f25450f101c2194df8e56eb0';
  var request = new XMLHttpRequest();
  request.open('GET', requestURL);

  request.responseType = 'json';
  request.send();

  var marker = new google.maps.Marker({
    position: {lat: 35.845619, lng: -86.390266},
    title: "Murfreesboro",
    map: map
  });

  request.onload = function() {
  	var weather = request.response;
    addMarkers(weather);
  }
}

function addMarkers(jsonObj) {
  var weather = jsonObj;
  // Adds a city name for each city position
  for (var i = 0; i < weather.list.length; i++) {
    var coord = weather.list[i].coord;
    var cityName = weather.list[i].name;
    var marker = new google.maps.Marker({
      position: {lat: coord.Lat, lng: coord.Lon},
      title: cityName,
      map: map
    });
    console.log("Marker for " + cityName + " has been added!");
  }
}
