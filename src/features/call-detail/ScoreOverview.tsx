import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Score } from '../../entities/call/model'

export function ScoreOverview({ score }: { score: Score }) {
  const { t } = useTranslation('scoring')
  return (
    <section className="score-overview">
      <div>
        <span className="eyebrow">{t('header.overallScore')}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '6px' }}>
          <strong>{score.total}</strong>
          <span>/ 100</span>
        </div>
      </div>
      <div className="score-ring" style={{ '--score': `${score.total}%` } as React.CSSProperties}>
        <span>{score.total}%</span>
      </div>
    </section>
  )
}
