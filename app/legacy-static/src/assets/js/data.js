/* ============================================================
   Mock data store (in-memory)
   Later, replace these arrays with fetch() calls to the API +
   the occupancy sensor feed. Shapes are kept API-friendly.
   ============================================================ */

const DB = {
  rooms: [
    { id: "r1", name: "Meeting Room 3A", floor: "3F", capacity: 8,  sensor: "PIR-3A-01", tablet: "TAB-3A", status: "occupied" },
    { id: "r2", name: "Meeting Room 3B", floor: "3F", capacity: 6,  sensor: "PIR-3B-01", tablet: "TAB-3B", status: "available" },
    { id: "r3", name: "Board Room 5F",   floor: "5F", capacity: 14, sensor: "PIR-5F-01", tablet: "TAB-5F", status: "available" },
    { id: "r4", name: "Huddle Pod 2C",   floor: "2F", capacity: 4,  sensor: "PIR-2C-01", tablet: "TAB-2C", status: "occupied" },
  ],

  meetings: [
    { id: "m1", roomId: "r1", title: "Product Review",  date: "2024-05-23", start: "10:00", end: "11:00", host: "A. Tanaka",   attendees: 5, status: "ongoing"  },
    { id: "m2", roomId: "r1", title: "Team Sync",       date: "2024-05-23", start: "14:00", end: "15:00", host: "M. Sato",     attendees: 7, status: "upcoming" },
    { id: "m3", roomId: "r1", title: "Project Kickoff", date: "2024-05-23", start: "16:00", end: "17:00", host: "K. Reyes",    attendees: 6, status: "upcoming" },
    { id: "m4", roomId: "r2", title: "Design Critique", date: "2024-05-23", start: "13:00", end: "14:00", host: "J. Cruz",     attendees: 4, status: "upcoming" },
    { id: "m5", roomId: "r3", title: "Exec Briefing",   date: "2024-05-23", start: "15:30", end: "16:30", host: "L. Yamamoto", attendees: 10, status: "upcoming" },
    { id: "m6", roomId: "r4", title: "Sprint Planning", date: "2024-05-23", start: "10:30", end: "11:30", host: "R. Villanueva", attendees: 4, status: "ongoing" },
  ],

  users: [
    { id: "u1", name: "A. Tanaka",      email: "a.tanaka@bandainamco.com",  role: "Admin",     dept: "Product",     active: true  },
    { id: "u2", name: "M. Sato",        email: "m.sato@bandainamco.com",    role: "Scheduler", dept: "Engineering", active: true  },
    { id: "u3", name: "K. Reyes",       email: "k.reyes@bandainamco.com",   role: "Member",    dept: "Design",      active: true  },
    { id: "u4", name: "J. Cruz",        email: "j.cruz@bandainamco.com",    role: "Member",    dept: "Design",      active: false },
    { id: "u5", name: "R. Villanueva",  email: "r.villanueva@bandainamco.com", role: "Scheduler", dept: "QA",       active: true  },
  ],

  // Utilization % per weekday, for the reports bar chart
  utilization: [
    { day: "Mon", pct: 72 }, { day: "Tue", pct: 85 }, { day: "Wed", pct: 61 },
    { day: "Thu", pct: 90 }, { day: "Fri", pct: 54 }, { day: "Sat", pct: 18 }, { day: "Sun", pct: 6 },
  ],
};

/* ---- Small helpers ---- */
const fmt12 = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
};

const roomById = (id) => DB.rooms.find((r) => r.id === id);
const uid = (p) => p + Math.random().toString(36).slice(2, 7);

/* ---- Shared icon set (line-style SVGs, replaces emoji) ---- */
const ICONS = {
  monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="1.8" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="10" cy="18" r="1.8" fill="currentColor" stroke="none"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 8h1M12 8h1M16 8h1M8 12h1M12 12h1M16 12h1M8 16h1M12 16h1M16 16h1M10 21v-4h4v4"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c1.4-3.8 4.4-5.5 7.5-5.5s6.1 1.7 7.5 5.5"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M2.7 20c1.2-3.4 3.7-5 6.3-5s5.1 1.6 6.3 5"/><circle cx="17" cy="8.5" r="2.4"/><path d="M15.2 9.2c1.9.3 3.6 1.7 4.5 4.3"/></svg>',
  barChart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M12 20V4M20 20v-7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4.5 4.5L19 8"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4.2L15.6 5.2a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19l-4.2 1z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 19h16"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5v14M16 5v14"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 4.5v15l13-7.5z"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  room: '<svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="12" width="28" height="8" rx="2"/><path d="M6 27v-4a2 2 0 0 1 2-2h2M40 27v-4a2 2 0 0 0-2-2h-2M13 16v11M35 16v11M17 8l3 4M31 8l-3 4"/></svg>',
};

function showToast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2400);
}
