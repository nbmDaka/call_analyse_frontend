import React from 'react'
import { useTranslation } from 'react-i18next'
import type { CallStatus } from '../../entities/call/model'

export function PipelineStep({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`pipeline-step ${active ? 'active' : ''}`}>
      <span>{active ? '✓' : '·'}</span>
      <b>{label}</b>
    </div>
  )
}

export function PipelineTracker({ status }: { status: CallStatus }) {
  const { t } = useTranslation('calls')
  if (['completed', 'failed'].includes(status)) return null

  return (
    <div className="pipeline">
      <div className="pipeline-track" />
      <PipelineStep label={t('status.uploaded')} active={true} />
      <PipelineStep label={t('status.transcribing')} active={['transcribing', 'transcribed', 'analyzing'].includes(status)} />
      <PipelineStep label={t('status.analyzing')} active={['analyzing'].includes(status)} />
      <PipelineStep label={t('status.completed')} active={status === 'completed'} />
    </div>
  )
}
