import { test, expect } from '@playwright/test'
import { setupAuthenticatedSession } from './fixtures'

test('switching workspace never shows cached calls from the previous tenant', async ({ page }) => {
  await setupAuthenticatedSession(page)
  await page.route('**/api/v1/workspaces', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ workspaces: [
    { id: 'ws-a', name: 'Alpha', type: 'company', status: 'active', owner_user_id: 'owner-a', membership_id: 'ma', membership_role: 'manager', membership_status: 'active' },
    { id: 'ws-b', name: 'Beta', type: 'company', status: 'active', owner_user_id: 'owner-b', membership_id: 'mb', membership_role: 'manager', membership_status: 'active' },
  ] }) }))
  await page.route('**/api/v1/workspaces/*/calls**', route => {
    const beta = route.request().url().includes('/ws-b/')
    const filename = beta ? 'beta-private-call.mp3' : 'alpha-private-call.mp3'
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ calls: [{ id: beta ? 'b1' : 'a1', managerId: 'usr-1', status: 'completed', originalFilename: filename, contentType: 'audio/mpeg', sizeBytes: 10, createdAt: '2026-08-21T00:00:00Z', updatedAt: '2026-08-21T00:00:00Z' }], total: 1, page: 1, perPage: 20, totalPages: 1 }) })
  })

  await page.goto('/calls')
  await expect(page.getByText('alpha-private-call.mp3')).toBeVisible()
  await page.getByRole('combobox', { name: /рабочее пространство|жұмыс кеңістігін/i }).selectOption('ws-b')
  await expect(page.getByText('beta-private-call.mp3')).toBeVisible()
  await expect(page.getByText('alpha-private-call.mp3')).toBeHidden()
})
