/*
Sports data for the Sports story card.

TO GO LIVE:
  1. Register the poller in backend.py:  POLLER_FILES["sports"] = "sports_poller.py"
     and forward "leagues" to it in run_poller() (e.g. --league NFL --league NBA).
  2. Set sports: true in src/api/config.ts.
  3. If the poller's JSON differs from SportsPollerResponse below, edit toGames().

Request sent:  POST /api/poll  {"poller": "sports", "leagues": ["NFL", "NBA"]}

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import type { Preferences, SportsGame } from '../types'
import { pollBackend } from './client'
import { isLive } from './config'
import { mockSports } from './mockData'

// Expected poller output. Easiest path: have the poller print exactly this.
interface SportsPollerResponse {
  games: SportsGame[]
}

function toGames(raw: SportsPollerResponse): SportsGame[] {
  return raw.games ?? []
}

export async function fetchSports(prefs: Preferences): Promise<SportsGame[]> {
  const leagues = prefs.leagues
  if (!isLive('sports')) {
    return mockSports.filter((g) => leagues.length === 0 || leagues.includes(g.league))
  }

  const raw = await pollBackend<SportsPollerResponse>('sports', { leagues })
  return toGames(raw)
}
