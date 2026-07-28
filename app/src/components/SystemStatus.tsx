import { motion } from 'framer-motion'
import { HiOutlineWifi, HiOutlineDatabase, HiOutlineServer, HiOutlineChip, HiOutlineCamera } from 'react-icons/hi'

type SystemStatusProps = {
  cameraOnline: boolean
  aiRunning: boolean
  backendConnected: boolean
  databaseConnected: boolean
  socketConnected: boolean
}

function HiOutlineCameraSymbol() {
  return <HiOutlineCamera className="h-5 w-5" />
}

export default function SystemStatus({ cameraOnline, aiRunning, backendConnected, databaseConnected, socketConnected }: SystemStatusProps) {
  const statuses = [
    { label: 'Camera', value: cameraOnline ? 'Online' : 'Offline', icon: HiOutlineCameraSymbol },
    { label: 'AI Model', value: aiRunning ? 'Running' : 'Stopped', icon: HiOutlineChip },
    { label: 'Backend', value: backendConnected ? 'Connected' : 'Disconnected', icon: HiOutlineServer },
    { label: 'Database', value: databaseConnected ? 'Connected' : 'Disconnected', icon: HiOutlineDatabase },
    { label: 'Socket.IO', value: socketConnected ? 'Connected' : 'Disconnected', icon: HiOutlineWifi },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_32px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">System Status</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Connection health</h2>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {statuses.map((tile) => (
          <div key={tile.label} className="flex items-center gap-4 rounded-[28px] bg-slate-50 p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white text-[#16A34A] shadow-sm">
              <tile.icon />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{tile.label}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{tile.value}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
