import { field, request } from '../../shared/api/client'
import { session } from '../../shared/api/session'
import type { TokenPair } from '../../shared/api/types'
import type { Role, User } from '../../entities/user/model'

export function parseUser(value: unknown): User {
  const item = value as Record<string, unknown>
  return {
    id: field<string>(item, 'id', 'ID') ?? '',
    email: field<string>(item, 'email', 'Email') ?? '',
    role: field<Role>(item, 'role', 'Role') ?? 'manager',
    supervisorId: field<string | null>(item, 'supervisorId', 'SupervisorID'),
    createdAt: field<string>(item, 'createdAt', 'CreatedAt'),
  }
}

export async function login(email: string, password: string): Promise<User> {
  const pair = await request<TokenPair>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false)
  session.save(pair)
  return getMe()
}

export async function register(email: string, password: string): Promise<User> {
  const pair = await request<TokenPair>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }, false)
  session.save(pair)
  return getMe()
}

export async function logout(): Promise<void> {
  const token = session.refreshToken
  if (token) await request('/api/v1/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token: token }) }, false).catch(() => undefined)
  session.clear()
}

export async function getMe(): Promise<User> {
  const response = await request<{ user: unknown }>('/api/v1/me')
  return parseUser(response.user)
}
