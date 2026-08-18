import React, { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'

function safeInternalPath(value: unknown) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')
    ? value
    : '/dashboard'
}

export function LoginPage() {
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      navigate(safeInternalPath((location.state as { from?: unknown } | null)?.from), { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : mode === 'login' ? 'Unable to sign in' : 'Unable to create account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-mark">CA</div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>
            CALL ANALYSE
          </span>
        </div>
        <h1>{mode === 'login' ? 'Make every conversation count.' : 'Join Call Analyse workspace.'}</h1>
        <p className="muted">
          {mode === 'login'
            ? 'Review calls, spot coaching opportunities, and turn insights into action.'
            : 'Create your account to start analyzing sales calls and track performance.'}
        </p>

        <form onSubmit={submit} className="stack">
          <label>
            Email
            <input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required placeholder="name@company.com" />
          </label>
          <label>
            Password
            <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} required placeholder="••••••••" />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-primary" style={{ padding: '12px', fontSize: '14px' }} disabled={busy}>
            {busy ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
          <p className="muted" style={{ fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="button button-ghost"
              style={{ padding: '0 4px', textDecoration: 'underline' }}
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError('')
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </section>
      <aside className="auth-aside">
        <span>ENTERPRISE AI PLATFORM</span>
        <p>“The best coaching starts with a clear picture of what actually happened.”</p>
      </aside>
    </main>
  )
}
