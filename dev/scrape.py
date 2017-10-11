# Responsible for receiving and updating the cities in Tennessee.

# Scrapes wikipedia for latitude and longitude data
# for municipalities within TN and outputs all of
# the data in a JSON file.

# Example: wikipedia.page(title="Adams, Tennessee", pageid=None, auto_suggest=True, redirect=True, preload=False).coordinates

import decimal
import json
import wikipedia

# Gets Place Name from https://en.wikipedia.org/wiki/List_of_municipalities_in_Tennessee
cities = wikipedia.page(title='List_of_municipalities_in_Tennessee', pageid=None, auto_suggest=True, redirect=True, preload=False).links
# Filters out links that are not cities
filteredCities = list(filter(lambda x: ', Tennessee' in x and 'County' not in x, cities))

# Grabs latitude and longitude data for each city
# Formats data into a dictionary with city name : {lat: , lng:}
cityData = {}
for x in filteredCities:
    try:
        print("Searching latlngData for: " + x + ".")
        latlngTuple = wikipedia.WikipediaPage(title = x, pageid=None, redirect=True, preload=False).coordinates
        lng = float(round(latlngTuple[1], 7))
        lat = float(round(latlngTuple[0], 7))
        latlngData = dict(lng=lng, lat=lat)
        cityData.setdefault("cities", []).append(dict(coords = latlngData, cityName = x))
    except:
        print("No latlngData found for: " + x + "!")

# Outputs formatted data to a JSON file
with open('data.json', 'w') as f:
    json.dump(cityData, f)
