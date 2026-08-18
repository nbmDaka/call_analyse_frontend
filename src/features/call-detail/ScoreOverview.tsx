import React from 'react'
import type { Score } from '../../entities/call/model'

export function ScoreOverview({ score }: { score: Score }) {
  return (
    <section className="score-overview">
      <div>
        <span className="eyebrow">OVERALL SCORE</span>
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
