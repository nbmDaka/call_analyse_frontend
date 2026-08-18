export type Role = 'admin' | 'supervisor' | 'manager'

export interface User {
  id: string
  email: string
  role: Role
  supervisorId?: string | null
  createdAt?: string
}

export function canUpload(role: Role | undefined): boolean {
  return role === 'manager' || role === 'admin'
}
