# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: calls.spec.ts >> E2E Calls Library Workflows >> 1. Renders calls table rows, status pills, and pagination
- Location: e2e\calls.spec.ts:5:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('sales_q3_client_meeting.mp3')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('sales_q3_client_meeting.mp3')

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
  - text: Пароль
  - textbox "Пароль":
    - /placeholder: ••••••••
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
  4  | test.describe('E2E Calls Library Workflows', () => {
  5  |   test('1. Renders calls table rows, status pills, and pagination', async ({ page }) => {
  6  |     await setupAuthenticatedSession(page)
  7  |     mockCallsAPI(page)
  8  | 
  9  |     await page.goto('/calls')
> 10 |     await expect(page.getByText('sales_q3_client_meeting.mp3')).toBeVisible()
     |                                                                 ^ Error: expect(locator).toBeVisible() failed
  11 |     await expect(page.getByText('support_onboarding_call.wav')).toBeVisible()
  12 |     await expect(page.getByText(/Страница 1|Бет 1/i)).toBeVisible()
  13 |   })
  14 | 
  15 |   test('2. Clicking call filename opens Call Detail page', async ({ page }) => {
  16 |     await setupAuthenticatedSession(page)
  17 |     mockCallsAPI(page)
  18 | 
  19 |     await page.goto('/calls')
  20 |     await page.getByText('sales_q3_client_meeting.mp3').click()
  21 |     await expect(page).toHaveURL(/\/calls\/call-101/)
  22 |   })
  23 | })
  24 | 
```