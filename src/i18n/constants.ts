import type { CallStatus } from '../entities/call/model'

export const criteriaLabels: Record<string, string> = {
  greeting: 'Greeting',
  rapport: 'Rapport',
  needs_discovery: 'Needs discovery',
  presentation: 'Presentation',
  objection_handling: 'Objection handling',
  next_action: 'Next action',
  communication: 'Communication',
  closing: 'Closing',
}

export const criteriaMax: Record<string, number> = {
  greeting: 5,
  rapport: 10,
  needs_discovery: 20,
  presentation: 15,
  objection_handling: 20,
  next_action: 15,
  communication: 10,
  closing: 5,
}

export const statusLabels: Record<CallStatus, string> = {
  uploaded: 'Uploaded',
  queued: 'Queued',
  transcribing: 'Transcribing',
  transcribed: 'Transcribed',
  analyzing: 'Analysing',
  completed: 'Completed',
  failed: 'Failed',
}
