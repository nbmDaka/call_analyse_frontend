export type SupportedLocale = 'ru' | 'kk'

export const DEFAULT_LOCALE: SupportedLocale = 'ru'
export const LOCALE_STORAGE_KEY = 'call-analyse.locale'

export interface TranslationNamespaces {
  common: typeof import('./locales/ru/common.json')
  auth: typeof import('./locales/ru/auth.json')
  dashboard: typeof import('./locales/ru/dashboard.json')
  calls: typeof import('./locales/ru/calls.json')
  upload: typeof import('./locales/ru/upload.json')
  scoring: typeof import('./locales/ru/scoring.json')
  errors: typeof import('./locales/ru/errors.json')
}
