'''
This poller will get all sports information relevant to the user's requests

https://api-sports.io/ will be used to poll the data

IF YOU WANT ACCESS FOR TESTING -> SEND j243v784@ku.edu email asking for access to API KEY

Architecture:
Retrieves sports data from api-sports using an API key and location provided through command-line arguments
Data is parsed and organized into a JSON payload for the backend
Backend then sends the processed data to the frontend for display to the user

To run, navigate to this working directory and run:
python -m pip install --user pipenv
python -m pipenv install
python -m pipenv shell
python sports_poller.py
'''

# Dictionary mapping sports to their APIs
sports = {
    "football": "https://v3.football.api-sports.io",
    "baseball" : "https://v1.baseball.api-sports.io",
    "basketball" : "https://v1.basketball.api-sports.io",
    #"f1" : "https://v1.f1.api-sports.io",
    "hockey" : "https://v1.hockey.api-sports.io",
    #"mma" : "https://v1.mma.api-sports.io",
    "nba" : "https://v2.nba.api-sports.io",
    "nfl" : "https://v1.american-football.api-sports.io",
    "rugby" : "https://v1.rugby.api-sports.io",
    "volleyball" : "https://v1.volleyball.api-sports.io",
}

import os
import requests
import json
import argparse

API_KEY = os.getenv("SPORTS_API_KEY")

def make_request(endpoint, params):
    '''Send an HTTP GET request to an external API, check for the response status, and return the response as a Python dictionary.'''
    try:
        response = requests.get(endpoint,
                                headers={"x-apisports-key": API_KEY},
                                params=params,
                                timeout=10
        )
        response.raise_for_status()

        data = response.json()
        if data.get("errors"):
            print(f"API error: {data['errors']}")
            return None
        
        return data
    
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 400:
            print("Invalid input entered.")
        elif e.response.status_code == 401:
            print("Invalid API key.")
        else:
            print(f"API error: {e.response.status_code}")
        return None
    
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None

def get_leagues(sport):
    ''' Get the list of all available leagues for a sport.'''
    endpoint = f"{sports[sport]}/leagues"
    params = None
    
    if sport in ["football", "nfl"]: # Sports that support the "current" parameter
        params = {
            "current" : "true"
        }

    return make_request(endpoint, params)

def get_teams(sport, league_id):
    ''' Get the list of all available teams for a sport.'''
    endpoint = f"{sports[sport]}/teams"

    if sport == "nba": 
        league_id = "standard"

    params = {
        "league" : league_id
    }

    return make_request(endpoint, params)

def get_games(sport, league_id, team_id, date):
    ''' Get games for a specified league and team at a specified date.'''
    endpoint = f"{sports[sport]}/fixtures" if sport == "football" else f"{sports[sport]}/games"

    params = {
        "league" : league_id,
        "team": team_id,
        "date" : date
        }

    return make_request(endpoint, params)

def get_standings(sport, league_id, team_id, season):
    endpoint = f"{sports[sport]}/standings"

    if sport == "nba":
        league_id = "standard"

    params = {
        "league" : league_id,
        "team" : team_id,
        "season" : season
    }

    return make_request(endpoint, params)

def parse_arguments():
    parser = argparse.ArgumentParser(description="Get sports information")

    parser.add_argument("--sport",
                        type=str,
                        choices=sports.keys(),
                        required=True,
                        help="Sport to retrieve information for"
                        )

    subparsers = parser.add_subparsers(dest="action", required=True)

    # Leagues
    subparsers.add_parser("leagues", help="Get available leagues")

    # Teams
    teams_parser = subparsers.add_parser("teams", help="Get teams in a league")
    teams_parser.add_argument("--league", type=str)

    # Games
    games_parser = subparsers.add_parser("games", help="Get games for a team and date")
    games_parser.add_argument("--league", type=str)
    games_parser.add_argument("--team", type=int, required=True)
    games_parser.add_argument("--date", type=str, required=True)

    # Standings
    standings_parser = subparsers.add_parser("standings", help="Get team standings")
    standings_parser.add_argument("--league", type=str)
    standings_parser.add_argument("--team", type=int, required=True)
    standings_parser.add_argument("--season", type=str, required=True)

    args = parser.parse_args()

    if args.action != "leagues" and args.sport != "nba" and not args.league:
        parser.error("--league is required for this sport")

    return args

def main():
    args = parse_arguments()

    league_id = "standard" if args.sport == "nba" else getattr(args, "league", None)

    if args.action == "leagues":
        output = get_leagues(args.sport)

    elif args.action == "teams":
        output = get_teams(args.sport, league_id)

    elif args.action == "games":
        output = get_games(args.sport, league_id, args.team, args.date)

    elif args.action == "standings":
        output = get_standings(args.sport, league_id, args.team, args.season)

    print(json.dumps(output, indent=4))

if __name__ == "__main__":
    main()