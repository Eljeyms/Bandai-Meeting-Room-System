import { useEffect, useMemo, useState } from 'react'
import { HiOutlineArrowRight, HiOutlineBuildingOffice2, HiOutlineCalendarDays, HiOutlineClock } from 'react-icons/hi2'
import type { DashboardData } from '../lib/api'

export default function PublicSchedulePage({ data }: { data: DashboardData }) {
  const [now, setNow] = useState(() => new Date())
  const dailyMeetings = useMemo(
    () => [...data.meetings].sort((left, right) => left.start.localeCompare(right.start)),
    [data.meetings],
  )
  const ongoingMeeting = dailyMeetings.find((meeting) => meeting.status === 'ongoing')
  const nextMeeting = dailyMeetings.find((meeting) => meeting.status === 'upcoming')
  const availableRooms = data.rooms.filter((room) => room.status === 'available').length
  const occupiedRooms = data.rooms.length - availableRooms
  const getRoom = (roomId: string) => data.rooms.find((room) => room.id === roomId)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(now)
  const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const ongoingRoom = ongoingMeeting ? getRoom(ongoingMeeting.roomId) : undefined
  const nextRoom = nextMeeting ? getRoom(nextMeeting.roomId) : undefined

  return (
    <div className="public-schedule">
      <header className="public-head">
        <div className="public-brand">
          <img src="/assets/img/images-removebg.png" alt="Bandai Namco" />
          <span>Meeting Room Directory</span>
        </div>
        <div className="public-head-copy">
          <p className="eyebrow">Live daily room board</p>
          <h1>Today’s Room Schedule</h1>
          <p>{formattedDate}</p>
        </div>
        <div className="public-head-actions">
          <div className="public-clock" aria-label={`Current time ${formattedTime}`}>
            <span><i /> Live</span>
            <strong>{formattedTime}</strong>
          </div>
          <a href="#/frontdesk-dashboard">Staff view <HiOutlineArrowRight /></a>
        </div>
      </header>

      <main className="public-schedule-main">
        <section className="public-spotlight" aria-label="Current schedule highlights">
          <article className={`public-feature public-feature-now ${ongoingMeeting ? 'has-meeting' : 'is-open'}`}>
            <div className="public-feature-kicker"><i /> Happening now</div>
            {ongoingMeeting ? (
              <>
                <div className="public-feature-copy">
                  <span>In progress</span>
                  <h2>{ongoingMeeting.title}</h2>
                  <p><HiOutlineBuildingOffice2 /> {ongoingRoom?.name || 'Room pending'} · {ongoingRoom?.floor}</p>
                </div>
                <div className="public-feature-meta">
                  <strong>{ongoingMeeting.start}–{ongoingMeeting.end}</strong>
                  <span>Hosted by {ongoingMeeting.host}</span>
                </div>
              </>
            ) : (
              <div className="public-feature-copy">
                <span>All clear</span>
                <h2>No meeting in progress</h2>
                <p>Rooms are ready for the next scheduled sessions.</p>
              </div>
            )}
          </article>

          <article className="public-feature public-feature-next">
            <div className="public-feature-kicker"><HiOutlineClock /> Up next</div>
            {nextMeeting ? (
              <>
                <div className="public-feature-copy">
                  <span>Starts at {nextMeeting.start}</span>
                  <h2>{nextMeeting.title}</h2>
                  <p><HiOutlineBuildingOffice2 /> {nextRoom?.name || 'Room pending'} · {nextRoom?.floor}</p>
                </div>
                <div className="public-feature-meta">
                  <strong>{nextMeeting.start}–{nextMeeting.end}</strong>
                  <span>Hosted by {nextMeeting.host}</span>
                </div>
              </>
            ) : (
              <div className="public-feature-copy">
                <span>Schedule complete</span>
                <h2>No more meetings today</h2>
                <p>Check again tomorrow for the next room schedule.</p>
              </div>
            )}
          </article>
        </section>

        <section className="public-metrics" aria-label="Room availability summary">
          <article>
            <span className="public-metric-icon is-free"><i className="dot dot-free" /></span>
            <div><strong>{availableRooms}</strong><span>Rooms available</span></div>
          </article>
          <article>
            <span className="public-metric-icon is-busy"><i className="dot dot-busy" /></span>
            <div><strong>{occupiedRooms}</strong><span>Rooms occupied</span></div>
          </article>
          <article>
            <span className="public-metric-icon"><HiOutlineCalendarDays /></span>
            <div><strong>{dailyMeetings.length}</strong><span>Meetings today</span></div>
          </article>
        </section>

        <section className="public-agenda-section" aria-label="Daily meeting schedule">
          <div className="public-agenda-head">
            <div>
              <p className="eyebrow">Full day</p>
              <h2>Today’s agenda</h2>
            </div>
            <div className="public-legend"><span><i className="dot dot-busy" /> In progress</span><span><i className="dot dot-free" /> Upcoming</span></div>
          </div>

          <div className="public-agenda">
            {dailyMeetings.map((meeting) => {
              const room = getRoom(meeting.roomId)
              const ongoing = meeting.status === 'ongoing'
              return (
                <article className={ongoing ? 'is-live' : ''} key={meeting.id}>
                  <div className="public-time">
                    <strong>{meeting.start}</strong>
                    <span>to {meeting.end}</span>
                  </div>
                  <div className="public-event">
                    <span className={`public-event-state ${ongoing ? 'is-live' : ''}`}>
                      <i /> {ongoing ? 'In progress' : 'Upcoming'}
                    </span>
                    <h3>{meeting.title}</h3>
                    <p>Hosted by {meeting.host}</p>
                  </div>
                  <div className="public-room">
                    <span className="public-room-icon"><HiOutlineBuildingOffice2 /></span>
                    <div><strong>{room?.name || 'Room pending'}</strong><span>{room?.floor}</span></div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="public-foot"><strong>BANDAI NAMCO</strong><span>Room availability updates automatically throughout the day.</span></footer>
    </div>
  )
}
