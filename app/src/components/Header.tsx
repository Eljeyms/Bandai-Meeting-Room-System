import { motion } from 'framer-motion'
import { HiOutlineCalendarDays, HiOutlineClock } from 'react-icons/hi2'

type HeaderProps = {
  roomName: string
  subtitle: string
  dateLabel: string
  timeLabel: string
}

export default function Header({ roomName, subtitle, dateLabel, timeLabel }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="flex flex-col gap-6 rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_32px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex flex-col gap-3 min-w-0 lg:max-w-xl">
        <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-slate-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-slate-700 shadow-sm">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#E60012] shadow-sm shadow-[#E60012]/20" />
          Bandai Namco
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-4xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-5xl">{roomName}</h1>
          <p className="mt-2 text-lg text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/90 px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <HiOutlineCalendarDays className="h-5 w-5" />
            <span className="text-sm uppercase tracking-[0.12em]">Date</span>
          </div>
          <p className="mt-3 text-xl font-semibold text-slate-900">{dateLabel}</p>
        </div>
        <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/90 px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <HiOutlineClock className="h-5 w-5" />
            <span className="text-sm uppercase tracking-[0.12em]">Live Clock</span>
          </div>
          <p className="mt-3 text-xl font-semibold text-slate-900">{timeLabel}</p>
        </div>
      </div>
    </motion.header>
  )
}
