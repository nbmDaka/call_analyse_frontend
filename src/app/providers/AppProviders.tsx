import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../features/auth/AuthProvider'
import { WorkspaceProvider } from '../../features/workspaces/WorkspaceProvider'

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 15_000 } },
})

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider queryClient={queryClient}>
          <WorkspaceProvider queryClient={queryClient}>{children}</WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
