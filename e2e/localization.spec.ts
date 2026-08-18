import { test, expect } from '@playwright/test'
import { setupAuthenticatedSession, mockCallsAPI } from './fixtures'

test.describe('E2E Localization (RU / KK) & Kazakh Glyph Rendering', () => {
  test('1. Switches locale between RU and ҚАЗ without page reload and persists across reloads', async ({ page }) => {
    await setupAuthenticatedSession(page)
    mockCallsAPI(page)

    await page.goto('/dashboard')

    // Click ҚАЗ button
    await page.getByRole('button', { name: 'Қазақ тілі' }).click()
    await expect(page.getByText('Жұмыс кеңістігін шолу')).toBeVisible()

    // Reload page
    await page.reload()
    await expect(page.getByText('Жұмыс кеңістігін шолу')).toBeVisible()

    // Click RU button
    await page.getByRole('button', { name: 'Русский язык' }).click()
    await expect(page.getByText('Обзор рабочего пространства')).toBeVisible()
  })

  test('2. Kazakh Cyrillic special glyphs render cleanly in interface', async ({ page }) => {
    await setupAuthenticatedSession(page)
    mockCallsAPI(page)

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Қазақ тілі' }).click()

    // Check presence of Kazakh glyphs in active UI text: Қ, ұ, і, ө
    await expect(page.getByText(/Жұмыс|Қоңыраулар|белсенділік/i).first()).toBeVisible()
  })
})
