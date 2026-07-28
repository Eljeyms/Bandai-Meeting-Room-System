import { useEffect, useMemo, useRef, useState } from 'react'
import { HiOutlineChevronDown, HiOutlineCpuChip, HiOutlineLightBulb } from 'react-icons/hi2'
import { FaFan, FaSnowflake } from 'react-icons/fa6'
import { updateSmartControls, type DashboardData, type Room, type SmartRoomControls } from '../lib/api'

type DeviceKey = 'lights' | 'aircon' | 'fan'

const devices: Array<{ key: DeviceKey; label: string; detail: string; Icon: typeof HiOutlineLightBulb }> = [
  { key: 'lights', label: 'Lights', detail: 'Ceiling and accent lights', Icon: HiOutlineLightBulb },
  { key: 'aircon', label: 'Air conditioning', detail: 'Comfort temperature control', Icon: FaSnowflake },
  { key: 'fan', label: 'Ventilation fan', detail: 'Additional air circulation', Icon: FaFan },
]

const isOccupied = (room: Room, meetings: DashboardData['meetings']) =>
  room.status === 'occupied' || meetings.some((meeting) => meeting.roomId === room.id && meeting.status === 'ongoing')

const automaticControls = (occupied: boolean): SmartRoomControls => ({
  mode: 'automatic',
  lights: occupied,
  aircon: occupied,
  fan: false,
})

export default function RoomDisplayPage({ data }: { data: DashboardData }) {
  const { rooms, meetings } = data
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id ?? '')
  const [controlsByRoom, setControlsByRoom] = useState<Record<string, SmartRoomControls>>(() =>
    Object.fromEntries(
      rooms.map((room) => [room.id, room.smartControls || automaticControls(isOccupied(room, meetings))])
    )
  )
  const [controlNotice, setControlNotice] = useState('')
  const [roomMenuOpen, setRoomMenuOpen] = useState(false)
  const roomPickerRef = useRef<HTMLDivElement>(null)
  const room = rooms.find((room) => room.id === selectedRoomId) || rooms[0]
  const activeRoomId = room?.id ?? ''

  const ongoingMeeting = useMemo(
    () => meetings.find((meeting) => meeting.roomId === activeRoomId && meeting.status === 'ongoing'),
    [activeRoomId, meetings]
  )

  const schedule = useMemo(
    () => meetings.filter((meeting) => meeting.roomId === activeRoomId).slice(0, 3),
    [activeRoomId, meetings]
  )

  useEffect(() => {
    if (!roomMenuOpen) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!roomPickerRef.current?.contains(event.target as Node)) {
        setRoomMenuOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setRoomMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [roomMenuOpen])

  if (!room) {
    return <div className="tablet-empty">No rooms are configured yet.</div>
  }

  const storedControls = controlsByRoom[room.id] || room.smartControls || automaticControls(isOccupied(room, meetings))
  const controls = storedControls.mode === 'automatic'
    ? automaticControls(isOccupied(room, meetings))
    : storedControls
  const automatic = controls.mode === 'automatic'

  const persistControls = async (next: SmartRoomControls) => {
    setControlsByRoom((current) => ({ ...current, [room.id]: next }))
    setControlNotice('')

    try {
      await updateSmartControls(room.id, next)
      setControlNotice('Room controls updated.')
    } catch {
      setControlNotice('Preview control updated. Connect the room gateway to control physical appliances.')
    }
  }

  const setMode = (mode: SmartRoomControls['mode']) => {
    const next = mode === 'automatic'
      ? automaticControls(isOccupied(room, meetings))
      : { ...controls, mode: 'manual' as const }
    void persistControls(next)
  }

  const toggleDevice = (device: DeviceKey) => {
    if (automatic) return
    void persistControls({ ...controls, [device]: !controls[device] })
  }

  return (
    <div className="tablet">
      <div className="tablet-top">
        <div className="room-title">
          <div className="room-picker" ref={roomPickerRef}>
            <button
              type="button"
              className="room-picker-button"
              aria-label={`Select room display, current room ${room.name}`}
              aria-haspopup="listbox"
              aria-expanded={roomMenuOpen}
              aria-controls="room-display-options"
              onClick={() => setRoomMenuOpen((open) => !open)}
            >
              <span className="room-picker-current">
                <strong>{room.name}</strong>
                <small>{room.floor}</small>
              </span>
              <HiOutlineChevronDown aria-hidden="true" />
            </button>
            {roomMenuOpen && (
              <div
                id="room-display-options"
                className="room-picker-menu"
                role="listbox"
                aria-label="Room display options"
              >
                {rooms.map((item) => {
                  const occupied = isOccupied(item, meetings)
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`room-picker-option ${item.id === room.id ? 'is-selected' : ''}`}
                      role="option"
                      aria-selected={item.id === room.id}
                      onClick={() => {
                        setSelectedRoomId(item.id)
                        setControlNotice('')
                        setRoomMenuOpen(false)
                      }}
                    >
                      <span className="room-option-copy">
                        <strong>{item.name}</strong>
                        <small>{item.floor}</small>
                      </span>
                      <span className={`room-option-status ${occupied ? 'is-occupied' : ''}`}>
                        {occupied ? 'Occupied' : 'Available'}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <div className="tablet-clock">
          <div className="date">Today</div>
          <div className="divider" />
          <div className="time"><span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span></div>
        </div>
      </div>

      <main className="tablet-main">
        <aside className="rail">
          <section className="panel">
            <div className="panel-head">
              <h2>Today's Schedule</h2>
              <a href="#">View All</a>
            </div>
            <div className="sched-list">
              {schedule.map((meeting) => (
                <div key={meeting.id} className="sched-item" style={{ '--accent': meeting.status === 'ongoing' ? 'var(--bn-red)' : 'var(--state-free)' } as React.CSSProperties}>
                  <div className="meta">
                    <strong>{meeting.title}</strong>
                    <span>{meeting.start} – {meeting.end}</span>
                  </div>
                  <span className="chev">›</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel ongoing">
            <div className="panel-head"><h2>Ongoing Meeting</h2></div>
            <div>
              {ongoingMeeting ? (
                <>
                  <p className="status-word">{ongoingMeeting.title}</p>
                  <p className="host-row">Hosted by {ongoingMeeting.host} · {ongoingMeeting.start}–{ongoingMeeting.end}</p>
                </>
              ) : (
                <p className="host-row">No meeting in progress</p>
              )}
            </div>
          </section>
        </aside>

        <section className={`stage ${ongoingMeeting ? 'busy' : 'free'}`}>
          <div className="stage-inner">
            <div className="status-word">{ongoingMeeting ? 'Occupied' : 'Available'}</div>
            <div className="phi-divider" aria-hidden="true" />
            <div className="status-icon">{ongoingMeeting ? '🏢' : '✔️'}</div>
            <p className="status-sub">
              {ongoingMeeting ? 'This room is currently in use' : 'This room is free and ready to book'}
            </p>
          </div>

          <section className="smart-panel" aria-labelledby="smart-controls-title">
            <div className="smart-panel-head">
              <div>
                <span className="smart-kicker"><HiOutlineCpuChip /> Smart room controls</span>
                <h2 id="smart-controls-title">Appliances</h2>
                <p>{automatic ? 'Occupancy automation is managing this room.' : 'Manual control is active for this room.'}</p>
              </div>
              <div className="control-mode" aria-label="Control mode">
                <button
                  type="button"
                  className={automatic ? 'active' : ''}
                  aria-pressed={automatic}
                  onClick={() => setMode('automatic')}
                >
                  Automatic
                </button>
                <button
                  type="button"
                  className={!automatic ? 'active' : ''}
                  aria-pressed={!automatic}
                  onClick={() => setMode('manual')}
                >
                  Manual
                </button>
              </div>
            </div>

            <div className="device-grid">
              {devices.map(({ key, label, detail, Icon }) => {
                const enabled = controls[key]
                return (
                  <button
                    type="button"
                    key={key}
                    className={`device-control ${enabled ? 'is-on' : ''}`}
                    onClick={() => toggleDevice(key)}
                    disabled={automatic}
                    aria-pressed={enabled}
                    aria-label={`${label}: ${enabled ? 'on' : 'off'}${automatic ? ', controlled automatically' : ''}`}
                  >
                    <span className="device-icon"><Icon /></span>
                    <span className="device-copy">
                      <strong>{label}</strong>
                      <small>{detail}</small>
                    </span>
                    <span className="device-state">{enabled ? 'On' : 'Off'}</span>
                    <span className="switch-track" aria-hidden="true"><span /></span>
                  </button>
                )
              })}
            </div>

            <div className="automation-note" role="status">
              <span className={`automation-dot ${automatic ? 'is-live' : ''}`} />
              <span>
                {controlNotice || (automatic
                  ? `Automation active · ${isOccupied(room, meetings) ? 'Occupancy detected, comfort devices enabled' : 'Room vacant, energy-saving mode enabled'}`
                  : 'Manual mode · Appliance controls are unlocked')}
              </span>
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}
