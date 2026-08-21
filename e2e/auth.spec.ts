import { test, expect } from '@playwright/test'
import { setupAuthenticatedSession, mockCallsAPI } from './fixtures'

test.describe('E2E Auth & Navigation Workflows', () => {
  test('1. Redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('2. Successful login with valid credentials navigates to /dashboard', async ({ page }) => {
    const mockUser = { id: 'usr-1', email: 'manager@company.com', role: 'manager' }
    
    await page.route('**/api/v1/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        }),
      })
    })

    await page.route('**/api/v1/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: mockUser }),
      })
    })

    mockCallsAPI(page)

    await page.goto('/login')
    await page.getByLabel(/Электронная почта|Электрондық пошта/i).fill('manager@company.com')
    await page.getByLabel(/Пароль|Құпия сөз/i).fill('password123')
    await page.getByRole('button', { name: /Войти|Кіру/i }).click()

    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('3. Invalid login displays localized error message', async ({ page }) => {
    await page.route('**/api/v1/auth/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Неверный логин или пароль' } }),
      })
    })

    await page.goto('/login')
    await page.getByLabel(/Электронная почта|Электрондық пошта/i).fill('wrong@company.com')
    await page.getByLabel(/Пароль|Құпия сөз/i).fill('wrongpass')
    await page.getByRole('button', { name: /Войти|Кіру/i }).click()

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('alert')).toContainText('Неверный логин или пароль')
  })

  test('4. Session persists after page reload', async ({ page }) => {
    await setupAuthenticatedSession(page)
    mockCallsAPI(page)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)

    await page.reload()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('5. Logout clears session and redirects to /login', async ({ page }) => {
    await setupAuthenticatedSession(page)
    mockCallsAPI(page)
    await page.goto('/dashboard')

    const logoutButton = page.getByRole('button', { name: /Выйти|Шығу/i })
    await logoutButton.click()

    await expect(page).toHaveURL(/\/login/)
  })
})
