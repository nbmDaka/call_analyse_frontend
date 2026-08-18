import { test, expect } from '@playwright/test'
import { setupAuthenticatedSession, mockCallsAPI } from './fixtures'

test.describe('E2E Call Detail Experience', () => {
  test('1. Completed call renders header, score ring, criteria, AI summary, and transcript', async ({ page }) => {
    await setupAuthenticatedSession(page)
    mockCallsAPI(page)

    await page.goto('/calls/call-101')
    await expect(page.getByText('sales_q3_client_meeting.mp3')).toBeVisible()
    await expect(page.getByText('87')).toBeVisible() // Score
    await expect(page.getByText('Менеджер качественно провел презентацию')).toBeVisible() // AI Summary
    await expect(page.getByText('Здравствуйте! Меня зовут Алексей')).toBeVisible() // Transcript
  })

  test('2. Processing call renders pipeline tracker without runtime crash', async ({ page }) => {
    await setupAuthenticatedSession(page)
    mockCallsAPI(page)

    await page.goto('/calls/call-102')
    await expect(page.getByText('support_onboarding_call.wav')).toBeVisible()
    await expect(page.getByText(/Транскрибация|Мәтінге айналдыруда/i)).toBeVisible()
  })
})
