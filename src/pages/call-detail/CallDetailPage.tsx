import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { formatBytes, formatDate } from '../../entities/call/model'
import { getCall } from '../../features/call-detail/api'
import { ScoreOverview } from '../../features/call-detail/ScoreOverview'
import { PipelineTracker } from '../../features/call-detail/PipelineTracker'
import { AIFeedback } from '../../features/call-detail/AIFeedback'
import { CriteriaBreakdown } from '../../features/call-detail/CriteriaBreakdown'
import { TranscriptViewer } from '../../features/call-detail/TranscriptViewer'
import { PageHeader } from '../../shared/ui/PageHeader'
import { StatusPill } from '../../shared/ui/StatusPill'
import { ErrorState } from '../../shared/ui/ErrorState'
import { LoadingLine } from '../../shared/ui/LoadingLine'

export function CallDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation(['calls', 'common', 'errors'])
  const detail = useQuery({
    queryKey: ['call', id],
    queryFn: () => getCall(id ?? ''),
    enabled: Boolean(id),
    refetchInterval: query => (['completed', 'failed'].includes(query.state.data?.call.status ?? '') ? false : 4000),
  })

  if (detail.isLoading) return <LoadingLine />
  if (detail.isError || !detail.data) return <ErrorState message={detail.error?.message} />

  const data = detail.data

  return (
    <>
      <Link className="back-link" to="/calls">
        ← {t('common:actions.back')}
      </Link>
      <PageHeader
        eyebrow={t('calls:header.detailEyebrow')}
        title={data.call.originalFilename || t('calls:header.untitled')}
        action={<StatusPill status={data.call.status} />}
      />
      <div className="detail-meta">
        <span>{formatDate(data.call.createdAt, i18n.language)}</span>
        <span>{formatBytes(data.call.sizeBytes, i18n.language)}</span>
        <span>{data.manager?.email ?? 'Manager'}</span>
      </div>

      {data.call.status === 'failed' && (
        <div className="alert alert-error">
          <strong>{t('errors:viewError.detailFailedTitle')}</strong>
          <span>{t('errors:viewError.detailFailedSub')}</span>
        </div>
      )}

      <PipelineTracker status={data.call.status} />

      {data.score && <ScoreOverview score={data.score} />}

      {data.analysis && (
        <div className="detail-grid">
          <AIFeedback analysis={data.analysis} />
          <CriteriaBreakdown criterionResults={data.analysis.criterionResults} />
        </div>
      )}

      {data.transcript && <TranscriptViewer transcript={data.transcript} />}
    </>
  )
}
