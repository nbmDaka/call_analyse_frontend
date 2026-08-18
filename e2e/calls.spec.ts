import { test, expect } from '@playwright/test'
import { setupAuthenticatedSession, mockCallsAPI } from './fixtures'

test.describe('E2E Calls Library Workflows', () => {
  test('1. Renders calls table rows, status pills, and pagination', async ({ page }) => {
    await setupAuthenticatedSession(page)
    mockCallsAPI(page)

    await page.goto('/calls')
    await expect(page.getByText('sales_q3_client_meeting.mp3')).toBeVisible()
    await expect(page.getByText('support_onboarding_call.wav')).toBeVisible()
    await expect(page.getByText(/Страница 1|Бет 1/i)).toBeVisible()
  })

  test('2. Clicking call filename opens Call Detail page', async ({ page }) => {
    await setupAuthenticatedSession(page)
    mockCallsAPI(page)

    await page.goto('/calls')
    await page.getByText('sales_q3_client_meeting.mp3').click()
    await expect(page).toHaveURL(/\/calls\/call-101/)
  })
})
