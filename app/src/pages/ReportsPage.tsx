import { useMemo, useState } from 'react'
import { exportReport, type DashboardData } from '../lib/api'

export default function ReportsPage({ data }: { data: DashboardData }) {
  const { rooms, meetings, utilization } = data
  const [sortMode, setSortMode] = useState('meetings')

  const byRoom = useMemo(() => {
    const dataset = rooms.map((room) => ({ room, count: meetings.filter((meeting) => meeting.roomId === room.id).length }))
    if (sortMode === 'status') {
      return dataset.sort((a, b) => a.room.status.localeCompare(b.room.status))
    }
    return dataset.sort((a, b) => b.count - a.count)
  }, [meetings, rooms, sortMode])

  return (
    <div className="card block">
      <div className="block-head">
        <h2>Reports</h2>
        <div className="filter-row">
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="meetings">Sort by meetings</option>
            <option value="status">Sort by status</option>
          </select>
          <button className="btn btn-primary" onClick={() => exportReport(rooms, meetings)}>Export</button>
        </div>
      </div>
      <div className="bars">
        {utilization.map((data) => (
          <div className="bar-col" key={data.day}>
            <div className="bar" style={{ height: `${data.pct}%` }}>
              <span className="pct">{data.pct}%</span>
            </div>
            <span className="lab">{data.day}</span>
          </div>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th>Room</th>
            <th>Meetings today</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {byRoom.map(({ room, count }, index) => (
            <tr key={room.id}>
              <td><strong>{index + 1}. {room.name}</strong><span className="sub">{room.floor}</span></td>
              <td>{count} meeting{count === 1 ? '' : 's'} today</td>
              <td><span className={`dot ${room.status === 'occupied' ? 'dot-busy' : 'dot-free'}`}></span>{room.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
