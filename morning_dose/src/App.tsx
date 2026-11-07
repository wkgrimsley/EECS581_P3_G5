/*
Morning Dose — app shell.
Home is the swipeable story deck; the ⋯ menu opens Preferences.

Earlier versions used <Pager> with Welcome, one page per module, and
Preferences side by side. The story deck replaces the pager because Story 6
needs cards that can be swiped away in any direction; each module's page from
modulePages.tsx is now shown inside its card. Pager.tsx and Welcome.tsx are
left in place in case we want them back.

Like Riley's version, App owns the saved preferences and Preferences edits a
draft that only takes effect when the user presses Save.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import { useEffect, useState } from 'react'
import { MoreMenu } from './components/MoreMenu'
import { StoryDeck } from './components/StoryDeck'
import { usePreferences } from './hooks/usePreferences'
import Prefrences from './pages/prefrences.tsx'
import type { Preferences } from './types'

export default function App() {
  const [prefs, setPrefs] = usePreferences() // saved preferences
  const [draft, setDraft] = useState<Preferences | null>(null) // being edited on the Preferences page
  const [justSaved, setJustSaved] = useState(false)
  const [now] = useState(() => new Date())
  const [deckKey, setDeckKey] = useState(0) // bump to restart the deck from the first card

  const view = draft ? 'prefs' : 'home'
  const visibleTopics = prefs.topicOrder.filter((id) => prefs.enabled[id])
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(prefs)

  const openPreferences = () => {
    setDraft(prefs)
    setJustSaved(false)
  }
  const closePreferences = () => setDraft(null) // closing without saving discards changes
  const save = () => {
    if (!draft) return
    setPrefs(draft)
    setJustSaved(true)
  }

  useEffect(() => {
    document.documentElement.classList.toggle('lock', view === 'home')
    if (view === 'prefs') window.scrollTo(0, 0)
  }, [view])

  return (
    <div className={view === 'home' ? 'app home' : 'app'}>
      <header className="app-header">
        <div>
          <h1 className="page-title">{view === 'home' ? 'Today' : 'Preferences'}</h1>
          {view === 'home' && (
            <p className="date">{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          )}
        </div>
        {view === 'home' ? (
          <MoreMenu
            items={[
              { label: 'Preferences', onSelect: openPreferences },
              { label: 'Start over', onSelect: () => setDeckKey((k) => k + 1) },
            ]}
          />
        ) : (
          <button className="round-btn" aria-label="Close preferences" onClick={closePreferences}>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </header>

      {draft ? (
        <Prefrences
          prefs={draft}
          onChange={(p) => {
            setDraft(p)
            setJustSaved(false)
          }}
          onSave={save}
          onDiscard={() => setDraft(prefs)}
          dirty={dirty}
          justSaved={justSaved}
        />
      ) : (
        <StoryDeck key={deckKey} topics={visibleTopics} prefs={prefs} onOpenPreferences={openPreferences} />
      )}
    </div>
  )
}
