export type WorkspaceType = 'personal' | 'company'
export type WorkspaceStatus = 'active' | 'suspended'
export type WorkspaceRole = 'owner' | 'admin' | 'supervisor' | 'manager'
export type MembershipStatus = 'invited' | 'active' | 'disabled'
export type PlatformRole = 'user' | 'super_admin'

export interface Workspace {
  id: string
  name: string
  type: WorkspaceType
  status: WorkspaceStatus
  ownerUserId: string
  membershipId: string
  membershipRole: WorkspaceRole
  membershipStatus: MembershipStatus
}

export function chooseActiveWorkspace(workspaces: readonly Workspace[], savedId: string | null): Workspace | null {
  const active = workspaces.filter(item => item.membershipStatus === 'active')
  return active.find(item => item.id === savedId) ?? active[0] ?? null
}

export function canUploadInWorkspace(workspace: Workspace | null): boolean {
  return workspace?.status === 'active' && ['owner', 'admin', 'manager'].includes(workspace.membershipRole)
}

export function canManageMembers(workspace: Workspace | null): boolean {
  return workspace?.type === 'company' && workspace.membershipStatus === 'active' && ['owner', 'admin'].includes(workspace.membershipRole)
}
