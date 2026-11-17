/*
User preferences, saved in the browser for now

Which topics are turned on is saved with Felix's loadEnabledModules and
saveEnabledModules in src/modules.ts so it's only stored in one place.
Everything else (order, location, keywords, stocks, etc.) is saved here.

When user accounts are done (Sprint 2 Story 4) we can change the load/save
functions to call the backend and nothing else in the UI has to change.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import { useEffect, useState } from 'react'
import { loadEnabledModules, saveEnabledModules } from '../modules'
import type { Preferences, TopicId } from '../types'

const STORAGE_KEY = 'morningDose.preferences'
const TOPIC_IDS: TopicId[] = ['notes', 'weather', 'calendar', 'news', 'stocks', 'sports']

export const defaultPreferences: Preferences = {
  topicOrder: ['notes', 'weather', 'calendar', 'news', 'stocks', 'sports'],
  enabled: { notes: true, weather: true, calendar: true, news: true, stocks: true, sports: true },
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
    // if it can't be read just use the defaults
  }
  let enabledIds: string[] = TOPIC_IDS
  try {
    enabledIds = loadEnabledModules()
  } catch {
    // localStorage isn't available
  }
  // topics we added after this user last saved (like Notes) start turned on
  // and go in their normal spot in the order
  const savedOrder = (saved.topicOrder ?? []).filter((id) => TOPIC_IDS.includes(id))
  const isNew = (id: TopicId) => saved.topicOrder !== undefined && !saved.topicOrder.includes(id)
  const enabled = Object.fromEntries(
    TOPIC_IDS.map((id) => [id, enabledIds.includes(id) || isNew(id)]),
  ) as Record<TopicId, boolean>
  const topicOrder = [...savedOrder]
  for (const id of defaultPreferences.topicOrder) {
    if (!topicOrder.includes(id)) topicOrder.splice(defaultPreferences.topicOrder.indexOf(id), 0, id)
  }
  return { ...defaultPreferences, ...saved, topicOrder, enabled }
}

function savePreferences(prefs: Preferences) {
  try {
    const { enabled, ...rest } = prefs
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
    // keep modules that don't have a card yet the way they were
    const others = loadEnabledModules().filter((id) => !TOPIC_IDS.includes(id as TopicId))
    saveEnabledModules([...others, ...TOPIC_IDS.filter((id) => enabled[id])])
  } catch {
    // localStorage might not work (like in private browsing), so it only lasts until the page closes
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences)
  useEffect(() => savePreferences(prefs), [prefs])
  return [prefs, setPrefs] as const
}
