import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Analysis } from '../../entities/call/model'
import { IconSparkles } from '../../shared/ui/Icons'
import { SpeechAnalyticsWidget } from './SpeechAnalyticsWidget'

function InsightSection({ title, items, variant }: { title: string; items?: string[]; variant?: 'positive' | 'negative' | 'neutral' }) {
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
  const violations = analysis.violations ?? []
  const coaching = analysis.actionableCoaching ?? []

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

      {/* Speech Dynamics & Acoustic Analytics */}
      {analysis.speechAnalytics && (
        <SpeechAnalyticsWidget
          speechAnalytics={analysis.speechAnalytics}
          roleMapping={analysis.roleMapping}
        />
      )}

      {/* Structured Violations with Quotes & Advice */}
      {violations.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <span className="eyebrow" style={{ color: '#ef4444' }}>Выявленные ошибки и нарушения</span>
          <div className="violations-container">
            {violations.map((v, i) => (
              <div key={i} className={`violation-card severity-${v.severity}`}>
                <div className="violation-header">
                  <span className="violation-title">{v.title}</span>
                  <span className={`severity-tag ${v.severity}`}>
                    {v.severity === 'high' ? 'Критично' : v.severity === 'medium' ? 'Средняя' : 'Низкая'}
                  </span>
                </div>
                {v.quote && <div className="violation-quote">«{v.quote}»</div>}
                {v.fixAdvice && (
                  <div className="violation-advice">
                    <strong>Как исправить:</strong> {v.fixAdvice}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Sales Coaching */}
      {coaching.length > 0 && (
        <div className="coaching-card" style={{ marginBottom: '24px' }}>
          <h4>💡 Персональные рекомендации для менеджера</h4>
          <ul>
            {coaching.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Standard Sales Insights */}
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
