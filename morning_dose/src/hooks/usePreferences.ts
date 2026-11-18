import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Preferences, TopicId } from '../types'

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : fallback
}

function normalizePreferences(value: unknown): Preferences {
  const saved = isRecord(value) ? value : {}
  const savedEnabled = isRecord(saved.enabled) ? saved.enabled : {}
  const enabled = { ...defaultPreferences.enabled }
  for (const id of TOPIC_IDS) {
    const savedValue = savedEnabled[id]
    enabled[id] = typeof savedValue === 'boolean' ? savedValue : defaultPreferences.enabled[id]
  }

  const savedOrder = stringArray(saved.topicOrder, defaultPreferences.topicOrder)
    .filter((id): id is TopicId => TOPIC_IDS.includes(id as TopicId))
  const topicOrder = [...new Set(savedOrder), ...TOPIC_IDS.filter((id) => !savedOrder.includes(id))]

  return {
    topicOrder,
    enabled,
    location: typeof saved.location === 'string' ? saved.location : defaultPreferences.location,
    stocks: stringArray(saved.stocks, defaultPreferences.stocks),
    newsKeywords: stringArray(saved.newsKeywords, defaultPreferences.newsKeywords),
    newsSources: stringArray(saved.newsSources, defaultPreferences.newsSources),
    leagues: stringArray(saved.leagues, defaultPreferences.leagues),
  }
}

export function usePreferences(userId: string) {
  const [prefs, setPrefs] = useState<Preferences>(defaultPreferences)
  const [loadState, setLoadState] = useState<{
    userId: string | null
    request: number
    loading: boolean
    error: string | null
  }>({ userId: null, request: -1, loading: true, error: null })
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true

    void (async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .maybeSingle()

      if (!active) return
      if (error) {
        setLoadState({ userId, request: retryCount, loading: false, error: error.message })
        return
      }

      setPrefs(normalizePreferences(data?.preferences))
      setLoadState({ userId, request: retryCount, loading: false, error: null })
    })().catch((cause: unknown) => {
      if (!active) return
      setLoadState({
        userId,
        request: retryCount,
        loading: false,
        error: cause instanceof Error ? cause.message : 'Unable to load preferences.',
      })
    })

    return () => {
      active = false
    }
  }, [userId, retryCount])

  const savePreferences = async (nextPreferences: Preferences) => {
    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          preferences: nextPreferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )

    if (error) throw error
    setPrefs(nextPreferences)
  }

  return {
    prefs,
    loading: loadState.userId !== userId || loadState.request !== retryCount || loadState.loading,
    error: loadState.userId === userId && loadState.request === retryCount ? loadState.error : null,
    savePreferences,
    retry: () => setRetryCount((count) => count + 1),
  } as const
}
