import { field, request } from '../../shared/api/client'
import type { Call, CallPage } from '../../entities/call/model'

export function parseCall(value: unknown): Call {
  const item = value as Record<string, unknown>
  return {
    id: field<string>(item, 'id', 'ID') ?? '',
    managerId: field<string>(item, 'managerId', 'ManagerID') ?? '',
    status: field<Call['status']>(item, 'status', 'Status') ?? 'uploaded',
    originalFilename: field<string>(item, 'originalFilename', 'OriginalFilename') ?? '',
    contentType: field<string>(item, 'contentType', 'ContentType') ?? '',
    sizeBytes: field<number>(item, 'sizeBytes', 'SizeBytes') ?? 0,
    durationSeconds: field<number | null>(item, 'durationSeconds', 'DurationSeconds'),
    errorMessage: field<string | null>(item, 'errorMessage', 'ErrorMessage'),
    createdAt: field<string>(item, 'createdAt', 'CreatedAt') ?? '',
    updatedAt: field<string>(item, 'updatedAt', 'UpdatedAt') ?? '',
  }
}

export async function getCalls(page = 1, pageSize = 20): Promise<CallPage> {
  const response = await request<Record<string, unknown>>(`/api/v1/calls?page=${page}&page_size=${pageSize}`)
  const calls = (field<unknown[]>(response, 'calls', 'Calls') ?? []).map(parseCall)
  return {
    calls,
    total: field<number>(response, 'total', 'Total') ?? 0,
    page: field<number>(response, 'page', 'Page') ?? page,
    perPage: field<number>(response, 'per_page', 'perPage', 'PerPage') ?? pageSize,
    totalPages: field<number>(response, 'total_pages', 'totalPages', 'TotalPages') ?? 1,
  }
}
