import { request } from '../../shared/api/client'
import type { Call } from '../../entities/call/model'
import { parseCall } from '../calls-list/api'

export async function uploadCall(file: File): Promise<Call> {
  const body = new FormData()
  body.append('file', file)
  const response = await request<{ call: unknown }>('/api/v1/calls', { method: 'POST', body })
  return parseCall(response.call)
}
