import React from 'react'
import type { Transcript } from '../../entities/call/model'

export function TranscriptViewer({ transcript }: { transcript: Transcript }) {
  return (
    <section className="content-card transcript-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">CONVERSATION</span>
          <h2>Transcript</h2>
        </div>
      </div>
      <div className="transcript">
        {transcript.segments?.length ? (
          transcript.segments.map((segment, index) => (
            <div className={`transcript-line ${segment.speaker}`} key={`${segment.text}-${index}`}>
              <span>{segment.speaker === 'manager' ? 'Manager' : 'Customer'}</span>
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
