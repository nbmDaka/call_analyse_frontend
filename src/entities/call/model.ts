import type { User } from '../user/model'
import { statusLabels } from '../../i18n/constants'

export type CallStatus = 'uploaded' | 'queued' | 'transcribing' | 'transcribed' | 'analyzing' | 'completed' | 'failed'

export interface Call {
  id: string
  managerId: string
  status: CallStatus
  originalFilename: string
  contentType: string
  sizeBytes: number
  durationSeconds?: number | null
  errorMessage?: string | null
  createdAt: string
  updatedAt: string
}

export interface CallPage {
  calls: Call[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface TranscriptSegment {
  speaker: 'manager' | 'client'
  text: string
  startSeconds?: number
  endSeconds?: number
}

export interface Transcript {
  text: string
  segments: TranscriptSegment[]
}

export interface CriterionResult {
  score: number
  max?: number
  feedback?: string
}

export interface Analysis {
  summary: string
  needs: string[]
  objections: string[]
  refusalReason?: string | null
  mistakes: string[]
  strengths: string[]
  nextAction: string
  criterionResults: Record<string, CriterionResult>
}

export interface Score {
  total: number
  criteria: Record<string, CriterionResult>
}

export interface CallDetail {
  call: Call
  manager?: User | null
  audio: { filename: string; contentType: string; sizeBytes: number }
  transcript?: Transcript | null
  analysis?: Analysis | null
  score?: Score | null
}

export interface DashboardSummary {
  totalCalls: number
  completedCalls: number
  failedCalls: number
  averageScore: number | null
}

export function statusLabel(status: CallStatus): string {
  return statusLabels[status] ?? 'Unknown status'
}

export function formatDate(value: string): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}
