import type { TokenPair } from './types'

export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')
export const ACCESS_KEY = 'call-analyse.access-token'
export const REFRESH_KEY = 'call-analyse.refresh-token'

let refreshPromise: Promise<boolean> | null = null

export const session = {
  get accessToken() {
    return localStorage.getItem(ACCESS_KEY)
  },
  get refreshToken() {
    return localStorage.getItem(REFRESH_KEY)
  },
  save(pair: TokenPair) {
    localStorage.setItem(ACCESS_KEY, pair.access_token)
    localStorage.setItem(REFRESH_KEY, pair.refresh_token)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

export async function refresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  const token = session.refreshToken
  if (!token) return false

  refreshPromise = (async () => {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: token }),
    })
    if (!response.ok) {
      session.clear()
      return false
    }
    session.save((await response.json()) as TokenPair)
    return true
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}
