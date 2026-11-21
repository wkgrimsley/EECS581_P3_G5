/*
Word of the Day data for the Word of the Day story card.

TO GO LIVE:
  1. Register the poller in backend.py:  POLLER_FILES["wordofday"] = "wotd_puller.py"
  2. Set wordofday: true in src/api/config.ts.
  3. If the poller's JSON differs from WordOfDayPollerResponse below, edit toWordOfDay().

Request sent:  POST /api/poll  {"poller": "wordofday"}

Author: <your name>
Creation Date: 2026-11-21
*/
import type { WordOfDay } from '../types'
import { pollBackend } from './client'
import { isLive } from './config'
import { mockWordOfDay } from './mockData'

// Expected poller output, exactly what wotd_puller.py prints.
interface WordOfDayPollerResponse {
  word_of_the_day?: WordOfDay
}

function toWordOfDay(raw: WordOfDayPollerResponse): WordOfDay | null {
  return raw.word_of_the_day ?? null
}

export async function fetchWordOfDay(): Promise<WordOfDay | null> {
  if (!isLive('wordofday')) return mockWordOfDay()

  const raw = await pollBackend<WordOfDayPollerResponse>('wordofday')
  return toWordOfDay(raw)
}