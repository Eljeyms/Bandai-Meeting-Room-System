import { HiOutlineBuildingOffice2, HiOutlineCalendarDays, HiOutlineChartBar, HiOutlineClock } from 'react-icons/hi2'
import type { DashboardData } from '../lib/api'

export default function FrontDeskDashboardPage({ data }: { data: DashboardData }) {
  const available = data.rooms.filter((room) => room.status === 'available').length
  const ongoing = data.meetings.filter((meeting) => meeting.status === 'ongoing')
  const upcoming = data.meetings.filter((meeting) => meeting.status === 'upcoming')

  return (
    <div className="frontdesk-dashboard">
      <section className="frontdesk-summary">
        {[
          { label: 'Available rooms', value: available, icon: HiOutlineBuildingOffice2 },
          { label: 'Ongoing meetings', value: ongoing.length, icon: HiOutlineClock },
          { label: 'Upcoming today', value: upcoming.length, icon: HiOutlineCalendarDays },
        ].map((item) => {
          const Icon = item.icon
          return <article className="card frontdesk-stat" key={item.label}><span><Icon /></span><div><small>{item.label}</small><strong>{item.value}</strong></div></article>
        })}
      </section>

      <section className="card block frontdesk-queue">
        <div className="block-head">
          <div><p className="eyebrow">Today at the front desk</p><h2>Meeting Arrival Board</h2></div>
          <a className="btn btn-primary" href="#/frontdesk-schedule">Manage schedule</a>
        </div>
        <div className="arrival-list">
          {data.meetings.map((meeting) => {
            const room = data.rooms.find((item) => item.id === meeting.roomId)
            return (
              <article key={meeting.id}>
                <time>{meeting.start}</time>
                <div><strong>{meeting.title}</strong><span>{room?.name} · {meeting.host}</span></div>
                <span className={`badge ${meeting.status === 'ongoing' ? 'badge-busy' : 'badge-mute'}`}>{meeting.status}</span>
              </article>
            )
          })}
        </div>
      </section>

      <section className="card frontdesk-links">
        <h2>Front Desk Tools</h2>
        <div>
          <a href="#/frontdesk-calendar"><HiOutlineCalendarDays /> Open calendar</a>
          <a href="#/frontdesk-reports"><HiOutlineChartBar /> View daily report</a>
          <a href="#/public"><HiOutlineBuildingOffice2 /> Open public schedule</a>
        </div>
      </section>
    </div>
  )
}
