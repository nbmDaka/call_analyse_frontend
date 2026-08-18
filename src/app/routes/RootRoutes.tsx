import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../../pages/login/LoginPage'
import { DashboardPage } from '../../pages/dashboard/DashboardPage'
import { CallsPage } from '../../pages/calls/CallsPage'
import { UploadPage } from '../../pages/upload/UploadPage'
import { CallDetailPage } from '../../pages/call-detail/CallDetailPage'
import { ProtectedRoute } from './ProtectedRoute'
import { AppShell } from './AppShell'

export function RootRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calls" element={<CallsPage />} />
          <Route path="/calls/new" element={<UploadPage />} />
          <Route path="/calls/:id" element={<CallDetailPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
