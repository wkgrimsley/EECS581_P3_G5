/*
One story card: loads its topic's data and shows it, with loading and error states.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import '../pages/cards.css'
import { useAsync } from '../hooks/useAsync'
import type { TopicDefinition } from '../topics/registry'
import type { Preferences } from '../types'

export function StoryCard({ topic, prefs }: { topic: TopicDefinition<unknown>; prefs: Preferences }) {
  const [state, reload] = useAsync(() => topic.load(prefs), topic.deps(prefs))
  const { View } = topic

  return (
    <article className="story-card">
      <header className="story-header">
        <h2>{topic.label}</h2>
      </header>
      <div className="story-body">
        {state.status === 'loading' && (
          <div className="skeleton" aria-label={`Loading ${topic.label}`}>
            <span /><span /><span />
          </div>
        )}
        {state.status === 'error' && (
          <div className="story-message">
            <h3>{topic.label} didn’t load</h3>
            <p className="muted small">{state.error.message}</p>
            <button className="button secondary" onClick={reload}>Retry</button>
          </div>
        )}
        {state.status === 'ready' && <View data={state.data} />}
      </div>
    </article>
  )
}
