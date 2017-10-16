# Responsible for receiving and updating the cities in Tennessee.

# Scrapes wikipedia for latitude, longitude, and population data
# for municipalities within TN and outputs all of
# the data in a JSON file.

from bs4 import BeautifulSoup
from bs4 import NavigableString
import lxml
import requests
import re

def main():
    url = 'https://en.wikipedia.org/wiki/List_of_municipalities_in_Tennessee'
    cities = requests.get(url)

    soup = BeautifulSoup(cities.content, "lxml")

    cityLinks = []
    # Gets all links for municipalities in Tennessee
    for link in soup.find_all('a'):
        href = link.get('href')
        # Removes invalid entries and counties
        if href is not None and "County" not in href and ",_Tennessee" in href:
            cityLinks.append("http://wikipedia.org" + href)

    cityData = {}
    # Heart of scraping
    for link in cityLinks[:2]:
        city = requests.get(link)
        citySoup = BeautifulSoup(city.content, "lxml")

        cityKey = citySoup.find("title").string.split(',')[0]
        cityDict = {cityKey: None}

        # Gets latitude and longitude data
        lat = citySoup.find("span", class_="latitude").string
        lng = citySoup.find("span", class_="longitude").string
        # RegExp to clean up dms (degrees minutes seconds)
        # * Unpacks list into positional arguments
        latExp = re.findall(r'\d{0,2}[0-9-NESW]', lat)
        lat = format(dms_to_dd(*latExp), '.7f')
        lngExp = re.findall(r'\d{0,2}[0-9-NESW]', lng)
        lng = format(dms_to_dd(*latExp), '.7f')

        latlngDict = {'lat': lat, 'lng': lng}
        cityDict[cityKey] = latlngDict

        # Gets population data
        # Looks for population data in poorly formatted table
        vcard = citySoup.find("table", class_="vcard")
        populationDict = {}
        for tag in vcard:
            if surrounded_by_strings(tag):
                try:
                    if "Population" in tag.get_text():
                        # This data is so ugly...
                        regExpThis = tag.find_next_sibling("tr").get_text()
                        regExpThis = re.findall(r'\d+[0-9]', regExpThis)
                        regExpThis = ''.join(str(elem) for elem in regExpThis)
                        populationDict = {'population': regExpThis}
                        break
                except:
                    pass

        cityDict[cityKey].update(populationDict)
        cityData.update(cityDict)


    for key in cityData:
        print(cityData[key])


def dms_to_dd(d, m, s, dir):
    dd = float(d) + float(m)/60 + float(s)/3600
    if(dir == 'S' or dir == 'W'): dd*=-1
    return dd

# Determines whether a tag is surrounded by strings
def surrounded_by_strings(tag):
    return (isinstance(tag.next_element, NavigableString) and isinstance(tag.previous_element, NavigableString))

# # Gets Place Name from https://en.wikipedia.org/wiki/List_of_municipalities_in_Tennessee
# cities = wikipedia.page(title='List_of_municipalities_in_Tennessee', pageid=None, auto_suggest=True, redirect=True, preload=False).links
# # Filters out links that are not cities
# filteredCities = list(filter(lambda x: ', Tennessee' in x and 'County' not in x, cities))
#
# # Grabs latitude and longitude data for each city
# # Formats data into a dictionary with city name : {lat: , lng:}
# cityData = {}
# for x in filteredCities:
#     try:
#         print("Searching latlngData for: " + x + ".")
#         latlngTuple = wikipedia.WikipediaPage(title = x, pageid=None, redirect=True, preload=False).coordinates
#         lng = float(round(latlngTuple[1], 7))
#         lat = float(round(latlngTuple[0], 7))
#         latlngData = dict(lng=lng, lat=lat)
#         cityData.setdefault("cities", []).append(dict(coords = latlngData, cityName = x))
#     except:
#         print("No latlngData found for: " + x + "!")
#
# # Outputs formatted data to a JSON file
# with open('cityData.json', 'w') as f:
#     json.dump(cityData, f)

if __name__ == '__main__':
    main()
