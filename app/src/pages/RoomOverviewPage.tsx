import { HiOutlineBuildingOffice2, HiOutlineClock, HiOutlineUsers, HiOutlineVideoCamera } from 'react-icons/hi2'
import type { DashboardData } from '../lib/api'

const cameraPreviews = [
  {
    video: 'https://videos.pexels.com/video-files/5716999/5716999-uhd_3840_2160_25fps.mp4',
    poster: 'https://images.pexels.com/videos/5716999/pexels-photo-5716999.jpeg?auto=compress&fit=crop&w=1280',
  },
  {
    video: 'https://videos.pexels.com/video-files/6951393/6951393-uhd_3840_2160_25fps.mp4',
    poster: 'https://images.pexels.com/videos/6951393/chairs-conference-room-daylight-microphones-6951393.jpeg?auto=compress&fit=crop&w=1280',
  },
]

export default function RoomOverviewPage({ data }: { data: DashboardData }) {
  const { rooms, meetings } = data
  const availableRooms = rooms.filter((room) => room.status === 'available').length
  return (
    <div className="overview">
      <div className="overview-top">
        <div className="overview-head">
          <span className="badge badge-mute">● Meeting Room Status</span>
          <h1>Rooms overview</h1>
          <p>Room availability, camera previews, and today’s schedules at a glance.</p>
        </div>
        <div className="overview-summary" aria-label="Room overview summary">
          <span><strong>{availableRooms}</strong> available</span>
          <span><strong>{rooms.length - availableRooms}</strong> occupied</span>
        </div>
      </div>

      <main className="overview-grid">
        {rooms.map((room, index) => {
          const roomMeetings = meetings.filter((meeting) => meeting.roomId === room.id).slice(0, 3)
          const camera = cameraPreviews[index % cameraPreviews.length]
          return (
            <article key={room.id} className="room-card">
              <div className="room-camera">
                <video
                  controls
                  muted
                  loop
                  playsInline
                  preload="none"
                  poster={camera.poster}
                  aria-label={`${room.name} room camera preview`}
                >
                  <source src={camera.video} type="video/mp4" />
                  Your browser does not support room video previews.
                </video>
                <div className="room-camera-top">
                  <span><HiOutlineVideoCamera /> Room preview</span>
                  <span className="camera-ready"><i /> Camera ready</span>
                </div>
              </div>

              <div className="room-card-body">
                <div className="room-card-head">
                  <div>
                    <p className="eyebrow">{room.floor}</p>
                    <h2>{room.name}</h2>
                  </div>
                  <div className={`room-status ${room.status === 'occupied' ? 'occupied' : 'available'}`}>
                    <i /> {room.status === 'occupied' ? 'Occupied' : 'Vacant'}
                  </div>
                </div>

                <div className="room-facts">
                  <span><HiOutlineUsers /><strong>{room.capacity}</strong> seats</span>
                  <span><HiOutlineBuildingOffice2 /> {room.floor}</span>
                </div>

                <div className="room-schedule">
                  <div className="room-schedule-head">
                    <strong>Today’s schedule</strong>
                    <span>{roomMeetings.length} meeting{roomMeetings.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="sched-list">
                    {roomMeetings.length ? roomMeetings.map((meeting) => (
                      <div key={meeting.id} className={`sched-item ${meeting.status === 'ongoing' ? 'is-live' : ''}`}>
                        <div><strong>{meeting.title}</strong><span>Hosted by {meeting.host}</span></div>
                        <span className="room-meeting-time"><HiOutlineClock /> {meeting.start}–{meeting.end}</span>
                      </div>
                    )) : <div className="room-empty">No meetings scheduled today</div>}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </main>
    </div>
  )
}
