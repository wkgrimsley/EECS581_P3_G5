/*
News data for the News story card.

Live source: backend.py  POST /api/news  {"keywords": [...], "sources": [...]}
which runs backend/pollers/news_poller.py and returns
  {"keywords": [NewsAPI article, ...], "sources": [NewsAPI article, ...]}

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import type { NewsItem, Preferences } from '../types'
import { postJSON } from './client'
import { isLive } from './config'
import { mockNews } from './mockData'

// One article as returned by NewsAPI (https://newsapi.org/docs/endpoints/everything)
interface NewsApiArticle {
  source: { id: string | null; name: string }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
}

// Output of news_poller.py
interface NewsPollerResponse {
  keywords: NewsApiArticle[]
  sources: NewsApiArticle[]
}

/** Convert the poller's response into the UI's NewsItem list. Edit this if the poller output changes. */
function toNewsItems(raw: NewsPollerResponse): NewsItem[] {
  const all = [...(raw.sources ?? []), ...(raw.keywords ?? [])]
  const seen = new Set<string>()
  return all
    .filter((a) => a.title && a.title !== '[Removed]' && !seen.has(a.url) && seen.add(a.url))
    .map((a) => ({
      id: a.url,
      title: a.title,
      source: a.source?.name ?? 'Unknown',
      url: a.url,
      summary: a.description ?? undefined,
      imageUrl: a.urlToImage ?? undefined,
      publishedAt: a.publishedAt,
    }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export async function fetchNews(prefs: Preferences): Promise<NewsItem[]> {
  if (!isLive('news')) return mockNews

  // news_poller.py exits with an error if it gets neither keywords nor sources
  if (prefs.newsKeywords.length === 0 && prefs.newsSources.length === 0) return []

  const raw = await postJSON<NewsPollerResponse>('/api/news', {
    keywords: prefs.newsKeywords,
    sources: prefs.newsSources,
  })
  return toNewsItems(raw)
}
