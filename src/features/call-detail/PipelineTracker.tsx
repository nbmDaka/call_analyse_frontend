import React from 'react'
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
  if (['completed', 'failed'].includes(status)) return null

  return (
    <div className="pipeline">
      <div className="pipeline-track" />
      <PipelineStep label="Uploaded" active={true} />
      <PipelineStep label="Transcription" active={['transcribing', 'transcribed', 'analyzing'].includes(status)} />
      <PipelineStep label="AI analysis" active={['analyzing'].includes(status)} />
      <PipelineStep label="Complete" active={status === 'completed'} />
    </div>
  )
}
