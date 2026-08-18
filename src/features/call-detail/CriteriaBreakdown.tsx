import React from 'react'
import { useTranslation } from 'react-i18next'
import type { CriterionResult } from '../../entities/call/model'

export function CriteriaBreakdown({ criterionResults }: { criterionResults: Record<string, CriterionResult> }) {
  const { t } = useTranslation('scoring')

  return (
    <section className="content-card">
      <div className="section-heading" style={{ marginBottom: '16px' }}>
        <div>
          <span className="eyebrow">{t('header.scoringBreakdown')}</span>
          <h2>{t('header.criteria')}</h2>
        </div>
      </div>
      <div className="criteria-list">
        {Object.entries(criterionResults).map(([key, result]) => {
          const percent = result.max ? Math.round((result.score / result.max) * 100) : 0
          return (
            <div className="criterion-item" key={key}>
              <div className="criterion-header">
                <span className="criterion-title">{t(`criteria.${key}`, { defaultValue: key })}</span>
                <span className="criterion-score">
                  <strong>{result.score}</strong>
                  <small> / {result.max}</small>
                </span>
              </div>
              <div className="criterion-track">
                <div className="criterion-bar" style={{ width: `${percent}%` }} />
              </div>
              {result.feedback && <p className="criterion-feedback">{result.feedback}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
