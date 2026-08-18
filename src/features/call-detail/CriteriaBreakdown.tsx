import React from 'react'
import { useTranslation } from 'react-i18next'
import type { CriterionResult } from '../../entities/call/model'

export function CriteriaBreakdown({ criterionResults }: { criterionResults: Record<string, CriterionResult> }) {
  const { t } = useTranslation('scoring')
  return (
    <section className="content-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t('header.scoringBreakdown')}</span>
          <h2>{t('header.criteria')}</h2>
        </div>
      </div>
      <div className="criteria-list">
        {Object.entries(criterionResults).map(([key, result]) => (
          <div className="criterion" key={key}>
            <div>
              <span>{t(`criteria.${key}`, { defaultValue: key })}</span>
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
