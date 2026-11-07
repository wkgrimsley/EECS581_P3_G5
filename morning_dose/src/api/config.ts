/*
API configuration — the one file to edit when a poller goes live.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import type { TopicId } from '../types'

// Where the Flask backend (backend/backend.py) lives.
// Leave blank in development: Vite forwards every /api/* request to
// http://127.0.0.1:5000 (see vite.config.ts), so there are no CORS issues.
// To point somewhere else, set VITE_API_BASE in morning_dose/.env.local.
export const API_BASE: string = import.meta.env.VITE_API_BASE ?? ''

// true  = fetch this topic from the backend
// false = show placeholder data from mockData.ts
// Flip a topic to true once its poller is registered in POLLER_FILES in backend.py.
export const LIVE_DATA: Record<TopicId, boolean> = {
  news: true, // backend/pollers/news_poller.py
  stocks: false,
  weather: false,
  sports: false,
  calendar: false,
}

// Set VITE_USE_MOCKS=true in morning_dose/.env.local to use placeholder data
// everywhere (handy when the backend isn't running or you have no API key).
const FORCE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

export const isLive = (topic: TopicId) => LIVE_DATA[topic] && !FORCE_MOCKS
