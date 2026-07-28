/* Rooms Overview — lobby display of every room's status at a glance.
   Distinct from the single-room tablet (user/index.html) and the admin
   console: read-only, no actions, meant for a shared screen near the lobby. */

function renderOverview() {
  document.getElementById("overviewGrid").innerHTML = DB.rooms.map((r) => {
    const busy = r.status === "occupied";
    const today = DB.meetings.filter((m) => m.roomId === r.id);
    return `
      <div class="card room-card">
        <div class="room-thumb">${ICONS.room}</div>
        <div class="room-card-head">
          <h2>${r.name}</h2>
          <span class="badge ${busy ? "badge-busy" : "badge-free"}">${busy ? "Occupied" : "Vacant"}</span>
        </div>
        <p class="room-cap">Capacity: ${r.capacity}</p>
        <div class="sched-list">
          ${today.length ? today.map((m) => `
            <div class="sched-item">
              <div class="meta">
                <strong>${fmt12(m.start)} - ${fmt12(m.end)}</strong>
                <span>${m.title}</span>
              </div>
              <div class="chev">${ICONS.chevronRight}</div>
            </div>`).join("") : `<p class="room-empty">No meetings scheduled</p>`}
        </div>
      </div>`;
  }).join("");
}

renderOverview();
