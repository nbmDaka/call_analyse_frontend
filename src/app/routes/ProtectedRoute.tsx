import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../features/auth/useAuth'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const { t } = useTranslation('common')

  if (loading)
    return (
      <div className="screen-loader">
        <div className="brand-mark">CA</div>
        {t('loading.workspace')}
      </div>
    )
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}
