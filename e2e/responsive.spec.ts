import { test, expect } from '@playwright/test'
import { setupAuthenticatedSession, mockCallsAPI } from './fixtures'

test.describe('E2E Responsive & Accessibility Smoke Audit', () => {
  const viewports = [
    { width: 1440, height: 900, name: 'Desktop 1440' },
    { width: 1024, height: 768, name: 'Tablet 1024' },
    { width: 390, height: 844, name: 'Mobile 390' },
  ]

  for (const vp of viewports) {
    test(`Smoke test on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await setupAuthenticatedSession(page)
      mockCallsAPI(page)

      await page.goto('/dashboard')
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      await page.goto('/calls')
      await expect(page.getByText('sales_q3_client_meeting.mp3')).toBeVisible()

      await page.goto('/calls/call-101')
      await expect(page.getByText('87')).toBeVisible()
    })
  }
})
