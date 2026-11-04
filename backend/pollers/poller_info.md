# Poller Information

Pollers collect external data and return one valid JSON object to the backend. Each poller runs as a separate Python process so the poller can be started directly or through the Flask backend.

## Location and registration

- Poller scripts belong in this directory.
- A poller must be registered in `src/backend/backend.py` in the `POLLER_FILES` dictionary before it can be run through `/api/poll`.
- Every poller must:
  1. Accept preferences through command-line arguments.
  2. Exit with a nonzero status when it cannot perform its task.
  3. Print only one JSON object to standard output on success.
  4. Send errors or logging to standard error rather than standard output.

Example registration:

```python
POLLER_FILES = {
    "news": "news_poller.py",
}
```

## Expected command-line interface

Use clear repeatable arguments for preference lists:

```text
python pollers/news_poller.py --keyword technology --source bbc-news
```

A poller should also define a small result structure, for example:

```json
{
  "keywords": [],
  "sources": []
}
```

Do not print progress messages or debug output after execution begins, because `backend.py` parses standard output as JSON.

## Add a new poller

1. Create `<name>_poller.py` in this directory.
2. `news_poller.py` is a good reference to copy from. Start with that if unclear
3. Add an argument parser and request handling.
4. Limit API results consistently for each request when the API supports pagination or page-size limits.
5. Combine results in a JSON-serializable dictionary.
6. Print that dictionary with `json.dumps(...)`.
7. Add the poller filename to `POLLER_FILES` in `backend.py`.
8. Test the poller directly and through the backend.

## News poller

Run the news poller from the `src` directory:

```powershell
python -m pipenv run python .\pollers\news_poller.py --keyword technology
python -m pipenv run python .\pollers\news_poller.py --source bbc-news
python -m pipenv run python .\pollers\news_poller.py --keyword technology --source bbc-news
```

The news poller requests up to three articles for each keyword and source. Its output has these top-level fields:

```json
{
  "keywords": [...],
  "sources": [...]
}
```

### Verify JSON and result counts

Pipe the poller's output into Python for a JSON/count check:

```powershell
python -m pipenv run python .\pollers\news_poller.py --keyword technology --source bbc-news |
  python -c "import json,sys; d=json.load(sys.stdin); print(len(d['keywords']), len(d['sources']))"
```

Expected output:

```text
3 3
```

The poller also writes the same object to `news_output.json` in the current working directory.

OR

Add code to write to a file the JSON dumps object to view easily

## API keys and configuration

Keep API credentials outside source code when possible. Preferred configuration is an environment variable, with a local fallback only for development:

```powershell
$env:NEWS_API_KEY = "your-api-key"
```

Then run the poller normally:

```powershell
python -m pipenv run python .\pollers\news_poller.py --keyword technology
```

Never commit real API keys or expose them in documentation or saved output.
