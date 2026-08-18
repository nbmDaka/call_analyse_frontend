import React from 'react'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '../../i18n'
import type { SupportedLocale } from '../../i18n/types'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentLang = (i18n.language ? i18n.language.slice(0, 2) : 'ru') as SupportedLocale

  return (
    <div className="lang-switcher" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '12px' }}>
      <button
        type="button"
        className={`button button-ghost ${currentLang === 'ru' ? 'active' : ''}`}
        onClick={() => changeLanguage('ru')}
        style={{
          padding: '4px 10px',
          fontSize: '11.5px',
          fontWeight: currentLang === 'ru' ? 700 : 500,
          backgroundColor: currentLang === 'ru' ? 'var(--color-primary)' : 'transparent',
          color: currentLang === 'ru' ? '#ffffff' : 'var(--color-fg-muted)',
          borderRadius: 'var(--radius-sm)',
        }}
        aria-label="Русский язык"
      >
        RU
      </button>
      <span style={{ color: 'var(--color-fg-subtle)', opacity: 0.4 }}>|</span>
      <button
        type="button"
        className={`button button-ghost ${currentLang === 'kk' ? 'active' : ''}`}
        onClick={() => changeLanguage('kk')}
        style={{
          padding: '4px 10px',
          fontSize: '11.5px',
          fontWeight: currentLang === 'kk' ? 700 : 500,
          backgroundColor: currentLang === 'kk' ? 'var(--color-primary)' : 'transparent',
          color: currentLang === 'kk' ? '#ffffff' : 'var(--color-fg-muted)',
          borderRadius: 'var(--radius-sm)',
        }}
        aria-label="Қазақ тілі"
      >
        ҚАЗ
      </button>
    </div>
  )
}
