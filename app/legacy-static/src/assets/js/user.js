/* Tablet display logic for one room (defaults to r1 / Meeting Room 3A).
   Occupancy comes from DB.rooms[].status — in production this is the
   sensor feed (PIR / camera / BLE headcount) pushed over WebSocket. */

const ROOM_ID = new URLSearchParams(location.search).get("room") || "r1";
const room = roomById(ROOM_ID);

const stage = document.getElementById("stage");

function renderHeader() {
  document.getElementById("roomName").textContent = room.name;
  document.title = `${room.name} · Bandai Namco`;
}

function renderClock() {
  const now = new Date();
  document.getElementById("clockDate").textContent = now.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  let h = now.getHours(), m = String(now.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 === 0 ? 12 : h % 12;
  document.getElementById("clockTime").innerHTML = `${h}:${m} <span>${ap}</span>`;
}

function renderSchedule() {
  const list = document.getElementById("schedList");
  const todays = DB.meetings.filter((mt) => mt.roomId === ROOM_ID);
  list.innerHTML = todays.map((mt) => `
    <div class="sched-item">
      <div class="ico">${ICONS.calendar}</div>
      <div class="meta">
        <strong>${mt.title}</strong>
        <span>${fmt12(mt.start)} – ${fmt12(mt.end)}</span>
      </div>
      <div class="chev">${ICONS.chevronRight}</div>
    </div>`).join("");

  const ongoing = todays.find((mt) => mt.status === "ongoing");
  const panel = document.getElementById("ongoingPanel");
  if (ongoing) {
    panel.style.display = "";
    document.getElementById("ongoingBody").innerHTML = `
      <div class="sched-item" style="--accent:var(--bn-red)">
        <div class="ico">${ICONS.calendar}</div>
        <div class="meta">
          <strong>${ongoing.title}</strong>
          <span>${fmt12(ongoing.start)} – ${fmt12(ongoing.end)}</span>
        </div>
      </div>
      <p class="host-row">Host: ${ongoing.host}<br>Attendees: ${ongoing.attendees}</p>`;
  } else {
    panel.style.display = "none";
  }
}

function renderStatus() {
  const busy = room.status === "occupied";
  stage.classList.toggle("busy", busy);
  stage.classList.toggle("free", !busy);
  document.getElementById("statusWord").textContent = busy ? "Occupied" : "Available";
  document.getElementById("statusIcon").innerHTML = busy ? ICONS.users : ICONS.check;
  document.getElementById("statusSub").textContent = busy
    ? "This room is currently in use"
    : "This room is free — walk in or book it";
}

/* Demo: tap the big status panel to simulate the sensor flipping state */
stage.addEventListener("click", () => {
  room.status = room.status === "occupied" ? "available" : "occupied";
  renderStatus();
});

renderHeader();
renderClock();
renderSchedule();
renderStatus();
setInterval(renderClock, 1000);
