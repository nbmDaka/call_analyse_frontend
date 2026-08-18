import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Transcript } from '../../entities/call/model'

function formatSeconds(seconds?: number): string {
  if (seconds === undefined || seconds === null) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function TranscriptViewer({ transcript }: { transcript: Transcript }) {
  const { t } = useTranslation('calls')

  return (
    <section className="content-card transcript-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t('transcript.eyebrow')}</span>
          <h2>{t('transcript.title')}</h2>
        </div>
      </div>

      <div className="transcript-list">
        {transcript.segments?.length ? (
          transcript.segments.map((segment, index) => {
            const isManager = segment.speaker === 'manager'
            const timestamp = formatSeconds(segment.startSeconds)
            return (
              <div className={`transcript-row ${isManager ? 'role-manager' : 'role-customer'}`} key={`${segment.text}-${index}`}>
                <div className="transcript-meta">
                  {timestamp && <span className="transcript-time">{timestamp}</span>}
                  <span className={`speaker-badge ${isManager ? 'badge-manager' : 'badge-customer'}`}>
                    {isManager ? t('transcript.manager') : t('transcript.customer')}
                  </span>
                </div>
                <p className="transcript-text">{segment.text}</p>
              </div>
            )
          })
        ) : (
          <p className="transcript-plain">{transcript.text}</p>
        )}
      </div>
    </section>
  )
}
