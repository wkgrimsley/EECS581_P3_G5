// Notes card: shows the daily reminders and the user's notes.
// The data comes from src/api/notes.ts and every change gets saved right away.
import { useState } from 'react'
import {
  addNote,
  addReminder,
  dateKeyOf,
  deleteNote,
  deleteReminder,
  saveNotes,
  todayKey,
  toggleReminder,
} from '../api/notes'
import type { Note, NotesData } from '../types'
import { clockTime } from '../utils/format'

const yesterdayKey = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return todayKey(d)
}

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

function Cross() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NoteItem({ note, when, onDelete }: { note: Note; when: string; onDelete: () => void }) {
  return (
    <li className="note">
      <p className="note-text">{note.text}</p>
      <div className="note-meta">
        <span>{when}</span>
        <button className="note-delete" aria-label="Delete note" onClick={onDelete}>
          <Cross />
        </button>
      </div>
    </li>
  )
}

export default function NotesPage({ data }: { data: NotesData }) {
  const [state, setState] = useState(data)
  const [reminderDraft, setReminderDraft] = useState('')
  const [noteDraft, setNoteDraft] = useState('')
  const [showEarlier, setShowEarlier] = useState(false)

  const update = (next: NotesData) => {
    setState(next)
    void saveNotes(next)
  }

  const today = todayKey()
  const yesterday = yesterdayKey()
  const doneCount = state.reminders.filter((r) => r.doneOn === today).length
  const todays = state.notes.filter((n) => dateKeyOf(n.createdAt) === today)
  const yesterdays = state.notes.filter((n) => dateKeyOf(n.createdAt) === yesterday)
  const earlier = state.notes.filter((n) => ![today, yesterday].includes(dateKeyOf(n.createdAt)))

  const submitReminder = () => {
    const text = reminderDraft.trim()
    if (text) update(addReminder(state, text))
    setReminderDraft('')
  }
  const submitNote = () => {
    const text = noteDraft.trim()
    if (text) update(addNote(state, text))
    setNoteDraft('')
  }

  return (
    <div className="notes">
      <section>
        <div className="notes-heading">
          <h3>Reminders</h3>
          {state.reminders.length > 0 && (
            <span className="muted small">{doneCount} of {state.reminders.length} done today</span>
          )}
        </div>
        {state.reminders.length === 0 && (
          <p className="muted small notes-empty">Add things to remember every morning.</p>
        )}
        <ul className="reminders">
          {state.reminders.map((r) => {
            const done = r.doneOn === today
            return (
              <li key={r.id} className={done ? 'reminder done' : 'reminder'}>
                <button
                  className="reminder-check"
                  role="checkbox"
                  aria-checked={done}
                  aria-label={`${r.text}${done ? ', done today' : ''}`}
                  onClick={() => update(toggleReminder(state, r.id))}
                >
                  {done && <Check />}
                </button>
                <span className="reminder-text">{r.text}</span>
                <button className="note-delete" aria-label={`Delete reminder ${r.text}`} onClick={() => update(deleteReminder(state, r.id))}>
                  <Cross />
                </button>
              </li>
            )
          })}
        </ul>
        <form
          className="notes-add"
          onSubmit={(e) => {
            e.preventDefault()
            submitReminder()
          }}
        >
          <input aria-label="New reminder" placeholder="Add a reminder" value={reminderDraft} onChange={(e) => setReminderDraft(e.target.value)} />
          {reminderDraft.trim() && <button type="submit" className="button secondary small-btn">Add</button>}
        </form>
      </section>

      <section>
        <div className="notes-heading">
          <h3>Notes</h3>
        </div>
        <form
          className="notes-add notes-add-note"
          onSubmit={(e) => {
            e.preventDefault()
            submitNote()
          }}
        >
          <textarea
            aria-label="New note"
            placeholder="Write a note"
            rows={2}
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onKeyDown={(e) => {
              // Cmd/Ctrl + Enter adds the note, regular Enter just goes to a new line
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                submitNote()
              }
            }}
          />
          {noteDraft.trim() && <button type="submit" className="button secondary small-btn">Add note</button>}
        </form>

        {state.notes.length === 0 && <p className="muted small notes-empty">Notes you write show up here the next morning too.</p>}

        <ul className="note-list">
          {todays.map((n) => (
            <NoteItem key={n.id} note={n} when={`Today, ${clockTime(n.createdAt)}`} onDelete={() => update(deleteNote(state, n.id))} />
          ))}
          {yesterdays.map((n) => (
            <NoteItem key={n.id} note={n} when={`Yesterday, ${clockTime(n.createdAt)}`} onDelete={() => update(deleteNote(state, n.id))} />
          ))}
          {showEarlier &&
            earlier.map((n) => (
              <NoteItem key={n.id} note={n} when={longDate(n.createdAt)} onDelete={() => update(deleteNote(state, n.id))} />
            ))}
        </ul>
        {earlier.length > 0 && (
          <button className="show-earlier" onClick={() => setShowEarlier((v) => !v)}>
            {showEarlier ? 'Hide earlier notes' : `Show earlier notes (${earlier.length})`}
          </button>
        )}
      </section>
    </div>
  )
}
