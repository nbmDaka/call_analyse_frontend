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
import { useWorkspace } from '../../features/workspaces/useWorkspace'

export function CallDetailPage() {
  const { id } = useParams()
  const { activeWorkspace } = useWorkspace()
  const { t, i18n } = useTranslation(['calls', 'common', 'errors'])
  const detail = useQuery({
    queryKey: ['call', activeWorkspace?.id, id],
    queryFn: () => getCall(activeWorkspace?.id ?? '', id ?? ''),
    enabled: Boolean(id && activeWorkspace?.id),
    refetchInterval: query => (['completed', 'failed'].includes(query.state.data?.call.status ?? '') ? false : 4000),
  })

  if (detail.isLoading) return <LoadingLine />
  if (detail.isError || !detail.data) return <ErrorState message={detail.error?.message} />

  const data = detail.data

  return (
    <div className="call-detail-page">
      <Link className="back-link" to="/calls">
        ← {t('common:actions.back')}
      </Link>

      <PageHeader
        eyebrow={t('calls:header.detailEyebrow')}
        title={data.call.originalFilename || t('calls:header.untitled')}
        action={<StatusPill status={data.call.status} />}
      />

      <div className="detail-meta-bar">
        <span className="meta-tag">{formatDate(data.call.createdAt, i18n.language)}</span>
        <span className="meta-tag">{formatBytes(data.call.sizeBytes, i18n.language)}</span>
        <span className="meta-tag">{data.manager?.email ?? 'Manager'}</span>
      </div>

      {data.call.status === 'failed' && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <strong>{t('errors:viewError.detailFailedTitle')}</strong>
          <span>{t('errors:viewError.detailFailedSub')}</span>
        </div>
      )}

      <PipelineTracker status={data.call.status} />

      <div className="call-detail-layout">
        <div className="detail-main-col">
          {data.analysis && <AIFeedback analysis={data.analysis} />}
          {data.transcript && <TranscriptViewer transcript={data.transcript} />}
        </div>

        <div className="detail-side-col">
          {data.score && <ScoreOverview score={data.score} />}
          {data.analysis && <CriteriaBreakdown criterionResults={data.analysis.criterionResults} />}
        </div>
      </div>
    </div>
  )
}
