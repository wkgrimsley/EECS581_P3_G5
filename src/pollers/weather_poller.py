'''
This poller will get all weather information relevant to the user's requests

WeatherAPI: https://www.weatherapi.com/docs/ will be used to poll the data

IF YOU WANT ACCESS FOR TESTING -> SEND j243v784@ku.edu email asking for access to API KEY

Architecture:
Retrieves weather data from WeatherAPI using an API key and location provided through command-line arguments
Separate functions retrieve current weather, air quality, weather alerts, hourly forecasts, and daily summaries
Data is parsed and organized into a JSON payload for the backend
Backend then sends the processed data to the frontend for display to the user

To run, navigate to this working directory and run:
python -m pip install --user pipenv
python -m pipenv install
python -m pipenv shell
python news_poller.py

'''

import os
import requests
import json
import argparse


API_KEY = os.getenv("WEATHER_API_KEY")

SEARCH_URL = "https://api.weatherapi.com/v1/search.json"
CURRENT_URL = "https://api.weatherapi.com/v1/current.json"
FORECAST_URL = "https://api.weatherapi.com/v1/forecast.json"
SEARCH_URL = "https://api.weatherapi.com/v1/search.json"
ALERTS_URL = "https://api.weatherapi.com/v1/alerts.json"

def search_cities(query):

    params = {
        "key" : API_KEY,
        "q" : query
    }

    response = requests.get(CURRENT_URL, params=params, timeout=10)
    response.raise_for_status()
    
    data = response.json()
    return data


def pull_current(city):
    ''' Pull current weather. '''

    params = {
        "key" : API_KEY,
        "q" : city,
        "aqi" : "no" 
    }

    response = requests.get(CURRENT_URL, params=params, timeout=10)
    response.raise_for_status()

    data = response.json()
    return data

def pull_air_quality(city):
    ''' Pull air quality data. '''

    params = {
        "key" : API_KEY,
        "q" : city,
        "aqi" : "yes"
    }

    response = requests.get(CURRENT_URL, params=params, timeout=10)
    response.raise_for_status()

    data = response.json()
    return data["current"]["air_quality"]

def pull_alerts(city):
    ''' Pull inclement weather alerts. '''

    params = {
        "key" : API_KEY,
        "q" : city
    }

    response = requests.get(ALERTS_URL, params=params, timeout=10)
    response.raise_for_status()

    data = response.json()
    return data

def pull_hourly(city):
    ''' Pull hourly weather for the day. '''
    params = {
            "key" : API_KEY,
            "q" : city,
            "days" : 1
    }
    
    response = requests.get(FORECAST_URL, params=params, timeout=10)
    response.raise_for_status()
    
    data = response.json()
    return data["forecast"]["forecastday"][0]["hour"]

def pull_daily_summary(city):
    ''' Pull weather summary for the day. '''
    params = {
            "key" : API_KEY,
            "q" : city,
            "days" : 1
    }
    
    response = requests.get(FORECAST_URL, params=params, timeout=10)
    response.raise_for_status()
    
    data = response.json()
    return data["forecast"]["forecastday"][0]["day"]

def parse_arguments():
    parser = argparse.ArgumentParser(description="Get current weather for a city")

    parser.add_argument("--query",
                            type=str,
                            required=False,
                            help="Search for city"
                            )

    parser.add_argument("--city",
                        type=str,
                        required=False,
                        help="City to retrieve weather for"
                        )

    return parser.parse_args()

def main():
    args = parse_arguments()
    output = {}

    if args.query:
        output["search"] = search_cities(args.query)

    if args.city: 
        output["current"] = pull_current(args.city)
        output["air_quality"] = pull_air_quality(args.city)
        output["alerts"] = pull_alerts(args.city)
        output["hourly"] = pull_hourly(args.city)
        output["daily_summary"] = pull_daily_summary(args.city)

    print(json.dumps(output, indent=4))

if __name__ == "__main__":
    main()
