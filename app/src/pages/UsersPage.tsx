import { useMemo, useState } from 'react'
import Modal from '../components/Modal'
import { createUser, updateUser, type DashboardData } from '../lib/api'

export default function UsersPage({ data }: { data: DashboardData }) {
  const { users } = data
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [draft, setDraft] = useState({ name: '', email: '', dept: '', role: 'Member' as 'Admin' | 'Member', active: true })
  const [message, setMessage] = useState('')
  const [showUserModal, setShowUserModal] = useState(false)

  const filteredUsers = useMemo(
    () => users.filter((user) => {
      const matchesRole = !selectedRole || user.role === selectedRole
      const matchesStatus = !selectedStatus || (selectedStatus === 'active' ? user.active : !user.active)
      const matchesSearch = !searchQuery || `${user.name} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesRole && matchesStatus && matchesSearch
    }),
    [users, selectedRole, selectedStatus, searchQuery]
  )

  return (
    <div className="card block">
      <div className="block-head">
        <h2>User Management</h2>
        <button className="btn btn-primary" onClick={() => setShowUserModal(true)}>Add user</button>
      </div>
      {message ? <div className="badge badge-free" style={{ marginBottom: '1rem' }}>{message}</div> : null}
      <div className="filter-row">
        <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
          <option value="">All roles</option>
          <option value="Admin">Admin</option>
          <option value="Member">Member</option>
        </select>
        <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <input
          type="search"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="rounded-[8px] border border-slate-200 bg-white px-4 py-2"
        />
        <div className="badge badge-free">{filteredUsers.length} users</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Department</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td><strong>{user.name}</strong><span className="sub">{user.email}</span></td>
              <td>{user.dept}</td>
              <td><span className={`badge ${user.role === 'Admin' ? 'badge-busy' : 'badge-mute'}`}>{user.role}</span></td>
              <td><span className={`dot ${user.active ? 'dot-free' : 'dot-busy'}`}></span>{user.active ? 'Active' : 'Suspended'}</td>
              <td className="row-actions">
                <button className="icon-btn" title="Edit">✎</button>
                <button className="icon-btn" title={user.active ? 'Suspend' : 'Reactivate'} onClick={async () => { await updateUser(user.id, { active: !user.active }); setMessage('User status updated.'); }}>{user.active ? '⏸' : '▶'}</button>
              </td>
            </tr>
          ))}
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan={5}><span className="sub">No users match this search.</span></td>
            </tr>
          )}
        </tbody>
      </table>
      <Modal
        open={showUserModal}
        title="Add user"
        onClose={() => setShowUserModal(false)}
        actions={<>
          <button type="button" className="btn" onClick={() => setShowUserModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={async () => {
            if (!draft.name || !draft.email || !draft.dept) { setMessage('Please provide a full user profile.'); return }
            await createUser(draft)
            setDraft({ name: '', email: '', dept: '', role: 'Member', active: true })
            setMessage('User created successfully.')
            setShowUserModal(false)
          }}>Save user</button>
        </>}
      >
        <div className="modal-form">
          <label><span>Name</span><input autoFocus value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} /></label>
          <label><span>Email</span><input type="email" value={draft.email} onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))} /></label>
          <label><span>Department</span><input value={draft.dept} onChange={(event) => setDraft((prev) => ({ ...prev, dept: event.target.value }))} /></label>
          <label><span>Role</span><select value={draft.role} onChange={(event) => setDraft((prev) => ({ ...prev, role: event.target.value as 'Admin' | 'Member' }))}><option value="Member">Member</option><option value="Admin">Admin</option></select></label>
        </div>
      </Modal>
    </div>
  )
}
