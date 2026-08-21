import { test, expect } from '@playwright/test'
import { setupAuthenticatedSession, mockCallsAPI } from './fixtures'

test.describe('E2E Upload Workflow', () => {
  test('1. File selection state updates file info in dropzone', async ({ page }) => {
    await setupAuthenticatedSession(page)
    mockCallsAPI(page)

    await page.goto('/calls/new')
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible()

    // Upload mock file input
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test_record.mp3',
      mimeType: 'audio/mpeg',
      buffer: Buffer.from('mock audio content'),
    })

    await expect(page.getByText('test_record.mp3')).toBeVisible()
    await expect(page.getByRole('button', { name: /Начать анализ|Талдауды бастау/i })).toBeEnabled()
  })

  test('2. Unsupported file type shows localized error message', async ({ page }) => {
    await setupAuthenticatedSession(page)
    mockCallsAPI(page)

    await page.goto('/calls/new')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf'),
    })

    await expect(page.getByRole('alert')).toBeVisible()
  })
})
