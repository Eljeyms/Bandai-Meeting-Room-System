import { useEffect } from 'react'

export default function PublicSchedulePage() {
  useEffect(() => {
    if (window.location.pathname !== '/room-calendar.html') {
      window.location.href = '/room-calendar.html'
    }
  }, [])

  return null
}
