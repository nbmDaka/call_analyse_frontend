import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading)
    return (
      <div className="screen-loader">
        <div className="brand-mark">CA</div>
        Loading workspace…
      </div>
    )
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}
