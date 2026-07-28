import { motion } from 'framer-motion'
import { HiOutlineCheckCircle } from 'react-icons/hi'

type StatusCardProps = {
  status: 'available' | 'occupied'
  peopleCount: number
  capacity: number
  nextMeeting: {
    title: string
    start: string
    end: string
  }
  endsAt: string
}

export default function StatusCard({ status, peopleCount, capacity, nextMeeting, endsAt }: StatusCardProps) {
  const isAvailable = status === 'available'
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={`rounded-[32px] border p-8 shadow-[0_32px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl ${isAvailable ? 'border-slate-200 bg-white/90' : 'border-[#DC2626]/20 bg-[#fee2e2]/90'}`}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${isAvailable ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {isAvailable ? 'Available' : 'Occupied'}
          </p>
          <h2 className={`mt-3 text-5xl font-semibold tracking-[-0.05em] ${isAvailable ? 'text-[#16A34A]' : 'text-[#B91C1C]'}`}>
            {isAvailable ? '🟢 AVAILABLE' : '🔴 OCCUPIED'}
          </h2>
          <p className={`mt-3 text-lg ${isAvailable ? 'text-slate-600' : 'text-slate-700'}`}>
            {isAvailable ? 'This room is free' : 'Meeting in progress'}
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
          <HiOutlineCheckCircle className={`h-8 w-8 ${isAvailable ? 'text-[#16A34A]' : 'text-[#DC2626]'}`} />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">People Detected</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{peopleCount} / {capacity}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Room status</p>
          <p className="mt-3 text-xl font-semibold text-slate-900">{isAvailable ? 'AI Detection Active' : 'Room Locked'}</p>
          <p className="mt-2 text-sm text-slate-500">{isAvailable ? 'Walk-ins allowed' : 'Please wait until the meeting ends'}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Next Meeting</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{nextMeeting.title}</p>
          <p className="mt-2 text-sm text-slate-500">{nextMeeting.start} - {nextMeeting.end}</p>
        </div>
        {!isAvailable && (
          <div className="rounded-[28px] bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Meeting ends</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{endsAt}</p>
          </div>
        )}
      </div>
    </motion.section>
  )
}
