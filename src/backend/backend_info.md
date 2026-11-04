# Backend Information

The backend is a Flask HTTP service in `backend.py`. It validates API requests, constructs poller commands, and returns the poller's JSON output to clients.

## Poller flow

1. A client sends a preference object to `/api/poll` or a specialized route such as `/api/news`.
2. Flask looks up the poller in `POLLER_FILES`.
3. `run_poller()` builds a Python command and passes preferences as command-line arguments.
4. The poller's standard output is parsed as JSON.
5. Flask converts the parsed object to the HTTP response.

The project normally uses this mapping:

```python
POLLER_FILES = {
    "news": "news_poller.py",
}
```

## Start the backend

From the `src` directory, install and synchronize dependencies:

```powershell
python -m pipenv sync
```

Start Flask:

```powershell
python -m pipenv run python .\backend\backend.py
```

The backend is available at:

```text
http://127.0.0.1:5000
```

Keep the backend terminal running while testing endpoints from another PowerShell terminal.

## Available endpoints

### Health check

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/health
```

Expected response:

```json
{"status":"ok"}
```

### News endpoint

```powershell
$result = Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:5000/api/news `
  -ContentType "application/json" `
  -Body '{"keywords":["technology"],"sources":["bbc-news"]}'

$result.keywords.Count
$result.sources.Count
```

### Generic poll endpoint

```powershell
$result = Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:5000/api/poll `
  -ContentType "application/json" `
  -Body '{"poller":"news","keywords":["technology"],"sources":["bbc-news"]}'

$result | ConvertTo-Json -Depth 10
```

## Inspecting results

Show article titles instead of the default PowerShell object summary:

```powershell
$result.keywords | Select-Object title, author, publishedAt, url
$result.sources | Select-Object title, author, publishedAt, url
```

## Testing backend behavior

1. Verify that the health endpoint responds before testing pollers.
2. Invoke a specialized route for a known poller.
3. Confirm that `keywords.Count` and `sources.Count` match the expected result limits.
4. Test the generic `/api/poll` route with `poller` set to the registered name.
5. Test each poller directly when an endpoint reports invalid JSON.

## Error responses

Common errors include:

- `Unknown poller`: the requested poller is not registered.
- `Poller not found`: the registered file does not exist at the expected path.
- `Poller returned invalid JSON`: the poller wrote something other than JSON to standard output, or exited before parsing its output.
- A nonzero poller exit returns its standard error with HTTP status `500` when available.

## Registering another poller

1. Create the poller in `src/pollers`.
2. Add an entry to `POLLER_FILES`, for example `"weather": "weather_poller.py"`.
3. Add argument handling in `run_poller()` for any preference fields the poller needs.
4. Optionally add a specialized route for the poller.
5. Test it directly first, then use the generic route and an optional specialized route.

Example generic request:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:5000/api/poll `
  -ContentType "application/json" `
  -Body '{"poller":"weather","locations":["lawrence"]}'
```
