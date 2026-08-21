import { test, expect } from '@playwright/test'
import { setupAuthenticatedSession, mockCallsAPI } from './fixtures'

test.describe('E2E Theme (Light / Dark) Workflows', () => {
  test('1. Toggles theme between Light and Dark mode using accessible icon button', async ({ page }) => {
    await setupAuthenticatedSession(page)
    mockCallsAPI(page)

    await page.goto('/dashboard')

    const themeButton = page.locator('.theme-toggle-icon-btn')
    await expect(themeButton).toBeVisible()

    // Click theme toggle button
    await themeButton.click()
    const themeAttribute = await page.locator('html').getAttribute('data-theme')
    expect(['light', 'dark']).toContain(themeAttribute)

    // Reload page to verify persistence
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', themeAttribute ?? 'light')
  })
})
