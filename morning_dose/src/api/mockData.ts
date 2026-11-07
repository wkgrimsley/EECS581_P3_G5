/*
Placeholder data used while a topic's poller isn't live yet
(see LIVE_DATA in src/api/config.ts).

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import type { CalendarEvent, NewsItem, SportsGame, StockQuote, WeatherSnapshot } from '../types'

const hoursFromNow = (h: number) => {
  const d = new Date(Date.now() + h * 3_600_000)
  d.setMinutes(0, 0, 0)
  return d.toISOString()
}

export const mockWeather = (location: string): WeatherSnapshot => ({
  location,
  tempF: 48,
  condition: 'Partly cloudy',
  highF: 61,
  lowF: 42,
  hourly: [0, 3, 6, 9, 12].map((h, i) => ({
    time: hoursFromNow(h),
    tempF: [48, 55, 60, 57, 50][i],
    condition: ['Partly cloudy', 'Sunny', 'Sunny', 'Cloudy', 'Clear'][i],
  })),
})

export const mockNews: NewsItem[] = [
  { id: 'n1', title: 'City council approves new downtown bike lanes', source: 'Local Times', url: '#', summary: 'The plan adds 4 miles of protected lanes by next summer.', publishedAt: hoursFromNow(-1) },
  { id: 'n2', title: 'Researchers unveil faster battery chemistry', source: 'Tech Daily', url: '#', summary: 'Lab prototypes charge to 80% in under ten minutes.', publishedAt: hoursFromNow(-3) },
  { id: 'n3', title: 'Markets open flat ahead of jobs report', source: 'Business Wire', url: '#', publishedAt: hoursFromNow(-4) },
]

export const mockStocks: StockQuote[] = [
  { symbol: 'AAPL', name: 'Apple', price: 231.42, change: 1.84, changePct: 0.8 },
  { symbol: 'MSFT', name: 'Microsoft', price: 498.1, change: -3.22, changePct: -0.64 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 182.55, change: 4.1, changePct: 2.3 },
  { symbol: 'AMZN', name: 'Amazon', price: 219.03, change: 0.45, changePct: 0.21 },
  { symbol: 'GOOGL', name: 'Alphabet', price: 201.77, change: -0.98, changePct: -0.48 },
  { symbol: 'TSLA', name: 'Tesla', price: 344.9, change: -8.6, changePct: -2.43 },
]

// Today's events at fixed local times
const todayAt = (h: number, m = 0) => {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

export const mockCalendar = (): CalendarEvent[] => [
  { id: 'c1', title: 'Gym', start: todayAt(7), end: todayAt(8) },
  { id: 'c2', title: 'EECS 581 lecture', start: todayAt(10), end: todayAt(11, 15), location: 'Eaton Hall' },
  { id: 'c3', title: 'Project 3 team meeting', start: todayAt(15, 30), end: todayAt(16, 30), location: 'LEEP2' },
  { id: 'c4', title: 'Dinner with family', start: todayAt(18, 30) },
]

export const mockSports: SportsGame[] = [
  { id: 's1', league: 'NFL', home: 'Chiefs', away: 'Bills', homeScore: 27, awayScore: 24, status: 'final', startTime: hoursFromNow(-14) },
  { id: 's2', league: 'NBA', home: 'Thunder', away: 'Nuggets', homeScore: 88, awayScore: 91, status: 'live', startTime: hoursFromNow(-1) },
  { id: 's3', league: 'NCAAB', home: 'Kansas', away: 'Duke', status: 'scheduled', startTime: hoursFromNow(10) },
]
