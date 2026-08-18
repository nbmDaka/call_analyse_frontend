import { test, expect } from '@playwright/test'
import { setupAuthenticatedSession, mockCallsAPI } from './fixtures'

test.describe('E2E Dashboard Workflows', () => {
  test('1. Renders Dashboard KPI stats and recent calls table', async ({ page }) => {
    await setupAuthenticatedSession(page)
    mockCallsAPI(page)

    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('42')).toBeVisible() // Total Calls
    await expect(page.getByText('sales_q3_client_meeting.mp3')).toBeVisible()
  })

  test('2. Clicking recent call row navigates to Call Detail page', async ({ page }) => {
    await setupAuthenticatedSession(page)
    mockCallsAPI(page)

    await page.goto('/dashboard')
    await page.getByText('sales_q3_client_meeting.mp3').click()
    await expect(page).toHaveURL(/\/calls\/call-101/)
  })
})
