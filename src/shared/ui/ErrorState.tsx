import React from 'react'

export interface ErrorStateProps {
  message?: string
}

export function ErrorState({ message = 'Something went wrong. Please try again.' }: ErrorStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-icon">!</span>
      <h3>We couldn’t load this view</h3>
      <p>{message}</p>
    </div>
  )
}
