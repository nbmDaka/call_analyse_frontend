import { test as base, Page } from '@playwright/test'

export interface MockUser {
  id: string
  email: string
  role: 'admin' | 'manager' | 'supervisor' | 'operator'
}

export async function setupAuthenticatedSession(page: Page, user: MockUser = { id: 'usr-1', email: 'manager@company.com', role: 'manager' }) {
  await page.route('/api/auth/me', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user }),
    })
  })

  await page.route('/api/auth/refresh', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'mock-access-token', user }),
    })
  })

  // Navigate to login page first to establish valid origin for localStorage
  await page.goto('/login')
  await page.evaluate(userData => {
    localStorage.setItem('callwise.auth.user', JSON.stringify(userData))
    localStorage.setItem('callwise.auth.token', 'mock-access-token')
  }, user)
}

export function mockCallsAPI(page: Page) {
  const sampleCalls = [
    {
      id: 'call-101',
      managerId: 'usr-1',
      status: 'completed',
      originalFilename: 'sales_q3_client_meeting.mp3',
      contentType: 'audio/mpeg',
      sizeBytes: 14500000,
      durationSeconds: 320,
      createdAt: '2026-08-18T10:00:00Z',
      updatedAt: '2026-08-18T10:05:00Z',
    },
    {
      id: 'call-102',
      managerId: 'usr-1',
      status: 'transcribing',
      originalFilename: 'support_onboarding_call.wav',
      contentType: 'audio/wav',
      sizeBytes: 8200000,
      durationSeconds: 180,
      createdAt: '2026-08-18T11:00:00Z',
      updatedAt: '2026-08-18T11:01:00Z',
    },
  ]

  page.route('/api/calls*', route => {
    const url = route.request().url()
    if (url.includes('/api/calls/call-101')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          call: sampleCalls[0],
          manager: { id: 'usr-1', email: 'manager@company.com', role: 'manager' },
          score: { total: 87, criteria: {} },
          analysis: {
            summary: 'Менеджер качественно провел презентацию продукта и выявил ключевые потребности клиентов.',
            needs: ['Автоматизация звонков', 'Казахский интерфейс'],
            objections: ['Высокая стоимость интеграции'],
            strengths: ['Активное слушание', 'Вежливое приветствие'],
            mistakes: ['Не уточнил бюджет на этапе выявления'],
            nextAction: 'Отправить коммерческое предложение с расчетом под 50 пользователей.',
            criterionResults: {
              greeting: { score: 10, max: 10, feedback: 'Отличное приветствие по регламенту.' },
              needs_discovery: { score: 16, max: 20, feedback: 'Выявлена основная потребность.' },
            },
          },
          transcript: {
            text: 'Здравствуйте! Добрый день.',
            segments: [
              { speaker: 'manager', text: 'Здравствуйте! Меня зовут Алексей, компания Callwise.', startSeconds: 0 },
              { speaker: 'client', text: 'Добрый день! Подскажите стоимость вашей платформы.', startSeconds: 4 },
            ],
          },
        }),
      })
    } else if (url.includes('/api/calls/call-102')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          call: sampleCalls[1],
          manager: { id: 'usr-1', email: 'manager@company.com', role: 'manager' },
          score: null,
          analysis: null,
          transcript: null,
        }),
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          calls: sampleCalls,
          total: 2,
          page: 1,
          perPage: 10,
          totalPages: 1,
        }),
      })
    }
  })

  page.route('/api/dashboard*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalCalls: 42,
        completedCalls: 38,
        failedCalls: 4,
        averageScore: 84.5,
        recentCalls: sampleCalls,
      }),
    })
  })
}

export const test = base
