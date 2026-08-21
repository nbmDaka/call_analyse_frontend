import { field, request } from '../../shared/api/client'
import type { Workspace } from '../../entities/workspace/model'

export function parseWorkspace(value: unknown): Workspace {
  const item = value as Record<string, unknown>
  return {
    id: field<string>(item, 'id', 'ID') ?? '',
    name: field<string>(item, 'name', 'Name') ?? '',
    type: field<Workspace['type']>(item, 'type', 'Type') ?? 'personal',
    status: field<Workspace['status']>(item, 'status', 'Status') ?? 'active',
    ownerUserId: field<string>(item, 'owner_user_id', 'ownerUserId', 'OwnerUserID') ?? '',
    membershipId: field<string>(item, 'membership_id', 'membershipId', 'MembershipID') ?? '',
    membershipRole: field<Workspace['membershipRole']>(item, 'membership_role', 'membershipRole', 'MembershipRole') ?? 'manager',
    membershipStatus: field<Workspace['membershipStatus']>(item, 'membership_status', 'membershipStatus', 'MembershipStatus') ?? 'disabled',
  }
}

export async function getWorkspaces(): Promise<Workspace[]> {
  const response = await request<{ workspaces: unknown[] }>('/api/v1/workspaces')
  return (response.workspaces ?? []).map(parseWorkspace)
}

export async function createCompanyWorkspace(name: string): Promise<Workspace> {
  const response = await request<{ workspace: unknown }>('/api/v1/workspaces', { method: 'POST', body: JSON.stringify({ name, type: 'company' }) })
  return parseWorkspace(response.workspace)
}
