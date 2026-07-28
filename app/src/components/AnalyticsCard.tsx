import { motion } from 'framer-motion'
import { HiOutlineChartBar } from 'react-icons/hi'

type AnalyticsCardProps = {
  capacity: number
  peopleCount: number
  occupancyRate: number
  motionDetected: boolean
  status: 'Available' | 'Occupied'
}

export default function AnalyticsCard({ capacity, peopleCount, occupancyRate, motionDetected, status }: AnalyticsCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_32px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Room Analytics</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Live metrics</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
          <HiOutlineChartBar className="h-5 w-5" />
          {status}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[28px] bg-slate-50 p-5 text-slate-700 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Room Capacity</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{capacity}</p>
        </div>
        <div className="rounded-[28px] bg-slate-50 p-5 text-slate-700 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current Occupancy</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{peopleCount}</p>
        </div>
        <div className="rounded-[28px] bg-slate-50 p-5 text-slate-700 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Occupancy Rate</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{occupancyRate}%</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[28px] bg-slate-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Motion</p>
          <p className="mt-3 text-xl font-semibold text-slate-900">{motionDetected ? 'Detected' : 'None'}</p>
        </div>
        <div className="rounded-[28px] bg-slate-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
          <p className="mt-3 text-xl font-semibold text-slate-900">{status}</p>
        </div>
      </div>
    </motion.section>
  )
}
