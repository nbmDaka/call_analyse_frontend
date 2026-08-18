import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Score } from '../../entities/call/model'

export function ScoreOverview({ score }: { score: Score }) {
  const { t } = useTranslation('scoring')
  const percentage = Math.min(100, Math.max(0, score.total))

  let scoreTier = 'high'
  if (percentage < 50) scoreTier = 'low'
  else if (percentage < 75) scoreTier = 'mid'

  return (
    <section className="content-card score-card">
      <span className="eyebrow">{t('header.overallScore')}</span>
      <div className={`score-display tier-${scoreTier}`}>
        <div className="score-ring-container">
          <svg className="score-ring-svg" viewBox="0 0 100 100">
            <circle className="score-ring-bg" cx="50" cy="50" r="42" />
            <circle
              className="score-ring-val"
              cx="50"
              cy="50"
              r="42"
              strokeDasharray={263.89}
              strokeDashoffset={263.89 - (263.89 * percentage) / 100}
            />
          </svg>
          <div className="score-ring-content">
            <strong className="score-number">{score.total}</strong>
            <span className="score-max">/ 100</span>
          </div>
        </div>
      </div>
    </section>
  )
}
