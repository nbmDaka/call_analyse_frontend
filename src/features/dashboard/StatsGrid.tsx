import React from 'react'
import type { DashboardSummary } from '../../entities/call/model'
import { StatCard } from '../../shared/ui/StatCard'

export interface StatsGridProps {
  summary?: DashboardSummary
}

export function StatsGrid({ summary }: StatsGridProps) {
  return (
    <div className="stats-grid">
      <StatCard label="Total calls" value={summary?.totalCalls ?? '—'} hint="All time recordings" />
      <StatCard label="Completed" value={summary?.completedCalls ?? '—'} hint="Processed successfully" tone="positive" />
      <StatCard label="Failed" value={summary?.failedCalls ?? '—'} hint="Need attention" tone="negative" />
      <StatCard
        label="Average score"
        value={summary?.averageScore == null ? '—' : `${Math.round(summary.averageScore)}/100`}
        hint="Across completed calls"
        tone="accent"
      />
    </div>
  )
}
