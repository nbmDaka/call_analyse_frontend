import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CustomSelect } from './CustomSelect'

// @ts-expect-error global scope declaration for test act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('CustomSelect component', () => {
  let container: HTMLDivElement | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let root: any = null

  const options = [
    { value: 'ws-1', label: 'Workspace Alpha', badge: 'Personal' },
    { value: 'ws-2', label: 'Workspace Beta', badge: 'Company' },
    { value: 'ws-3', label: 'Workspace Gamma', disabled: true },
  ]

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

  it('renders active selected option label and badge', async () => {
    await act(async () => {
      root.render(<CustomSelect options={options} value="ws-1" onChange={() => {}} ariaLabel="Workspace Select" />)
    })
    const trigger = container?.querySelector('.custom-select-trigger')
    expect(trigger?.textContent).toContain('Workspace Alpha')
    expect(trigger?.textContent).toContain('Personal')
  })

  it('opens options popover menu on click and triggers onChange', async () => {
    const handleChange = vi.fn()
    await act(async () => {
      root.render(<CustomSelect options={options} value="ws-1" onChange={handleChange} ariaLabel="Workspace Select" />)
    })

    const trigger = container?.querySelector('.custom-select-trigger') as HTMLButtonElement
    await act(async () => {
      trigger.click()
    })

    const dropdown = container?.querySelector('.custom-select-dropdown')
    expect(dropdown).not.toBeNull()

    const items = container?.querySelectorAll('.custom-select-option')
    expect(items?.length).toBe(3)

    await act(async () => {
      ;(items?.[1] as HTMLElement).click()
    })

    expect(handleChange).toHaveBeenCalledWith('ws-2')
  })

  it('does not trigger onChange when clicking disabled option', async () => {
    const handleChange = vi.fn()
    await act(async () => {
      root.render(<CustomSelect options={options} value="ws-1" onChange={handleChange} ariaLabel="Workspace Select" />)
    })

    const trigger = container?.querySelector('.custom-select-trigger') as HTMLButtonElement
    await act(async () => {
      trigger.click()
    })

    const items = container?.querySelectorAll('.custom-select-option')
    await act(async () => {
      ;(items?.[2] as HTMLElement).click()
    })

    expect(handleChange).not.toHaveBeenCalled()
  })
})
