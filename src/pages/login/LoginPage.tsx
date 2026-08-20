import React, { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../features/auth/useAuth'
import { requestPasswordReset } from '../../features/auth/api'
import { LanguageSwitcher } from '../../shared/ui/LanguageSwitcher'

function safeInternalPath(value: unknown) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')
    ? value
    : '/dashboard'
}

export function LoginPage() {
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation(['auth', 'common', 'errors'])
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate(safeInternalPath((location.state as { from?: unknown } | null)?.from), { replace: true })
      } else if (mode === 'register') {
        await signUp(email, password)
        setNotice('Аккаунт создан. Проверьте почту и перейдите по ссылке из письма.')
        setMode('login')
        setPassword('')
        return
      } else {
        await requestPasswordReset(email)
        setNotice('Если такой адрес зарегистрирован, письмо для сброса пароля уже отправлено.')
        setMode('login')
        return
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : mode === 'login' ? t('auth:button.signingIn') : t('auth:button.creatingAccount'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-mark small">CA</div>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em', color: 'var(--color-fg)' }}>
              Call Analyse
            </span>
          </div>
          <LanguageSwitcher />
        </div>

        <h1>{mode === 'login' ? t('auth:title.login') : mode === 'register' ? t('auth:title.register') : 'Сброс пароля'}</h1>
        <p className="muted">{mode === 'login' ? t('auth:sub.login') : mode === 'register' ? t('auth:sub.register') : 'Введите email, и мы отправим ссылку для сброса пароля.'}</p>

        <form onSubmit={submit} className="stack">
          <label>
            {t('auth:field.email')}
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
              placeholder={t('auth:field.emailPlaceholder')}
            />
          </label>
          {mode !== 'forgot' && <label>
            {t('auth:field.password')}
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
              placeholder={t('auth:field.passwordPlaceholder')}
            />
          </label>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {notice && <p role="status">{notice}</p>}
          <button className="button button-primary" style={{ padding: '10px 18px', fontSize: '14px', marginTop: '8px' }} disabled={busy}>
            {mode === 'forgot'
              ? busy ? 'Отправка…' : 'Отправить ссылку'
              : busy
              ? mode === 'login'
                ? t('auth:button.signingIn')
                : t('auth:button.creatingAccount')
              : mode === 'login'
                ? t('auth:button.signIn')
                : t('auth:button.signUp')}
          </button>
          {mode === 'login' && <button
            type="button"
            className="button button-ghost"
            style={{ padding: '0 4px', textDecoration: 'underline', display: 'inline-flex', alignSelf: 'center' }}
            onClick={() => {
              setMode('forgot')
              setError('')
              setNotice('')
            }}
          >
            Забыли пароль?
          </button>}
          <p className="muted" style={{ fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>
            {mode === 'forgot' ? 'Вспомнили пароль? ' : mode === 'login' ? t('auth:switch.noAccount') : t('auth:switch.hasAccount')}
            <button
              type="button"
              className="button button-ghost"
              style={{ padding: '0 4px', textDecoration: 'underline', display: 'inline-flex' }}
              onClick={() => {
                setMode(mode === 'forgot' ? 'login' : mode === 'login' ? 'register' : 'login')
                setError('')
                setNotice('')
              }}
            >
              {mode === 'forgot' ? 'Войти' : mode === 'login' ? t('auth:switch.toSignUp') : t('auth:switch.toSignIn')}
            </button>
          </p>
        </form>
      </section>
      <aside className="auth-aside">
        <span>{t('auth:quote.badge')}</span>
        <p>{t('auth:quote.text')}</p>
      </aside>
    </main>
  )
}
