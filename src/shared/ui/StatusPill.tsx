import React from 'react'
import type { CallStatus } from '../../entities/call/model'
import { statusLabel } from '../../entities/call/model'

export function StatusPill({ status }: { status: CallStatus }) {
  return (
    <span className={`status-pill status-${status}`}>
      <i />
      {statusLabel(status)}
    </span>
  )
}
