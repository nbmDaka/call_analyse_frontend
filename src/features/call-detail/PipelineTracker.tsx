import React from 'react'
import { useTranslation } from 'react-i18next'
import type { CallStatus } from '../../entities/call/model'

interface StepProps {
  label: string
  status: 'completed' | 'current' | 'future' | 'failed'
}

function PipelineStep({ label, status }: StepProps) {
  return (
    <div className={`pipeline-step ${status}`}>
      <div className="pipeline-dot">
        {status === 'completed' ? '✓' : status === 'failed' ? '✕' : status === 'current' ? '•' : ''}
      </div>
      <span>{label}</span>
    </div>
  )
}

export function PipelineTracker({ status }: { status: CallStatus }) {
  const { t } = useTranslation('calls')

  const isFailed = status === 'failed'
  const isDone = status === 'completed'

  const getStepStatus = (step: 'uploaded' | 'transcribing' | 'analyzing' | 'completed'): StepProps['status'] => {
    if (isFailed) {
      if (step === 'uploaded') return 'completed'
      return 'failed'
    }

    if (isDone) return 'completed'

    if (step === 'uploaded') return 'completed'
    if (step === 'transcribing') {
      if (['transcribing', 'transcribed'].includes(status)) return 'current'
      if (status === 'analyzing') return 'completed'
      return 'future'
    }
    if (step === 'analyzing') {
      if (status === 'analyzing') return 'current'
      return 'future'
    }

    return 'future'
  }

  return (
    <div className="pipeline-card">
      <div className="pipeline-steps">
        <PipelineStep label={t('status.uploaded')} status={getStepStatus('uploaded')} />
        <div className="pipeline-line" />
        <PipelineStep label={t('status.transcribing')} status={getStepStatus('transcribing')} />
        <div className="pipeline-line" />
        <PipelineStep label={t('status.analyzing')} status={getStepStatus('analyzing')} />
        <div className="pipeline-line" />
        <PipelineStep label={t('status.completed')} status={getStepStatus('completed')} />
      </div>
    </div>
  )
}
