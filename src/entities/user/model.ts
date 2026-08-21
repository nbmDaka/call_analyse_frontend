export type Role = 'admin' | 'supervisor' | 'manager'
import type { PlatformRole } from '../workspace/model'

export interface User {
  id: string
  email: string
  role: Role
  platformRole?: PlatformRole
  status?: 'active' | 'suspended'
  supervisorId?: string | null
  createdAt?: string
}

export function canUpload(role: Role | undefined): boolean {
  return role === 'manager' || role === 'admin'
}
