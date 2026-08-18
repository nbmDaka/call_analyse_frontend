import React from 'react'
import { useTranslation } from 'react-i18next'
import type { CallStatus } from '../../entities/call/model'

export function StatusPill({ status }: { status: CallStatus }) {
  const { t } = useTranslation('calls')
  return (
    <span className={`status-pill status-${status}`}>
      <i />
      {t(`status.${status}`, { defaultValue: status })}
    </span>
  )
}
