import { motion } from 'framer-motion'

type Meeting = {
  title: string
  organizer: string
  start: string
  end: string
  duration: string
}

type ScheduleCardProps = {
  currentMeeting?: Meeting
  upcomingMeetings: Meeting[]
}

export default function ScheduleCard({ currentMeeting, upcomingMeetings }: ScheduleCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_32px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Today's Schedule</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Current meeting & upcoming</h2>
        </div>
        <button className="rounded-full bg-[#E60012] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#E60012]/20 transition hover:bg-[#c60011]">
          View All
        </button>
      </div>

      <div className="mt-8 space-y-6">
        {currentMeeting ? (
          <div className="rounded-[28px] border border-[#16A34A]/15 bg-[#ECFDF5] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#16A34A]">Current Meeting</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{currentMeeting.title}</p>
              </div>
              <p className="rounded-full bg-[#DCFCE7] px-3 py-1 text-sm font-semibold text-[#166534]">{currentMeeting.start} — {currentMeeting.end}</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Organizer</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{currentMeeting.organizer}</p>
              </div>
              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Duration</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{currentMeeting.duration}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-slate-200/80 bg-slate-50 p-8 text-center text-xl font-semibold text-slate-700">
            No meetings scheduled today
          </div>
        )}

        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Upcoming meetings</p>
          <div className="mt-6 space-y-4">
            {upcomingMeetings.map((meeting, index) => (
              <div key={index} className="rounded-[24px] border border-slate-200/80 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-slate-900">{meeting.title}</p>
                  <span className="text-sm font-semibold text-slate-600">{meeting.start} — {meeting.end}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span>{meeting.organizer}</span>
                  <span>{meeting.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
