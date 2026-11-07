/*
Stock data for the Stocks story card.

TO GO LIVE:
  1. Register the poller in backend.py:  POLLER_FILES["stocks"] = "stocks_poller.py"
     and forward "symbols" to it in run_poller() (e.g. --symbol AAPL --symbol MSFT).
  2. Set stocks: true in src/api/config.ts.
  3. If the poller's JSON differs from StocksPollerResponse below, edit toStockQuotes().

Request sent:  POST /api/poll  {"poller": "stocks", "symbols": ["AAPL", "MSFT"]}

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import type { Preferences, StockQuote } from '../types'
import { pollBackend } from './client'
import { isLive } from './config'
import { mockStocks } from './mockData'

// Expected poller output. Easiest path: have the poller print exactly this.
interface StocksPollerResponse {
  quotes: {
    symbol: string
    name?: string
    price: number
    change: number
    changePct?: number
  }[]
}

function toStockQuotes(raw: StocksPollerResponse): StockQuote[] {
  return (raw.quotes ?? []).map((q) => ({
    symbol: q.symbol,
    name: q.name ?? q.symbol,
    price: q.price,
    change: q.change,
    changePct: q.changePct ?? (q.price ? (q.change / (q.price - q.change)) * 100 : 0),
  }))
}

export async function fetchStocks(prefs: Preferences): Promise<StockQuote[]> {
  if (!isLive('stocks')) return mockStocks.filter((s) => prefs.stocks.includes(s.symbol))
  if (prefs.stocks.length === 0) return []

  const raw = await pollBackend<StocksPollerResponse>('stocks', { symbols: prefs.stocks })
  return toStockQuotes(raw)
}
