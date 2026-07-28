import { motion } from 'framer-motion'
import { HiOutlineCamera } from 'react-icons/hi'

type LiveCameraCardProps = {
  cameraOnline: boolean
  aiRunning: boolean
  lastDetection: string
}

export default function LiveCameraCard({ cameraOnline, aiRunning, lastDetection }: LiveCameraCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_32px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Live Camera</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Video Placeholder</h2>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-500 shadow-sm">
          <HiOutlineCamera className="h-7 w-7" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[28px] bg-slate-50 p-5 text-slate-700 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Camera Status</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{cameraOnline ? '🟢 Online' : '🔴 Offline'}</p>
        </div>
        <div className="rounded-[28px] bg-slate-50 p-5 text-slate-700 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">AI Detection</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{aiRunning ? '🟢 Running' : '🔴 Paused'}</p>
        </div>
        <div className="rounded-[28px] bg-slate-50 p-5 text-slate-700 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Last Detection</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{lastDetection}</p>
        </div>
      </div>
    </motion.section>
  )
}
