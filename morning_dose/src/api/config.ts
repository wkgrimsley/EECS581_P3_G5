/*
API settings. This is the file to change when a poller is ready to use.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import type { TopicId } from '../types'

// where the Flask backend (backend/backend.py) is running
// leave this blank when developing, Vite sends every /api/* request to
// http://127.0.0.1:5000 (see vite.config.ts), so there are no CORS issues.
// to use a different address set VITE_API_BASE in morning_dose/.env.local
export const API_BASE: string = import.meta.env.VITE_API_BASE ?? ''

// true = get this topic from the backend
// false = show the placeholder data from mockData.ts
// change a topic to true once its poller is added to POLLER_FILES in backend.py
export const LIVE_DATA: Record<TopicId, boolean> = {
  news: true, // backend/pollers/news_poller.py
  stocks: false,
  weather: false,
  sports: false,
  calendar: false,
  notes: false, // saved in the browser for now, see src/api/notes.ts
}

// put VITE_USE_MOCKS=true in morning_dose/.env.local to use placeholder data
// for everything (useful if the backend isn't running or you don't have an API key)
const FORCE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

export const isLive = (topic: TopicId) => LIVE_DATA[topic] && !FORCE_MOCKS
