import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n, { changeLanguage, detectInitialLocale, resources } from './index'
import { LOCALE_STORAGE_KEY } from './types'
import { statusLabel } from '../entities/call/model'

describe('i18n localization module', () => {
  beforeEach(() => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    })
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('1. Russian is used as fallback/default', () => {
    expect(detectInitialLocale()).toBe('ru')
    expect(i18n.language).toBe('ru')
    expect(i18n.t('common:actions.uploadCall')).toBe('Загрузить звонок')
  })

  it('2. Switching to Kazakh updates visible UI', async () => {
    await changeLanguage('kk')
    expect(i18n.language).toBe('kk')
    expect(i18n.t('common:actions.uploadCall')).toBe('Қоңырауды жүктеу')
    expect(i18n.t('dashboard:header.eyebrow')).toBe('ЖҰМЫС КЕҢІСТІГІН ШОЛУ')
  })

  it('3. Selected locale persists in localStorage under call-analyse.locale', async () => {
    await changeLanguage('kk')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('kk')
    await changeLanguage('ru')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('ru')
  })

  it('4. Reload/bootstrap uses stored locale from localStorage', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'kk')
    expect(detectInitialLocale()).toBe('kk')
  })

  it('5. Both locales contain required high-level namespaces', () => {
    const requiredNamespaces = ['common', 'auth', 'dashboard', 'calls', 'upload', 'scoring', 'errors'] as const
    for (const ns of requiredNamespaces) {
      expect(resources.ru[ns]).toBeDefined()
      expect(resources.kk[ns]).toBeDefined()
    }
  })

  it('6. Important status labels resolve in both languages', () => {
    expect(statusLabel('completed', 'ru')).toBe('Завершён')
    expect(statusLabel('completed', 'kk')).toBe('Аяқталды')
    expect(statusLabel('transcribing', 'ru')).toBe('Транскрибация')
    expect(statusLabel('transcribing', 'kk')).toBe('Мәтінге айналдыруда')
    expect(statusLabel('failed', 'ru')).toBe('Ошибка')
    expect(statusLabel('failed', 'kk')).toBe('Қате')
  })
})
