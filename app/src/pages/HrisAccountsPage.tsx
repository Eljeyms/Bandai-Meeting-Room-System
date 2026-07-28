import { useMemo, useState } from 'react'
import { HiOutlineArrowPath, HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineLink, HiOutlineUserGroup } from 'react-icons/hi2'
import type { DashboardData } from '../lib/api'

export default function HrisAccountsPage({ data }: { data: DashboardData }) {
  const [message, setMessage] = useState('')
  const accounts = useMemo(() => data.users.map((user, index) => ({
    ...user,
    employeeId: `BN-${String(1001 + index).padStart(5, '0')}`,
    syncStatus: user.active ? 'Synced' : 'Review',
  })), [data.users])

  return (
    <div className="hris-page">
      <section className="card hris-connection">
        <div className="hris-connection-icon"><HiOutlineLink /></div>
        <div>
          <p className="eyebrow">Account source</p>
          <h2>HRIS Account Connection</h2>
          <p>Employee records and room-access roles are ready to map to your HRIS provider.</p>
        </div>
        <div className="hris-connection-state">
          <span><HiOutlineExclamationTriangle /> Provider not configured</span>
          <button type="button" className="btn btn-primary" onClick={() => setMessage('Select an HRIS provider and add its API credentials to enable live synchronization.')}>
            <HiOutlineArrowPath /> Sync accounts
          </button>
        </div>
      </section>

      {message && <div className="form-message" role="status">{message}</div>}

      <section className="card block">
        <div className="block-head">
          <div><p className="eyebrow">Imported directory</p><h2>HRIS Accounts</h2></div>
          <span className="badge badge-mute"><HiOutlineUserGroup /> {accounts.length} accounts</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Employee</th><th>Employee ID</th><th>Department</th><th>Room role</th><th>Sync</th></tr></thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td><strong>{account.name}</strong><span className="sub">{account.email}</span></td>
                  <td>{account.employeeId}</td>
                  <td>{account.dept}</td>
                  <td><span className={`badge ${account.role === 'Admin' ? 'badge-busy' : 'badge-mute'}`}>{account.role}</span></td>
                  <td><span className={`hris-sync ${account.syncStatus === 'Synced' ? 'synced' : ''}`}><HiOutlineCheckCircle /> {account.syncStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
