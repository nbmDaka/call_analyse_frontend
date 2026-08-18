import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Transcript } from '../../entities/call/model'

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
      <div className="transcript">
        {transcript.segments?.length ? (
          transcript.segments.map((segment, index) => (
            <div className={`transcript-line ${segment.speaker}`} key={`${segment.text}-${index}`}>
              <span>{segment.speaker === 'manager' ? t('transcript.manager') : t('transcript.customer')}</span>
              <p>{segment.text}</p>
            </div>
          ))
        ) : (
          <p>{transcript.text}</p>
        )}
      </div>
    </section>
  )
}
