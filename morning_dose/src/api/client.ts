/*
Small HTTP helpers for talking to the Flask backend.
Every topic adapter in this folder goes through these, so error handling
and the backend URL live in one place.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import { API_BASE } from './config'

export class BackendError extends Error {}

const BACKEND_DOWN =
  "Can't reach the backend. Is backend.py running on port 5000? " +
  '(Or set VITE_USE_MOCKS=true in morning_dose/.env.local to use placeholder data.)'

/** POST a JSON body and return the parsed JSON response. */
export async function postJSON<T>(path: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new BackendError(BACKEND_DOWN)
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    // backend.py returns {"error": "..."} on failure
    if (data?.error) throw new BackendError(data.error)
    // Vite's proxy answers 5xx with no body when Flask isn't running
    throw new BackendError(res.status >= 500 ? BACKEND_DOWN : `Backend returned ${res.status}`)
  }
  return data as T
}

/**
 * Call the generic poll route: POST /api/poll {"poller": name, ...preferences}
 * Use this for any poller registered in POLLER_FILES in backend.py.
 */
export function pollBackend<T>(poller: string, preferences: Record<string, unknown>): Promise<T> {
  return postJSON<T>('/api/poll', { poller, ...preferences })
}
