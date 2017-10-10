// Responsible for receiving and updating the cities in Tennessee

// Scrapes wikipedia for geographic data for municipalities within
// TN.

var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.get('/scrape', function(req, res) {

  // List of cities in TN.
  url = 'https://en.wikipedia.org/wiki/List_of_municipalities_in_Tennessee';

  request(url, function(error, response, html) {
    if(!error) {
      
      var $ = cheerio.load(html);

      var city;
      var json = {city : ""};

      $('.tbody').filter(function() {
        var data = $(this);
        city = data.children().first().text();

        json.city = city;
      })

    }
  }

  fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err) {
    console.log('File successfully written!');
  })

})

app.listen('8081');

exports = module.exports = app;
