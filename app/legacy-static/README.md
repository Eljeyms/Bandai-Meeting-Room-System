# Bandai Namco — Meeting Room System (UI)

Tablet room display (user side) + admin console for a meeting room scheduling and
occupancy system. Front-end only for now: all data is mocked in
`src/assets/js/data.js` so the UI can later be wired to a real API and the
occupancy sensor feed.

## Folder structure

```
bandai-room-system/
├── Dockerfile              # nginx image serving the UI
├── docker-compose.yml      # one command to run everything
├── nginx.conf              # web server config
├── README.md
└── src/
    ├── index.html          # staff setup picker — one card per kiosk device
    ├── user/
    │   ├── index.html      # tablet display, locked to one room
    │   └── overview.html   # lobby display, all rooms at a glance
    ├── admin/
    │   ├── dashboard.html  # reports & dashboard (live overview)
    │   ├── schedule.html   # schedule management (book/edit/cancel)
    │   ├── rooms.html      # configuration / room management
    │   ├── users.html      # user management
    │   └── reports.html    # utilization reports + CSV export
    └── assets/
        ├── css/
        │   ├── tokens.css  # golden-ratio scales + trimmed Bandai palette
        │   ├── base.css    # shared components
        │   ├── user.css    # tablet + lobby layout
        │   └── admin.css   # console layout
        └── js/
            ├── data.js     # mock data store + helpers
            ├── user.js     # tablet logic (clock, schedule, occupancy)
            ├── overview.js # lobby "all rooms" logic
            ├── admin.js    # sidebar + all admin page logic
            └── launcher.js # renders the kiosk picker from DB.rooms
```

## Admin/tablet separation

Each physical tablet is a locked kiosk pointed at `user/index.html?room=<id>`
(one URL per room) or, for a lobby screen, `user/overview.html`. Neither page
links anywhere else — no path from a kiosk to the admin console or to another
room's display. `src/index.html` is a staff-only setup picker for configuring
those kiosks and jumping into the admin console; it isn't meant to be loaded
on a mounted tablet.

## Run it

With Docker:

```bash
docker compose up --build
```

Then open **http://localhost:8080**

Without Docker (any static server works):

```bash
cd src && python -m http.server 8080
```

## How the golden ratio (φ = 1.618) is used

- **Tablet layout** — schedule rail is 38.2% of the width, status panel is 61.8%
  (`grid-template-columns: 38.2% 61.8%`), same proportion as the reference design.
- **Type scale** — every font size is the previous step × 1.618:
  16px → 25.9px → 41.9px → 67.8px → 109.7px (the giant "Occupied").
- **Spacing scale** — 8px base multiplied by φ per step: 8, 13, 21, 34, 55, 89.
- **Details** — the dot on the divider line sits at exactly 61.8% of its length,
  dashboard columns split 61.8/38.2, form modals are ~500px (a golden width),
  and bars in the report chart are 61.8% of their column.

## Demo behaviors

- On the tablet view, **tap the big status panel** to simulate the occupancy
  sensor flipping between Occupied and Available.
- Open a specific room on the tablet with `user/index.html?room=r2` etc.
- Schedule Management blocks double bookings for the same room and time.
- Reports page exports a CSV.

## Wiring the real sensor later

Everything reads from `DB` in `data.js`. When the backend exists:

1. Replace the arrays with `fetch()` calls to your API.
2. Push sensor state (PIR / camera headcount) to the tablet over WebSocket or
   polling, and call `renderStatus()` in `user.js` when it changes.
