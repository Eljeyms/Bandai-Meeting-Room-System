import { motion } from 'framer-motion'
import { HiOutlineCheckCircle } from 'react-icons/hi'

type FooterProps = {
  liveUpdated: string
}

export default function Footer({ liveUpdated }: FooterProps) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_32px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E60012] text-white shadow-sm">
            <span className="text-sm font-bold uppercase">B</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">Bandai Namco</p>
            <p className="text-sm text-slate-500">AI Detection Active</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm">
            <p className="font-semibold text-slate-900">Last Updated</p>
            <p className="mt-1">{liveUpdated}</p>
          </div>
          <div className="rounded-[24px] bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm">
            <p className="font-semibold text-slate-900">Connection</p>
            <p className="mt-1 inline-flex items-center gap-2 text-[#16A34A]">
              <HiOutlineCheckCircle className="h-5 w-5" /> Online
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
