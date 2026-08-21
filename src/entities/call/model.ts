import type { User } from '../user/model'
import i18n from '../../i18n'

export type CallStatus = 'uploaded' | 'queued' | 'transcribing' | 'transcribed' | 'analyzing' | 'completed' | 'failed'

export interface Call {
  id: string
  workspaceId?: string
  ownerUserId?: string
  uploadedByUserId?: string
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


export interface RoleMapping {

  managerSpeaker?: string
  clientSpeaker?: string
}

export interface TalkToListenRatio {
  managerPercentage: number
  clientPercentage: number
}

export interface AwkwardPause {
  startSeconds: number
  endSeconds: number
  durationSeconds: number
}

export interface Interruption {
  timestampSeconds: number
  interruptedBy: string
  context: string
}

export interface EmotionalTone {
  managerTone: string
  clientTone: string
  sentimentShift: string
}

export interface SpeechAnalytics {
  talkToListen?: TalkToListenRatio
  awkwardPauses?: AwkwardPause[]
  interruptions?: Interruption[]
  emotionalTone?: EmotionalTone
}

export interface Violation {
  severity: 'low' | 'medium' | 'high'
  title: string
  quote: string
  timestampSeconds?: number
  fixAdvice: string
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
  roleMapping?: RoleMapping
  speechAnalytics?: SpeechAnalytics
  violations?: Violation[]
  actionableCoaching?: string[]
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

export function getIntlLocale(locale?: string): string {
  const lang = locale || (i18n.language ? i18n.language.slice(0, 2) : 'ru')
  return lang === 'kk' ? 'kk-KZ' : 'ru-RU'
}

export function statusLabel(status: CallStatus, locale?: string): string {
  const lang = locale || (i18n.language ? i18n.language.slice(0, 2) : 'ru')
  const res = i18n.getResourceBundle(lang === 'kk' ? 'kk' : 'ru', 'calls')
  return res?.status?.[status] || status
}

export function formatDate(value: string, locale?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return value
  const targetLocale = getIntlLocale(locale)
  return new Intl.DateTimeFormat(targetLocale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export function formatBytes(bytes: number, locale?: string): string {
  const targetLocale = getIntlLocale(locale)
  const formatter = new Intl.NumberFormat(targetLocale, { maximumFractionDigits: 1 })
  if (bytes < 1024) return `${bytes} B`
  if (bytes > 1024 * 1024) return `${formatter.format(bytes / 1024 / 1024)} MB`
  return `${formatter.format(Math.round(bytes / 1024))} KB`
}
