import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../features/auth/useAuth'
import { canUpload } from '../../entities/user/model'
import { getDashboard } from '../../features/dashboard/api'
import { getCalls } from '../../features/calls-list/api'
import { StatsGrid } from '../../features/dashboard/StatsGrid'
import { CallTable } from '../../features/calls-list/CallTable'
import { PageHeader } from '../../shared/ui/PageHeader'
import { ErrorState } from '../../shared/ui/ErrorState'
import { IconUpload } from '../../shared/ui/Icons'

export function DashboardPage() {
  const { user } = useAuth()
  const { t } = useTranslation(['dashboard', 'common'])
  const summary = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard })
  const calls = useQuery({ queryKey: ['calls', 1], queryFn: () => getCalls(1, 5) })

  return (
    <>
      <PageHeader
        eyebrow={t('dashboard:header.eyebrow')}
        title={t('dashboard:header.title')}
        action={
          canUpload(user?.role) && (
            <Link className="button button-primary" to="/calls/new">
              <IconUpload />
              {t('common:actions.analyseCall')}
            </Link>
          )
        }
      />
      {summary.isError ? (
        <ErrorState message={summary.error.message} />
      ) : (
        <>
          <StatsGrid summary={summary.data} />
          <section className="content-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{t('dashboard:recent.eyebrow')}</span>
                <h2>{t('dashboard:recent.title')}</h2>
              </div>
              <Link className="text-link" to="/calls">
                {t('dashboard:recent.viewAll')}
              </Link>
            </div>
            {calls.isError ? <ErrorState message={calls.error.message} /> : <CallTable calls={calls.data?.calls ?? []} compact={true} />}
          </section>
        </>
      )}
    </>
  )
}
