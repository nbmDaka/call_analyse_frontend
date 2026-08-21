import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import type { Workspace } from '../../entities/workspace/model'
import { chooseActiveWorkspace } from '../../entities/workspace/model'
import { useAuth } from '../auth/useAuth'
import { getWorkspaces } from './api'
import { WorkspaceContext } from './WorkspaceContext'

const STORAGE_KEY = 'callwise.workspaceId'

export function WorkspaceProvider({ children, queryClient }: { children: React.ReactNode; queryClient: QueryClient }) {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const reload = useCallback(async () => {
    if (!user) { setWorkspaces([]); setActiveWorkspace(null); return }
    setLoading(true); setError(null)
    try {
      const items = await getWorkspaces()
      const chosen = chooseActiveWorkspace(items, localStorage.getItem(STORAGE_KEY))
      setWorkspaces(items); setActiveWorkspace(chosen)
      if (chosen) localStorage.setItem(STORAGE_KEY, chosen.id)
      else localStorage.removeItem(STORAGE_KEY)
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error('Failed to load workspaces'))
      setWorkspaces([]); setActiveWorkspace(null)
    } finally { setLoading(false) }
  }, [user])

  useEffect(() => { void reload() }, [reload])

  const value = useMemo(() => ({
    workspaces, activeWorkspace, loading, error,
    selectWorkspace(workspaceId: string) {
      const next = chooseActiveWorkspace(workspaces, workspaceId)
      if (!next || next.id === activeWorkspace?.id) return
      setActiveWorkspace(next); localStorage.setItem(STORAGE_KEY, next.id)
      queryClient.removeQueries({ predicate: query => ['workspace', 'calls', 'call', 'dashboard', 'members'].includes(String(query.queryKey[0])) && query.queryKey[1] !== next.id })
    },
    reload,
  }), [workspaces, activeWorkspace, loading, error, reload, queryClient])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
