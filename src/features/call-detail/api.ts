import { field, request } from '../../shared/api/client'
import type { Analysis, CallDetail, CriterionResult } from '../../entities/call/model'
import { criteriaMax } from '../../i18n/constants'
import { parseCall } from '../calls-list/api'
import { parseUser } from '../auth/api'

export function parseDetail(response: Record<string, unknown>): CallDetail {
  const rawCall = field<unknown>(response, 'call', 'Call')
  const rawAudio = field<Record<string, unknown>>(response, 'audio', 'Audio') ?? {}
  const rawManager = field<unknown>(response, 'manager', 'Manager')
  const rawTranscript = field<CallDetail['transcript']>(response, 'transcript', 'Transcript')
  const rawAnalysis = field<Record<string, unknown>>(response, 'analysis', 'Analysis')
  const rawScore = field<Record<string, unknown>>(response, 'score', 'Score')

  const analysis: Analysis | null | undefined = rawAnalysis
    ? {
        summary: field<string>(rawAnalysis, 'summary', 'Summary') ?? '',
        needs: field<string[]>(rawAnalysis, 'needs', 'Needs') ?? [],
        objections: field<string[]>(rawAnalysis, 'objections', 'Objections') ?? [],
        refusalReason: field<string | null>(rawAnalysis, 'refusal_reason', 'refusalReason', 'RefusalReason'),
        mistakes: field<string[]>(rawAnalysis, 'mistakes', 'Mistakes') ?? [],
        strengths: field<string[]>(rawAnalysis, 'strengths', 'Strengths') ?? [],
        nextAction: field<string>(rawAnalysis, 'next_action', 'nextAction', 'NextAction') ?? '',
        criterionResults: Object.fromEntries(
          Object.entries(
            field<Analysis['criterionResults']>(rawAnalysis, 'criterion_results', 'criterionResults', 'CriterionResults') ?? {}
          ).map(([key, result]) => [key, { ...(result as CriterionResult), max: criteriaMax[key] }])
        ),
      }
    : (rawAnalysis as null | undefined)

  const score = rawScore
    ? {
        total: field<number>(rawScore, 'total', 'total_score', 'Total') ?? 0,
        criteria: field<NonNullable<CallDetail['score']>['criteria']>(rawScore, 'criteria', 'Criteria') ?? {},
      }
    : (rawScore as null | undefined)

  return {
    call: parseCall(rawCall ?? {}),
    manager: rawManager ? parseUser(rawManager) : (rawManager as null | undefined),
    audio: {
      filename: field<string>(rawAudio, 'filename', 'Filename') ?? '',
      contentType: field<string>(rawAudio, 'content_type', 'contentType', 'ContentType') ?? '',
      sizeBytes: field<number>(rawAudio, 'size_bytes', 'sizeBytes', 'SizeBytes') ?? 0,
    },
    transcript: rawTranscript,
    analysis,
    score,
  }
}

export async function getCall(workspaceIdOrCallId: string, callId?: string): Promise<CallDetail> {
  const path = callId ? `/api/v1/workspaces/${workspaceIdOrCallId}/calls/${callId}` : `/api/v1/calls/${workspaceIdOrCallId}`
  return parseDetail(await request<Record<string, unknown>>(path))
}
