import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { canUpload } from '../../entities/user/model'
import { UploadDropzone } from '../../features/upload-call/UploadDropzone'
import { PageHeader } from '../../shared/ui/PageHeader'

export function UploadPage() {
  const { user } = useAuth()

  if (!canUpload(user?.role)) return <Navigate to="/calls" replace />

  return (
    <>
      <PageHeader eyebrow="NEW ANALYSIS" title="Upload a call" />
      <UploadDropzone />
    </>
  )
}
