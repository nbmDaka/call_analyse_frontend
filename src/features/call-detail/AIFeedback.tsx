import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Analysis } from '../../entities/call/model'
import { IconSparkles } from '../../shared/ui/Icons'

function InsightSection({ title, items, variant }: { title: string; items?: string[]; variant?: 'positive' | 'negative' | 'neutral' }) {
  const { t } = useTranslation('scoring')
  if (!items || items.length === 0) return null

  return (
    <div className={`insight-block ${variant ? `variant-${variant}` : ''}`}>
      <h4>{title}</h4>
      <ul>
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export function AIFeedback({ analysis }: { analysis: Analysis }) {
  const { t } = useTranslation('scoring')

  return (
    <section className="ai-surface">
      <div className="ai-header">
        <div className="ai-badge">
          <IconSparkles />
          <span>{t('header.aiFeedback')}</span>
        </div>
        <h2>{t('header.analysisSummary')}</h2>
      </div>

      <p className="ai-summary-lead">{analysis.summary}</p>

      <div className="insights-container">
        <InsightSection title={t('insights.needs')} items={analysis.needs} variant="neutral" />
        <InsightSection title={t('insights.objections')} items={analysis.objections} variant="negative" />
        <InsightSection title={t('insights.strengths')} items={analysis.strengths} variant="positive" />
        <InsightSection title={t('insights.mistakes')} items={analysis.mistakes} variant="negative" />
      </div>

      {analysis.nextAction && (
        <div className="next-action-card">
          <span className="eyebrow">{t('header.recommendedAction')}</span>
          <p>{analysis.nextAction}</p>
        </div>
      )}
    </section>
  )
}
