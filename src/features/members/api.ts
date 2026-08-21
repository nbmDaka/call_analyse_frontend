import { field, request } from '../../shared/api/client'
import type { MembershipStatus, WorkspaceRole } from '../../entities/workspace/model'

export interface Membership {
  id: string; workspaceId: string; userId: string; email: string
  role: WorkspaceRole; status: MembershipStatus; supervisorMembershipId?: string | null
}

function parseMember(value: unknown): Membership {
  const item = value as Record<string, unknown>
  return {
    id: field<string>(item, 'id', 'ID') ?? '', workspaceId: field<string>(item, 'workspace_id', 'WorkspaceID') ?? '',
    userId: field<string>(item, 'user_id', 'UserID') ?? '', email: field<string>(item, 'email', 'Email') ?? '',
    role: field<WorkspaceRole>(item, 'role', 'Role') ?? 'manager', status: field<MembershipStatus>(item, 'status', 'Status') ?? 'disabled',
    supervisorMembershipId: field<string | null>(item, 'supervisor_membership_id', 'SupervisorMembershipID'),
  }
}

export async function getMembers(workspaceId: string): Promise<Membership[]> {
  const response = await request<{ members: unknown[] }>(`/api/v1/workspaces/${workspaceId}/members`)
  return (response.members ?? []).map(parseMember)
}

export async function addMember(workspaceId: string, email: string, role: WorkspaceRole): Promise<Membership> {
  const response = await request<{ member: unknown }>(`/api/v1/workspaces/${workspaceId}/members`, { method: 'POST', body: JSON.stringify({ email, role }) })
  return parseMember(response.member)
}

export async function updateMember(workspaceId: string, membershipId: string, patch: Record<string, unknown>): Promise<Membership> {
  const response = await request<{ member: unknown }>(`/api/v1/workspaces/${workspaceId}/members/${membershipId}`, { method: 'PATCH', body: JSON.stringify(patch) })
  return parseMember(response.member)
}

export async function removeMember(workspaceId: string, membershipId: string): Promise<void> {
  await request(`/api/v1/workspaces/${workspaceId}/members/${membershipId}`, { method: 'DELETE' })
}
