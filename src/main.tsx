import React, { createContext, useContext, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getCall, getCalls, getDashboard, getMe, login, logout, register, session, uploadCall } from './api'
import type { Call, CallDetail, CallStatus, User } from './types'
import './styles.css'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } })

const AuthContext = createContext<{ user: User | null; loading: boolean; signIn: (email: string, password: string) => Promise<void>; signUp: (email: string, password: string) => Promise<void>; signOut: () => Promise<void> }>({ user: null, loading: true, signIn: async () => undefined, signUp: async () => undefined, signOut: async () => undefined })
function useAuth() { return useContext(AuthContext) }
function safeInternalPath(value: unknown) { return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/dashboard' }

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(session.accessToken))
  useEffect(() => {
    if (!session.accessToken) { setLoading(false); return }
    getMe().then(setUser).catch(() => { session.clear(); setUser(null) }).finally(() => setLoading(false))
  }, [])
  const value = {
    user, loading,
    async signIn(email: string, password: string) { setUser(await login(email, password)) },
    async signUp(email: string, password: string) { setUser(await register(email, password)) },
    async signOut() { await logout(); setUser(null); queryClient.clear() },
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="screen-loader">Loading workspace…</div>
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

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
  return <main className="auth-page"><section className="auth-card"><div className="brand-mark">CA</div><p className="eyebrow">CALL ANALYSE</p><h1>{mode === 'login' ? 'Make every conversation count.' : 'Join Call Analyse workspace.'}</h1><p className="muted">{mode === 'login' ? 'Review calls, spot coaching opportunities, and turn insights into action.' : 'Create your account to start analyzing sales calls and track performance.'}</p><form onSubmit={submit} className="stack"><label>Email<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></label><label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} required /></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary" disabled={busy}>{busy ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign in' : 'Create account')}</button><p className="muted" style={{ fontSize: '13px', margin: '5px 0 0', textAlign: 'center' }}>{mode === 'login' ? "Don't have an account? " : 'Already have an account? '}<button type="button" className="button button-ghost" style={{ padding: '0 4px', textDecoration: 'underline' }} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Sign up' : 'Sign in'}</button></p></form></section><aside className="auth-aside"><span>FIELD NOTE · 01</span><p>“The best coaching starts with a clear picture of what actually happened.”</p></aside></main>
}

function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  return <div className="app-shell"><aside className="sidebar"><div className="logo"><span className="brand-mark small">CA</span><span>Call Analyse</span></div><div className="sidebar-section"><span className="sidebar-label">Workspace</span><NavLink to="/dashboard">Overview</NavLink><NavLink to="/calls">Calls</NavLink></div><div className="sidebar-spacer" /><div className="user-menu"><div className="avatar">{user?.email[0]?.toUpperCase()}</div><div className="user-meta"><strong>{user?.email}</strong><span>{user?.role}</span></div><button className="icon-button" title="Sign out" onClick={() => void signOut().then(() => navigate('/login'))}>↗</button></div></aside><main className="main-content"><Outlet /></main></div>
}

function PageHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) { return <header className="page-header">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<div className="header-row"><h1>{title}</h1>{action}</div></header> }
function ErrorState({ message = 'Something went wrong. Please try again.' }: { message?: string }) { return <div className="empty-state"><span className="empty-icon">!</span><h3>We couldn’t load this view</h3><p>{message}</p></div> }
function StatCard({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: string }) { return <div className={`stat-card ${tone ?? ''}`}><span>{label}</span><strong>{value}</strong>{hint && <small>{hint}</small>}</div> }
function canUpload(role: User['role'] | undefined) { return role === 'manager' || role === 'admin' }

function DashboardPage() {
  const { user } = useAuth()
  const summary = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard })
  const calls = useQuery({ queryKey: ['calls', 1], queryFn: () => getCalls(1, 5) })
  return <><PageHeader eyebrow="WORKSPACE OVERVIEW" title="Good morning." action={canUpload(user?.role) && <Link className="button button-primary" to="/calls/new">+ Analyse a call</Link>} />{summary.isError ? <ErrorState message={summary.error.message} /> : <><div className="stats-grid"><StatCard label="Total calls" value={summary.data?.totalCalls ?? '—'} hint="All time" /><StatCard label="Completed" value={summary.data?.completedCalls ?? '—'} hint="Processed successfully" tone="positive" /><StatCard label="Failed" value={summary.data?.failedCalls ?? '—'} hint="Need attention" tone="negative" /><StatCard label="Average score" value={summary.data?.averageScore == null ? '—' : `${Math.round(summary.data.averageScore)}/100`} hint="Across completed calls" tone="accent" /></div><section className="content-card"><div className="section-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Latest calls</h2></div><Link className="text-link" to="/calls">View all →</Link></div>{calls.isError ? <ErrorState message={calls.error.message} /> : <CallTable calls={calls.data?.calls ?? []} compact={true} />}</section></>}</>
}

function statusLabel(status: CallStatus) { return ({ uploaded: 'Uploaded', queued: 'Queued', transcribing: 'Transcribing', transcribed: 'Transcribed', analyzing: 'Analysing', completed: 'Completed', failed: 'Failed' } satisfies Record<CallStatus, string>)[status] ?? 'Unknown status' }
function StatusPill({ status }: { status: CallStatus }) { return <span className={`status-pill status-${status}`}><i />{statusLabel(status)}</span> }
function formatDate(value: string) { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date) }
function formatBytes(bytes: number) { if (bytes < 1024) return `${bytes} B`; return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB` }
function CallTable({ calls, compact = false }: { calls: Call[]; compact?: boolean }) { if (!calls.length) return <div className="empty-state small"><span className="empty-icon">◌</span><h3>No calls yet</h3><p>Upload your first recording to start analysing conversations.</p><Link className="button button-secondary" to="/calls/new">Upload a call</Link></div>; return <div className="table-wrap"><table><thead><tr><th>Recording</th><th>Status</th><th>Uploaded</th><th>Size</th><th /></tr></thead><tbody>{calls.map(call => <tr key={call.id}><td><Link className="call-name" to={`/calls/${call.id}`}>{call.originalFilename || 'Untitled recording'}</Link><span className="table-sub">{call.id.slice(0, 8)}</span></td><td><StatusPill status={call.status} /></td><td>{formatDate(call.createdAt)}</td><td>{formatBytes(call.sizeBytes)}</td><td><Link className="row-arrow" to={`/calls/${call.id}`}>→</Link></td></tr>)}</tbody></table>{compact && calls.length > 0 && <></>}</div> }

function CallsPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const calls = useQuery({ queryKey: ['calls', page], queryFn: () => getCalls(page) })
  return <><PageHeader eyebrow="CALL LIBRARY" title="Calls" action={canUpload(user?.role) && <Link className="button button-primary" to="/calls/new">+ Upload call</Link>} /><section className="content-card"><div className="section-heading"><div><h2>All recordings</h2><p className="muted">Review processing status and open detailed analysis.</p></div>{calls.data && <span className="result-count">{calls.data.total} total</span>}</div>{calls.isLoading ? <div className="loading-line" /> : calls.isError ? <ErrorState message={calls.error.message} /> : <><CallTable calls={calls.data?.calls ?? []} />{(calls.data?.totalPages ?? 1) > 1 && <div className="pagination"><button disabled={page === 1} onClick={() => setPage(value => value - 1)}>←</button><span>Page {page} of {calls.data?.totalPages}</span><button disabled={page === calls.data?.totalPages} onClick={() => setPage(value => value + 1)}>→</button></div>}</>}</section></>
}

function UploadPage() {
  const { user } = useAuth(); const navigate = useNavigate(); const queryClient = useQueryClient(); const [file, setFile] = useState<File | null>(null); const [dragging, setDragging] = useState(false)
  if (!canUpload(user?.role)) return <Navigate to="/calls" replace />
  const mutation = useMutation({ mutationFn: uploadCall, onSuccess: call => { queryClient.invalidateQueries({ queryKey: ['calls'] }); navigate(`/calls/${call.id}`) } })
  function select(next: File | undefined) { if (!next) return; const allowed = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a']; if (!allowed.includes(next.type) && !/\.(mp3|wav|m4a)$/i.test(next.name)) { mutation.reset(); return } setFile(next) }
  return <><PageHeader eyebrow="NEW ANALYSIS" title="Upload a call" /><div className="upload-layout"><section className="content-card upload-card"><div className={`drop-zone ${dragging ? 'dragging' : ''}`} onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); select(event.dataTransfer.files[0]) }}><span className="upload-icon">↑</span><h2>{file ? file.name : 'Drop a recording here'}</h2><p>{file ? `${formatBytes(file.size)} · ${file.type || 'audio file'}` : 'or choose an audio file from your computer'}</p><label className="button button-secondary">Choose file<input type="file" accept=".mp3,.wav,.m4a,audio/*" hidden onChange={event => select(event.target.files?.[0])} /></label><small>Supported formats: MP3, WAV, M4A</small></div>{mutation.isError && <p className="form-error">{mutation.error.message}</p>}<div className="upload-actions"><Link className="button button-ghost" to="/calls">Cancel</Link><button className="button button-primary" disabled={!file || mutation.isPending} onClick={() => file && mutation.mutate(file)}>{mutation.isPending ? 'Uploading…' : 'Start analysis'}</button></div></section><aside className="info-card"><p className="eyebrow">WHAT HAPPENS NEXT</p><ol><li><b>Upload</b><span>Your recording is securely stored.</span></li><li><b>Transcription</b><span>The conversation is converted to text.</span></li><li><b>Analysis</b><span>AI evaluates the call against 8 criteria.</span></li><li><b>Coaching insights</b><span>Review strengths and next actions.</span></li></ol></aside></div></>
}

const criteriaLabels: Record<string, string> = { greeting: 'Greeting', rapport: 'Rapport', needs_discovery: 'Needs discovery', presentation: 'Presentation', objection_handling: 'Objection handling', next_action: 'Next action', communication: 'Communication', closing: 'Closing' }
const criteriaMax: Record<string, number> = { greeting: 5, rapport: 10, needs_discovery: 20, presentation: 15, objection_handling: 20, next_action: 15, communication: 10, closing: 5 }
function ListBlock({ title, items }: { title: string; items?: string[] }) { return <div className="insight-block"><h3>{title}</h3>{items?.length ? <ul>{items.map(item => <li key={item}>{item}</li>)}</ul> : <p className="muted">No observations recorded.</p>}</div> }
function CallDetailPage() {
  const { id } = useParams(); const detail = useQuery({ queryKey: ['call', id], queryFn: () => getCall(id ?? ''), enabled: Boolean(id), refetchInterval: query => ['completed', 'failed'].includes(query.state.data?.call.status ?? '') ? false : 4000 })
  if (detail.isLoading) return <div className="loading-line" />
  if (detail.isError || !detail.data) return <ErrorState message={detail.error?.message} />
  const data = detail.data
  return <><Link className="back-link" to="/calls">← Back to calls</Link><PageHeader eyebrow="CALL ANALYSIS" title={data.call.originalFilename || 'Call detail'} action={<StatusPill status={data.call.status} />} /><div className="detail-meta"><span>{formatDate(data.call.createdAt)}</span><span>{formatBytes(data.call.sizeBytes)}</span><span>{data.manager?.email ?? 'Manager'}</span></div>{data.call.status === 'failed' && <div className="alert alert-error"><strong>Analysis couldn’t be completed.</strong><span>Please try uploading the recording again.</span></div>}{!['completed', 'failed'].includes(data.call.status) && <div className="pipeline"><div className="pipeline-track" /><PipelineStep label="Uploaded" active={true} /><PipelineStep label="Transcription" active={['transcribing', 'transcribed', 'analyzing'].includes(data.call.status)} /><PipelineStep label="AI analysis" active={['analyzing'].includes(data.call.status)} /><PipelineStep label="Complete" active={data.call.status === 'completed'} /></div>}{data.score && <section className="score-overview"><div><p className="eyebrow">OVERALL SCORE</p><strong>{data.score.total}</strong><span>/ 100</span></div><div className="score-ring" style={{ '--score': `${data.score.total}%` } as React.CSSProperties}><span>{data.score.total}%</span></div></section>}{data.analysis && <div className="detail-grid"><section className="content-card"><div className="section-heading"><div><p className="eyebrow">AI FEEDBACK</p><h2>Analysis summary</h2></div></div><p className="lead">{data.analysis.summary}</p><div className="insights-grid"><ListBlock title="Customer needs" items={data.analysis.needs} /><ListBlock title="Objections" items={data.analysis.objections} /><ListBlock title="Manager strengths" items={data.analysis.strengths} /><ListBlock title="Manager mistakes" items={data.analysis.mistakes} /></div><div className="next-action"><p className="eyebrow">RECOMMENDED NEXT ACTION</p><p>{data.analysis.nextAction}</p></div></section><section className="content-card"><div className="section-heading"><div><p className="eyebrow">SCORING BREAKDOWN</p><h2>Criteria</h2></div></div><div className="criteria-list">{Object.entries(data.analysis.criterionResults).map(([key, result]) => <div className="criterion" key={key}><div><span>{criteriaLabels[key] ?? key}</span><b>{result.score}<small>/{result.max}</small></b></div><div className="progress"><i style={{ width: `${result.max ? result.score / result.max * 100 : 0}%` }} /></div>{result.feedback && <p>{result.feedback}</p>}</div>)}</div></section></div>}{data.transcript && <section className="content-card transcript-card"><div className="section-heading"><div><p className="eyebrow">CONVERSATION</p><h2>Transcript</h2></div></div><div className="transcript">{data.transcript.segments?.length ? data.transcript.segments.map((segment, index) => <div className={`transcript-line ${segment.speaker}`} key={`${segment.text}-${index}`}><span>{segment.speaker === 'manager' ? 'Manager' : 'Customer'}</span><p>{segment.text}</p></div>) : <p>{data.transcript.text}</p>}</div></section>}</>
}
function PipelineStep({ label, active }: { label: string; active: boolean }) { return <div className={`pipeline-step ${active ? 'active' : ''}`}><span>{active ? '✓' : '·'}</span><b>{label}</b></div> }

function RootRoutes() { return <Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute />}><Route element={<AppShell />}><Route path="/dashboard" element={<DashboardPage />} /><Route path="/calls" element={<CallsPage />} /><Route path="/calls/new" element={<UploadPage />} /><Route path="/calls/:id" element={<CallDetailPage />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Route></Route></Routes> }
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><QueryClientProvider client={queryClient}><BrowserRouter><AuthProvider><RootRoutes /></AuthProvider></BrowserRouter></QueryClientProvider></React.StrictMode>)
