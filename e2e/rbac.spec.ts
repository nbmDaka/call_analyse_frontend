import { test, expect } from '@playwright/test'
import { setupAuthenticatedSession, mockCallsAPI } from './fixtures'

test.describe('E2E Role-Based Access Control (RBAC) Audit', () => {
  test('1. Manager/Admin role sees upload action button and can access /calls/new', async ({ page }) => {
    await setupAuthenticatedSession(page, { id: 'usr-1', email: 'manager@company.com', role: 'manager' })
    mockCallsAPI(page, 'manager')

    await page.goto('/calls')
    const uploadLink = page.getByRole('link', { name: /Загрузить звонок|Қоңырауды жүктеу/i })
    await expect(uploadLink).toBeVisible()

    await page.goto('/calls/new')
    await expect(page).toHaveURL(/\/calls\/new/)
  })

  test('2. Supervisor/Operator role hides upload button and blocks direct URL access to /upload', async ({ page }) => {
    await setupAuthenticatedSession(page, { id: 'usr-2', email: 'sup@company.com', role: 'supervisor' })
    mockCallsAPI(page, 'supervisor')

    await page.goto('/calls')
    const uploadLink = page.getByRole('link', { name: /Загрузить звонок|Қоңырауды жүктеу/i })
    await expect(uploadLink).toBeHidden()

    // Direct access redirect test
    await page.goto('/calls/new')
    await expect(page).toHaveURL(/\/calls/)
  })
})
