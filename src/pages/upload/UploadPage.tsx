import React from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { canUploadInWorkspace } from '../../entities/workspace/model'
import { useWorkspace } from '../../features/workspaces/useWorkspace'
import { UploadDropzone } from '../../features/upload-call/UploadDropzone'
import { PageHeader } from '../../shared/ui/PageHeader'

export function UploadPage() {
  const { activeWorkspace } = useWorkspace()
  const { t } = useTranslation('upload')

  if (!canUploadInWorkspace(activeWorkspace)) return <Navigate to="/calls" replace />

  return (
    <>
      <PageHeader eyebrow={t('header.eyebrow')} title={t('header.title')} />
      <UploadDropzone />
    </>
  )
}
