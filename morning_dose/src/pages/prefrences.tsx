/*
Preferences page (Sprint 1 Story 2 / backlog #7).
Builds on Felix's and Riley's versions: topic names/descriptions come from
MODULES in src/modules.ts, on/off is saved with saveEnabledModules(), and
changes are a draft until the user presses Save.
Choose which topics show, their order, and what each topic pulls.
These values are what get sent to the backend pollers.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import { useState } from 'react'
import type { ReactNode } from 'react'
import './prefrences.css'
import { leagueOptions, newsSourceOptions, stockOptions } from '../api/options'
import { defaultPreferences } from '../hooks/usePreferences'
import { TOPICS } from '../topics/registry'
import type { Preferences, TopicId } from '../types'

type Props = {
  prefs: Preferences // the draft being edited
  onChange: (p: Preferences) => void // update the draft
  onSave: () => void // tell App to keep the draft
  onDiscard: () => void // throw the draft away
  dirty: boolean // draft differs from what's saved
  justSaved: boolean
}

const toggle = (list: string[], item: string) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item]

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="pref-section">
      <h2 className="pref-title">{title}</h2>
      {hint && <p className="pref-hint">{hint}</p>}
      {children}
    </section>
  )
}

/** On/off switch: a checkbox styled in prefrences.css */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <input
      type="checkbox"
      role="switch"
      className="switch"
      aria-label={label}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  )
}

/** Grid of tiles; each tile can be selected or not */
function TileGrid({ options, selected, onToggle }: {
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  return (
    <div className="tiles">
      {options.map((o) => {
        const on = selected.includes(o.value)
        return (
          <button key={o.value} className={on ? 'tile on' : 'tile'} aria-pressed={on} onClick={() => onToggle(o.value)}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export default function Prefrences({ prefs, onChange, onSave, onDiscard, dirty, justSaved }: Props) {
  const [keywordDraft, setKeywordDraft] = useState('')
  const set = (patch: Partial<Preferences>) => onChange({ ...prefs, ...patch })
  const enabledCount = prefs.topicOrder.filter((id) => prefs.enabled[id]).length

  const move = (id: TopicId, dir: -1 | 1) => {
    const order = [...prefs.topicOrder]
    const i = order.indexOf(id)
    const j = i + dir
    if (j < 0 || j >= order.length) return
    ;[order[i], order[j]] = [order[j], order[i]]
    set({ topicOrder: order })
  }

  const addKeyword = () => {
    const k = keywordDraft.trim()
    if (k && !prefs.newsKeywords.includes(k)) set({ newsKeywords: [...prefs.newsKeywords, k] })
    setKeywordDraft('')
  }

  return (
    <div className="prefs">
      <Section title="Topics" hint="Choose which cards you see and the order they come in.">
        <ol className="topic-list">
          {prefs.topicOrder.map((id, i) => (
            <li key={id} className={prefs.enabled[id] ? 'topic-row' : 'topic-row off'}>
              <span className="topic-order" aria-hidden>{i + 1}</span>
              <span className="topic-text">
                <span className="topic-name">{TOPICS[id].label}</span>
                <span className="topic-desc">{TOPICS[id].description}</span>
              </span>
              <span className="topic-move">
                <button className="icon-btn" aria-label={`Move ${TOPICS[id].label} up`} disabled={i === 0} onClick={() => move(id, -1)}>
                  <Arrow up />
                </button>
                <button className="icon-btn" aria-label={`Move ${TOPICS[id].label} down`} disabled={i === prefs.topicOrder.length - 1} onClick={() => move(id, 1)}>
                  <Arrow />
                </button>
              </span>
              <Toggle
                label={`Show ${TOPICS[id].label}`}
                checked={prefs.enabled[id]}
                onChange={(v) => set({ enabled: { ...prefs.enabled, [id]: v } })}
              />
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Weather" hint="Forecast location.">
        <input
          className="field"
          aria-label="Weather location"
          value={prefs.location}
          onChange={(e) => set({ location: e.target.value })}
          placeholder="City, State"
        />
      </Section>

      <Section title="News" hint="Latest articles that mention your keywords, plus top headlines from the sources you pick.">
        <form
          className="field tag-field"
          onSubmit={(e) => {
            e.preventDefault()
            addKeyword()
          }}
        >
          {prefs.newsKeywords.map((k) => (
            <span key={k} className="tag">
              {k}
              <button type="button" aria-label={`Remove ${k}`} onClick={() => set({ newsKeywords: toggle(prefs.newsKeywords, k) })}>
                <Cross />
              </button>
            </span>
          ))}
          <input
            aria-label="Add keyword"
            placeholder={prefs.newsKeywords.length ? 'Add another' : 'Add a keyword'}
            value={keywordDraft}
            onChange={(e) => setKeywordDraft(e.target.value)}
            onBlur={addKeyword}
          />
        </form>
        <h3 className="pref-subtitle">Sources</h3>
        <TileGrid
          options={newsSourceOptions.map((s) => ({ value: s.id, label: s.label }))}
          selected={prefs.newsSources}
          onToggle={(v) => set({ newsSources: toggle(prefs.newsSources, v) })}
        />
      </Section>

      <Section title="Stocks" hint="Companies to follow.">
        <TileGrid
          options={stockOptions.map((s) => ({ value: s, label: s }))}
          selected={prefs.stocks}
          onToggle={(v) => set({ stocks: toggle(prefs.stocks, v) })}
        />
      </Section>

      <Section title="Sports" hint="Leagues to show scores for. Pick none to see all of them.">
        <TileGrid
          options={leagueOptions.map((s) => ({ value: s, label: s }))}
          selected={prefs.leagues}
          onToggle={(v) => set({ leagues: toggle(prefs.leagues, v) })}
        />
      </Section>

      <button className="reset-btn" onClick={() => onChange(defaultPreferences)}>Reset to defaults</button>

      <footer className="prefs-footer">
        <span className="muted small" aria-live="polite">
          {dirty ? 'Unsaved changes' : justSaved ? 'Saved' : `${enabledCount} of ${prefs.topicOrder.length} topics on`}
        </span>
        <span className="prefs-actions">
          {dirty && <button className="button secondary" onClick={onDiscard}>Discard</button>}
          <button className="button" onClick={onSave} disabled={!dirty}>Save</button>
        </span>
      </footer>
    </div>
  )
}

function Arrow({ up = false }: { up?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden style={{ transform: up ? 'rotate(180deg)' : undefined }}>
      <path d="M7 2v10M3 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Cross() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
