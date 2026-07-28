export type Room = {
  id: string
  name: string
  floor: string
  capacity: number
  status: 'occupied' | 'available'
  sensor: string
  tablet: string
  smartControls: {
    mode: 'automatic' | 'manual'
    lights: boolean
    aircon: boolean
    fan: boolean
  }
}

export type Meeting = {
  id: string
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
  name: string
  email: string
  dept: string
  role: 'Admin' | 'Member'
  active: boolean
}

export type UtilizationDatum = {
  day: string
  pct: number
}

export const rooms: Room[] = [
  { id: 'r1', name: 'Meeting Room 3B', floor: 'Tower A · 5th floor', capacity: 8, status: 'available', sensor: 'AiSense X', tablet: 'Kiosk 03', smartControls: { mode: 'automatic', lights: false, aircon: false, fan: false } },
  { id: 'r2', name: 'Studio 2F', floor: 'Tower A · 2nd floor', capacity: 10, status: 'occupied', sensor: 'AiSense X', tablet: 'Kiosk 01', smartControls: { mode: 'automatic', lights: true, aircon: true, fan: false } },
  { id: 'r3', name: 'Boardroom 5A', floor: 'Tower B · 7th floor', capacity: 14, status: 'occupied', sensor: 'AiSense X', tablet: 'Kiosk 07', smartControls: { mode: 'automatic', lights: true, aircon: true, fan: false } },
  { id: 'r4', name: 'Focus Suite 1C', floor: 'Tower B · 3rd floor', capacity: 6, status: 'available', sensor: 'AiSense X', tablet: 'Kiosk 02', smartControls: { mode: 'automatic', lights: false, aircon: false, fan: false } },
]

export const meetings: Meeting[] = [
  { id: 'm1', title: 'Design Critique', roomId: 'r2', status: 'ongoing', start: '12:30', end: '13:30', host: 'S. Takahashi', date: '2026-07-27' },
  { id: 'm2', title: 'Team Sync', roomId: 'r3', status: 'upcoming', start: '14:00', end: '14:30', host: 'J. Kubota', date: '2026-07-27' },
  { id: 'm3', title: 'Project Kickoff', roomId: 'r1', status: 'upcoming', start: '15:00', end: '16:00', host: 'M. Fujita', date: '2026-07-27' },
  { id: 'm4', title: 'UX Review', roomId: 'r4', status: 'upcoming', start: '16:30', end: '17:15', host: 'A. Mori', date: '2026-07-27' },
]

export const users: User[] = [
  { id: 'u1', name: 'Sora Tanaka', email: 'sora.tanaka@bandai.com', dept: 'Design', role: 'Admin', active: true },
  { id: 'u2', name: 'Kenji Ito', email: 'kenji.ito@bandai.com', dept: 'Engineering', role: 'Member', active: true },
  { id: 'u3', name: 'Mika Sato', email: 'mika.sato@bandai.com', dept: 'Operations', role: 'Member', active: false },
  { id: 'u4', name: 'Hiroko Yamazaki', email: 'hiroko.yamazaki@bandai.com', dept: 'Marketing', role: 'Member', active: true },
]

export const utilization: UtilizationDatum[] = [
  { day: 'Mon', pct: 68 },
  { day: 'Tue', pct: 74 },
  { day: 'Wed', pct: 59 },
  { day: 'Thu', pct: 81 },
  { day: 'Fri', pct: 66 },
]
