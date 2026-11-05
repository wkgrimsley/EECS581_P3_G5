'''
Backend for handling pollers

Requests from frontend call REST API endpoints which then call the appropriate poller to gather data from the appropriate source

Author: Bill Grimsley
Creation Date: 2026-10-28
'''


import json
import subprocess
import sys
from pathlib import Path

from flask import Flask, jsonify, request
#Create a Flask app to handle API requests and run pollers
app = Flask(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
POLLER_DIRECTORY = PROJECT_ROOT / "pollers"
POLLER_FILES = {
    "news": "news_poller.py",
}

#code for run_poller adapted from GitHub Copilot
def run_poller(poller_name, preferences):
    """Run the specified poller with the given preferences and return the result."""
    poller_file = POLLER_FILES.get(poller_name)
    if poller_file is None:
        return None, "Unknown poller", 400

    poller_path = POLLER_DIRECTORY / poller_file
    if not poller_path.is_file():
        return None, f"Poller not found: {poller_file}", 404

    command = [sys.executable, str(poller_path)]
    for keyword in preferences.get("keywords", []):
        command.extend(["--keyword", str(keyword)])
    for source in preferences.get("sources", []):
        command.extend(["--source", str(source)])

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=60,
        cwd=str(PROJECT_ROOT),
    )

    if result.returncode != 0:
        return None, result.stderr.strip() or "Poller failed", 500

    try:
        return json.loads(result.stdout), None, 200
    except json.JSONDecodeError:
        return None, "Poller returned invalid JSON", 500

#get api health to check if the backend is running
@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

#Poll specific poller based on the poller name and preferences provided in the request body
@app.post("/api/poll")
def poll():
    data = request.get_json(silent=True) or {}
    poller_name = data.get("poller")

    if poller_name not in POLLER_FILES:
        return jsonify({"error": "Unknown poller"}), 400

    data, error, status = run_poller(poller_name, data)
    if error:
        return jsonify({"error": error}), status

    return jsonify(data)

#poll specific news data
@app.post("/api/news")
def news():
    data, error, status = run_poller("news", request.get_json(silent=True) or {})
    if error:
        return jsonify({"error": error}), status

    return jsonify(data)

#backend runs on local host and port 5000, debug mode is enabled for development purposes
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
