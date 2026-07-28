/* Setup launcher — lists one kiosk card per room straight from DB.rooms,
   so adding/removing a room here automatically updates the picker. */

const roomCard = (r) => `
  <a class="tablet-card" href="user/index.html?room=${r.id}">
    <div class="ico">${ICONS.monitor}</div>
    <strong>${r.name}</strong>
    <span>${r.floor} · Tablet ${r.tablet}</span>
  </a>`;

const overviewCard = () => `
  <a class="tablet-card" href="user/overview.html">
    <div class="ico">${ICONS.grid}</div>
    <strong>Rooms Overview</strong>
    <span>Lobby display of every room</span>
  </a>`;

document.getElementById("tabletGrid").innerHTML =
  DB.rooms.map(roomCard).join("") + overviewCard();
