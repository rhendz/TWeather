# Responsible for receiving and updating the cities in Tennessee.

# Scrapes wikipedia for latitude, longitude, and population data
# for municipalities within TN and outputs all of
# the data into a JSON file.

from bs4 import BeautifulSoup
from bs4 import NavigableString
import lxml
import requests
import re
import json

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
    for link in cityLinks:
        city = requests.get(link)
        citySoup = BeautifulSoup(city.content, "lxml")

        cityName = citySoup.find("title").string.split(',')[0]
        print("Finding data for " + cityName[0:10] + "...", end="\t\t")
        cityDict = {cityName: None}

        try:
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

            cityDict[cityName] = {'coords': latlngDict}

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
                            regExpThis = ''.join(str(elem)
                                                 for elem in regExpThis)
                            populationDict = {'population': regExpThis}
                            break
                    except:
                        pass

            cityDict[cityName].update(populationDict)
            cityData.update(cityDict)
            # Checkmark for Success
            print("\u2713")
        except:
            # Cross Mark for Failure
            print("\u274C")

    with open('cityData.json', 'w') as f:
        json.dump(cityData, f)


def dms_to_dd(d, m, s, dir):
    dd = float(d) + float(m) / 60 + float(s) / 3600
    if(dir == 'S' or dir == 'W'):
        dd *= -1
    return dd

# Determines whether a tag is surrounded by strings
def surrounded_by_strings(tag):
    return (isinstance(tag.next_element, NavigableString) and isinstance(tag.previous_element, NavigableString))

if __name__ == '__main__':
    main()
