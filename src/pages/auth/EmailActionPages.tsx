import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword, verifyEmail } from '../../features/auth/api'

function AuthActionCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-card">{children}</section>
    </main>
  )
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setState('error')
      return
    }
    verifyEmail(token).then(() => setState('success')).catch(() => setState('error'))
  }, [searchParams])

  return (
    <AuthActionCard>
      <h1>{state === 'loading' ? 'Подтверждение почты' : state === 'success' ? 'Почта подтверждена' : 'Ссылка недействительна'}</h1>
      <p className="muted">
        {state === 'loading'
          ? 'Проверяем ссылку…'
          : state === 'success'
            ? 'Теперь вы можете войти в аккаунт.'
            : 'Ссылка устарела или уже использована. Запросите новое письмо.'}
      </p>
      {state !== 'loading' && <Link className="button button-primary" to="/login">Перейти ко входу</Link>}
    </AuthActionCard>
  )
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const token = searchParams.get('token') ?? ''

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!token) {
      setError('Ссылка для сброса пароля отсутствует.')
      return
    }
    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов.')
      return
    }
    if (password !== confirmation) {
      setError('Пароли не совпадают.')
      return
    }
    setBusy(true)
    try {
      await resetPassword(token, password)
      setMessage('Пароль изменён. Теперь можно войти в аккаунт.')
      setPassword('')
      setConfirmation('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось изменить пароль.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthActionCard>
      <h1>Новый пароль</h1>
      <p className="muted">Введите новый пароль для аккаунта.</p>
      <form onSubmit={submit} className="stack">
        <label>
          Новый пароль
          <input type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required />
        </label>
        <label>
          Повторите пароль
          <input type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <button className="button button-primary" disabled={busy || Boolean(message)}>
          {busy ? 'Сохранение…' : 'Изменить пароль'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: '16px' }}><Link to="/login">Вернуться ко входу</Link></p>
    </AuthActionCard>
  )
}
