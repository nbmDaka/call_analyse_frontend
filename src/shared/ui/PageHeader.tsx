import React from 'react'

export interface PageHeaderProps {
  eyebrow?: string
  title: string
  action?: React.ReactNode
}

export function PageHeader({ eyebrow, title, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <div className="header-row">
        <h1>{title}</h1>
        {action}
      </div>
    </header>
  )
}
