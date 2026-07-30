import { useMemo, useState } from 'react'
import { HiChevronLeft, HiChevronRight, HiOutlineCalendarDays, HiOutlineClock } from 'react-icons/hi2'
import Modal from '../components/Modal'
import {
  createMeeting,
  createWorkflowTemplate,
  deleteMeeting,
  deleteWorkflowTemplate,
  updateMeeting,
  updateWorkflowTemplate,
  type DashboardData,
  type Meeting,
} from '../lib/api'
import type { WorkflowTemplate } from '../workflowTemplates'

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
const addMinutesToTime = (time: string, minutes: number) => {
  if (!time) return ''
  const [hours, currentMinutes] = time.split(':').map(Number)
  const total = hours * 60 + currentMinutes + minutes
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
const formatTimeOption = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour = hours % 12 || 12
  return `${hour}:${String(minutes).padStart(2, '0')} ${period}`
}
const timeOptions = Array.from({ length: 96 }, (_, index) => {
  const hours = Math.floor(index / 4)
  const minutes = (index % 4) * 15
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
})
const meetingOverlaps = (meeting: Meeting, roomId: string, date: string, start: string, end: string) => (
  meeting.roomId === roomId && meeting.date === date && meeting.start < end && meeting.end > start
)

function MeetingPill({ meeting, roomName }: { meeting: Meeting; roomName?: string }) {
  return (
    <div className={`calendar-event ${meeting.status}`}>
      <strong>{meeting.start} · {meeting.title}</strong>
      <span>{roomName || 'Room not assigned'}</span>
    </div>
  )
}

export default function SchedulePage({ data, mode = 'calendar' }: { data: DashboardData; mode?: 'calendar' | 'schedule' }) {
  const { rooms, meetings, workflowTemplates: templates } = data
  const initialDate = meetings[0]?.date ? parseDate(meetings[0].date) : new Date()
  const [calendarView, setCalendarView] = useState<CalendarView>('week')
  const [cursorDate, setCursorDate] = useState(initialDate)
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [draft, setDraft] = useState({ title: '', roomId: '', start: '', end: '', host: '', date: toDateKey(initialDate) })
  const [message, setMessage] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [hasBookingConflict, setHasBookingConflict] = useState(false)
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null)
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [templateDraft, setTemplateDraft] = useState({ name: '', description: '', durationMinutes: 30, bufferMinutes: 0 })

  const beginNewTemplate = () => {
    setEditingTemplateId(null)
    setTemplateDraft({ name: '', description: '', durationMinutes: 30, bufferMinutes: 0 })
  }

  const beginEditTemplate = (template: WorkflowTemplate) => {
    setEditingTemplateId(template.id)
    setTemplateDraft({
      name: template.name,
      description: template.description,
      durationMinutes: template.durationMinutes,
      bufferMinutes: template.bufferMinutes,
    })
  }

  const saveTemplate = async () => {
    if (!templateDraft.name.trim() || templateDraft.durationMinutes < 15) return
    try {
      const payload = { ...templateDraft, name: templateDraft.name.trim() }
      if (editingTemplateId) {
        await updateWorkflowTemplate(editingTemplateId, payload)
      } else {
        await createWorkflowTemplate(payload)
      }
      setMessage(editingTemplateId ? 'Workflow template updated.' : 'Workflow template added.')
      beginNewTemplate()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The workflow template could not be saved.')
    }
  }

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
      setBookingError('Please complete every meeting field.')
      setHasBookingConflict(false)
      return
    }
    if (draft.end <= draft.start) {
      setBookingError('The end time must be later than the start time.')
      setHasBookingConflict(false)
      return
    }
    try {
      await createMeeting({ ...draft, status: 'upcoming' })
      const roomName = rooms.find((room) => room.id === draft.roomId)?.name || 'Selected room'
      const bookedTime = `${formatTimeOption(draft.start)}–${formatTimeOption(draft.end)}`
      setMessage(`${roomName} booked for ${draft.date}, ${bookedTime}.`)
      setDraft({ title: '', roomId: '', start: '', end: '', host: '', date: toDateKey(cursorDate) })
      setSelectedTemplate('')
      setBookingError('')
      setHasBookingConflict(false)
      setShowForm(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'The meeting could not be saved.'
      setBookingError(errorMessage === 'Failed to fetch' ? 'Unable to connect to the booking service. Please check that the API is running and try again.' : errorMessage)
      setHasBookingConflict(/already booked/i.test(errorMessage))
    }
  }

  const bookingDuration = draft.start && draft.end
    ? (Number(draft.end.slice(0, 2)) * 60 + Number(draft.end.slice(3))) - (Number(draft.start.slice(0, 2)) * 60 + Number(draft.start.slice(3)))
    : 0

  const alternativeRooms = draft.date && draft.start && draft.end
    ? rooms.filter((room) => room.id !== draft.roomId && !meetings.some((meeting) => meetingOverlaps(meeting, room.id, draft.date, draft.start, draft.end))).slice(0, 3)
    : []

  const nextAvailableTimes = bookingDuration > 0 && draft.roomId && draft.date
    ? timeOptions
      .filter((start) => start > draft.start)
      .map((start) => ({ start, end: addMinutesToTime(start, bookingDuration) }))
      .filter(({ start, end }) => end > start && !meetings.some((meeting) => meetingOverlaps(meeting, draft.roomId, draft.date, start, end)))
      .slice(0, 3)
    : []

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

  const meetingForm = (
    <Modal open={showForm} title="New meeting" size="large" onClose={() => { setShowForm(false); setBookingError('') }} actions={<>
      <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
      <button className="btn btn-primary" type="button" onClick={saveMeeting}>Save meeting</button>
    </>}>
    <div className="meeting-form modal-form">
      <label className="template-field">
        <span>Workflow template</span>
        <select
          autoFocus
          value={selectedTemplate}
          onChange={(event) => {
            const templateId = event.target.value
            const template = templates.find((item) => item.id === templateId)
            setSelectedTemplate(templateId)
            if (template) {
              setDraft((prev) => ({
                ...prev,
                title: prev.title || template.name,
                end: prev.start ? addMinutesToTime(prev.start, template.durationMinutes) : prev.end,
              }))
            }
          }}
        >
          <option value="">No template — custom meeting</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} · {template.durationMinutes} min
            </option>
          ))}
        </select>
        {selectedTemplate ? (() => {
          const template = templates.find((item) => item.id === selectedTemplate)
          return template ? <small className="template-help">{template.description} · {template.bufferMinutes ? `${template.bufferMinutes}-minute room preparation` : 'No preparation buffer'}</small> : null
        })() : null}
        <button type="button" className="template-manage-btn" onClick={() => setShowTemplateManager(true)}>Manage templates</button>
      </label>
      <label><span>Meeting title</span><input value={draft.title} onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder="e.g. Design review" /></label>
      <label><span>Room</span><select value={draft.roomId} onChange={(event) => setDraft((prev) => ({ ...prev, roomId: event.target.value }))}><option value="">Select room</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
      <label><span>Date</span><input type="date" value={draft.date} onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))} /></label>
      <label><span>Starts</span><select value={draft.start} onChange={(event) => {
        const start = event.target.value
        const template = templates.find((item) => item.id === selectedTemplate)
        setDraft((prev) => ({ ...prev, start, end: template ? addMinutesToTime(start, template.durationMinutes) : prev.end }))
      }}><option value="">Select time</option>{timeOptions.map((time) => <option key={time} value={time}>{formatTimeOption(time)}</option>)}</select></label>
      <label><span>Ends</span><select value={draft.end} onChange={(event) => setDraft((prev) => ({ ...prev, end: event.target.value }))}><option value="">Select time</option>{timeOptions.map((time) => <option key={time} value={time}>{formatTimeOption(time)}</option>)}</select></label>
      <label><span>Host</span><input value={draft.host} onChange={(event) => setDraft((prev) => ({ ...prev, host: event.target.value }))} placeholder="Organizer name" /></label>
    </div>
    {draft.roomId && draft.date && draft.start && draft.end ? (
      <div className="booking-summary">
        <strong>Booking</strong>
        <span>{rooms.find((room) => room.id === draft.roomId)?.name} · {draft.date} · {formatTimeOption(draft.start)}–{formatTimeOption(draft.end)}</span>
      </div>
    ) : null}
    </Modal>
  )

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
            <button className="btn btn-primary" type="button" onClick={() => { setBookingError(''); setShowForm(true) }}>New meeting</button>
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
            <button className="btn btn-primary" type="button" onClick={() => { setBookingError(''); setShowForm(true) }}>New meeting</button>
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
                      <button className="icon-btn" title="Cancel meeting" onClick={() => setMeetingToDelete(meeting)}>✕</button>
                    </td>
                  </tr>
                )
              })}
              {!filteredMeetings.length && <tr><td colSpan={5}><span className="sub">No meetings match these filters.</span></td></tr>}
            </tbody>
          </table>
        </div>
      </section>}
      <Modal
        open={Boolean(bookingError)}
        title={hasBookingConflict ? 'Selected time is unavailable' : 'Meeting could not be saved'}
        size="small"
        onClose={() => { setBookingError(''); setHasBookingConflict(false) }}
        actions={<button type="button" className="btn btn-primary" onClick={() => { setBookingError(''); setHasBookingConflict(false) }}>Back to meeting</button>}
      >
        <div className="booking-popup" role="alert">
          <p>{bookingError}</p>
          {hasBookingConflict && (alternativeRooms.length || nextAvailableTimes.length) ? <strong>Choose an available option:</strong> : null}
          {hasBookingConflict && alternativeRooms.length ? (
            <div className="booking-suggestions">
              <span>Same time, another room</span>
              <div>{alternativeRooms.map((room) => <button type="button" key={room.id} onClick={() => {
                setDraft((prev) => ({ ...prev, roomId: room.id }))
                setBookingError('')
                setHasBookingConflict(false)
              }}>{room.name}</button>)}</div>
            </div>
          ) : null}
          {hasBookingConflict && nextAvailableTimes.length ? (
            <div className="booking-suggestions">
              <span>Same room, next available time</span>
              <div>{nextAvailableTimes.map(({ start, end }) => <button type="button" key={start} onClick={() => {
                setDraft((prev) => ({ ...prev, start, end }))
                setBookingError('')
                setHasBookingConflict(false)
              }}>{formatTimeOption(start)}–{formatTimeOption(end)}</button>)}</div>
            </div>
          ) : null}
        </div>
      </Modal>
      <Modal
        open={Boolean(meetingToDelete)}
        title="Cancel meeting?"
        size="small"
        onClose={() => setMeetingToDelete(null)}
        actions={<>
          <button type="button" className="btn" onClick={() => setMeetingToDelete(null)}>Keep meeting</button>
          <button className="btn btn-danger" onClick={async () => {
            if (!meetingToDelete) return
            await deleteMeeting(meetingToDelete.id)
            setMessage('Meeting cancelled.')
            setMeetingToDelete(null)
          }}>Cancel meeting</button>
        </>}
      >
        <p><strong>{meetingToDelete?.title}</strong> will be removed from the schedule.</p>
      </Modal>
      <Modal
        open={showTemplateManager}
        title="Manage workflow templates"
        size="large"
        onClose={() => setShowTemplateManager(false)}
        actions={<button type="button" className="btn" onClick={() => setShowTemplateManager(false)}>Done</button>}
      >
        <div className="template-manager">
          <div className="template-editor">
            <h3>{editingTemplateId ? 'Edit template' : 'Add template'}</h3>
            <div className="modal-form">
              <label><span>Template name</span><input value={templateDraft.name} onChange={(event) => setTemplateDraft((prev) => ({ ...prev, name: event.target.value }))} placeholder="e.g. Interview" /></label>
              <label><span>Description</span><input value={templateDraft.description} onChange={(event) => setTemplateDraft((prev) => ({ ...prev, description: event.target.value }))} placeholder="Short purpose or setup note" /></label>
              <label><span>Duration</span><select value={templateDraft.durationMinutes} onChange={(event) => setTemplateDraft((prev) => ({ ...prev, durationMinutes: Number(event.target.value) }))}>{[15, 30, 45, 60, 90, 120, 180].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}</select></label>
              <label><span>Preparation buffer</span><select value={templateDraft.bufferMinutes} onChange={(event) => setTemplateDraft((prev) => ({ ...prev, bufferMinutes: Number(event.target.value) }))}>{[0, 5, 10, 15, 30].map((minutes) => <option key={minutes} value={minutes}>{minutes ? `${minutes} minutes` : 'No buffer'}</option>)}</select></label>
            </div>
            <div className="template-editor-actions">
              {editingTemplateId ? <button type="button" className="btn" onClick={beginNewTemplate}>Cancel edit</button> : null}
              <button type="button" className="btn btn-primary" disabled={!templateDraft.name.trim()} onClick={saveTemplate}>{editingTemplateId ? 'Save changes' : 'Add template'}</button>
            </div>
          </div>
          <div className="template-manager-list">
            {templates.map((template) => (
              <article key={template.id}>
                <div><strong>{template.name}</strong><span>{template.durationMinutes} min · {template.bufferMinutes ? `${template.bufferMinutes} min buffer` : 'No buffer'}</span></div>
                <div className="row-actions">
                  <button type="button" className="btn" onClick={() => beginEditTemplate(template)}>Edit</button>
                  <button type="button" className="btn template-delete" onClick={async () => {
                    try {
                      await deleteWorkflowTemplate(template.id)
                      if (selectedTemplate === template.id) setSelectedTemplate('')
                      if (editingTemplateId === template.id) beginNewTemplate()
                      setMessage('Workflow template removed.')
                    } catch (error) {
                      setMessage(error instanceof Error ? error.message : 'The workflow template could not be removed.')
                    }
                  }}>Remove</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
