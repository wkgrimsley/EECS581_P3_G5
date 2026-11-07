/*
Topic registry — every story card the app can show.
Names/descriptions come from MODULES in src/modules.ts, and the component that
shows each card's content comes from MODULE_PAGES in src/modulePages.tsx.

To add a new topic (e.g. word of the day):
  1. Add it to MODULES in src/modules.ts and its id to TopicId in src/types.ts
  2. Write src/api/<topic>.ts with a fetch function (copy calendar.ts)
  3. Write src/pages/<Topic>Page.tsx and add it to MODULE_PAGES in src/modulePages.tsx
  4. Add an entry below, add it to LIVE_DATA in src/api/config.ts,
     and to TOPIC_IDS / topicOrder in src/hooks/usePreferences.ts

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import type { ComponentType } from 'react'
import { fetchCalendar } from '../api/calendar'
import { fetchNews } from '../api/news'
import { fetchSports } from '../api/sports'
import { fetchStocks } from '../api/stocks'
import { fetchWeather } from '../api/weather'
import { MODULE_PAGES } from '../modulePages'
import { MODULES } from '../modules'
import type { Preferences, TopicId } from '../types'

export interface TopicDefinition<T> {
  id: TopicId
  label: string
  description: string
  load: (prefs: Preferences) => Promise<T>
  // which preferences cause a re-fetch when they change
  deps: (prefs: Preferences) => unknown[]
  View: ComponentType<{ data: T }>
}

const moduleInfo = (id: TopicId) => {
  const m = MODULES.find((x) => x.id === id)
  return { label: m?.name ?? id, description: m?.description ?? '' }
}

// Helper keeps each entry type-checked against its own data type
const defineTopic = <T,>(t: Omit<TopicDefinition<T>, 'label' | 'description'>) =>
  ({ ...t, ...moduleInfo(t.id) }) as TopicDefinition<unknown>

export const TOPICS: Record<TopicId, TopicDefinition<unknown>> = {
  weather: defineTopic({ id: 'weather', load: fetchWeather, deps: (p) => [p.location], View: MODULE_PAGES.weather }),
  calendar: defineTopic({ id: 'calendar', load: fetchCalendar, deps: () => [], View: MODULE_PAGES.calendar }),
  news: defineTopic({ id: 'news', load: fetchNews, deps: (p) => [p.newsKeywords.join(), p.newsSources.join()], View: MODULE_PAGES.news }),
  stocks: defineTopic({ id: 'stocks', load: fetchStocks, deps: (p) => [p.stocks.join()], View: MODULE_PAGES.stocks }),
  sports: defineTopic({ id: 'sports', load: fetchSports, deps: (p) => [p.leagues.join()], View: MODULE_PAGES.sports }),
}
