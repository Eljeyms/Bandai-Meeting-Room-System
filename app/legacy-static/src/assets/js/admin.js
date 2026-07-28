/* Admin console logic. Each page sets <body class="admin" data-page="...">
   and this script injects the shared sidebar + runs that page's renderer. */

const PAGE = document.body.dataset.page;

/* ---------- Shared sidebar ---------- */
function renderSidebar() {
  const links = [
    ["dashboard", "dashboard.html", ICONS.grid, "Dashboard"],
    ["schedule",  "schedule.html",  ICONS.calendar, "Schedule Management"],
    ["rooms",     "rooms.html",     ICONS.building, "Room Configuration"],
    ["users",     "users.html",     ICONS.user, "User Management"],
    ["reports",   "reports.html",   ICONS.barChart, "Reports"],
  ];
  document.getElementById("sidebar").innerHTML = `
    <div class="brand">
      <img class="chip" src="../assets/img/images-removebg.png" alt="Bandai Namco" />
      <div class="name">Meeting Room<br>Admin Console</div>
    </div>
    <nav>
      <div class="section-label">Manage</div>
      ${links.map(([key, href, ico, label]) => `
        <a href="${href}" class="${key === PAGE ? "active" : ""}">
          <span class="ico">${ico}</span>${label}
        </a>`).join("")}
      <div class="section-label">Displays</div>
      <a href="../user/index.html"><span class="ico">${ICONS.monitor}</span>Room Display (Tablet)</a>
      <a href="../user/overview.html"><span class="ico">${ICONS.building}</span>Rooms Overview (Lobby)</a>
    </nav>
    <div class="side-foot">
      Fun for All into the Future<br>
      <a href="../index.html">Back to launcher</a>
    </div>`;
}

/* ---------- Modal helpers ---------- */
function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-backdrop")) e.target.classList.remove("open");
});

/* ============================================================
   DASHBOARD
   ============================================================ */
function pageDashboard() {
  const occ = DB.rooms.filter((r) => r.status === "occupied").length;
  const stats = [
    ["Rooms occupied now", `${occ} / ${DB.rooms.length}`, "Live from sensors", "var(--bn-red)"],
    ["Meetings today", DB.meetings.length, "Across all rooms", "var(--ink-soft)"],
    ["Active users", DB.users.filter((u) => u.active).length, "Can book rooms", "var(--state-free)"],
    ["Avg utilization", "64%", "This week", "var(--ink-soft)"],
  ];
  document.getElementById("statGrid").innerHTML = stats.map(([l, v, h, a]) => `
    <div class="card stat" style="--accent:${a}">
      <div class="label">${l}</div>
      <div class="value">${v}</div>
      <div class="hint">${h}</div>
    </div>`).join("");

  document.getElementById("liveRooms").innerHTML = DB.rooms.map((r) => {
    const mt = DB.meetings.find((m) => m.roomId === r.id && m.status === "ongoing");
    const busy = r.status === "occupied";
    return `<tr>
      <td><strong>${r.name}</strong><span class="sub">${r.floor} · seats ${r.capacity}</span></td>
      <td><span class="dot ${busy ? "dot-busy" : "dot-free"}"></span>${busy ? "Occupied" : "Available"}</td>
      <td>${mt ? `${mt.title}<span class="sub">${fmt12(mt.start)} – ${fmt12(mt.end)} · ${mt.host}</span>` : "<span class='sub'>—</span>"}</td>
    </tr>`;
  }).join("");

  document.getElementById("upNext").innerHTML = DB.meetings
    .filter((m) => m.status === "upcoming").slice(0, 4)
    .map((m) => `<tr>
      <td><strong>${m.title}</strong><span class="sub">${roomById(m.roomId).name}</span></td>
      <td>${fmt12(m.start)}<span class="sub">${m.host}</span></td>
    </tr>`).join("");
}

/* ============================================================
   SCHEDULE MANAGEMENT
   ============================================================ */
function pageSchedule() {
  const tbody = document.getElementById("schedRows");
  const roomFilter = document.getElementById("roomFilter");
  roomFilter.innerHTML = `<option value="">All rooms</option>` +
    DB.rooms.map((r) => `<option value="${r.id}">${r.name}</option>`).join("");

  const roomSelect = document.getElementById("mRoom");
  roomSelect.innerHTML = DB.rooms.map((r) => `<option value="${r.id}">${r.name}</option>`).join("");

  function draw() {
    const f = roomFilter.value;
    const rows = DB.meetings.filter((m) => !f || m.roomId === f);
    tbody.innerHTML = rows.map((m) => `<tr>
      <td><strong>${m.title}</strong><span class="sub">${m.host} · ${m.attendees} attendees</span></td>
      <td>${roomById(m.roomId).name}</td>
      <td>${fmt12(m.start)} – ${fmt12(m.end)}<span class="sub">${m.date}</span></td>
      <td><span class="badge ${m.status === "ongoing" ? "badge-busy" : "badge-mute"}">${m.status}</span></td>
      <td class="row-actions">
        <button class="icon-btn" title="Edit" onclick="editMeeting('${m.id}')">${ICONS.pencil}</button>
        <button class="icon-btn" title="Cancel meeting" onclick="deleteMeeting('${m.id}')">${ICONS.x}</button>
      </td>
    </tr>`).join("") || `<tr><td colspan="5"><span class="sub">No meetings match this filter. Use “New meeting” to book one.</span></td></tr>`;
  }
  roomFilter.addEventListener("change", draw);
  draw();

  let editingId = null;
  window.editMeeting = (id) => {
    const m = DB.meetings.find((x) => x.id === id);
    editingId = id;
    mTitle.value = m.title; mRoom.value = m.roomId; mDate.value = m.date;
    mStart.value = m.start; mEnd.value = m.end; mHost.value = m.host; mAtt.value = m.attendees;
    document.getElementById("meetingModalTitle").textContent = "Edit meeting";
    openModal("meetingModal");
  };
  window.deleteMeeting = (id) => {
    DB.meetings = DB.meetings.filter((x) => x.id !== id);
    draw(); showToast("Meeting cancelled");
  };
  document.getElementById("newMeetingBtn").addEventListener("click", () => {
    editingId = null;
    ["mTitle","mDate","mStart","mEnd","mHost","mAtt"].forEach((i) => document.getElementById(i).value = "");
    document.getElementById("meetingModalTitle").textContent = "New meeting";
    openModal("meetingModal");
  });
  document.getElementById("saveMeeting").addEventListener("click", () => {
    if (!mTitle.value || !mDate.value || !mStart.value || !mEnd.value) { showToast("Fill in title, date, and times"); return; }
    const clash = DB.meetings.some((m) =>
      m.id !== editingId && m.roomId === mRoom.value && m.date === mDate.value &&
      !(mEnd.value <= m.start || mStart.value >= m.end));
    if (clash) { showToast("That room is already booked for this time"); return; }
    const data = { roomId: mRoom.value, title: mTitle.value, date: mDate.value,
      start: mStart.value, end: mEnd.value, host: mHost.value || "—",
      attendees: Number(mAtt.value) || 0, status: "upcoming" };
    if (editingId) Object.assign(DB.meetings.find((x) => x.id === editingId), data);
    else DB.meetings.push({ id: uid("m"), ...data });
    closeModal("meetingModal"); draw();
    showToast(editingId ? "Meeting updated" : "Meeting booked");
  });
}

/* ============================================================
   ROOM CONFIGURATION
   ============================================================ */
function pageRooms() {
  const tbody = document.getElementById("roomRows");
  function draw() {
    tbody.innerHTML = DB.rooms.map((r) => `<tr>
      <td><strong>${r.name}</strong><span class="sub">${r.floor}</span></td>
      <td>${r.capacity} seats</td>
      <td>${r.sensor}<span class="sub">Tablet ${r.tablet}</span></td>
      <td><span class="dot ${r.status === "occupied" ? "dot-busy" : "dot-free"}"></span>${r.status}</td>
      <td class="row-actions">
        <button class="icon-btn" title="Edit" onclick="editRoom('${r.id}')">${ICONS.pencil}</button>
        <button class="icon-btn" title="Remove room" onclick="deleteRoom('${r.id}')">${ICONS.x}</button>
      </td>
    </tr>`).join("");
  }
  draw();

  let editingId = null;
  window.editRoom = (id) => {
    const r = roomById(id); editingId = id;
    rName.value = r.name; rFloor.value = r.floor; rCap.value = r.capacity;
    rSensor.value = r.sensor; rTablet.value = r.tablet;
    document.getElementById("roomModalTitle").textContent = "Edit room";
    openModal("roomModal");
  };
  window.deleteRoom = (id) => {
    DB.rooms = DB.rooms.filter((x) => x.id !== id);
    draw(); showToast("Room removed");
  };
  document.getElementById("newRoomBtn").addEventListener("click", () => {
    editingId = null;
    ["rName","rFloor","rCap","rSensor","rTablet"].forEach((i) => document.getElementById(i).value = "");
    document.getElementById("roomModalTitle").textContent = "Add room";
    openModal("roomModal");
  });
  document.getElementById("saveRoom").addEventListener("click", () => {
    if (!rName.value) { showToast("Room name is required"); return; }
    const data = { name: rName.value, floor: rFloor.value || "—",
      capacity: Number(rCap.value) || 0, sensor: rSensor.value || "unassigned",
      tablet: rTablet.value || "unassigned" };
    if (editingId) Object.assign(roomById(editingId), data);
    else DB.rooms.push({ id: uid("r"), status: "available", ...data });
    closeModal("roomModal"); draw();
    showToast(editingId ? "Room updated" : "Room added");
  });
}

/* ============================================================
   USER MANAGEMENT
   ============================================================ */
function pageUsers() {
  const tbody = document.getElementById("userRows");
  function draw() {
    tbody.innerHTML = DB.users.map((u) => `<tr>
      <td><strong>${u.name}</strong><span class="sub">${u.email}</span></td>
      <td>${u.dept}</td>
      <td><span class="badge ${u.role === "Admin" ? "badge-busy" : "badge-mute"}">${u.role}</span></td>
      <td><span class="dot ${u.active ? "dot-free" : "dot-busy"}"></span>${u.active ? "Active" : "Suspended"}</td>
      <td class="row-actions">
        <button class="icon-btn" title="Edit" onclick="editUser('${u.id}')">${ICONS.pencil}</button>
        <button class="icon-btn" title="${u.active ? "Suspend" : "Reactivate"}" onclick="toggleUser('${u.id}')">${u.active ? ICONS.pause : ICONS.play}</button>
      </td>
    </tr>`).join("");
  }
  draw();

  let editingId = null;
  window.editUser = (id) => {
    const u = DB.users.find((x) => x.id === id); editingId = id;
    uName.value = u.name; uEmail.value = u.email; uDept.value = u.dept; uRole.value = u.role;
    document.getElementById("userModalTitle").textContent = "Edit user";
    openModal("userModal");
  };
  window.toggleUser = (id) => {
    const u = DB.users.find((x) => x.id === id);
    u.active = !u.active; draw();
    showToast(u.active ? "User reactivated" : "User suspended");
  };
  document.getElementById("newUserBtn").addEventListener("click", () => {
    editingId = null;
    ["uName","uEmail","uDept"].forEach((i) => document.getElementById(i).value = "");
    uRole.value = "Member";
    document.getElementById("userModalTitle").textContent = "Add user";
    openModal("userModal");
  });
  document.getElementById("saveUser").addEventListener("click", () => {
    if (!uName.value || !uEmail.value) { showToast("Name and email are required"); return; }
    const data = { name: uName.value, email: uEmail.value, dept: uDept.value || "—", role: uRole.value };
    if (editingId) Object.assign(DB.users.find((x) => x.id === editingId), data);
    else DB.users.push({ id: uid("u"), active: true, ...data });
    closeModal("userModal"); draw();
    showToast(editingId ? "User updated" : "User added");
  });
}

/* ============================================================
   REPORTS
   ============================================================ */
function pageReports() {
  document.getElementById("bars").innerHTML = DB.utilization.map((d) => `
    <div class="bar-col">
      <div class="bar" style="height:${d.pct}%"><span class="pct">${d.pct}%</span></div>
      <span class="lab">${d.day}</span>
    </div>`).join("");

  const byRoom = DB.rooms.map((r) => ({
    r, count: DB.meetings.filter((m) => m.roomId === r.id).length,
  })).sort((a, b) => b.count - a.count);
  document.getElementById("topRooms").innerHTML = byRoom.map(({ r, count }, i) => `<tr>
    <td><strong>${i + 1}. ${r.name}</strong><span class="sub">${r.floor}</span></td>
    <td>${count} meeting${count === 1 ? "" : "s"} today</td>
    <td><span class="dot ${r.status === "occupied" ? "dot-busy" : "dot-free"}"></span>${r.status}</td>
  </tr>`).join("");

  document.getElementById("exportBtn").addEventListener("click", () => {
    const rows = [["Room","Floor","Meetings today","Status"],
      ...byRoom.map(({ r, count }) => [r.name, r.floor, count, r.status])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "room-utilization.csv";
    a.click();
    showToast("Report exported as CSV");
  });
}

/* ---------- Boot ---------- */
renderSidebar();
({ dashboard: pageDashboard, schedule: pageSchedule, rooms: pageRooms,
   users: pageUsers, reports: pageReports }[PAGE] || (() => {}))();
