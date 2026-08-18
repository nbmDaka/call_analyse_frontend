import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Analysis } from '../../entities/call/model'

function ListBlock({ title, items }: { title: string; items?: string[] }) {
  const { t } = useTranslation('scoring')
  return (
    <div className="insight-block">
      <h3>{title}</h3>
      {items?.length ? (
        <ul>
          {items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">{t('insights.empty')}</p>
      )}
    </div>
  )
}

export function AIFeedback({ analysis }: { analysis: Analysis }) {
  const { t } = useTranslation('scoring')
  return (
    <section className="content-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t('header.aiFeedback')}</span>
          <h2>{t('header.analysisSummary')}</h2>
        </div>
      </div>
      <p className="lead">{analysis.summary}</p>
      <div className="insights-grid">
        <ListBlock title={t('insights.needs')} items={analysis.needs} />
        <ListBlock title={t('insights.objections')} items={analysis.objections} />
        <ListBlock title={t('insights.strengths')} items={analysis.strengths} />
        <ListBlock title={t('insights.mistakes')} items={analysis.mistakes} />
      </div>
      <div className="next-action">
        <span className="eyebrow">{t('header.recommendedAction')}</span>
        <p>{analysis.nextAction}</p>
      </div>
    </section>
  )
}
