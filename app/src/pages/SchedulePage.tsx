import { useMemo, useState } from 'react'
import { HiChevronLeft, HiChevronRight, HiOutlineCalendarDays, HiOutlineClock } from 'react-icons/hi2'
import { createMeeting, deleteMeeting, updateMeeting, type DashboardData, type Meeting } from '../lib/api'

type CalendarView = 'day' | 'week' | 'month'

const viewLabels: { key: CalendarView; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
]

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const toDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
const startOfWeek = (date: Date) => addDays(date, -((date.getDay() + 6) % 7))
const isSameDay = (left: Date, right: Date) => toDateKey(left) === toDateKey(right)
const formatDay = (date: Date) => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date)

function MeetingPill({ meeting, roomName }: { meeting: Meeting; roomName?: string }) {
  return (
    <div className={`calendar-event ${meeting.status}`}>
      <strong>{meeting.start} · {meeting.title}</strong>
      <span>{roomName || 'Room not assigned'}</span>
    </div>
  )
}

export default function SchedulePage({ data, mode = 'calendar' }: { data: DashboardData; mode?: 'calendar' | 'schedule' }) {
  const { rooms, meetings } = data
  const initialDate = meetings[0]?.date ? parseDate(meetings[0].date) : new Date()
  const [calendarView, setCalendarView] = useState<CalendarView>('week')
  const [cursorDate, setCursorDate] = useState(initialDate)
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState({ title: '', roomId: '', start: '', end: '', host: '', date: toDateKey(initialDate) })
  const [message, setMessage] = useState('')

  const filteredMeetings = useMemo(
    () => meetings
      .filter((meeting) => {
        const matchesRoom = !selectedRoom || meeting.roomId === selectedRoom
        const matchesStatus = !selectedStatus || meeting.status === selectedStatus
        return matchesRoom && matchesStatus
      })
      .sort((left, right) => `${left.date}${left.start}`.localeCompare(`${right.date}${right.start}`)),
    [meetings, selectedRoom, selectedStatus],
  )

  const meetingsByDate = useMemo(() => {
    const grouped = new Map<string, Meeting[]>()
    filteredMeetings.forEach((meeting) => {
      grouped.set(meeting.date, [...(grouped.get(meeting.date) || []), meeting])
    })
    return grouped
  }, [filteredMeetings])

  const calendarTitle = useMemo(() => {
    if (calendarView === 'day') {
      return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(cursorDate)
    }
    if (calendarView === 'week') {
      const weekStart = startOfWeek(cursorDate)
      const weekEnd = addDays(weekStart, 6)
      return `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(weekStart)} – ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(weekEnd)}`
    }
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(cursorDate)
  }, [calendarView, cursorDate])

  const moveCalendar = (direction: number) => {
    const amount = calendarView === 'day' ? 1 : calendarView === 'week' ? 7 : 0
    setCursorDate(amount
      ? addDays(cursorDate, amount * direction)
      : new Date(cursorDate.getFullYear(), cursorDate.getMonth() + direction, 1))
  }

  const saveMeeting = async () => {
    if (!draft.title || !draft.roomId || !draft.start || !draft.end || !draft.host || !draft.date) {
      setMessage('Please complete every meeting field.')
      return
    }
    if (draft.end <= draft.start) {
      setMessage('The end time must be later than the start time.')
      return
    }
    try {
      await createMeeting({ ...draft, status: 'upcoming' })
      setDraft({ title: '', roomId: '', start: '', end: '', host: '', date: toDateKey(cursorDate) })
      setMessage('Meeting created successfully.')
      setShowForm(false)
    } catch {
      setMessage('The meeting could not be saved while live services are offline.')
    }
  }

  const renderDay = () => {
    const dayMeetings = meetingsByDate.get(toDateKey(cursorDate)) || []
    return (
      <div className="day-view">
        <div className="day-date">
          <span>{cursorDate.toLocaleDateString('en-US', { weekday: 'long' })}</span>
          <strong>{cursorDate.getDate()}</strong>
        </div>
        <div className="day-agenda">
          {dayMeetings.map((meeting) => (
            <article className="agenda-event" key={meeting.id}>
              <div className="agenda-time"><HiOutlineClock />{meeting.start}–{meeting.end}</div>
              <div>
                <h3>{meeting.title}</h3>
                <p>{rooms.find((room) => room.id === meeting.roomId)?.name} · Hosted by {meeting.host}</p>
              </div>
              <span className={`badge ${meeting.status === 'ongoing' ? 'badge-busy' : 'badge-mute'}`}>{meeting.status}</span>
            </article>
          ))}
          {!dayMeetings.length && <div className="calendar-empty"><HiOutlineCalendarDays /><strong>No meetings scheduled</strong><span>This day is open for bookings.</span></div>}
        </div>
      </div>
    )
  }

  const renderWeek = () => {
    const weekStart = startOfWeek(cursorDate)
    return (
      <div className="week-view">
        {Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)).map((date) => {
          const dayMeetings = meetingsByDate.get(toDateKey(date)) || []
          return (
            <section className={`week-day ${isSameDay(date, new Date()) ? 'today' : ''}`} key={toDateKey(date)}>
              <button type="button" className="week-day-head" onClick={() => { setCursorDate(date); setCalendarView('day') }}>
                <span>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <strong>{date.getDate()}</strong>
              </button>
              <div className="week-events">
                {dayMeetings.map((meeting) => <MeetingPill key={meeting.id} meeting={meeting} roomName={rooms.find((room) => room.id === meeting.roomId)?.name} />)}
                {!dayMeetings.length && <span className="week-open">Available</span>}
              </div>
            </section>
          )
        })}
      </div>
    )
  }

  const renderMonth = () => {
    const first = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 1)
    const gridStart = startOfWeek(first)
    return (
      <div className="month-wrap">
        <div className="month-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="month-view">
          {Array.from({ length: 42 }, (_, index) => addDays(gridStart, index)).map((date) => {
            const dayMeetings = meetingsByDate.get(toDateKey(date)) || []
            const isCurrentMonth = date.getMonth() === cursorDate.getMonth()
            return (
              <button
                type="button"
                className={`month-day ${isCurrentMonth ? '' : 'outside'} ${isSameDay(date, new Date()) ? 'today' : ''}`}
                key={toDateKey(date)}
                onClick={() => { setCursorDate(date); setCalendarView('day') }}
              >
                <span className="month-number">{date.getDate()}</span>
                <span className="month-events">
                  {dayMeetings.slice(0, 2).map((meeting) => <span className={`month-event ${meeting.status}`} key={meeting.id}>{meeting.start} {meeting.title}</span>)}
                  {dayMeetings.length > 2 && <span className="month-more">+{dayMeetings.length - 2} more</span>}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const calendarFilters = (
    <div className="calendar-filters">
      <select aria-label="Filter by room" value={selectedRoom} onChange={(event) => setSelectedRoom(event.target.value)}>
        <option value="">All rooms</option>
        {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
      </select>
      <select aria-label="Filter by status" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
        <option value="">All statuses</option>
        <option value="ongoing">Ongoing</option>
        <option value="upcoming">Upcoming</option>
      </select>
      <span className="calendar-count">{filteredMeetings.length} meeting{filteredMeetings.length === 1 ? '' : 's'}</span>
    </div>
  )

  const meetingForm = showForm ? (
    <div className="meeting-form">
      <label><span>Meeting title</span><input value={draft.title} onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder="e.g. Design review" /></label>
      <label><span>Room</span><select value={draft.roomId} onChange={(event) => setDraft((prev) => ({ ...prev, roomId: event.target.value }))}><option value="">Select room</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
      <label><span>Date</span><input type="date" value={draft.date} onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))} /></label>
      <label><span>Starts</span><input type="time" value={draft.start} onChange={(event) => setDraft((prev) => ({ ...prev, start: event.target.value }))} /></label>
      <label><span>Ends</span><input type="time" value={draft.end} onChange={(event) => setDraft((prev) => ({ ...prev, end: event.target.value }))} /></label>
      <label><span>Host</span><input value={draft.host} onChange={(event) => setDraft((prev) => ({ ...prev, host: event.target.value }))} placeholder="Organizer name" /></label>
      <button className="btn btn-primary form-submit" type="button" onClick={saveMeeting}>Save meeting</button>
    </div>
  ) : null

  return (
    <div className="schedule-stack" data-view={mode}>
      {mode === 'calendar' && <section className="card calendar-card">
        <div className="calendar-toolbar">
          <div>
            <p className="eyebrow">Team calendar</p>
            <h2>{calendarTitle}</h2>
          </div>
          <div className="calendar-controls">
            <div className="segmented" aria-label="Calendar view">
              {viewLabels.map((view) => (
                <button type="button" className={calendarView === view.key ? 'active' : ''} key={view.key} onClick={() => setCalendarView(view.key)}>{view.label}</button>
              ))}
            </div>
            <div className="calendar-nav">
              <button type="button" className="icon-btn" aria-label="Previous period" onClick={() => moveCalendar(-1)}><HiChevronLeft /></button>
              <button type="button" className="today-btn" onClick={() => setCursorDate(new Date())}>Today</button>
              <button type="button" className="icon-btn" aria-label="Next period" onClick={() => moveCalendar(1)}><HiChevronRight /></button>
            </div>
            <button className="btn btn-primary" type="button" onClick={() => setShowForm((value) => !value)}>{showForm ? 'Close form' : 'New meeting'}</button>
          </div>
        </div>

        {calendarFilters}
        {meetingForm}
        {message && <div className="form-message" role="status">{message}</div>}

        <div className="calendar-canvas" data-testid="calendar-canvas">
          {calendarView === 'day' && renderDay()}
          {calendarView === 'week' && renderWeek()}
          {calendarView === 'month' && renderMonth()}
        </div>
      </section>}

      {mode === 'schedule' && <section className="card block schedule-list-card">
        <div className="block-head">
          <div><p className="eyebrow">All bookings</p><h2>Meeting schedule</h2></div>
          <div className="schedule-head-actions">
            <span className="badge badge-mute">Sorted by date & time</span>
            <button className="btn btn-primary" type="button" onClick={() => setShowForm((value) => !value)}>{showForm ? 'Close form' : 'New meeting'}</button>
          </div>
        </div>
        {calendarFilters}
        {meetingForm}
        {message && <div className="form-message" role="status">{message}</div>}
        <div className="table-scroll">
          <table>
            <thead><tr><th>Meeting</th><th>Room</th><th>When</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {filteredMeetings.map((meeting) => {
                const room = rooms.find((item) => item.id === meeting.roomId)
                return (
                  <tr key={meeting.id}>
                    <td><strong>{meeting.title}</strong><span className="sub">{meeting.host}</span></td>
                    <td>{room?.name || 'Unassigned'}<span className="sub">{room?.floor}</span></td>
                    <td>{formatDay(parseDate(meeting.date))}<span className="sub">{meeting.start} – {meeting.end}</span></td>
                    <td><span className={`badge ${meeting.status === 'ongoing' ? 'badge-busy' : 'badge-mute'}`}>{meeting.status}</span></td>
                    <td className="row-actions">
                      <button className="icon-btn" title="Toggle meeting status" onClick={async () => { await updateMeeting(meeting.id, { status: meeting.status === 'ongoing' ? 'upcoming' : 'ongoing' }); setMessage('Meeting updated.') }}>✎</button>
                      <button className="icon-btn" title="Cancel meeting" onClick={async () => { await deleteMeeting(meeting.id); setMessage('Meeting cancelled.') }}>✕</button>
                    </td>
                  </tr>
                )
              })}
              {!filteredMeetings.length && <tr><td colSpan={5}><span className="sub">No meetings match these filters.</span></td></tr>}
            </tbody>
          </table>
        </div>
      </section>}
    </div>
  )
}
