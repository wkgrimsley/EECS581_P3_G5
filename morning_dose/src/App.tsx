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
import { useAuth } from './auth/useAuth'
import { MoreMenu } from './components/MoreMenu'
import { StoryDeck } from './components/StoryDeck'
import { usePreferences } from './hooks/usePreferences'
import AuthPage from './pages/AuthPage'
import Prefrences from './pages/prefrences.tsx'
import type { Preferences } from './types'

export default function App() {
  const { user, loading, error: authError, signOut } = useAuth()

  if (loading) {
    return <main className="auth-page"><p className="muted">Checking your session…</p></main>
  }
  if (!user) return <AuthPage authError={authError} />

  return <SignedInApp key={user.id} userId={user.id} signOut={signOut} />
}

function SignedInApp({ userId, signOut }: { userId: string; signOut: () => Promise<void> }) {
  const { prefs, loading, error, savePreferences, retry } = usePreferences(userId)
  const [draft, setDraft] = useState<Preferences | null>(null) // being edited on the Preferences page
  const [justSaved, setJustSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [now] = useState(() => new Date())
  const [deckKey, setDeckKey] = useState(0) // bump to restart the deck from the first card

  const view = draft ? 'prefs' : 'home'
  const visibleTopics = prefs.topicOrder.filter((id) => prefs.enabled[id])
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(prefs)

  const openPreferences = () => {
    setDraft(prefs)
    setJustSaved(false)
    setSaveError(null)
  }
  const closePreferences = () => {
    setDraft(null) // closing without saving discards changes
    setSaveError(null)
  }
  const save = async () => {
    if (!draft || saving) return
    setSaving(true)
    setSaveError(null)
    try {
      await savePreferences(draft)
      setJustSaved(true)
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : 'Unable to save preferences.')
    } finally {
      setSaving(false)
    }
  }
  const handleSignOut = () => {
    void signOut().catch((cause: unknown) => {
      setAccountError(cause instanceof Error ? cause.message : 'Unable to sign out.')
    })
  }

  useEffect(() => {
    document.documentElement.classList.toggle('lock', view === 'home')
    if (view === 'prefs') window.scrollTo(0, 0)
  }, [view])

  if (loading) {
    return <main className="auth-page"><p className="muted">Loading your preferences…</p></main>
  }

  if (error) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1 className="page-title">Couldn’t load preferences</h1>
          <p className="auth-message error" role="alert">{error}</p>
          <button className="button" onClick={retry}>Try again</button>
          <button className="button secondary" onClick={handleSignOut}>Sign out</button>
        </section>
      </main>
    )
  }

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
              { label: 'Sign out', onSelect: handleSignOut },
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

      {accountError && <p className="auth-message error" role="alert">{accountError}</p>}

      {draft ? (
        <Prefrences
          prefs={draft}
          onChange={(p) => {
            setDraft(p)
            setJustSaved(false)
            setSaveError(null)
          }}
          onSave={() => void save()}
          onDiscard={() => {
            setDraft(prefs)
            setSaveError(null)
          }}
          dirty={dirty}
          justSaved={justSaved}
          saving={saving}
          saveError={saveError}
        />
      ) : (
        <StoryDeck key={deckKey} topics={visibleTopics} prefs={prefs} onOpenPreferences={openPreferences} />
      )}
    </div>
  )
}
