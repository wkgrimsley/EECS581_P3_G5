/*
Weather data for the Weather story card.

TO GO LIVE:
  1. Register the poller in backend.py:  POLLER_FILES["weather"] = "weather_poller.py"
     and forward "locations" to it in run_poller() (e.g. --location "Lawrence, KS").
     (backend_info.md already uses {"poller":"weather","locations":[...]} as its example.)
  2. Set weather: true in src/api/config.ts.
  3. If the poller's JSON differs from WeatherPollerResponse below, edit toWeather().

Request sent:  POST /api/poll  {"poller": "weather", "locations": ["Lawrence, KS"]}

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import type { Preferences, WeatherSnapshot } from '../types'
import { pollBackend } from './client'
import { isLive } from './config'
import { mockWeather } from './mockData'

// Expected poller output (one entry per requested location).
interface WeatherPollerResponse {
  locations: {
    location: string
    tempF: number
    condition: string
    highF: number
    lowF: number
    hourly?: { time: string; tempF: number; condition: string }[]
  }[]
}

function toWeather(raw: WeatherPollerResponse): WeatherSnapshot {
  const w = raw.locations?.[0]
  if (!w) throw new Error('Weather poller returned no locations')
  return { ...w, hourly: w.hourly ?? [] }
}

export async function fetchWeather(prefs: Preferences): Promise<WeatherSnapshot> {
  if (!isLive('weather')) return mockWeather(prefs.location)

  const raw = await pollBackend<WeatherPollerResponse>('weather', { locations: [prefs.location] })
  return toWeather(raw)
}
