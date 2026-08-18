import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getCall } from '../../features/call-detail/api'
import { getCalls } from '../../features/calls-list/api'
import { login } from '../../features/auth/api'
import { session } from './session'

describe('API client', () => {
  beforeEach(() => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    })
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('normalizes Go default field names in a call page', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            Calls: [
              {
                ID: 'call-1',
                ManagerID: 'manager-1',
                Status: 'completed',
                OriginalFilename: 'demo.mp3',
                SizeBytes: 2048,
                CreatedAt: '2026-08-14T12:00:00Z',
              },
            ],
            Total: 1,
            Page: 1,
            PerPage: 20,
            TotalPages: 1,
          }),
          { status: 200 }
        )
      )
    )
    const result = await getCalls()
    expect(result.calls[0]).toMatchObject({
      id: 'call-1',
      managerId: 'manager-1',
      status: 'completed',
      originalFilename: 'demo.mp3',
      sizeBytes: 2048,
    })
  })

  it('refreshes once after an expired access token', async () => {
    session.save({ access_token: 'expired', refresh_token: 'refresh-1' })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: 'expired' } }), { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'fresh', refresh_token: 'refresh-2' }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ call: { ID: 'call-1', Status: 'queued' }, audio: {} }), { status: 200 })
      )
    vi.stubGlobal('fetch', fetchMock)
    const result = await getCall('call-1')
    expect(result.call).toMatchObject({ id: 'call-1', status: 'queued' })
    expect(session.accessToken).toBe('fresh')
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[2][1].headers.get('Authorization')).toBe('Bearer fresh')
  })

  it('deduplicates concurrent refreshes caused by parallel 401 responses', async () => {
    session.save({ access_token: 'expired', refresh_token: 'refresh-1' })
    const unauthorized = () => new Response(JSON.stringify({ error: { message: 'expired' } }), { status: 401 })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'fresh', refresh_token: 'refresh-2' }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ call: { ID: 'call-1', Status: 'queued' }, audio: {} }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ call: { ID: 'call-2', Status: 'queued' }, audio: {} }), { status: 200 })
      )
    vi.stubGlobal('fetch', fetchMock)

    const [first, second] = await Promise.all([getCall('call-1'), getCall('call-2')])

    expect(first.call.id).toBe('call-1')
    expect(second.call.id).toBe('call-2')
    expect(fetchMock).toHaveBeenCalledTimes(5)
  })

  it('stores tokens and returns the authenticated user after login', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'access', refresh_token: 'refresh' }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ user: { ID: 'user-1', Email: 'manager@example.com', Role: 'manager' } }),
          { status: 200 }
        )
      )
    vi.stubGlobal('fetch', fetchMock)
    const user = await login('manager@example.com', 'secret')
    expect(user).toMatchObject({ id: 'user-1', email: 'manager@example.com', role: 'manager' })
    expect(session.refreshToken).toBe('refresh')
  })

  it('exposes the backend error message without leaking the raw response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { code: 'INVALID_REQUEST', message: 'file is required' }, request_id: 'request-1' }),
          { status: 400 }
        )
      )
    )

    await expect(getCalls()).rejects.toThrow('file is required')
  })
})
