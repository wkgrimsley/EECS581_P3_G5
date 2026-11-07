// Content of the Stocks card. Data arrives already converted by src/api/stocks.ts;
// the card title and description come from modules.ts (see StoryCard.tsx).
import type { StockQuote } from '../types'

export default function StocksPage({ data }: { data: StockQuote[] }) {
  if (data.length === 0) {
    return (
      <div className="story-message">
        <h3>No stocks selected</h3>
        <p className="muted small">Choose stocks to follow in Preferences.</p>
      </div>
    )
  }
  return (
    <ul className="rows">
      {data.map((q) => {
        const up = q.change >= 0
        return (
          <li key={q.symbol} className="quote">
            <div>
              <div className="symbol">{q.symbol}</div>
              <div className="name">{q.name}</div>
            </div>
            <div className="price num">
              <div>{q.price.toFixed(2)}</div>
              <span className={`change num ${up ? 'positive' : 'negative'}`}>
                {up ? '+' : '−'}{Math.abs(q.changePct).toFixed(2)}%
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
