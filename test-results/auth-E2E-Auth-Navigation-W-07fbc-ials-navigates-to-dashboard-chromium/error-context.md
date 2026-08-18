# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> E2E Auth & Navigation Workflows >> 2. Successful login with valid credentials navigates to /dashboard
- Location: e2e\auth.spec.ts:10:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard/
Received string:  "http://localhost:5173/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × locator resolved to <html lang="en">…</html>
       - unexpected value "http://localhost:5173/login"

```

```yaml
- main:
  - text: CA Call Analyse
  - button "Русский язык": RU
  - text: "|"
  - button "Қазақ тілі": ҚАЗ
  - heading "Каждый разговор имеет значение." [level=1]
  - paragraph: Анализируйте звонки, находите точки роста и превращайте выводы в действия.
  - text: Электронная почта
  - textbox "Электронная почта":
    - /placeholder: name@company.com
    - text: manager@company.com
  - text: Пароль
  - textbox "Пароль":
    - /placeholder: ••••••••
    - text: password123
  - alert: authentication required
  - button "Войти"
  - paragraph:
    - text: Нет аккаунта?
    - button "Зарегистрироваться"
  - complementary:
    - text: Платформа ИИ-аналитики
    - paragraph: «Лучшее обучение начинается с точного понимания того, что произошло на самом деле.»
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { setupAuthenticatedSession, mockCallsAPI } from './fixtures'
  3  | 
  4  | test.describe('E2E Auth & Navigation Workflows', () => {
  5  |   test('1. Redirects unauthenticated users to /login', async ({ page }) => {
  6  |     await page.goto('/dashboard')
  7  |     await expect(page).toHaveURL(/\/login/)
  8  |   })
  9  | 
  10 |   test('2. Successful login with valid credentials navigates to /dashboard', async ({ page }) => {
  11 |     const mockUser = { id: 'usr-1', email: 'manager@company.com', role: 'manager' }
  12 |     
  13 |     await page.route('/api/auth/login', route => {
  14 |       route.fulfill({
  15 |         status: 200,
  16 |         contentType: 'application/json',
  17 |         body: JSON.stringify({
  18 |           token: 'mock-access-token',
  19 |           user: mockUser,
  20 |         }),
  21 |       })
  22 |     })
  23 | 
  24 |     await page.route('/api/auth/me', route => {
  25 |       route.fulfill({
  26 |         status: 200,
  27 |         contentType: 'application/json',
  28 |         body: JSON.stringify({ user: mockUser }),
  29 |       })
  30 |     })
  31 | 
  32 |     mockCallsAPI(page)
  33 | 
  34 |     await page.goto('/login')
  35 |     await page.getByLabel(/Электронная почта|Электрондық пошта/i).fill('manager@company.com')
  36 |     await page.getByLabel(/Пароль|Құпия сөз/i).fill('password123')
  37 |     await page.getByRole('button', { name: /Войти|Кіру/i }).click()
  38 | 
> 39 |     await expect(page).toHaveURL(/\/dashboard/)
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  40 |   })
  41 | 
  42 |   test('3. Invalid login displays localized error message', async ({ page }) => {
  43 |     await page.route('/api/auth/login', route => {
  44 |       route.fulfill({
  45 |         status: 401,
  46 |         contentType: 'application/json',
  47 |         body: JSON.stringify({ message: 'Неверный логин или пароль' }),
  48 |       })
  49 |     })
  50 | 
  51 |     await page.goto('/login')
  52 |     await page.getByLabel(/Электронная почта|Электрондық пошта/i).fill('wrong@company.com')
  53 |     await page.getByLabel(/Пароль|Құпия сөз/i).fill('wrongpass')
  54 |     await page.getByRole('button', { name: /Войти|Кіру/i }).click()
  55 | 
  56 |     await expect(page.getByRole('alert')).toBeVisible()
  57 |     await expect(page.getByRole('alert')).toContainText('Неверный логин или пароль')
  58 |   })
  59 | 
  60 |   test('4. Session persists after page reload', async ({ page }) => {
  61 |     await setupAuthenticatedSession(page)
  62 |     mockCallsAPI(page)
  63 |     await page.goto('/dashboard')
  64 |     await expect(page).toHaveURL(/\/dashboard/)
  65 | 
  66 |     await page.reload()
  67 |     await expect(page).toHaveURL(/\/dashboard/)
  68 |   })
  69 | 
  70 |   test('5. Logout clears session and redirects to /login', async ({ page }) => {
  71 |     await setupAuthenticatedSession(page)
  72 |     mockCallsAPI(page)
  73 |     await page.goto('/dashboard')
  74 | 
  75 |     const logoutButton = page.getByRole('button', { name: /Выйти|Шығу/i })
  76 |     await logoutButton.click()
  77 | 
  78 |     await expect(page).toHaveURL(/\/login/)
  79 |   })
  80 | })
  81 | 
```