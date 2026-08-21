import { describe, expect, it } from 'vitest'
import { chooseActiveWorkspace } from './model'

describe('workspace selection', () => {
  const workspaces = [
    { id: 'personal', name: 'Personal', type: 'personal', status: 'active', ownerUserId: 'u1', membershipId: 'm1', membershipRole: 'owner', membershipStatus: 'active' },
    { id: 'company', name: 'Company', type: 'company', status: 'active', ownerUserId: 'u2', membershipId: 'm2', membershipRole: 'manager', membershipStatus: 'active' },
  ] as const

  it('keeps a saved workspace only while its membership remains active', () => {
    expect(chooseActiveWorkspace(workspaces, 'company')?.id).toBe('company')
  })

  it('falls back to the first active membership and never selects disabled access', () => {
    const unavailable = workspaces.map(item => item.id === 'company' ? { ...item, membershipStatus: 'disabled' as const } : item)
    expect(chooseActiveWorkspace(unavailable, 'company')?.id).toBe('personal')
  })
})
