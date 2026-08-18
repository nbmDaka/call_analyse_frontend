import type { Analysis, Call, CallDetail, CallPage, CriterionResult, DashboardSummary, Role, User } from './types'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')
const ACCESS_KEY = 'call-analyse.access-token'
const REFRESH_KEY = 'call-analyse.refresh-token'
const CRITERION_MAX: Record<string, number> = { greeting: 5, rapport: 10, needs_discovery: 20, presentation: 15, objection_handling: 20, next_action: 15, communication: 10, closing: 5 }
let refreshPromise: Promise<boolean> | null = null

type TokenPair = { access_token: string; refresh_token: string }
type APIErrorBody = { error?: { message?: string; code?: string } }

export const session = {
  get accessToken() { return localStorage.getItem(ACCESS_KEY) },
  get refreshToken() { return localStorage.getItem(REFRESH_KEY) },
  save(pair: TokenPair) { localStorage.setItem(ACCESS_KEY, pair.access_token); localStorage.setItem(REFRESH_KEY, pair.refresh_token) },
  clear() { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY) },
}

function field<T>(value: Record<string, unknown>, ...names: string[]): T | undefined {
  for (const name of names) if (value[name] !== undefined) return value[name] as T
  return undefined
}

function parseCall(value: unknown): Call {
  const item = value as Record<string, unknown>
  return {
    id: field<string>(item, 'id', 'ID') ?? '',
    managerId: field<string>(item, 'managerId', 'ManagerID') ?? '',
    status: (field<Call['status']>(item, 'status', 'Status') ?? 'uploaded'),
    originalFilename: field<string>(item, 'originalFilename', 'OriginalFilename') ?? '',
    contentType: field<string>(item, 'contentType', 'ContentType') ?? '',
    sizeBytes: field<number>(item, 'sizeBytes', 'SizeBytes') ?? 0,
    durationSeconds: field<number | null>(item, 'durationSeconds', 'DurationSeconds'),
    errorMessage: field<string | null>(item, 'errorMessage', 'ErrorMessage'),
    createdAt: field<string>(item, 'createdAt', 'CreatedAt') ?? '',
    updatedAt: field<string>(item, 'updatedAt', 'UpdatedAt') ?? '',
  }
}

function parseUser(value: unknown): User {
  const item = value as Record<string, unknown>
  return {
    id: field<string>(item, 'id', 'ID') ?? '',
    email: field<string>(item, 'email', 'Email') ?? '',
    role: (field<Role>(item, 'role', 'Role') ?? 'manager'),
    supervisorId: field<string | null>(item, 'supervisorId', 'SupervisorID'),
    createdAt: field<string>(item, 'createdAt', 'CreatedAt'),
  }
}

async function refresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  const token = session.refreshToken
  if (!token) return false
  refreshPromise = (async () => {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: token }) })
    if (!response.ok) { session.clear(); return false }
    session.save(await response.json() as TokenPair)
    return true
  })()
  try { return await refreshPromise } finally { refreshPromise = null }
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers)
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const token = session.accessToken
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (response.status === 401 && retry && await refresh()) return request<T>(path, init, false)
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as APIErrorBody
    throw new Error(body.error?.message ?? 'Request failed')
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function login(email: string, password: string) {
  const pair = await request<TokenPair>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false)
  session.save(pair)
  return getMe()
}

export async function register(email: string, password: string) {
  const pair = await request<TokenPair>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }, false)
  session.save(pair)
  return getMe()
}

export async function logout() {
  const token = session.refreshToken
  if (token) await request('/api/v1/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token: token }) }, false).catch(() => undefined)
  session.clear()
}

export async function getMe() {
  const response = await request<{ user: unknown }>('/api/v1/me')
  return parseUser(response.user)
}

export async function getDashboard() {
  const response = await request<{ summary: Record<string, unknown> }>('/api/v1/dashboard/summary')
  const summary = response.summary
  return {
    totalCalls: field<number>(summary, 'total_calls', 'totalCalls', 'TotalCalls') ?? 0,
    completedCalls: field<number>(summary, 'completed_calls', 'completedCalls', 'CompletedCalls') ?? 0,
    failedCalls: field<number>(summary, 'failed_calls', 'failedCalls', 'FailedCalls') ?? 0,
    averageScore: field<number | null>(summary, 'average_score', 'averageScore', 'AverageScore') ?? null,
  } satisfies DashboardSummary
}

export async function getCalls(page = 1, pageSize = 20): Promise<CallPage> {
  const response = await request<Record<string, unknown>>(`/api/v1/calls?page=${page}&page_size=${pageSize}`)
  const calls = (field<unknown[]>(response, 'calls', 'Calls') ?? []).map(parseCall)
  return {
    calls,
    total: field<number>(response, 'total', 'Total') ?? 0,
    page: field<number>(response, 'page', 'Page') ?? page,
    perPage: field<number>(response, 'per_page', 'perPage', 'PerPage') ?? pageSize,
    totalPages: field<number>(response, 'total_pages', 'totalPages', 'TotalPages') ?? 1,
  }
}

function parseDetail(response: Record<string, unknown>): CallDetail {
  const rawCall = field<unknown>(response, 'call', 'Call')
  const rawAudio = field<Record<string, unknown>>(response, 'audio', 'Audio') ?? {}
  const rawManager = field<unknown>(response, 'manager', 'Manager')
  const rawTranscript = field<CallDetail['transcript']>(response, 'transcript', 'Transcript')
  const rawAnalysis = field<Record<string, unknown>>(response, 'analysis', 'Analysis')
  const rawScore = field<Record<string, unknown>>(response, 'score', 'Score')
  const analysis: Analysis | null | undefined = rawAnalysis ? {
    summary: field<string>(rawAnalysis, 'summary', 'Summary') ?? '',
    needs: field<string[]>(rawAnalysis, 'needs', 'Needs') ?? [],
    objections: field<string[]>(rawAnalysis, 'objections', 'Objections') ?? [],
    refusalReason: field<string | null>(rawAnalysis, 'refusal_reason', 'refusalReason', 'RefusalReason'),
    mistakes: field<string[]>(rawAnalysis, 'mistakes', 'Mistakes') ?? [],
    strengths: field<string[]>(rawAnalysis, 'strengths', 'Strengths') ?? [],
    nextAction: field<string>(rawAnalysis, 'next_action', 'nextAction', 'NextAction') ?? '',
    criterionResults: Object.fromEntries(Object.entries(field<Analysis['criterionResults']>(rawAnalysis, 'criterion_results', 'criterionResults', 'CriterionResults') ?? {}).map(([key, result]) => [key, { ...(result as CriterionResult), max: CRITERION_MAX[key] }])),
  } : rawAnalysis
  const score = rawScore ? { total: field<number>(rawScore, 'total', 'total_score', 'Total') ?? 0, criteria: field<NonNullable<CallDetail['score']>['criteria']>(rawScore, 'criteria', 'Criteria') ?? {} } : rawScore
  return {
    call: parseCall(rawCall ?? {}),
    manager: rawManager ? parseUser(rawManager) : rawManager as null | undefined,
    audio: { filename: field<string>(rawAudio, 'filename', 'Filename') ?? '', contentType: field<string>(rawAudio, 'content_type', 'contentType', 'ContentType') ?? '', sizeBytes: field<number>(rawAudio, 'size_bytes', 'sizeBytes', 'SizeBytes') ?? 0 },
    transcript: rawTranscript,
    analysis,
    score,
  }
}

export async function getCall(id: string) { return parseDetail(await request<Record<string, unknown>>(`/api/v1/calls/${id}`)) }

export async function uploadCall(file: File) {
  const body = new FormData()
  body.append('file', file)
  const response = await request<{ call: unknown }>('/api/v1/calls', { method: 'POST', body })
  return parseCall(response.call)
}
