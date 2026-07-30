import { useMemo, useState } from 'react'
import Modal from '../components/Modal'
import { createRoom, deleteRoom, updateRoom, type DashboardData } from '../lib/api'

export default function RoomsPage({ data }: { data: DashboardData }) {
  const { rooms } = data
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [draft, setDraft] = useState({ name: '', floor: '', capacity: 6, status: 'available' as 'available' | 'occupied', sensor: 'AiSense X', tablet: 'Kiosk' })
  const [message, setMessage] = useState('')
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<DashboardData['rooms'][number] | null>(null)

  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => !selectedStatus || room.status === selectedStatus)
      .sort((a, b) => {
        if (sortBy === 'capacity') return a.capacity - b.capacity
        if (sortBy === 'status') return a.status.localeCompare(b.status)
        return a.name.localeCompare(b.name)
      })
  }, [rooms, selectedStatus, sortBy])

  return (
    <div className="card block">
      <div className="block-head">
        <h2>Room Configuration</h2>
        <button className="btn btn-primary" onClick={() => setShowRoomModal(true)}>Add room</button>
      </div>
      {message ? <div className="badge badge-free" style={{ marginBottom: '1rem' }}>{message}</div> : null}
      <div className="filter-row">
        <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
        </select>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="name">Sort by room</option>
          <option value="capacity">Sort by capacity</option>
          <option value="status">Sort by status</option>
        </select>
        <div className="badge badge-free">{filteredRooms.length} rooms</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Room</th>
            <th>Capacity</th>
            <th>Sensor</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredRooms.map((room) => (
            <tr key={room.id}>
              <td><strong>{room.name}</strong><span className="sub">{room.floor}</span></td>
              <td>{room.capacity} seats</td>
              <td>{room.sensor}<span className="sub">Tablet {room.tablet}</span></td>
              <td><span className={`dot ${room.status === 'occupied' ? 'dot-busy' : 'dot-free'}`}></span>{room.status}</td>
              <td className="row-actions">
                <button className="icon-btn" title="Edit" onClick={async () => { await updateRoom(room.id, { status: room.status === 'occupied' ? 'available' : 'occupied' }); setMessage('Room status updated.'); }}>✎</button>
                <button className="icon-btn" title="Remove" onClick={() => setRoomToDelete(room)}>✕</button>
              </td>
            </tr>
          ))}
          {filteredRooms.length === 0 && (
            <tr>
              <td colSpan={5}><span className="sub">No rooms match this filter.</span></td>
            </tr>
          )}
        </tbody>
      </table>
      <Modal
        open={showRoomModal}
        title="Add room"
        onClose={() => setShowRoomModal(false)}
        actions={<>
          <button type="button" className="btn" onClick={() => setShowRoomModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={async () => {
            if (!draft.name || !draft.floor) { setMessage('Please provide a room name and floor.'); return }
            await createRoom(draft)
            setDraft({ name: '', floor: '', capacity: 6, status: 'available', sensor: 'AiSense X', tablet: 'Kiosk' })
            setMessage('Room created successfully.')
            setShowRoomModal(false)
          }}>Save room</button>
        </>}
      >
        <div className="modal-form">
          <label><span>Room name</span><input autoFocus value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} /></label>
          <label><span>Floor</span><input value={draft.floor} onChange={(event) => setDraft((prev) => ({ ...prev, floor: event.target.value }))} /></label>
          <label><span>Capacity</span><input type="number" min="1" value={draft.capacity} onChange={(event) => setDraft((prev) => ({ ...prev, capacity: Number(event.target.value) }))} /></label>
          <label><span>Status</span><select value={draft.status} onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value as 'available' | 'occupied' }))}><option value="available">Available</option><option value="occupied">Occupied</option></select></label>
        </div>
      </Modal>
      <Modal
        open={Boolean(roomToDelete)}
        title="Remove room?"
        size="small"
        onClose={() => setRoomToDelete(null)}
        actions={<>
          <button type="button" className="btn" onClick={() => setRoomToDelete(null)}>Keep room</button>
          <button className="btn btn-danger" onClick={async () => {
            if (!roomToDelete) return
            await deleteRoom(roomToDelete.id)
            setMessage('Room removed.')
            setRoomToDelete(null)
          }}>Remove room</button>
        </>}
      >
        <p>This will permanently remove <strong>{roomToDelete?.name}</strong> from the room list.</p>
      </Modal>
    </div>
  )
}
