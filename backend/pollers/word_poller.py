'''
This poller will get the Merriam-Webster Word of the Day

Source: https://www.merriam-webster.com/word-of-the-day/calendar
The first story link on that page is today's word, in the form
/word-of-the-day/<word>-YYYY-MM-DD, so the word and date are read from that link.

Only the word, its date, and a link back to Merriam-Webster are saved.
Definitions and examples belong to Merriam-Webster, so the front end links out for those.
This should only be run about once a day.

Architecture:
Polls the Merriam-Webster calendar page (no API key needed)
Data is parsed and passed as a JSON payload to the backend for further processing
Backend will then send the processed data to the front end for display to the user

Author: Riley Backus
Creation Date: 2026-11-20
'''
import json
import logging
import re
import requests

#general site URL and the page that lists the words
SITE_URL = "https://www.merriam-webster.com"
CALENDAR_URL = f"{SITE_URL}/word-of-the-day/calendar"
#matches e.g. /word-of-the-day/ruthless-2026-11-20 (the first match is today's word)
WORD_LINK_PATTERN = re.compile(r"/word-of-the-day/([a-z0-9-]+?)-(\d{4}-\d{2}-\d{2})")
#identify ourselves politely to the site
HEADERS = {"User-Agent": "MorningDose/1.0 (personal project)"}

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

def pull_word_of_the_day():
    """Pull today's Merriam-Webster word of the day.
        Returns the word, its date, and a link to its page as a JSON string."""
    session = create_retry_session()

    try:
        response = session.get(CALENDAR_URL, headers=HEADERS, timeout=10)
        response.raise_for_status()  # Raise an error for bad responses
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching word of the day: {e}")
        return json.dumps({})

    match = WORD_LINK_PATTERN.search(response.text)
    if match is None:
        logging.error("Couldn't find the word of the day. Has the page layout changed?")
        return json.dumps({})

    path, slug, date = match.groups()
    word_data = {
        "word": slug.replace("-", " "),  # "ad-hoc" -> "ad hoc"
        "date": date,
        "url": f"{SITE_URL}{path}",
    }

    return json.dumps(word_data)  # Return the word as a JSON string

def main():
    """Run the word of the day poller and output the result for the backend"""
    logging.basicConfig(level=logging.WARNING)

    word_data = json.loads(pull_word_of_the_day())
    if not word_data:
        raise SystemExit("Could not pull the word of the day")

    output = {
        "word_of_the_day": word_data,
    }

    with open("wotd_output.json", "w") as output_file:
        json.dump(output, output_file, indent=4)

    print(json.dumps(output))


if __name__ == "__main__":
    main()