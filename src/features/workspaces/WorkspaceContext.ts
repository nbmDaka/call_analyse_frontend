import { createContext } from 'react'
import type { Workspace } from '../../entities/workspace/model'

export interface WorkspaceContextValue {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  loading: boolean
  error: Error | null
  selectWorkspace: (workspaceId: string) => void
  reload: () => Promise<void>
}

export const WorkspaceContext = createContext<WorkspaceContextValue>({
  workspaces: [], activeWorkspace: null, loading: true, error: null,
  selectWorkspace: () => undefined, reload: async () => undefined,
})
