import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type SupportedLocale } from './types'

import ruCommon from './locales/ru/common.json'
import ruAuth from './locales/ru/auth.json'
import ruDashboard from './locales/ru/dashboard.json'
import ruCalls from './locales/ru/calls.json'
import ruUpload from './locales/ru/upload.json'
import ruScoring from './locales/ru/scoring.json'
import ruErrors from './locales/ru/errors.json'

import kkCommon from './locales/kk/common.json'
import kkAuth from './locales/kk/auth.json'
import kkDashboard from './locales/kk/dashboard.json'
import kkCalls from './locales/kk/calls.json'
import kkUpload from './locales/kk/upload.json'
import kkScoring from './locales/kk/scoring.json'
import kkErrors from './locales/kk/errors.json'

export const resources = {
  ru: {
    common: ruCommon,
    auth: ruAuth,
    dashboard: ruDashboard,
    calls: ruCalls,
    upload: ruUpload,
    scoring: ruScoring,
    errors: ruErrors,
  },
  kk: {
    common: kkCommon,
    auth: kkAuth,
    dashboard: kkDashboard,
    calls: kkCalls,
    upload: kkUpload,
    scoring: kkScoring,
    errors: kkErrors,
  },
} as const

export function detectInitialLocale(): SupportedLocale {
  const saved = typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function'
    ? localStorage.getItem(LOCALE_STORAGE_KEY)
    : null
  if (saved === 'ru' || saved === 'kk') return saved

  const browserLang = typeof navigator !== 'undefined' ? navigator.language || (navigator as { userLanguage?: string }).userLanguage || '' : ''
  if (browserLang.toLowerCase().startsWith('kk')) return 'kk'
  if (browserLang.toLowerCase().startsWith('ru')) return 'ru'

  return DEFAULT_LOCALE
}

const initialLocale = detectInitialLocale()

i18n.use(initReactI18next).init({
  lng: initialLocale,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: ['ru', 'kk'],
  ns: ['common', 'auth', 'dashboard', 'calls', 'upload', 'scoring', 'errors'],
  defaultNS: 'common',
  resources,
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lng: string) => {
  if (lng === 'ru' || lng === 'kk') {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(LOCALE_STORAGE_KEY, lng)
    }
  }
})

export function changeLanguage(locale: SupportedLocale): Promise<unknown> {
  if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }
  return i18n.changeLanguage(locale)
}

export default i18n
