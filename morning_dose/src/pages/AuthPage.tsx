import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import './AuthPage.css'

type Props = { authError: string | null }

export default function AuthPage({ authError }: Props) {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'signUp') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        if (!data.session) {
          setMessage('Account created. Check your email to confirm your address, then sign in.')
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Authentication failed. Please try again.')
    } finally {
      setPending(false)
    }
  }

  const changeMode = (nextMode: 'signIn' | 'signUp') => {
    setMode(nextMode)
    setError(null)
    setMessage(null)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1 className="page-title">Morning Dose</h1>
        <p className="muted">{mode === 'signIn' ? 'Sign in to continue.' : 'Create an account to save your preferences.'}</p>

        <form className="auth-form" onSubmit={(event) => void submit(event)}>
          <label>
            Email
            <input
              autoComplete="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {(error || authError) && <p className="auth-message error" role="alert">{error ?? authError}</p>}
          {message && <p className="auth-message" role="status">{message}</p>}
          <button className="button auth-submit" type="submit" disabled={pending}>
            {pending ? 'Please wait…' : mode === 'signIn' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'signIn' ? 'New here?' : 'Already have an account?'}{' '}
          <button
            type="button"
            className="text-button"
            onClick={() => changeMode(mode === 'signIn' ? 'signUp' : 'signIn')}
          >
            {mode === 'signIn' ? 'Create account' : 'Sign in'}
          </button>
        </p>
      </section>
    </main>
  )
}
