'''
This poller will get all news information relevant to the user's requests

News API: https://newsapi.org/v2/everything?q=keyword&apiKey=YOUR_API
will be used to poll the data


IF YOU WANT ACCESS FOR TESTING -> SEND grimsleybill@ku.edu email asking for access to API KEY
(or setup your own account, I'll give you my API key just please don't abuse it since there is a limit we can hit)

Architecture:
Polls newsapi using API key and keyword(s) provided by user preferences page
Data is then parsed and passed as a JSON payload to the backend for further processing
Backend will then send the processed data to the front end for display to the user

To run, navigate to this working directory and run:
python -m pip install --user pipenv
python -m pipenv install
python -m pipenv shell
python news_poller.py
'''
import argparse
import os
import requests
import json
import logging
import time

CURR_DATE = time.strftime("%Y-%m-%d")  # Get the current date in YYYY-MM-DD format
YESTERDAY_DATE = time.strftime("%Y-%m-%d", time.localtime(time.time() - 86400))  # Get yesterday's date
LAST_WEEK_DATE = time.strftime("%Y-%m-%d", time.localtime(time.time() - 604800))  # Get the date a week ago
API_URL = "https://newsapi.org/v2"
API_KEY = os.getenv('NEWS_API_KEY')  # Get the API key from environment variable

def create_retry_session(retries=3, backoff_factor=0.3, status_forcelist=(500, 502, 504)):
    '''
    create requests session with retry session for handling inconsequential errors
    '''
    session = requests.Session()
    retry = requests.adapters.Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = requests.adapters.HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

def pull_news_keyword(keywords):
    """Pull news articles matching the supplied keywords."""
    all_articles = []

    session = create_retry_session()

    for keyword in keywords:
        url = f"{API_URL}/everything?q={keyword}&from={LAST_WEEK_DATE}&to={CURR_DATE}&sortBy=popularity&apiKey={API_KEY}"
        try:
            response = session.get(url)
            response.raise_for_status()  # Raise an error for bad responses
            data = response.json()
            articles = data.get('articles', [])
            all_articles.extend(articles)
        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching news for keyword '{keyword}': {e}")

    return json.dumps(all_articles)  # Return the articles as a JSON string

def pull_news_source(sources):
    """Pull top headlines from the supplied NewsAPI sources."""
    all_articles = []

    session = create_retry_session()

    for source in sources:
        url = f"{API_URL}/top-headlines?sources={source}&apiKey={API_KEY}"
        try:
            response = session.get(url)
            response.raise_for_status()  # Raise an error for bad responses
            data = response.json()
            articles = data.get('articles', [])
            all_articles.extend(articles)
        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching news for source '{source}': {e}")

    return json.dumps(all_articles)  # Return the articles as a JSON string

def parse_arguments():
    parser = argparse.ArgumentParser(description="Poll news by keyword and source")
    parser.add_argument(
        "--keyword",
        action="append",
        default=[],
        help="News keyword to search for; may be provided multiple times",
    )
    parser.add_argument(
        "--source",
        action="append",
        default=[],
        help="NewsAPI source ID; may be provided multiple times",
    )
    return parser.parse_args()


def main():
    args = parse_arguments()
    logging.basicConfig(level=logging.WARNING)

    if not args.keyword and not args.source:
        raise SystemExit("Provide at least one --keyword or --source argument")

    keyword_news = json.loads(pull_news_keyword(args.keyword))
    source_news = json.loads(pull_news_source(args.source))

    print(json.dumps({
        "keywords": keyword_news,
        "sources": source_news,
    }))


if __name__ == "__main__":
    main()
