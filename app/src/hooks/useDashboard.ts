import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { getDashboard, type DashboardData } from '../lib/api'
import { meetings, rooms, users, utilization } from '../data'

const socketUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'http://127.0.0.1:4000'

export default function useDashboard(onNotification?: (message: string) => void) {
  const [data, setData] = useState<DashboardData>({ rooms, meetings, users, utilization })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnectionDelay: 1500,
    })

    const load = async () => {
      try {
        const payload = await getDashboard()
        setData(payload)
        setError(null)
        setIsLive(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to connect to live services')
        setIsLive(false)
      } finally {
        setLoading(false)
      }
    }

    load()

    socket.on('connect', () => {
      socket.emit('join-room', 'dashboard')
      setIsLive(true)
    })
    socket.on('disconnect', () => setIsLive(false))
    socket.on('connect_error', () => setIsLive(false))
    socket.on('rooms:updated', () => {
      load()
      onNotification?.('Room status changed')
    })
    socket.on('meetings:updated', () => {
      load()
      onNotification?.('Meeting schedule changed')
    })
    socket.on('users:updated', () => {
      load()
      onNotification?.('User list changed')
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return { data, loading, error, isLive }
}
