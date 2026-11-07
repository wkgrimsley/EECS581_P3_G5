/*
Runs an async loader and tracks loading / error / ready state.
Re-runs when `deps` change, or when reload() is called.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
/* eslint-disable react-hooks/exhaustive-deps -- callers pass their own deps list */
import { useCallback, useEffect, useState } from 'react'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; data: T }

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    fn()
      .then((data) => !cancelled && setState({ status: 'ready', data }))
      .catch((error: Error) => !cancelled && setState({ status: 'error', error }))
    return () => {
      cancelled = true
    }
  }, [...deps, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  return [state, reload] as const
}
