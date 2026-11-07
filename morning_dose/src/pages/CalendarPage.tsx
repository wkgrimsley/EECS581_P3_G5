// Content of the Calendar card. Data arrives already converted by src/api/calendar.ts;
// the card title and description come from modules.ts (see StoryCard.tsx).
import type { CalendarEvent } from '../types'
import { clockTime } from '../utils/format'

// Start time on top, end time underneath (like the iOS Calendar list)
function Time({ e }: { e: CalendarEvent }) {
  if (e.allDay) return <span className="event-time">All day</span>
  return (
    <span className="event-time num">
      <span>{clockTime(e.start)}</span>
      {e.end && <span className="muted">{clockTime(e.end)}</span>}
    </span>
  )
}

export default function CalendarPage({ data }: { data: CalendarEvent[] }) {
  if (data.length === 0) {
    return (
      <div className="story-message">
        <h3>Nothing scheduled today</h3>
      </div>
    )
  }
  return (
    <ul className="rows">
      {data.map((e) => (
        <li key={e.id} className="event">
          <Time e={e} />
          <span>
            <span className="event-title">{e.title}</span>
            {e.location && <span className="muted small event-location">{e.location}</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}
