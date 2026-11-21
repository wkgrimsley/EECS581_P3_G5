/*
Data types used across the frontend

The UI only uses these types. Whatever a poller sends back gets converted
into one of these in src/api/<topic>.ts, so if a poller's output changes
we only have to fix that one file and not the UI.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/

export type TopicId = 'notes' | 'weather' | 'news' | 'stocks' | 'sports' | 'calendar' | 'wordofday'

export interface HourlyForecast {
  time: string // ISO timestamp
  tempF: number
  condition: string
}

export interface WeatherSnapshot {
  location: string
  tempF: number
  condition: string
  highF: number
  lowF: number
  hourly: HourlyForecast[]
}

export interface NewsItem {
  id: string
  title: string
  source: string
  url: string
  summary?: string
  imageUrl?: string
  publishedAt: string // ISO timestamp
}

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePct: number
}

export interface SportsGame {
  id: string
  league: string
  home: string
  away: string
  homeScore?: number
  awayScore?: number
  status: 'scheduled' | 'live' | 'final'
  startTime: string // ISO timestamp
}

export interface CalendarEvent {
  id: string
  title: string
  start: string // ISO timestamp
  end?: string // ISO timestamp
  allDay?: boolean
  location?: string
}

// a reminder shows up every morning, checking it off only counts for that day
export interface Reminder {
  id: string
  text: string
  doneOn?: string // the date (YYYY-MM-DD) it was last checked off
}

// a note is saved with the time it was written and stays until it's deleted
export interface Note {
  id: string
  text: string
  createdAt: string // ISO timestamp
}

export interface NotesData {
  reminders: Reminder[]
  notes: Note[]
}

export type WordOfDay = {
  word: string
  date: string // YYYY-MM-DD
  url: string
  partOfSpeech?: string
  pronunciation?: string
  definitions?: string[]
}

export interface Preferences {
  topicOrder: TopicId[]
  enabled: Record<TopicId, boolean>
  location: string // weather
  stocks: string[] // ticker symbols
  newsKeywords: string[] // sent to news_poller.py as --keyword
  newsSources: string[] // NewsAPI source IDs, sent as --source
  leagues: string[] // sports
}
