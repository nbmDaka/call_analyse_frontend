import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../features/auth/useAuth'
import { canUpload } from '../../entities/user/model'
import { getCalls } from '../../features/calls-list/api'
import { CallTable } from '../../features/calls-list/CallTable'
import { PageHeader } from '../../shared/ui/PageHeader'
import { ErrorState } from '../../shared/ui/ErrorState'
import { LoadingLine } from '../../shared/ui/LoadingLine'
import { IconUpload } from '../../shared/ui/Icons'

export function CallsPage() {
  const { user } = useAuth()
  const { t } = useTranslation(['calls', 'common'])
  const [page, setPage] = useState(1)
  const calls = useQuery({ queryKey: ['calls', page], queryFn: () => getCalls(page) })

  return (
    <>
      <PageHeader
        eyebrow={t('calls:header.eyebrow')}
        title={t('calls:header.title')}
        action={
          canUpload(user?.role) && (
            <Link className="button button-primary" to="/calls/new">
              <IconUpload />
              {t('common:actions.uploadCall')}
            </Link>
          )
        }
      />
      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>{t('calls:library.title')}</h2>
            <p className="muted">{t('calls:library.sub')}</p>
          </div>
          {calls.data && <span className="result-count">{t('calls:library.total', { count: calls.data.total })}</span>}
        </div>
        {calls.isLoading ? (
          <LoadingLine />
        ) : calls.isError ? (
          <ErrorState message={calls.error.message} />
        ) : (
          <>
            <CallTable calls={calls.data?.calls ?? []} />
            {(calls.data?.totalPages ?? 1) > 1 && (
              <div className="pagination">
                <span>
                  {t('calls:pagination.page', { current: page, total: calls.data?.totalPages })}
                </span>
                <div className="pagination-controls">
                  <button disabled={page === 1} onClick={() => setPage(value => value - 1)}>
                    {t('common:actions.previous')}
                  </button>
                  <button disabled={page === calls.data?.totalPages} onClick={() => setPage(value => value + 1)}>
                    {t('common:actions.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
