import React from 'react'
import { Link } from 'react-router-dom'
import type { Call } from '../../entities/call/model'
import { formatBytes, formatDate } from '../../entities/call/model'
import { StatusPill } from '../../shared/ui/StatusPill'

export interface CallTableProps {
  calls: Call[]
  compact?: boolean
}

export function CallTable({ calls, compact = false }: CallTableProps) {
  if (!calls.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon">◌</span>
        <h3>No calls yet</h3>
        <p>Upload your first recording to start analysing conversations.</p>
        <Link className="button button-secondary" to="/calls/new">
          Upload a call
        </Link>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Recording</th>
            <th>Status</th>
            <th>Uploaded</th>
            <th>Size</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {calls.map(call => (
            <tr key={call.id}>
              <td>
                <Link className="call-name" to={`/calls/${call.id}`}>
                  {call.originalFilename || 'Untitled recording'}
                </Link>
                <span className="table-sub">{call.id.slice(0, 8)}</span>
              </td>
              <td>
                <StatusPill status={call.status} />
              </td>
              <td>{formatDate(call.createdAt)}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{formatBytes(call.sizeBytes)}</td>
              <td style={{ textAlign: 'right' }}>
                <Link className="row-arrow" to={`/calls/${call.id}`}>
                  →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {compact && calls.length > 0 && <></>}
    </div>
  )
}
