import React from 'react'
import { useTranslation } from 'react-i18next'

export interface ErrorStateProps {
  message?: string
}

export function ErrorState({ message }: ErrorStateProps) {
  const { t } = useTranslation('errors')
  return (
    <div className="empty-state">
      <span className="empty-icon">!</span>
      <h3>{t('viewError.title')}</h3>
      <p>{message || t('codes.DEFAULT')}</p>
    </div>
  )
}
