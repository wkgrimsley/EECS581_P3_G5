// Content of the Sports card. Data arrives already converted by src/api/sports.ts;
// the card title and description come from modules.ts (see StoryCard.tsx).
import type { SportsGame } from '../types'
import { clockTime } from '../utils/format'

function Team({ name, score, other, final }: { name: string; score?: number; other?: number; final: boolean }) {
  const cls = final && score !== undefined && other !== undefined ? (score > other ? 'winner' : 'loser') : ''
  return (
    <div className={`team ${cls}`}>
      <span>{name}</span>
      <span className="num">{score ?? ''}</span>
    </div>
  )
}

export default function SportsPage({ data }: { data: SportsGame[] }) {
  if (data.length === 0) {
    return (
      <div className="story-message">
        <h3>No games today</h3>
        <p className="muted small">Change your leagues in Preferences.</p>
      </div>
    )
  }
  return (
    <ul className="rows">
      {data.map((g) => {
        const final = g.status === 'final'
        return (
          <li key={g.id} className="game">
            <div className="status">
              <span>{g.league}</span>
              <span>
                {final ? 'Final' : g.status === 'live' ? <span className="live">Live</span> : clockTime(g.startTime)}
              </span>
            </div>
            <Team name={g.away} score={g.awayScore} other={g.homeScore} final={final} />
            <Team name={g.home} score={g.homeScore} other={g.awayScore} final={final} />
          </li>
        )
      })}
    </ul>
  )
}
