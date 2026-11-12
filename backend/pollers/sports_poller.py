'''
This poller will get all sports information relevant to the user's requests

https://api-sports.io/ will be used to poll the data

IF YOU WANT ACCESS FOR TESTING -> SEND j243v784@ku.edu email asking for access to API KEY

Architecture:
Retrieves weather data from [external API] using an API key and location provided through command-line arguments
Data is parsed and organized into a JSON payload for the backend
Backend then sends the processed data to the frontend for display to the user

To run, navigate to this working directory and run:
python -m pip install --user pipenv
python -m pipenv install
python -m pipenv shell
python sports_poller.py
'''

import os
import requests
import json
import argparse

API_KEY = os.getenv("SPORTS_API_KEY")

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

def parse_arguments():
    parser = argparse.ArgumentParser(description="Get sports information")

    '''
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
    '''

    return parser.parse_args()

def main():
    args = parse_arguments()
    output = {}

    print(json.dumps(output, indent=4))

if __name__ == "__main__":
    main()
