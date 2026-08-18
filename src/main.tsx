import React, { createContext, useContext, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getCall, getCalls, getDashboard, getMe, login, logout, register, session, uploadCall } from './api'
import type { Call, CallDetail, CallStatus, User } from './types'
import './styles.css'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } })

const AuthContext = createContext<{
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}>({
  user: null,
  loading: true,
  signIn: async () => undefined,
  signUp: async () => undefined,
  signOut: async () => undefined,
})

function useAuth() { return useContext(AuthContext) }

function safeInternalPath(value: unknown) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')
    ? value
    : '/dashboard'
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(session.accessToken))

  useEffect(() => {
    if (!session.accessToken) { setLoading(false); return }
    getMe().then(setUser).catch(() => { session.clear(); setUser(null) }).finally(() => setLoading(false))
  }, [])

  const value = {
    user,
    loading,
    async signIn(email: string, password: string) { setUser(await login(email, password)) },
    async signUp(email: string, password: string) { setUser(await register(email, password)) },
    async signOut() { await logout(); setUser(null); queryClient.clear() },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="screen-loader"><div className="brand-mark">CA</div>Loading workspace…</div>
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

/* ==========================================================================
   SVG ICONS
   ========================================================================== */

function IconOverview() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconCalls() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function IconUpload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

/* ==========================================================================
   AUTH PAGES
   ========================================================================== */

function LoginPage() {
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
    event.preventDefault(); setError(''); setBusy(true)
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
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>CALL ANALYSE</span>
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
            <button type="button" className="button button-ghost" style={{ padding: '0 4px', textDecoration: 'underline' }} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
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

/* ==========================================================================
   APP SHELL & NAVIGATION
   ========================================================================== */

function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('call-analyse.theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('call-analyse.theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">
          <span className="brand-mark small">CA</span>
          <span>Call Analyse</span>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">Workspace</span>
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
            <IconOverview />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/calls" className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
            <IconCalls />
            <span>Calls</span>
          </NavLink>
        </div>

        <div className="sidebar-spacer" />

        <div className="sidebar-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            <span>{theme === 'light' ? 'Dark theme' : 'Light theme'}</span>
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </button>
        </div>

        <div className="user-menu">
          <div className="avatar">{user?.email[0]?.toUpperCase()}</div>
          <div className="user-meta">
            <strong>{user?.email}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="icon-button" title="Sign out" onClick={() => void signOut().then(() => navigate('/login'))}>
            <IconLogout />
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

function PageHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <header className="page-header">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <div className="header-row">
        <h1>{title}</h1>
        {action}
      </div>
    </header>
  )
}

function ErrorState({ message = 'Something went wrong. Please try again.' }: { message?: string }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">!</span>
      <h3>We couldn’t load this view</h3>
      <p>{message}</p>
    </div>
  )
}

function StatCard({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: string }) {
  return (
    <div className={`stat-card ${tone ?? ''}`}>
      <div className="stat-card-header">
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  )
}

function canUpload(role: User['role'] | undefined) { return role === 'manager' || role === 'admin' }

/* ==========================================================================
   DASHBOARD PAGE
   ========================================================================== */

function DashboardPage() {
  const { user } = useAuth()
  const summary = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard })
  const calls = useQuery({ queryKey: ['calls', 1], queryFn: () => getCalls(1, 5) })

  return (
    <>
      <PageHeader
        eyebrow="WORKSPACE OVERVIEW"
        title="Good morning."
        action={
          canUpload(user?.role) && (
            <Link className="button button-primary" to="/calls/new">
              <IconUpload />
              Analyse a call
            </Link>
          )
        }
      />
      {summary.isError ? (
        <ErrorState message={summary.error.message} />
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Total calls" value={summary.data?.totalCalls ?? '—'} hint="All time recordings" />
            <StatCard label="Completed" value={summary.data?.completedCalls ?? '—'} hint="Processed successfully" tone="positive" />
            <StatCard label="Failed" value={summary.data?.failedCalls ?? '—'} hint="Need attention" tone="negative" />
            <StatCard
              label="Average score"
              value={summary.data?.averageScore == null ? '—' : `${Math.round(summary.data.averageScore)}/100`}
              hint="Across completed calls"
              tone="accent"
            />
          </div>

          <section className="content-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">RECENT ACTIVITY</span>
                <h2>Latest calls</h2>
              </div>
              <Link className="text-link" to="/calls">View all →</Link>
            </div>
            {calls.isError ? <ErrorState message={calls.error.message} /> : <CallTable calls={calls.data?.calls ?? []} compact={true} />}
          </section>
        </>
      )}
    </>
  )
}

function statusLabel(status: CallStatus) {
  return (
    {
      uploaded: 'Uploaded',
      queued: 'Queued',
      transcribing: 'Transcribing',
      transcribed: 'Transcribed',
      analyzing: 'Analysing',
      completed: 'Completed',
      failed: 'Failed',
    } satisfies Record<CallStatus, string>
  )[status] ?? 'Unknown status'
}

function StatusPill({ status }: { status: CallStatus }) {
  return (
    <span className={`status-pill status-${status}`}>
      <i />
      {statusLabel(status)}
    </span>
  )
}

function formatDate(value: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

function CallTable({ calls, compact = false }: { calls: Call[]; compact?: boolean }) {
  if (!calls.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon">◌</span>
        <h3>No calls yet</h3>
        <p>Upload your first recording to start analysing conversations.</p>
        <Link className="button button-secondary" to="/calls/new">Upload a call</Link>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Recording</th>
            <th>Status</th>
            <th>Uploaded</th>
            <th>Size</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {calls.map(call => (
            <tr key={call.id}>
              <td>
                <Link className="call-name" to={`/calls/${call.id}`}>
                  {call.originalFilename || 'Untitled recording'}
                </Link>
                <span className="table-sub">{call.id.slice(0, 8)}</span>
              </td>
              <td>
                <StatusPill status={call.status} />
              </td>
              <td>{formatDate(call.createdAt)}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{formatBytes(call.sizeBytes)}</td>
              <td style={{ textAlign: 'right' }}>
                <Link className="row-arrow" to={`/calls/${call.id}`}>→</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {compact && calls.length > 0 && <></>}
    </div>
  )
}

/* ==========================================================================
   CALLS LIBRARY PAGE
   ========================================================================== */

function CallsPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const calls = useQuery({ queryKey: ['calls', page], queryFn: () => getCalls(page) })

  return (
    <>
      <PageHeader
        eyebrow="CALL LIBRARY"
        title="Calls"
        action={
          canUpload(user?.role) && (
            <Link className="button button-primary" to="/calls/new">
              <IconUpload />
              Upload call
            </Link>
          )
        }
      />
      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>All recordings</h2>
            <p className="muted">Review processing status and open detailed analysis.</p>
          </div>
          {calls.data && <span className="result-count">{calls.data.total} total</span>}
        </div>
        {calls.isLoading ? (
          <div className="loading-line" />
        ) : calls.isError ? (
          <ErrorState message={calls.error.message} />
        ) : (
          <>
            <CallTable calls={calls.data?.calls ?? []} />
            {(calls.data?.totalPages ?? 1) > 1 && (
              <div className="pagination">
                <span>Page {page} of {calls.data?.totalPages}</span>
                <div className="pagination-controls">
                  <button disabled={page === 1} onClick={() => setPage(value => value - 1)}>← Previous</button>
                  <button disabled={page === calls.data?.totalPages} onClick={() => setPage(value => value + 1)}>Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}

/* ==========================================================================
   UPLOAD PAGE
   ========================================================================== */

function UploadPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)

  if (!canUpload(user?.role)) return <Navigate to="/calls" replace />

  const mutation = useMutation({
    mutationFn: uploadCall,
    onSuccess: call => {
      queryClient.invalidateQueries({ queryKey: ['calls'] })
      navigate(`/calls/${call.id}`)
    },
  })

  function select(next: File | undefined) {
    if (!next) return
    const allowed = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a']
    if (!allowed.includes(next.type) && !/\.(mp3|wav|m4a)$/i.test(next.name)) {
      mutation.reset()
      return
    }
    setFile(next)
  }

  return (
    <>
      <PageHeader eyebrow="NEW ANALYSIS" title="Upload a call" />
      <div className="upload-layout">
        <section className="content-card upload-card">
          <div
            className={`drop-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={event => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={event => {
              event.preventDefault()
              setDragging(false)
              select(event.dataTransfer.files[0])
            }}
          >
            <div className="upload-icon">
              <IconUpload />
            </div>
            <h2>{file ? file.name : 'Drop a recording here'}</h2>
            <p>{file ? `${formatBytes(file.size)} · ${file.type || 'audio file'}` : 'or choose an audio file from your computer'}</p>
            <label className="button button-secondary">
              Choose file
              <input type="file" accept=".mp3,.wav,.m4a,audio/*" hidden onChange={event => select(event.target.files?.[0])} />
            </label>
            <small>Supported formats: MP3, WAV, M4A</small>
          </div>
          {mutation.isError && <p className="form-error" style={{ marginTop: '16px' }}>{mutation.error.message}</p>}
          <div className="upload-actions">
            <Link className="button button-ghost" to="/calls">Cancel</Link>
            <button className="button button-primary" disabled={!file || mutation.isPending} onClick={() => file && mutation.mutate(file)}>
              {mutation.isPending ? 'Uploading…' : 'Start analysis'}
            </button>
          </div>
        </section>

        <aside className="info-card">
          <span className="eyebrow">WHAT HAPPENS NEXT</span>
          <ol>
            <li>
              <b>Upload</b>
              <span>Your recording is securely stored and parsed.</span>
            </li>
            <li>
              <b>Transcription</b>
              <span>The conversation is converted to text.</span>
            </li>
            <li>
              <b>Analysis</b>
              <span>AI evaluates the call against 8 core criteria.</span>
            </li>
            <li>
              <b>Coaching insights</b>
              <span>Review strengths and recommended next actions.</span>
            </li>
          </ol>
        </aside>
      </div>
    </>
  )
}

/* ==========================================================================
   CALL DETAIL PAGE
   ========================================================================== */

const criteriaLabels: Record<string, string> = {
  greeting: 'Greeting',
  rapport: 'Rapport',
  needs_discovery: 'Needs discovery',
  presentation: 'Presentation',
  objection_handling: 'Objection handling',
  next_action: 'Next action',
  communication: 'Communication',
  closing: 'Closing',
}

function ListBlock({ title, items }: { title: string; items?: string[] }) {
  return (
    <div className="insight-block">
      <h3>{title}</h3>
      {items?.length ? (
        <ul>
          {items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">No observations recorded.</p>
      )}
    </div>
  )
}

function CallDetailPage() {
  const { id } = useParams()
  const detail = useQuery({
    queryKey: ['call', id],
    queryFn: () => getCall(id ?? ''),
    enabled: Boolean(id),
    refetchInterval: query => (['completed', 'failed'].includes(query.state.data?.call.status ?? '') ? false : 4000),
  })

  if (detail.isLoading) return <div className="loading-line" />
  if (detail.isError || !detail.data) return <ErrorState message={detail.error?.message} />

  const data = detail.data

  return (
    <>
      <Link className="back-link" to="/calls">← Back to calls</Link>
      <PageHeader
        eyebrow="CALL ANALYSIS"
        title={data.call.originalFilename || 'Call detail'}
        action={<StatusPill status={data.call.status} />}
      />
      <div className="detail-meta">
        <span>{formatDate(data.call.createdAt)}</span>
        <span>{formatBytes(data.call.sizeBytes)}</span>
        <span>{data.manager?.email ?? 'Manager'}</span>
      </div>

      {data.call.status === 'failed' && (
        <div className="alert alert-error">
          <strong>Analysis couldn’t be completed.</strong>
          <span>Please try uploading the recording again.</span>
        </div>
      )}

      {!['completed', 'failed'].includes(data.call.status) && (
        <div className="pipeline">
          <div className="pipeline-track" />
          <PipelineStep label="Uploaded" active={true} />
          <PipelineStep label="Transcription" active={['transcribing', 'transcribed', 'analyzing'].includes(data.call.status)} />
          <PipelineStep label="AI analysis" active={['analyzing'].includes(data.call.status)} />
          <PipelineStep label="Complete" active={data.call.status === 'completed'} />
        </div>
      )}

      {data.score && (
        <section className="score-overview">
          <div>
            <span className="eyebrow">OVERALL SCORE</span>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '6px' }}>
              <strong>{data.score.total}</strong>
              <span>/ 100</span>
            </div>
          </div>
          <div className="score-ring" style={{ '--score': `${data.score.total}%` } as React.CSSProperties}>
            <span>{data.score.total}%</span>
          </div>
        </section>
      )}

      {data.analysis && (
        <div className="detail-grid">
          <section className="content-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">AI FEEDBACK</span>
                <h2>Analysis summary</h2>
              </div>
            </div>
            <p className="lead">{data.analysis.summary}</p>
            <div className="insights-grid">
              <ListBlock title="Customer needs" items={data.analysis.needs} />
              <ListBlock title="Objections" items={data.analysis.objections} />
              <ListBlock title="Manager strengths" items={data.analysis.strengths} />
              <ListBlock title="Manager mistakes" items={data.analysis.mistakes} />
            </div>
            <div className="next-action">
              <span className="eyebrow">RECOMMENDED NEXT ACTION</span>
              <p>{data.analysis.nextAction}</p>
            </div>
          </section>

          <section className="content-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">SCORING BREAKDOWN</span>
                <h2>Criteria</h2>
              </div>
            </div>
            <div className="criteria-list">
              {Object.entries(data.analysis.criterionResults).map(([key, result]) => (
                <div className="criterion" key={key}>
                  <div>
                    <span>{criteriaLabels[key] ?? key}</span>
                    <b>
                      {result.score}
                      <small>/{result.max}</small>
                    </b>
                  </div>
                  <div className="progress">
                    <i style={{ width: `${result.max ? (result.score / result.max) * 100 : 0}%` }} />
                  </div>
                  {result.feedback && <p>{result.feedback}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {data.transcript && (
        <section className="content-card transcript-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CONVERSATION</span>
              <h2>Transcript</h2>
            </div>
          </div>
          <div className="transcript">
            {data.transcript.segments?.length ? (
              data.transcript.segments.map((segment, index) => (
                <div className={`transcript-line ${segment.speaker}`} key={`${segment.text}-${index}`}>
                  <span>{segment.speaker === 'manager' ? 'Manager' : 'Customer'}</span>
                  <p>{segment.text}</p>
                </div>
              ))
            ) : (
              <p>{data.transcript.text}</p>
            )}
          </div>
        </section>
      )}
    </>
  )
}

function PipelineStep({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`pipeline-step ${active ? 'active' : ''}`}>
      <span>{active ? '✓' : '·'}</span>
      <b>{label}</b>
    </div>
  )
}

/* ==========================================================================
   ROOT ROUTER
   ========================================================================== */

function RootRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calls" element={<CallsPage />} />
          <Route path="/calls/new" element={<UploadPage />} />
          <Route path="/calls/:id" element={<CallDetailPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <RootRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
