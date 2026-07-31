import type { DashboardData } from '../lib/api'
import {
  HiComputerDesktop,
  HiOutlineArrowRight,
  HiOutlineBolt,
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
  HiOutlinePresentationChartLine,
  HiOutlineUserGroup,
} from 'react-icons/hi2'

export default function DashboardPage({ data }: { data: DashboardData }) {
  const { rooms, meetings, users } = data
  const occupiedRooms = rooms.filter((room) => room.status === 'occupied').length
  const activeUsers = users.filter((user) => user.active).length
  const utilization = rooms.length ? Math.round((occupiedRooms / rooms.length) * 100) : 0
  const upcomingMeetings = meetings.filter((meeting) => meeting.status === 'upcoming').slice(0, 4)

  const scheduleRows = rooms.map((room) => {
    const meeting = meetings.find((m) => m.roomId === room.id && m.status === 'ongoing')
    return {
      ...room,
      busy: room.status === 'occupied',
      currentMeeting: meeting,
    }
  })

  const stats = [
    { label: 'Rooms occupied now', value: `${occupiedRooms} / ${rooms.length}`, hint: 'Live from room sensors', color: 'var(--bn-red)', icon: HiOutlineBuildingOffice2 },
    { label: 'Meetings today', value: meetings.length.toString(), hint: 'Across all meeting rooms', color: 'var(--bn-red-dark)', icon: HiOutlineCalendarDays },
    { label: 'Active users', value: activeUsers.toString(), hint: 'Users with booking access', color: 'var(--state-free)', icon: HiOutlineUserGroup },
    { label: 'Average utilization', value: `${utilization}%`, hint: 'Current room usage rate', color: 'var(--ink-soft)', icon: HiOutlinePresentationChartLine },
  ]

  const quickActions = [
    { label: 'Manage rooms', href: '#/rooms', icon: HiOutlineBuildingOffice2 },
    { label: 'New meeting', href: '#/schedule', icon: HiOutlineCalendarDays },
    { label: 'HRIS accounts', href: '#/hris', icon: HiOutlineUserGroup },
    { label: 'View reports', href: '#/reports', icon: HiOutlineChartBar },
  ]

  const shortcuts = [
    {
      title: 'Room Operations',
      icon: HiOutlineCog6Tooth,
      items: [
        { label: 'Room configuration', href: '#/rooms', icon: HiOutlineBuildingOffice2 },
        { label: 'Schedule management', href: '#/schedule', icon: HiOutlineCalendarDays },
      ],
    },
    {
      title: 'People & Access',
      icon: HiOutlineUserGroup,
      items: [
        { label: 'HRIS accounts', href: '#/hris', icon: HiOutlineUserGroup },
        { label: 'Room display', href: '#/display', icon: HiComputerDesktop },
      ],
    },
    {
      title: 'Insights & Displays',
      icon: HiOutlineChartBar,
      items: [
        { label: 'Utilization reports', href: '#/reports', icon: HiOutlinePresentationChartLine },
        { label: 'Rooms overview', href: '#/overview', icon: HiOutlineBuildingOffice2 },
      ],
    },
  ]

  return (
    <>
      <section className="stat-grid">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div className="card stat" key={stat.label} style={{ '--accent': stat.color } as React.CSSProperties}>
              <span className="stat-icon"><Icon /></span>
              <div className="label">{stat.label}</div>
              <div className="value">{stat.value}</div>
              <div className="hint">{stat.hint}</div>
            </div>
          )
        })}
      </section>

      <section className="golden-cols">
        <div className="card block">
          <div className="block-head">
            <h2>Rooms right now</h2>
            <span className="badge badge-busy">● Live</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Status</th>
                <th>Current meeting</th>
              </tr>
            </thead>
            <tbody>
              {scheduleRows.map((room) => (
                <tr key={room.id}>
                  <td>
                    <strong>{room.name}</strong>
                    <span className="sub">{room.floor} · seats {room.capacity}</span>
                  </td>
                  <td>
                    <span className={`dot ${room.busy ? 'dot-busy' : 'dot-free'}`} />
                    {room.busy ? 'Occupied' : 'Available'}
                  </td>
                  <td>
                    {room.currentMeeting ? (
                      <>
                        {room.currentMeeting.title}
                        <span className="sub">{room.currentMeeting.start} – {room.currentMeeting.end} · {room.currentMeeting.host}</span>
                      </>
                    ) : (
                      <span className="sub">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card block">
          <div className="block-head">
            <h2>Up next</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Meeting</th>
                <th>Starts</th>
              </tr>
            </thead>
            <tbody>
              {upcomingMeetings.map((meeting) => {
                const room = rooms.find((r) => r.id === meeting.roomId)
                return (
                  <tr key={meeting.id}>
                    <td>
                      <strong>{meeting.title}</strong>
                      <span className="sub">{room?.name}</span>
                    </td>
                    <td>
                      {meeting.start}
                      <span className="sub">{meeting.host}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card quick-actions-card">
        <div className="dashboard-section-head">
          <span className="section-icon"><HiOutlineBolt /></span>
          <div>
            <h2>Quick Actions</h2>
            <p>Common room administration tasks</p>
          </div>
        </div>
        <div className="quick-action-buttons">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <a className="quick-action" key={action.label} href={action.href}>
                <Icon />
                <span>{action.label}</span>
              </a>
            )
          })}
        </div>
      </section>

      <section className="dashboard-shortcuts">
        <div className="dashboard-section-head">
          <span className="section-icon"><HiOutlineCog6Tooth /></span>
          <div>
            <h2>Administration Shortcuts</h2>
            <p>Go directly to the tools you use most</p>
          </div>
        </div>
        <div className="shortcut-grid">
          {shortcuts.map((group) => {
            const GroupIcon = group.icon
            return (
              <article className="shortcut-group" key={group.title}>
                <header>
                  <span><GroupIcon /></span>
                  <h3>{group.title}</h3>
                  <small>{group.items.length}</small>
                </header>
                <div className="shortcut-links">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <a href={item.href} key={item.label}>
                        <span className="shortcut-link-icon"><Icon /></span>
                        <strong>{item.label}</strong>
                        <HiOutlineArrowRight className="shortcut-arrow" />
                      </a>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      </section>

    </>
  )
}
