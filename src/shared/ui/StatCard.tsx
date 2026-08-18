import React from 'react'

export interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  tone?: string
}

export function StatCard({ label, value, hint, tone }: StatCardProps) {
  return (
    <div className={`stat-card ${tone ?? ''}`}>
      <div className="stat-card-header">
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  )
}
