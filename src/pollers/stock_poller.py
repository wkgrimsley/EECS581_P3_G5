'''
This poller will get all stock information relevant to the user's requests

Finnhub: https://finnhub.io will be used to poll the data

IF YOU WANT ACCESS FOR TESTING -> SEND j243v784@ku.edu email asking for access to API KEY

Architecture:
Retrieves weather data from  Finnhub using an API key and location provided through command-line arguments
---
Data is parsed and organized into a JSON payload for the backend
Backend then sends the processed data to the frontend for display to the user

To run, navigate to this working directory and run:
python -m pip install --user pipenv
python -m pipenv install
python -m pipenv shell
python stock_poller.py
'''

import os
import requests
import json
import argparse

API_KEY = os.getenv("STOCK_API_KEY")

SEARCH_URL = "https://finnhub.io/api/v1/search"
QUOTE_URL = "https://finnhub.io/api/v1/quote"
COMPANY_PROFILE_URL = "https://finnhub.io/api/v1/profile2"

def make_request(url, params):
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        return data
    
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 400:
            print("Invalid input entered.")
        elif e.response.status_code == 401:
            print("Invalid API key.")
        else:
            print(f"API error: {e.reponse.status_code}")
        return None
    
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None


def search_stocks(query):
    ''' Search for best-matching stock symbols by query. Can input anything from symbol, security's name to ISIN and Cusip.'''
    params = {
        "token" : API_KEY,
        "q" : query
    }

    return make_request(SEARCH_URL, params)["result"]

def pull_quote(symbol):
    ''' Pull quote for stock. '''

    params = {
        "token" : API_KEY,
        "q" : symbol
    }

    return make_request(QUOTE_URL, params)

def pull_company_profile(symbol):
    ''' Pull company profile for stock. '''

    params = {
        "token" : API_KEY,
        "q" : symbol
    }

    return make_request(COMPANY_PROFILE_URL, params)
    

def parse_arguments():
    parser = argparse.ArgumentParser(description="Get stock information")

    parser.add_argument("--query",
                                type=str,
                                required=False,
                                help="Stock name"
                                )
    
    parser.add_argument("--symbol",
                        type=str,
                        required=False,
                        help="Stock symbol"
                        )

    return parser.parse_args()

def main():
    args = parse_arguments()
    output = {}

    if args.query:
        output["search"] = search_stocks(args.query)

    if args.symbol:
        output["quote"] = pull_quote(args.symbol)
        output["company_profile"] = pull_quote(args.symbol)

    print(json.dumps(output, indent=4))

if __name__ == "__main__":
    main()