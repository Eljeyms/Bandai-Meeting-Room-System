export type WorkflowTemplate = {
  id: string
  name: string
  description: string
  durationMinutes: number
  bufferMinutes: number
}

export const workflowTemplates: WorkflowTemplate[] = [
  { id: 'standard', name: 'Standard Meeting', description: 'General team meeting', durationMinutes: 30, bufferMinutes: 5 },
  { id: 'client', name: 'Client Presentation', description: 'Presentation-ready setup', durationMinutes: 60, bufferMinutes: 15 },
  { id: 'workshop', name: 'Team Workshop', description: 'Long-form collaboration session', durationMinutes: 120, bufferMinutes: 15 },
  { id: 'quick', name: 'Quick Huddle', description: 'Short discussion', durationMinutes: 15, bufferMinutes: 0 },
]
