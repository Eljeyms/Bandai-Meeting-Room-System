import { useMemo, useState } from 'react'
import {
  HiArrowDownTray,
  HiCalendarDays,
  HiChartBar,
  HiChevronLeft,
  HiChevronRight,
  HiClock,
  HiEllipsisVertical,
  HiMapPin,
  HiOutlineBuildingOffice2,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2'
import { exportReport, type DashboardData } from '../lib/api'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PAGE_SIZE = 5

const minutesBetween = (start: string, end: string) => {
  const toMinutes = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number)
    return hours * 60 + minutes
  }
  return Math.max(0, toMinutes(end) - toMinutes(start))
}

const splitFloor = (floor: string) => floor.split('·').map((part) => part.trim())

export default function ReportsPage({ data }: { data: DashboardData }) {
  const { rooms, meetings, utilization } = data
  const [sortMode, setSortMode] = useState<'meetings' | 'usage' | 'name'>('meetings')
  const [page, setPage] = useState(1)
  const [range, setRange] = useState('This week')

  const weeklyData = useMemo(() => {
    const counts = DAY_NAMES.map((day) => ({ day, meetings: 0 }))
    meetings.forEach((meeting) => {
      const date = new Date(`${meeting.date}T12:00:00`)
      const index = (date.getDay() + 6) % 7
      if (!Number.isNaN(index)) counts[index].meetings += 1
    })
    return counts
  }, [meetings])

  const rows = useMemo(() => {
    const usageByDay = new Map(utilization.map((item) => [item.day, item.pct]))
    const reportRows = rooms.map((room) => {
      const roomMeetings = meetings.filter((meeting) => meeting.roomId === room.id)
      const [location = 'Main office', floor = room.floor] = splitFloor(room.floor)
      const usageRate = usageByDay.get('Fri') ?? Math.round((roomMeetings.length / Math.max(1, meetings.length)) * 100)
      return { room, location, floor, count: roomMeetings.length, usageRate }
    })
    return reportRows.sort((a, b) => {
      if (sortMode === 'usage') return b.usageRate - a.usageRate
      if (sortMode === 'name') return a.room.name.localeCompare(b.room.name)
      return b.count - a.count
    })
  }, [meetings, rooms, sortMode, utilization])

  const totalMeetings = meetings.length
  const averagePerDay = (totalMeetings / 7).toFixed(1)
  const totalHours = (meetings.reduce((total, meeting) => total + minutesBetween(meeting.start, meeting.end), 0) / 60).toFixed(1)
  const roomsUsed = new Set(meetings.map((meeting) => meeting.roomId)).size
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const visibleRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const changeSort = (value: 'meetings' | 'usage' | 'name') => {
    setSortMode(value)
    setPage(1)
  }

  return (
    <div className="reports-page">
      <section className="reports-overview">
        <div className="report-chart-card">
          <div className="report-card-head">
            <div>
              <span className="report-kicker">Weekly activity</span>
              <h2>Meetings by day</h2>
            </div>
            <select className="report-range" value={range} onChange={(event) => setRange(event.target.value)} aria-label="Report date range">
              <option>This week</option>
              <option>Last week</option>
              <option>This month</option>
            </select>
          </div>
          <div className="report-chart-body" aria-label="Meetings by day bar chart">
            <div className="report-y-axis"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div>
            <div className="report-chart">
              {weeklyData.map(({ day, meetings: count }) => {
                const max = Math.max(...weeklyData.map((item) => item.meetings), 1)
                return <div className="report-bar-column" key={day}>
                  <span className="report-bar-value">{count || ''}</span>
                  <div className="report-bar-track"><span style={{ height: `${Math.max(count ? 12 : 0, (count / max) * 100)}%` }} /></div>
                  <span>{day}</span>
                </div>
              })}
            </div>
          </div>
        </div>

        <div className="report-metrics">
          <Metric icon={<HiCalendarDays />} label="Total meetings" value={totalMeetings} detail="This week" tone="blue" />
          <Metric icon={<HiOutlineArrowTrendingUp />} label="Avg. per day" value={averagePerDay} detail="Meetings" tone="green" />
          <Metric icon={<HiClock />} label="Total hours" value={totalHours} detail="This week" tone="violet" />
          <Metric icon={<HiOutlineBuildingOffice2 />} label="Rooms used" value={roomsUsed} detail="Unique rooms" tone="amber" />
        </div>
      </section>

      <section className="report-table-card">
        <div className="report-table-head">
          <div><span className="report-kicker">Live analytics</span><h2>Room performance</h2></div>
          <div className="report-table-actions">
            <select aria-label="Sort room performance" value={sortMode} onChange={(event) => changeSort(event.target.value as typeof sortMode)}>
              <option value="meetings">Sort by meetings</option>
              <option value="usage">Sort by usage</option>
              <option value="name">Sort by name</option>
            </select>
            <button className="btn btn-primary report-export" onClick={() => exportReport(rooms, meetings, utilization)}><HiArrowDownTray />Export report</button>
          </div>
        </div>
        <div className="report-table-scroll">
          <table className="report-table">
            <thead><tr><th>Room</th><th>Location</th><th>Meetings today</th><th>Weekly meetings</th><th>Usage rate</th><th>Status</th><th aria-label="Actions" /></tr></thead>
            <tbody>{visibleRows.map(({ room, location, floor, count, usageRate }, index) => <tr key={room.id}>
              <td><div className="report-room"><span className="report-room-icon"><HiChartBar /></span><span><strong>{(page - 1) * PAGE_SIZE + index + 1}. {room.name}</strong><small>{location} · {floor}</small></span></div></td>
              <td><span className="report-location"><HiMapPin />{floor}</span></td>
              <td><strong>{count}</strong><small>{count === 1 ? 'meeting' : 'meetings'} today</small></td>
              <td><strong>{count}</strong><small>This week</small></td>
              <td><UsageRing value={usageRate} /></td>
              <td><span className={`report-status ${room.status}`}><i />{room.status === 'available' ? 'Available' : 'Occupied'}</span></td>
              <td><button className="report-more" aria-label={`More actions for ${room.name}`}><HiEllipsisVertical /></button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="report-pagination">
          <button disabled={page === 1} aria-label="Previous page" onClick={() => setPage((value) => value - 1)}><HiChevronLeft /></button>
          <span>{page}</span>
          <button disabled={page === pageCount} aria-label="Next page" onClick={() => setPage((value) => value + 1)}><HiChevronRight /></button>
        </div>
      </section>
    </div>
  )
}

function Metric({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string | number; detail: string; tone: string }) {
  return <article className="report-metric"><span className={`report-metric-icon ${tone}`}>{icon}</span><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
}

function UsageRing({ value }: { value: number }) {
  const radius = 16
  const circumference = 2 * Math.PI * radius
  return <span className="usage-ring"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r={radius} /><circle className={value >= 80 ? 'high' : ''} cx="20" cy="20" r={radius} strokeDasharray={circumference} strokeDashoffset={circumference - (value / 100) * circumference} /></svg><b>{value}%</b></span>
}
