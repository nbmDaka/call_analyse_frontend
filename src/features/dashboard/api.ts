import { field, request } from '../../shared/api/client'
import type { DashboardSummary } from '../../entities/call/model'

export async function getDashboard(workspaceId = ''): Promise<DashboardSummary> {
  const path = workspaceId ? `/api/v1/workspaces/${workspaceId}/dashboard` : '/api/v1/dashboard/summary'
  const response = await request<{ summary: Record<string, unknown> }>(path)
  const summary = response.summary
  return {
    totalCalls: field<number>(summary, 'total_calls', 'totalCalls', 'TotalCalls') ?? 0,
    completedCalls: field<number>(summary, 'completed_calls', 'completedCalls', 'CompletedCalls') ?? 0,
    failedCalls: field<number>(summary, 'failed_calls', 'failedCalls', 'FailedCalls') ?? 0,
    averageScore: field<number | null>(summary, 'average_score', 'averageScore', 'AverageScore') ?? null,
  } satisfies DashboardSummary
}
