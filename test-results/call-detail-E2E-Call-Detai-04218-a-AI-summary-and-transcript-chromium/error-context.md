# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: call-detail.spec.ts >> E2E Call Detail Experience >> 1. Completed call renders header, score ring, criteria, AI summary, and transcript
- Location: e2e\call-detail.spec.ts:5:3

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
  4  | test.describe('E2E Call Detail Experience', () => {
  5  |   test('1. Completed call renders header, score ring, criteria, AI summary, and transcript', async ({ page }) => {
  6  |     await setupAuthenticatedSession(page)
  7  |     mockCallsAPI(page)
  8  | 
  9  |     await page.goto('/calls/call-101')
> 10 |     await expect(page.getByText('sales_q3_client_meeting.mp3')).toBeVisible()
     |                                                                 ^ Error: expect(locator).toBeVisible() failed
  11 |     await expect(page.getByText('87')).toBeVisible() // Score
  12 |     await expect(page.getByText('Менеджер качественно провел презентацию')).toBeVisible() // AI Summary
  13 |     await expect(page.getByText('Здравствуйте! Меня зовут Алексей')).toBeVisible() // Transcript
  14 |   })
  15 | 
  16 |   test('2. Processing call renders pipeline tracker without runtime crash', async ({ page }) => {
  17 |     await setupAuthenticatedSession(page)
  18 |     mockCallsAPI(page)
  19 | 
  20 |     await page.goto('/calls/call-102')
  21 |     await expect(page.getByText('support_onboarding_call.wav')).toBeVisible()
  22 |     await expect(page.getByText(/Транскрибация|Мәтінге айналдыруда/i)).toBeVisible()
  23 |   })
  24 | })
  25 | 
```