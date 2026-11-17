/*
Notes and daily reminders (Sprint 2 Story 3, backlog #8 and #11)

Right now everything is saved in the browser with localStorage.
Once Bill's user accounts are done (Sprint 2 Story 4) we just need to change
loadNotes() and saveNotes() to call the backend. The Notes card stays the same.

Author: Jamareon Davis
Creation Date: 2026-11-17
*/
import type { Note, NotesData, Reminder } from '../types'

const STORAGE_KEY = 'morningDose.notes'

const empty: NotesData = { reminders: [], notes: [] }

// gets today's date in the user's time zone as YYYY-MM-DD
export const todayKey = (now = new Date()) => now.toLocaleDateString('en-CA')

// turns a saved timestamp into the date it happened on (YYYY-MM-DD)
export const dateKeyOf = (iso: string) => todayKey(new Date(iso))

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export async function loadNotes(): Promise<NotesData> {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<NotesData> | null
    return { reminders: saved?.reminders ?? [], notes: saved?.notes ?? [] }
  } catch {
    return empty
  }
}

export async function saveNotes(data: NotesData): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage might not work (like in private browsing), so changes only last until the page is closed
  }
}

// Changes to notes and reminders
// each of these returns a new copy of the data and the card saves it

export const addReminder = (data: NotesData, text: string): NotesData => ({
  ...data,
  reminders: [...data.reminders, { id: newId(), text }],
})

// checks a reminder off for today, or unchecks it if it's already done
export const toggleReminder = (data: NotesData, id: string, today = todayKey()): NotesData => ({
  ...data,
  reminders: data.reminders.map((r): Reminder =>
    r.id === id ? { ...r, doneOn: r.doneOn === today ? undefined : today } : r,
  ),
})

export const deleteReminder = (data: NotesData, id: string): NotesData => ({
  ...data,
  reminders: data.reminders.filter((r) => r.id !== id),
})

export const addNote = (data: NotesData, text: string, now = new Date()): NotesData => ({
  ...data,
  notes: [{ id: newId(), text, createdAt: now.toISOString() }, ...data.notes],
})

export const deleteNote = (data: NotesData, id: string): NotesData => ({
  ...data,
  notes: data.notes.filter((n: Note) => n.id !== id),
})
