import React from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../features/auth/useAuth'
import { canUpload } from '../../entities/user/model'
import { UploadDropzone } from '../../features/upload-call/UploadDropzone'
import { PageHeader } from '../../shared/ui/PageHeader'

export function UploadPage() {
  const { user } = useAuth()
  const { t } = useTranslation('upload')

  if (!canUpload(user?.role)) return <Navigate to="/calls" replace />

  return (
    <>
      <PageHeader eyebrow={t('header.eyebrow')} title={t('header.title')} />
      <UploadDropzone />
    </>
  )
}
