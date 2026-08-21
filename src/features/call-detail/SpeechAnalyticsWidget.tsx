import React from 'react'
import type { SpeechAnalytics, RoleMapping } from '../../entities/call/model'

interface SpeechAnalyticsWidgetProps {
  speechAnalytics?: SpeechAnalytics
  roleMapping?: RoleMapping
}

export function SpeechAnalyticsWidget({ speechAnalytics, roleMapping }: SpeechAnalyticsWidgetProps) {
  if (!speechAnalytics) return null

  const talk = speechAnalytics.talkToListen ?? { managerPercentage: 50, clientPercentage: 50 }
  const pausesCount = speechAnalytics.awkwardPauses?.length ?? 0
  const interruptionsCount = speechAnalytics.interruptions?.length ?? 0
  const tone = speechAnalytics.emotionalTone

  return (
    <div className="speech-analytics-card">
      <div className="ai-header">
        <span className="eyebrow">Аналитика речи и акустики</span>
        <h3>Динамика диалога и баланс речи</h3>
      </div>

      {/* Talk-to-Listen Ratio */}
      <div className="talk-ratio-container">
        <div className="talk-ratio-labels">
          <span>Менеджер: {talk.managerPercentage}%</span>
          <span>Клиент: {talk.clientPercentage}%</span>
        </div>
        <div className="talk-ratio-bar">
          <div className="talk-ratio-manager" style={{ width: `${talk.managerPercentage}%` }} />
          <div className="talk-ratio-client" style={{ width: `${talk.clientPercentage}%` }} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="speech-metrics-grid">
        <div className="speech-metric-box">
          <span className="metric-label">Неловкие паузы (&gt;3.5с)</span>
          <span className="metric-value">{pausesCount}</span>
        </div>

        <div className="speech-metric-box">
          <span className="metric-label">Перебивания</span>
          <span className="metric-value">{interruptionsCount}</span>
        </div>

        {tone && (
          <div className="speech-metric-box">
            <span className="metric-label">Тон клиента</span>
            <span className="metric-value" style={{ fontSize: '14px', textTransform: 'capitalize' }}>
              {tone.clientTone}
            </span>
          </div>
        )}

        {tone && (
          <div className="speech-metric-box">
            <span className="metric-label">Тон менеджера</span>
            <span className="metric-value" style={{ fontSize: '14px', textTransform: 'capitalize' }}>
              {tone.managerTone}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
