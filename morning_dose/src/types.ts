/*
Shared data types for the Morning Snapshot frontend.

The UI only ever works with these shapes. Whatever a poller returns gets
converted into one of these by the matching adapter in src/api/<topic>.ts,
so a poller's output format can change without touching any UI code.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/

export type TopicId = 'weather' | 'news' | 'stocks' | 'sports' | 'calendar'

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

export interface Preferences {
  topicOrder: TopicId[]
  enabled: Record<TopicId, boolean>
  location: string // weather
  stocks: string[] // ticker symbols
  newsKeywords: string[] // sent to news_poller.py as --keyword
  newsSources: string[] // NewsAPI source IDs, sent as --source
  leagues: string[] // sports
}
