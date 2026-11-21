// Content of the Word of the Day card. Data arrives already converted by
// src/api/wordOfDay.ts; the card title and description come from modules.ts
// (see StoryCard.tsx).
import type { WordOfDay } from '../types'

export default function WordOfDayPage({ data }: { data: WordOfDay | null }) {
  if (!data) {
    return (
      <div className="story-message">
        <h3>No word of the day yet</h3>
      </div>
    )
  }

  // Add the time so the date isn't shifted a day by timezone parsing
  const date = new Date(`${data.date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="word">
      <h2 className="word-title">{data.word}</h2>
      {(data.partOfSpeech || data.pronunciation) && (
        <p className="muted small">
          {[data.partOfSpeech, data.pronunciation].filter(Boolean).join(' · ')}
        </p>
      )}
      {data.definitions && data.definitions.length > 0 && (
        <ol className="word-definitions">
          {data.definitions.slice(0, 3).map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ol>
      )}
      <p className="muted small">{date}</p>
      <a href={data.url} target="_blank" rel="noreferrer">
        Read more on Merriam-Webster →
      </a>
    </div>
  )
}