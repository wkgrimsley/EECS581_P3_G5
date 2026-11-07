// Content of the News card. Data arrives already converted by src/api/news.ts;
// the card title and description come from modules.ts (see StoryCard.tsx).
import type { NewsItem } from '../types'
import { timeAgo } from '../utils/format'

const MAX_STORIES = 5

export default function NewsPage({ data }: { data: NewsItem[] }) {
  if (data.length === 0) {
    return (
      <div className="story-message">
        <h3>No stories</h3>
        <p className="muted small">Add a keyword or a source in Preferences.</p>
      </div>
    )
  }
  const [lead, ...rest] = data.slice(0, MAX_STORIES)
  return (
    <div className="news">
      <a className="news-lead" href={lead.url} target="_blank" rel="noreferrer">
        {lead.imageUrl && (
          <img
            src={lead.imageUrl}
            alt=""
            loading="lazy"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <h3>{lead.title}</h3>
        {lead.summary && <p className="summary">{lead.summary}</p>}
        <div className="meta"><span>{lead.source}</span><span>{timeAgo(lead.publishedAt)}</span></div>
      </a>
      <ul className="rows">
        {rest.map((n) => (
          <li key={n.id} className="news-item">
            <a href={n.url} target="_blank" rel="noreferrer">
              <h3>{n.title}</h3>
              <div className="meta"><span>{n.source}</span><span>{timeAgo(n.publishedAt)}</span></div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
