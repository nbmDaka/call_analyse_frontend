import { API_URL, refresh, session } from './session'
import type { APIErrorBody } from './types'

export function field<T>(value: Record<string, unknown>, ...names: string[]): T | undefined {
  for (const name of names) if (value[name] !== undefined) return value[name] as T
  return undefined
}

export async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers)
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const token = session.accessToken
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (response.status === 401 && retry && (await refresh())) return request<T>(path, init, false)
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as APIErrorBody
    throw new Error(body.error?.message ?? 'Request failed')
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
