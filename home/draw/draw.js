/* ==========================
   ELEMENTS
========================== */
const listPreview = document.getElementById("listPreview");
const groupSelect = document.getElementById("groupSelect");
const groupTable = document.getElementById("groupTable");
const slot = document.getElementById("slot");
const btnSpin = document.getElementById("btnSpin");
const btnReset = document.getElementById("btnReset");
const giftGrid = document.getElementById("giftGrid");

const reserveBox = document.getElementById("reserveBox");
const reserveInput = document.getElementById("reserveInput");
const btnReserve = document.getElementById("btnReserve");
const btnReload = document.getElementById("btnReload");

const toast = document.getElementById("toast");
const confettiCanvas = document.getElementById("confetti");
const confettiCtx = confettiCanvas.getContext("2d");

const GROUP_SIZE = 4;

/* ==========================
   TOAST
========================== */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ==========================
   LOAD DATA
========================== */
const personList = JSON.parse(localStorage.getItem("personList"));
if (!personList || !personList.length) {
  alert("⚠️ Chưa có danh sách");
  location.href = "/home/index.html";
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
  groupSelect.innerHTML += `<option value="${i}">Nhóm ${i}</option>`;
  spinPool[i] = personList.slice((i - 1) * GROUP_SIZE, i * GROUP_SIZE);
}

groupSelect.innerHTML += `<option value="reserve">🔁 Nhóm dự bị</option>`;

/* ==========================
   GROUP TABLE
========================== */
function renderCurrentGroup() {
  const value = groupSelect.value;
  groupTable.innerHTML = "";

  if (value === "reserve") {
    reserveList.forEach(p => {
      groupTable.innerHTML += `
        <tr>
          <td>Dự bị</td>
          <td>${p.label}</td>
          <td>-</td>
        </tr>
      `;
    });
    return;
  }

  const g = +value;
  spinPool[g].forEach(p => {
    groupTable.innerHTML += `
      <tr>
        <td>Nhóm ${g}</td>
        <td>${p.label}</td>
        <td>${p.avg.toFixed(2)}</td>
      </tr>
    `;
  });
}

/* ==========================
   CONFETTI
========================== */
function resizeConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeConfetti();
window.addEventListener("resize", resizeConfetti);

let confettiRunning = false;
let confettiFrameId = null;

function launchConfetti() {
  if (confettiRunning) return; // ❌ không cho chạy chồng
  confettiRunning = true;

  const pieces = [];
  const duration = 120; // số frame (~2s)
  let frame = 0;

  for (let i = 0; i < 90; i++) {
    pieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -20,
      r: Math.random() * 5 + 4,
      c: `hsl(${Math.random() * 360},80%,60%)`,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 3 + 2,
      rot: Math.random() * Math.PI,
    });
  }

  function animate() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += 0.1;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.c;
      confettiCtx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
      confettiCtx.restore();
    });

    frame++;

    if (frame < duration) {
      confettiFrameId = requestAnimationFrame(animate);
    } else {
      stopConfetti();
    }
  }

  animate();
}

function stopConfetti() {
  if (confettiFrameId) cancelAnimationFrame(confettiFrameId);
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiRunning = false;
}

/* ==========================
   GIFT LOGIC
========================== */
let opened = false;

function createGiftsFromPool(pool, label = "🎁 Chọn một hộp") {
  giftGrid.innerHTML = "";
  slot.textContent = label;
  opened = false;

  if (!pool || pool.length === 0) {
    slot.textContent = "❌ Hết người";
    return;
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  shuffled.forEach(p => {
    const card = document.createElement("div");
    card.className = "gift-card";
    card.innerHTML = `
      <div class="gift-inner">
        <div class="gift-face gift-front">🎁</div>
        <div class="gift-face gift-back">${p.label}</div>
      </div>
    `;

    card.onclick = () => {
      if (opened) return;
      opened = true;

      // 👉 LẬT HỘP TRƯỚC
      card.classList.add("open");

      // ⏱ ĐỢI animation lật (~800ms)
      setTimeout(() => {
        launchConfetti();

        slot.textContent = `🎉 Trúng: ${p.label}`;

        const idx = pool.indexOf(p);
        if (idx !== -1) pool.splice(idx, 1);

        // khóa các hộp khác SAU animation
        [...giftGrid.children].forEach(c => {
          c.onclick = null;
          if (c !== card) c.style.opacity = 0.4;
        });

        renderCurrentGroup();
      }, 800); // 👈 BẰNG THỜI GIAN flip CSS
    };


    giftGrid.appendChild(card);
  });
}

/* ==========================
   EVENTS
========================== */
groupSelect.addEventListener("change", () => {
  const value = groupSelect.value;
  giftGrid.innerHTML = "";
  slot.textContent = "Chưa mở quà";

  if (value === "reserve") {
    reserveBox.style.display = "flex";
    renderCurrentGroup();
    createGiftsFromPool(reserveList, "🎁 Mở quà dự bị");
    return;
  }

  reserveBox.style.display = "none";
  renderCurrentGroup();
  createGiftsFromPool(spinPool[+value]);
});

btnSpin.onclick = () => {
  const value = groupSelect.value;
  if (value === "reserve") {
    createGiftsFromPool(reserveList, "🎁 Mở quà dự bị");
  } else {
    createGiftsFromPool(spinPool[+value]);
  }
};

btnReset.onclick = btnSpin.onclick;

/* ==========================
   ADD RESERVE
========================== */
btnReserve.onclick = () => {
  const raw = reserveInput.value.trim();
  if (!raw) {
    showToast("⚠️ Vui lòng nhập tên dự bị");
    return;
  }

  const names = raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (!names.length) {
    showToast("⚠️ Danh sách không hợp lệ");
    return;
  }

  names.forEach(name => reserveList.push({ label: name }));
  reserveInput.value = "";

  renderCurrentGroup();
  createGiftsFromPool(reserveList, "🎁 Mở quà dự bị");
  showToast("✔ Thêm danh sách dự bị thành công");
};

btnReload.onclick = () => {
  location.reload(); // load lại page từ đầu
};


/* ==========================
   INIT
========================== */
renderCurrentGroup();
createGiftsFromPool(spinPool[1]);