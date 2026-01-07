/* ==========================
   ELEMENTS
========================== */
const listPreview = document.getElementById("listPreview");
const groupSelect = document.getElementById("groupSelect");
const groupTable = document.getElementById("groupTable");
const slot = document.getElementById("slot");
const btnSpin = document.getElementById("btnSpin");
const btnReset = document.getElementById("btnReset");
const btnReload = document.getElementById("btnReload");

const reserveBox = document.getElementById("reserveBox");
const reserveInput = document.getElementById("reserveInput");
const btnReserve = document.getElementById("btnReserve");

const wheel = document.getElementById("wheel");
const ctx = wheel.getContext("2d");

const GROUP_SIZE = 4;

/* ==========================
   LOAD DATA
========================== */
const personList = JSON.parse(localStorage.getItem("personList"));
if (!personList || !personList.length) {
  alert("⚠️ Chưa có danh sách");
  location.href = "/home";
}

/* ==========================
   PREVIEW
========================== */
renderPreview(personList);

function renderPreview(list) {
  let html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Tên</th>
          <th>Điểm TB</th>
          <th>Nhóm</th>
        </tr>
      </thead>
      <tbody>
  `;
  list.forEach((p, i) => {
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${p.label}</td>
        <td>${p.avg.toFixed(2)}</td>
        <td>Nhóm ${Math.floor(i / GROUP_SIZE) + 1}</td>
      </tr>
    `;
  });
  html += "</tbody></table>";
  listPreview.innerHTML = html;
}

/* ==========================
   GROUP DATA
========================== */
const totalGroups = Math.ceil(personList.length / GROUP_SIZE);
const spinPool = {};
const reserveList = [];

for (let i = 1; i <= totalGroups; i++) {
  spinPool[i] = personList.slice((i - 1) * GROUP_SIZE, i * GROUP_SIZE);
  groupSelect.innerHTML += `<option value="${i}">Nhóm ${i}</option>`;
}
groupSelect.innerHTML += `<option value="reserve">🔁 Nhóm dự bị</option>`;

/* ==========================
   TABLE
========================== */
function renderCurrentGroup() {
  const value = groupSelect.value;
  groupTable.innerHTML = "";

  const renderRow = (group, name, avg, onDelete) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${group}</td>
      <td>${name}</td>
      <td>${avg ?? "-"}</td>
      <td><button class="btn-delete">−</button></td>
    `;
    tr.querySelector("button").onclick = onDelete;
    groupTable.appendChild(tr);
  };

  if (value === "reserve") {
    reserveList.forEach((p, i) => {
      renderRow("Dự bị", p.label, "-", () => {
        reserveList.splice(i, 1);
        renderCurrentGroup();
        drawWheel(reserveList);
      });
    });
    return;
  }

  const g = +value;
  spinPool[g].forEach((p, i) => {
    renderRow(`Nhóm ${g}`, p.label, p.avg.toFixed(2), () => {
      spinPool[g].splice(i, 1);
      renderCurrentGroup();
      drawWheel(spinPool[g]);
    });
  });
}

/* ==========================
   WHEEL DRAW
========================== */
const SIZE = wheel.width;
const R = SIZE / 2;
let currentRotation = 0;
let spinning = false;

/* ✅ NEW: pending winner */
let pendingIndex = null;
let pendingPool = null;

function drawWheel(pool) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  if (!pool.length) return;

  const slice = (Math.PI * 2) / pool.length;

  ctx.save();
  ctx.translate(R, R);
  ctx.rotate(currentRotation);
  ctx.translate(-R, -R);

  pool.forEach((p, i) => {
    const start = -Math.PI / 2 + i * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(R, R);
    ctx.arc(R, R, R - 8, start, end);
    ctx.fillStyle = `hsl(${i * 360 / pool.length},75%,55%)`;
    ctx.fill();

    ctx.save();
    ctx.translate(R, R);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px system-ui";
    ctx.fillText(p.label, R - 20, 6);
    ctx.restore();
  });

  ctx.restore();
}

/* ==========================
   SPIN LOGIC
========================== */
function spinWheel(pool) {
  if (!pool.length || spinning) return;
  spinning = true;

  const slice = (Math.PI * 2) / pool.length;
  const rounds = 5 + Math.random() * 5;
  const extra = Math.random() * Math.PI * 2;

  const targetRotation =
    currentRotation +
    rounds * Math.PI * 2 +
    extra;

  const duration = 5000 + Math.random() * 5000;
  const startRotation = currentRotation;
  const startTime = performance.now();

  function animate(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);

    currentRotation =
      startRotation +
      (targetRotation - startRotation) * ease;

    drawWheel(pool);

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      const angle =
        (Math.PI * 2 -
          ((currentRotation + Math.PI / 2) % (Math.PI * 2))) %
        (Math.PI * 2);

      const index = Math.floor(angle / slice);
      const winner = pool[index];

      /* ✅ CHỈ LƯU – KHÔNG XÓA */
      pendingIndex = index;
      pendingPool = pool;

      slot.textContent = `🎉 Trúng: ${winner.label} (nhấn SPIN để xác nhận)`;
      slot.classList.add("win");

      spinning = false;
    }
  }

  requestAnimationFrame(animate);
}

/* ==========================
   EVENTS
========================== */
btnSpin.onclick = () => {
  const pool =
    groupSelect.value === "reserve"
      ? reserveList
      : spinPool[+groupSelect.value];

  /* ✅ Nếu có pending → xóa trước */
  if (pendingIndex !== null) {
    pendingPool.splice(pendingIndex, 1);
    pendingIndex = null;
    pendingPool = null;

    slot.textContent = "Chưa quay";
    slot.classList.remove("win");

    renderCurrentGroup();
    drawWheel(pool);
    return;
  }

  spinWheel(pool);
};

btnReset.onclick = btnSpin.onclick;

groupSelect.addEventListener("change", () => {
  const pool =
    groupSelect.value === "reserve"
      ? reserveList
      : spinPool[+groupSelect.value];

  reserveBox.style.display =
    groupSelect.value === "reserve" ? "flex" : "none";

  pendingIndex = null;
  slot.textContent = "Chưa quay";
  drawWheel(pool);
  renderCurrentGroup();
});

btnReserve.onclick = () => {
  const raw = reserveInput.value.trim();
  if (!raw) return;

  raw.split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .forEach(name => reserveList.push({ label: name }));

  reserveInput.value = "";
  renderCurrentGroup();
  drawWheel(reserveList);
};

btnReload.onclick = () => location.reload();

/* ==========================
   INIT
========================== */
renderCurrentGroup();
drawWheel(spinPool[1]);
