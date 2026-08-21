import { useContext } from 'react'
import { WorkspaceContext } from './WorkspaceContext'

export function useWorkspace() { return useContext(WorkspaceContext) }
