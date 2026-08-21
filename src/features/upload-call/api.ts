import { request } from '../../shared/api/client'
import type { Call } from '../../entities/call/model'
import { parseCall } from '../calls-list/api'

export async function uploadCall(workspaceIdOrFile: string | File, maybeFile?: File): Promise<Call> {
  const workspaceId = typeof workspaceIdOrFile === 'string' ? workspaceIdOrFile : ''
  const file = typeof workspaceIdOrFile === 'string' ? maybeFile : workspaceIdOrFile
  if (!file) throw new Error('File is required')
  const body = new FormData()
  body.append('file', file)
  const path = workspaceId ? `/api/v1/workspaces/${workspaceId}/calls` : '/api/v1/calls'
  const response = await request<{ call: unknown }>(path, { method: 'POST', body })
  return parseCall(response.call)
}
