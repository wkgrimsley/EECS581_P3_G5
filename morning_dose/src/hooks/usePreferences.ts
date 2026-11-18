/*
User preferences, saved in the browser for now.

Which topics are switched on is stored with Felix's loadEnabledModules /
saveEnabledModules in src/modules.ts, so there is one source of truth for that.
Everything else (order, location, keywords, stocks, ...) is stored here.

When user accounts land (Sprint 2, Story 5), swap the load/save functions
for backend calls — nothing else in the UI needs to change.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import { useEffect, useState } from 'react'
import { loadEnabledModules, saveEnabledModules } from '../modules'
import type { Preferences, TopicId } from '../types'

const STORAGE_KEY = 'morningDose.preferences'
const TOPIC_IDS: TopicId[] = ['weather', 'calendar', 'news', 'stocks', 'sports']

export const defaultPreferences: Preferences = {
  topicOrder: ['weather', 'calendar', 'news', 'stocks', 'sports'],
  enabled: { weather: true, calendar: true, news: true, stocks: true, sports: true },
  location: 'Lawrence, KS',
  stocks: ['AAPL', 'MSFT', 'NVDA'],
  newsKeywords: ['technology'],
  newsSources: ['bbc-news'],
  leagues: [],
}

function loadPreferences(): Preferences {
  let saved: Partial<Preferences> = {}
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    // unreadable — fall back to defaults
  }
  let enabledIds: string[] = TOPIC_IDS
  try {
    enabledIds = loadEnabledModules()
  } catch {
    // storage unavailable
  }
  const enabled = Object.fromEntries(TOPIC_IDS.map((id) => [id, enabledIds.includes(id)])) as Record<TopicId, boolean>
  // keep any topics added later that an older saved order doesn't know about
  const order = (saved.topicOrder ?? []).filter((id) => TOPIC_IDS.includes(id))
  const topicOrder = [...order, ...TOPIC_IDS.filter((id) => !order.includes(id))]
  return { ...defaultPreferences, ...saved, topicOrder, enabled }
}

function savePreferences(prefs: Preferences) {
  try {
    const { enabled, ...rest } = prefs
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
    // Keep any modules that aren't story cards yet as they were
    const others = loadEnabledModules().filter((id) => !TOPIC_IDS.includes(id as TopicId))
    saveEnabledModules([...others, ...TOPIC_IDS.filter((id) => enabled[id])])
  } catch {
    // storage unavailable (private browsing etc.) — keep in memory only
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences)
  useEffect(() => savePreferences(prefs), [prefs])
  return [prefs, setPrefs] as const
}
