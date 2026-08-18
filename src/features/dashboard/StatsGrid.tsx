import React from 'react'
import { useTranslation } from 'react-i18next'
import type { DashboardSummary } from '../../entities/call/model'
import { StatCard } from '../../shared/ui/StatCard'

export interface StatsGridProps {
  summary?: DashboardSummary
}

export function StatsGrid({ summary }: StatsGridProps) {
  const { t } = useTranslation('dashboard')
  return (
    <div className="stats-grid">
      <StatCard label={t('stats.totalCalls')} value={summary?.totalCalls ?? '—'} hint={t('stats.allTime')} />
      <StatCard label={t('stats.completed')} value={summary?.completedCalls ?? '—'} hint={t('stats.completedHint')} tone="positive" />
      <StatCard label={t('stats.failed')} value={summary?.failedCalls ?? '—'} hint={t('stats.failedHint')} tone="negative" />
      <StatCard
        label={t('stats.averageScore')}
        value={summary?.averageScore == null ? '—' : `${Math.round(summary.averageScore)}/100`}
        hint={t('stats.averageHint')}
        tone="accent"
      />
    </div>
  )
}
