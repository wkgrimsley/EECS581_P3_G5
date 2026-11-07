// Content of the Weather card. Data arrives already converted by src/api/weather.ts;
// the card title and description come from modules.ts (see StoryCard.tsx).
import type { WeatherSnapshot } from '../types'

const hour = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: 'numeric' })

export default function WeatherPage({ data }: { data: WeatherSnapshot }) {
  return (
    <>
      <p className="weather-location">{data.location}</p>
      <p className="weather-temp num">{Math.round(data.tempF)}°</p>
      <p className="weather-summary">{data.condition}</p>
      <p className="weather-range num">
        High {Math.round(data.highF)}°, low {Math.round(data.lowF)}°
      </p>
      {data.hourly.length > 0 && (
        <ul className="hourly">
          {data.hourly.map((h, i) => (
            <li key={h.time}>
              <span className="muted">{i === 0 ? 'Now' : hour(h.time)}</span>
              <span className="num">{Math.round(h.tempF)}°</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
