/*
Calendar data for the Calendar story card.

TO GO LIVE:
  1. Write a calendar poller (e.g. Google Calendar or an .ics feed) and register it
     in backend.py:  POLLER_FILES["calendar"] = "calendar_poller.py"
  2. Set calendar: true in src/api/config.ts.
  3. If the poller's JSON differs from CalendarPollerResponse below, edit toEvents().

Request sent:  POST /api/poll  {"poller": "calendar", "date": "2026-11-07"}

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import type { CalendarEvent } from '../types'
import { pollBackend } from './client'
import { isLive } from './config'
import { mockCalendar } from './mockData'

// Expected poller output. Easiest path: have the poller print exactly this.
interface CalendarPollerResponse {
  events: CalendarEvent[]
}

function toEvents(raw: CalendarPollerResponse): CalendarEvent[] {
  return [...(raw.events ?? [])].sort((a, b) => a.start.localeCompare(b.start))
}

export async function fetchCalendar(): Promise<CalendarEvent[]> {
  if (!isLive('calendar')) return mockCalendar()

  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local time
  const raw = await pollBackend<CalendarPollerResponse>('calendar', { date: today })
  return toEvents(raw)
}
