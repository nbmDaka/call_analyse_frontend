import React from 'react'
import type { CriterionResult } from '../../entities/call/model'
import { criteriaLabels } from '../../i18n/constants'

export function CriteriaBreakdown({ criterionResults }: { criterionResults: Record<string, CriterionResult> }) {
  return (
    <section className="content-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">SCORING BREAKDOWN</span>
          <h2>Criteria</h2>
        </div>
      </div>
      <div className="criteria-list">
        {Object.entries(criterionResults).map(([key, result]) => (
          <div className="criterion" key={key}>
            <div>
              <span>{criteriaLabels[key] ?? key}</span>
              <b>
                {result.score}
                <small>/{result.max}</small>
              </b>
            </div>
            <div className="progress">
              <i style={{ width: `${result.max ? (result.score / result.max) * 100 : 0}%` }} />
            </div>
            {result.feedback && <p>{result.feedback}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
