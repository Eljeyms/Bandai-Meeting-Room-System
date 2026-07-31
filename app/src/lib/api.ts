export type SmartRoomControls = {
  mode: 'automatic' | 'manual'
  lights: boolean
  aircon: boolean
  fan: boolean
}

export type Room = {
  id: string
  _id?: string
  name: string
  floor: string
  capacity: number
  status: 'occupied' | 'available'
  sensor: string
  tablet: string
  aiDetected?: boolean
  lastUpdated?: string
  smartControls?: SmartRoomControls
}

export type Meeting = {
  id: string
  _id?: string
  title: string
  roomId: string
  status: 'ongoing' | 'upcoming'
  start: string
  end: string
  host: string
  date: string
}

export type User = {
  id: string
  _id?: string
  name: string
  email: string
  dept: string
  role: 'Admin' | 'Member'
  active: boolean
}

export type UtilizationDatum = {
  id?: string
  _id?: string
  day: string
  pct: number
}

export type DashboardData = {
  rooms: Room[]
  meetings: Meeting[]
  users: User[]
  utilization: UtilizationDatum[]
  workflowTemplates: import('../workflowTemplates').WorkflowTemplate[]
}

const fallbackBaseUrl = 'http://127.0.0.1:4000'
const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) || fallbackBaseUrl

const normalize = <T extends { _id?: string; id?: string; roomId?: string | { toString: () => string } }>(item: T): T & { id: string } => ({
  ...item,
  id: item.id || item._id || '',
  roomId: item.roomId ? (typeof item.roomId === 'string' ? item.roomId : item.roomId.toString()) : item.roomId,
})

const normalizeDashboard = (payload: DashboardData): DashboardData => ({
  rooms: payload.rooms.map((room) => normalize(room)),
  meetings: payload.meetings.map((meeting) => normalize(meeting)),
  users: payload.users.map((user) => normalize(user)),
  utilization: payload.utilization.map((item) => normalize(item)),
  workflowTemplates: (payload.workflowTemplates || []).map((template) => normalize(template)),
})

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const timeoutSignal = typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(4000) : undefined
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    signal: options?.signal || timeoutSignal,
    ...options,
  })
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(errorPayload?.error || 'Request failed')
  }
  return response.json() as Promise<T>
}

export const getDashboard = async (): Promise<DashboardData> => {
  const payload = await request<DashboardData>('/api/dashboard')
  return normalizeDashboard(payload)
}

export const createRoom = async (payload: Omit<Room, 'id' | '_id'>) => {
  return request<Room>('/api/rooms', { method: 'POST', body: JSON.stringify(payload) })
}

export const updateRoom = async (roomId: string, payload: Partial<Room>) => {
  return request<Room>(`/api/rooms/${roomId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export const updateSmartControls = async (roomId: string, payload: SmartRoomControls) => {
  return request<Room>(`/api/rooms/${roomId}/controls`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export const deleteRoom = async (roomId: string) => {
  return request<{ success: boolean }>(`/api/rooms/${roomId}`, { method: 'DELETE' })
}

export const createMeeting = async (payload: Omit<Meeting, 'id' | '_id'>) => {
  return request<Meeting>('/api/meetings', { method: 'POST', body: JSON.stringify(payload) })
}

export const updateMeeting = async (meetingId: string, payload: Partial<Meeting>) => {
  return request<Meeting>(`/api/meetings/${meetingId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export const deleteMeeting = async (meetingId: string) => {
  return request<{ success: boolean }>(`/api/meetings/${meetingId}`, { method: 'DELETE' })
}

export const createWorkflowTemplate = async (payload: Omit<import('../workflowTemplates').WorkflowTemplate, 'id' | '_id'>) => {
  return request<import('../workflowTemplates').WorkflowTemplate>('/api/workflow-templates', { method: 'POST', body: JSON.stringify(payload) })
}

export const updateWorkflowTemplate = async (templateId: string, payload: Partial<import('../workflowTemplates').WorkflowTemplate>) => {
  return request<import('../workflowTemplates').WorkflowTemplate>(`/api/workflow-templates/${templateId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export const deleteWorkflowTemplate = async (templateId: string) => {
  return request<{ success: boolean }>(`/api/workflow-templates/${templateId}`, { method: 'DELETE' })
}

export const createUser = async (payload: Omit<User, 'id' | '_id'>) => {
  return request<User>('/api/users', { method: 'POST', body: JSON.stringify(payload) })
}

export const updateUser = async (userId: string, payload: Partial<User>) => {
  return request<User>(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export const detectRoom = async (roomId: string) => {
  return request<Room>('/api/ai/detect', { method: 'POST', body: JSON.stringify({ roomId }) })
}

export const exportReport = (rooms: Room[], meetings: Meeting[]) => {
  const rows = [
    ['Room', 'Meetings today', 'Status'],
    ...rooms.map((room) => {
      const count = meetings.filter((meeting) => meeting.roomId === room.id).length
      return [room.name, count, room.status]
    }),
  ]
  const csv = rows.map((row) => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'room-report.csv'
  link.click()
  window.URL.revokeObjectURL(url)
}
