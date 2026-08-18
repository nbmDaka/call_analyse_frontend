import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Call } from '../../entities/call/model'
import { formatBytes, formatDate } from '../../entities/call/model'
import { StatusPill } from '../../shared/ui/StatusPill'

export interface CallTableProps {
  calls: Call[]
  compact?: boolean
}

export function CallTable({ calls, compact = false }: CallTableProps) {
  const { t, i18n } = useTranslation(['calls', 'common'])

  if (!calls.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon">◌</span>
        <h3>{t('calls:empty.title')}</h3>
        <p>{t('calls:empty.sub')}</p>
        <Link className="button button-secondary" to="/calls/new">
          {t('common:actions.uploadCall')}
        </Link>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{t('calls:table.recording')}</th>
            <th>{t('calls:table.status')}</th>
            <th>{t('calls:table.uploaded')}</th>
            <th>{t('calls:table.size')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {calls.map(call => (
            <tr key={call.id}>
              <td>
                <Link className="call-name" to={`/calls/${call.id}`}>
                  {call.originalFilename || t('calls:header.untitled')}
                </Link>
                <span className="table-sub">{call.id.slice(0, 8)}</span>
              </td>
              <td>
                <StatusPill status={call.status} />
              </td>
              <td>{formatDate(call.createdAt, i18n.language)}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{formatBytes(call.sizeBytes, i18n.language)}</td>
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
