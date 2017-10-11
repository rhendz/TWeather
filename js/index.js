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
  var data = $.getJSON("/dev/data.json");
  // addMarkers(json);

  // data = {
  //   "0" : {
  //     "cityName" : "Rockford, Tennessee",
  //     "coords" : {
  //       "lng": "-83.9422222",
  //       "lat": "35.8391667"
  //     }
  //   },
  //   "1" : {
  //     "cityName" : "Apples, Tennessee",
  //     "coords" : {
  //       "lng": "-83.9422222",
  //       "lat": "35.8391667"
  //     }
  //   }
  // }
  console.log(data[0].cityName);
  console.log(data[1].cityName);
}

// function addMarkers(jsonObj) {
//   var weather = jsonObj;
//   // Adds a city name for each city position
//   for (var i = 0; i < weather.length; i++) {
//     var cityName = weather[i];
//     var marker = new google.maps.Marker({
//       position: {lat: cityName.lat, lng: cityName.lng},
//       title: cityName,
//       map: map
//     });
//     console.log("Marker for " + cityName + " has been added!");
//   }
// }
