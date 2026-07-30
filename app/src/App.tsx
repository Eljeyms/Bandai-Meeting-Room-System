import { useEffect, useRef, useState } from 'react'
import {
  HiArrowPath,
  HiBars3,
  HiComputerDesktop,
  HiOutlineBell,
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineClipboardDocumentList,
  HiOutlineIdentification,
  HiOutlineTableCells,
  HiOutlineUserCircle,
  HiOutlineUserGroup,
  HiXMark,
} from 'react-icons/hi2'
import DashboardPage from './pages/DashboardPage'
import FrontDeskDashboardPage from './pages/FrontDeskDashboardPage'
import HrisAccountsPage from './pages/HrisAccountsPage'
import ProfilePage from './pages/ProfilePage'
import PublicSchedulePage from './pages/PublicSchedulePage'
import ReportsPage from './pages/ReportsPage'
import RoomDisplayPage from './pages/RoomDisplayPage'
import RoomOverviewPage from './pages/RoomOverviewPage'
import RoomsPage from './pages/RoomsPage'
import SchedulePage from './pages/SchedulePage'
import useDashboard from './hooks/useDashboard'
import './index.css'

type PageKey =
  | 'dashboard'
  | 'reports'
  | 'rooms'
  | 'schedule'
  | 'calendar'
  | 'hris'
  | 'profile'
  | 'display'
  | 'overview'
  | 'frontdesk-dashboard'
  | 'frontdesk-reports'
  | 'frontdesk-schedule'
  | 'frontdesk-calendar'
  | 'frontdesk-profile'
  | 'public'

type PortalRole = 'admin' | 'frontdesk'

type NotificationItem = {
  id: string
  text: string
  time: string
}

const adminLinks = [
  { key: 'dashboard', label: 'Dashboard', icon: HiOutlineTableCells },
  { key: 'reports', label: 'Reports', icon: HiOutlineChartBar },
  { key: 'rooms', label: 'Room Management', icon: HiOutlineBuildingOffice2 },
  { key: 'schedule', label: 'Schedule', icon: HiOutlineClipboardDocumentList },
  { key: 'calendar', label: 'Calendar', icon: HiOutlineCalendarDays },
  { key: 'hris', label: 'HRIS Accounts', icon: HiOutlineUserGroup },
  { key: 'profile', label: 'Profile', icon: HiOutlineIdentification },
] satisfies Array<{ key: PageKey; label: string; icon: typeof HiOutlineTableCells }>

const frontDeskLinks = [
  { key: 'frontdesk-dashboard', label: 'Dashboard', icon: HiOutlineTableCells },
  { key: 'frontdesk-reports', label: 'Reports', icon: HiOutlineChartBar },
  { key: 'frontdesk-schedule', label: 'Schedule', icon: HiOutlineClipboardDocumentList },
  { key: 'frontdesk-calendar', label: 'Calendar', icon: HiOutlineCalendarDays },
  { key: 'frontdesk-profile', label: 'Profile', icon: HiOutlineIdentification },
] satisfies Array<{ key: PageKey; label: string; icon: typeof HiOutlineTableCells }>

const pageHeaders: Record<Exclude<PageKey, 'public'>, { eyebrow: string; title: string; description: string }> = {
  dashboard: { eyebrow: 'Meeting room administration', title: 'Admin Dashboard', description: 'System-wide room operations, schedules, and access' },
  reports: { eyebrow: 'Insights & utilization', title: 'Reports', description: 'Usage trends and room performance metrics' },
  rooms: { eyebrow: 'Room fleet', title: 'Room Management', description: 'Manage room setup, sensors, tablets, and availability' },
  schedule: { eyebrow: 'Booking operations', title: 'Schedule', description: 'Create and manage meeting bookings' },
  calendar: { eyebrow: 'Calendar workspace', title: 'Calendar', description: 'Review schedules by day, week, or month' },
  hris: { eyebrow: 'Identity integration', title: 'HRIS Accounts', description: 'Employee accounts and room-access role mapping' },
  profile: { eyebrow: 'Account settings', title: 'Profile', description: 'Administrator profile and access information' },
  display: { eyebrow: 'Room display', title: 'Room Display (Tablet)', description: 'Live room availability and ongoing meeting status' },
  overview: { eyebrow: 'Rooms overview', title: 'Rooms Overview (Lobby)', description: 'Real-time room status and upcoming schedule summary' },
  'frontdesk-dashboard': { eyebrow: 'Reception workspace', title: 'Front Desk Dashboard', description: 'Today’s arrivals, rooms, and meeting activity' },
  'frontdesk-reports': { eyebrow: 'Daily operations', title: 'Front Desk Reports', description: 'Room and meeting activity for reception teams' },
  'frontdesk-schedule': { eyebrow: 'Booking operations', title: 'Front Desk Schedule', description: 'Create and manage visitor and employee bookings' },
  'frontdesk-calendar': { eyebrow: 'Calendar workspace', title: 'Front Desk Calendar', description: 'Review daily, weekly, and monthly schedules' },
  'frontdesk-profile': { eyebrow: 'Account settings', title: 'Front Desk Profile', description: 'Team profile and assigned access' },
}

const pageKeys = new Set<PageKey>([...Object.keys(pageHeaders) as Array<Exclude<PageKey, 'public'>>, 'public'])
const isPageKey = (value: string): value is PageKey => pageKeys.has(value as PageKey)

function App() {
  const initialHash = window.location.hash.replace('#/', '')
  const [selectedPage, setSelectedPage] = useState<PageKey>(isPageKey(initialHash) ? initialHash : 'dashboard')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const addNotification = (text: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    setNotifications((prev) => [{ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text, time }, ...prev].slice(0, 6))
  }

  const { data, loading, error, isLive } = useDashboard(addNotification)

  const publicView = selectedPage === 'public'
  const hidePageHeader = selectedPage === 'display' || selectedPage === 'overview'
  const activeRole: PortalRole = selectedPage.startsWith('frontdesk-') ? 'frontdesk' : 'admin'
  const roleLinks = activeRole === 'admin' ? adminLinks : frontDeskLinks

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const syncPageFromHash = () => {
      const nextPage = window.location.hash.replace('#/', '')
      if (isPageKey(nextPage)) {
        setSelectedPage(nextPage)
        setMenuOpen(false)
      }
    }
    window.addEventListener('hashchange', syncPageFromHash)
    window.addEventListener('popstate', syncPageFromHash)
    return () => {
      window.removeEventListener('hashchange', syncPageFromHash)
      window.removeEventListener('popstate', syncPageFromHash)
    }
  }, [])

  useEffect(() => {
    if (!notificationsOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notificationsOpen])

  const toggleNotifications = () => {
    setNotificationsOpen((open) => !open)
  }

  const navigate = (page: PageKey) => {
    setSelectedPage(page)
    setMenuOpen(false)
    window.history.replaceState(null, '', `#/${page}`)
  }

  const changeRole = (role: 'admin' | 'frontdesk' | 'public') => {
    if (role === 'public') navigate('public')
    else navigate(role === 'admin' ? 'dashboard' : 'frontdesk-dashboard')
  }

  if (publicView) {
    return <PublicSchedulePage data={data} />
  }

  return (
    <div className="admin">
      <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}>
        <HiBars3 />
      </button>
      {menuOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`side ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <img src="/assets/img/bandai-badge.png" alt="Bandai" />
          </div>
          <div className="brand-copy">
            <strong>Bandai Namco</strong>
            <span>Meeting Room System</span>
          </div>
          <button className="close-menu" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><HiXMark /></button>
        </div>

        <div className="side-profile">
          <span className="profile-avatar">{activeRole === 'admin' ? 'AD' : 'FD'}</span>
          <span className="profile-copy">
            <strong>{activeRole === 'admin' ? 'Admin Console' : 'Front Desk Team'}</strong>
            <span>{activeRole === 'admin' ? 'System Administrator' : 'Reception Operations'}</span>
            <small>{activeRole === 'admin' ? 'Full access' : 'Front desk access'}</small>
          </span>
        </div>

        <nav aria-label="Primary navigation">
          <div className="section-label">{activeRole === 'admin' ? 'Manage' : 'Front Desk'}</div>
          {roleLinks.map((link) => (
            <button
              type="button"
              key={link.key}
              className={link.key === selectedPage ? 'active' : ''}
              onClick={() => navigate(link.key)}
            >
              <span className="ico"><link.icon /></span>
              {link.label}
            </button>
          ))}

          {activeRole === 'admin' && (
            <>
              <div className="section-label">Displays</div>
              <button type="button" className={selectedPage === 'display' ? 'active' : ''} onClick={() => navigate('display')}>
                <span className="ico"><HiComputerDesktop /></span>Room Display
              </button>
              <button type="button" className={selectedPage === 'overview' ? 'active' : ''} onClick={() => navigate('overview')}>
                <span className="ico"><HiOutlineBuildingOffice2 /></span>Rooms Overview
              </button>
            </>
          )}

          <div className="section-label">Public</div>
          <button type="button" onClick={() => navigate('public')}>
            <span className="ico"><HiOutlineCalendarDays /></span>Daily Schedule
          </button>
        </nav>

        <div className="side-foot">
          Fun for All into the Future<br />
          <a href="#/public">Open public schedule</a>
        </div>
      </aside>

      {!hidePageHeader && (
        <header className="topbar">
          <div className="topbar-context">
            <span className="topbar-mark" aria-hidden="true" />
            Meeting Room Administration
          </div>
          <div className="topbar-actions">
            <label className="role-switcher">
              <span className="sr-only">Select system view</span>
              <select aria-label="Select system view" value={activeRole} onChange={(event) => changeRole(event.target.value as 'admin' | 'frontdesk' | 'public')}>
                <option value="admin">Admin view</option>
                <option value="frontdesk">Front desk</option>
                <option value="public">Public schedule</option>
              </select>
            </label>
            <div className="notification-wrapper" ref={notificationsRef}>
              <button
                type="button"
                className="topbar-icon"
                aria-label="Notifications"
                aria-haspopup="true"
                aria-expanded={notificationsOpen}
                onClick={toggleNotifications}
              >
                <HiOutlineBell />
                {notifications.length > 0 ? <span className="notification-dot" /> : null}
              </button>
              {notificationsOpen ? (
                <div className="notification-menu" role="dialog" aria-label="Notifications">
                  <div className="notification-menu-head">
                    <strong>Notifications</strong>
                    <button type="button" className="notification-menu-clear" onClick={() => setNotifications([])}>
                      Clear
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="notification-empty">No recent updates</div>
                  ) : (
                    <ul>
                      {notifications.map((item) => (
                        <li key={item.id}>
                          <span>{item.text}</span>
                          <time>{item.time}</time>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
            <div className="topbar-user">
              <HiOutlineUserCircle />
              <span><strong>{activeRole === 'admin' ? 'Administrator' : 'Front Desk'}</strong><small>{activeRole === 'admin' ? 'System Admin' : 'Reception'}</small></span>
            </div>
          </div>
        </header>
      )}

      <main className={`content ${hidePageHeader ? 'display-content' : 'admin-content'}`}>
        {!hidePageHeader && (
          <header className="page-head">
            <div>
              <p className="eyebrow">{pageHeaders[selectedPage].eyebrow}</p>
              <h1>{pageHeaders[selectedPage].title}</h1>
              <p>{pageHeaders[selectedPage].description}</p>
            </div>
            <div className="actions">
              <div className={`live-pill ${isLive ? 'online' : 'offline'}`}>
                <span className="live-dot" />
                {isLive ? 'Live system' : 'Demo data'}
              </div>
              <div className="time-pill">
                <HiArrowPath />
                {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
          </header>
        )}

        {error && !hidePageHeader ? <div className="service-notice" role="status"><strong>Preview mode</strong><span>Live services are offline, so sample data is shown. Start the backend to enable saving and real-time updates.</span></div> : null}
        {loading && !hidePageHeader ? <div className="loading-grid" aria-label="Loading live room data">{[1, 2, 3, 4].map((item) => <div className="skeleton" key={item} />)}</div> : null}

        {selectedPage === 'dashboard' && <DashboardPage data={data} />}
        {selectedPage === 'reports' && <ReportsPage data={data} />}
        {selectedPage === 'rooms' && <RoomsPage data={data} />}
        {selectedPage === 'schedule' && <SchedulePage data={data} mode="schedule" />}
        {selectedPage === 'calendar' && <SchedulePage data={data} mode="calendar" />}
        {selectedPage === 'hris' && <HrisAccountsPage data={data} />}
        {selectedPage === 'profile' && <ProfilePage role="admin" />}
        {selectedPage === 'display' && <RoomDisplayPage data={data} />}
        {selectedPage === 'overview' && <RoomOverviewPage data={data} />}
        {selectedPage === 'frontdesk-dashboard' && <FrontDeskDashboardPage data={data} />}
        {selectedPage === 'frontdesk-reports' && <ReportsPage data={data} />}
        {selectedPage === 'frontdesk-schedule' && <SchedulePage data={data} mode="schedule" />}
        {selectedPage === 'frontdesk-calendar' && <SchedulePage data={data} mode="calendar" />}
        {selectedPage === 'frontdesk-profile' && <ProfilePage role="frontdesk" />}
      </main>
    </div>
  )
}

export default App
