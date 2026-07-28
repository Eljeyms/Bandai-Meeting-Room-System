import { useState } from 'react'
import { HiOutlineEnvelope, HiOutlineIdentification, HiOutlineShieldCheck, HiOutlineUserCircle } from 'react-icons/hi2'

export default function ProfilePage({ role }: { role: 'admin' | 'frontdesk' }) {
  const [profile, setProfile] = useState({
    name: role === 'admin' ? 'Admin Console' : 'Front Desk Team',
    email: role === 'admin' ? 'admin@bandainamco.local' : 'frontdesk@bandainamco.local',
    department: role === 'admin' ? 'IT & Workplace Operations' : 'Reception & Facilities',
  })
  const [message, setMessage] = useState('')

  return (
    <div className="profile-layout">
      <aside className="card profile-summary">
        <span className="profile-large-avatar"><HiOutlineUserCircle /></span>
        <h2>{profile.name}</h2>
        <p>{role === 'admin' ? 'System Administrator' : 'Front Desk Coordinator'}</p>
        <span className="profile-access"><HiOutlineShieldCheck /> {role === 'admin' ? 'Full administrative access' : 'Front desk access'}</span>
      </aside>

      <section className="card profile-form-card">
        <div className="block-head">
          <div><p className="eyebrow">Account settings</p><h2>Profile Information</h2></div>
        </div>
        <div className="profile-form">
          <label><span><HiOutlineIdentification /> Display name</span><input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} /></label>
          <label><span><HiOutlineEnvelope /> Email address</span><input type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} /></label>
          <label><span><HiOutlineIdentification /> Department</span><input value={profile.department} onChange={(event) => setProfile((current) => ({ ...current, department: event.target.value }))} /></label>
          <label><span><HiOutlineShieldCheck /> Account role</span><input value={role === 'admin' ? 'System Administrator' : 'Front Desk'} disabled /></label>
        </div>
        <div className="profile-actions">
          {message && <span role="status">{message}</span>}
          <button type="button" className="btn btn-primary" onClick={() => setMessage('Profile changes saved on this device.')}>Save profile</button>
        </div>
      </section>
    </div>
  )
}
