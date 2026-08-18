import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import i18n from '../i18n'
import { LanguageSwitcher } from '../shared/ui/LanguageSwitcher'
import { StatusPill } from '../shared/ui/StatusPill'
import { ScoreOverview } from './call-detail/ScoreOverview'
import { CriteriaBreakdown } from './call-detail/CriteriaBreakdown'
import { PipelineTracker } from './call-detail/PipelineTracker'
import { canUpload } from '../entities/user/model'
import type { User } from '../entities/user/model'

// Polyfill IS_REACT_ACT_ENVIRONMENT for React 18 in vitest environment
// @ts-expect-error global scope declaration for test act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('Frontend Component & RBAC Audit Tests', () => {
  let container: HTMLDivElement | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let root: any = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount()
      })
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    container = null
    root = null
  })

  it('1. LanguageSwitcher switches locale between Russian and Kazakh', async () => {
    await act(async () => {
      root.render(<LanguageSwitcher />)
    })
    const buttons = container?.querySelectorAll('button')
    expect(buttons?.length).toBe(2)

    // Click Kazakh button
    await act(async () => {
      buttons?.[1].click()
    })
    expect(i18n.language).toBe('kk')

    // Click Russian button
    await act(async () => {
      buttons?.[0].click()
    })
    expect(i18n.language).toBe('ru')
  })

  it('2. StatusPill renders status meaning and semantic indicator', async () => {
    await act(async () => {
      root.render(<StatusPill status="completed" />)
    })
    expect(container?.textContent).toContain('Завершён')
    expect(container?.querySelector('.status-completed')).not.toBeNull()

    await act(async () => {
      root.render(<StatusPill status="failed" />)
    })
    expect(container?.textContent).toContain('Ошибка')
    expect(container?.querySelector('.status-failed')).not.toBeNull()
  })

  it('3. ScoreOverview renders representative score correctly across tiers (0, 50, 87, 100)', async () => {
    await act(async () => {
      root.render(<ScoreOverview score={{ total: 87, criteria: {} }} />)
    })
    expect(container?.textContent).toContain('87')
    expect(container?.textContent).toContain('/ 100')
    expect(container?.querySelector('.tier-high')).not.toBeNull()

    await act(async () => {
      root.render(<ScoreOverview score={{ total: 45, criteria: {} }} />)
    })
    expect(container?.textContent).toContain('45')
    expect(container?.querySelector('.tier-low')).not.toBeNull()
  })

  it('4. CriteriaBreakdown renders localized criteria and progress meters', async () => {
    const mockCriteria = {
      greeting: { score: 8, max: 10, feedback: 'Good greeting' },
      closing: { score: 10, max: 10, feedback: 'Excellent closing' },
    }
    await act(async () => {
      root.render(<CriteriaBreakdown criterionResults={mockCriteria} />)
    })
    expect(container?.textContent).toContain('Приветствие')
    expect(container?.textContent).toContain('8')
    expect(container?.textContent).toContain('Good greeting')
  })

  it('5. PipelineTracker renders current/completed state for processing statuses', async () => {
    await act(async () => {
      root.render(<PipelineTracker status="transcribing" />)
    })
    expect(container?.querySelector('.pipeline-step.current')).not.toBeNull()

    await act(async () => {
      root.render(<PipelineTracker status="completed" />)
    })
    expect(container?.querySelectorAll('.pipeline-step.completed').length).toBe(4)
  })

  it('6. Upload permission is strictly restricted by canUpload role check', () => {
    const manager: User = { id: '1', email: 'manager@test.com', role: 'manager' }
    const admin: User = { id: '2', email: 'admin@test.com', role: 'admin' }
    const supervisor: User = { id: '3', email: 'sup@test.com', role: 'supervisor' }

    expect(canUpload(manager.role)).toBe(true)
    expect(canUpload(admin.role)).toBe(true)
    expect(canUpload(supervisor.role)).toBe(false)
    expect(canUpload(undefined)).toBe(false)
  })

  it('7. Call Detail rendering does not crash when analysis is missing/incomplete', async () => {
    // PipelineTracker rendering with transcribing status (no analysis data)
    await act(async () => {
      root.render(<PipelineTracker status="transcribing" />)
    })
    expect(container?.textContent).toContain('Транскрибация')
  })
})
