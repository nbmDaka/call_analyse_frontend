import { request } from '../../shared/api/client'
import type { Workspace } from '../../entities/workspace/model'

export interface PlatformUser { id: string; email: string; platform_role: 'user' | 'super_admin'; status: 'active' | 'suspended' }
export interface PlatformMetrics { users: number; workspaces: number; calls: number }

export async function getPlatformData() {
  const [workspaceResponse, userResponse, metricsResponse] = await Promise.all([
    request<{ workspaces: Workspace[] }>('/api/v1/platform/workspaces'), request<{ users: PlatformUser[] }>('/api/v1/platform/users'), request<{ metrics: PlatformMetrics }>('/api/v1/platform/metrics'),
  ])
  return { workspaces: workspaceResponse.workspaces, users: userResponse.users, metrics: metricsResponse.metrics }
}

export async function setPlatformWorkspaceStatus(id: string, status: 'active' | 'suspended') {
  await request(`/api/v1/platform/workspaces/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export async function setPlatformUserStatus(id: string, status: 'active' | 'suspended') {
  await request(`/api/v1/platform/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export async function createPlatformCompany(name: string, ownerUserId: string) {
  await request('/api/v1/platform/workspaces', { method: 'POST', body: JSON.stringify({ name, owner_user_id: ownerUserId }) })
}
