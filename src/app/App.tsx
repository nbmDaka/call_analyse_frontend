import React from 'react'
import { AppProviders } from './providers/AppProviders'
import { RootRoutes } from './routes/RootRoutes'

export function App() {
  return (
    <AppProviders>
      <RootRoutes />
    </AppProviders>
  )
}
