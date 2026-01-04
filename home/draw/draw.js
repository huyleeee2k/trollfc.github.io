const listPreview = document.getElementById("listPreview");
const groupSelect = document.getElementById("groupSelect");
const groupTable = document.getElementById("groupTable");
const slot = document.getElementById("slot");
const btnSpin = document.getElementById("btnSpin");
const giftGrid = document.getElementById("giftGrid");

const GROUP_SIZE = 4;

/* ==========================
   LOAD DATA
========================== */
const personList = JSON.parse(localStorage.getItem("personList"));
if (!personList || !personList.length) {
  alert("⚠️ Chưa có danh sách, quay lại trang Home");
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
      <tr><th>STT</th><th>Tên</th><th>Điểm TB</th><th>Nhóm</th></tr>
    </thead><tbody>`;
  list.forEach((p, i) => {
    html += `
    <tr>
      <td>${i + 1}</td>
      <td>${p.label}</td>
      <td>${p.avg.toFixed(2)}</td>
      <td>Nhóm ${Math.floor(i / GROUP_SIZE) + 1}</td>
    </tr>`;
  });
  html += "</tbody></table>";
  listPreview.innerHTML = html;
}

/* ==========================
   GROUP
========================== */
const totalGroups = Math.ceil(personList.length / GROUP_SIZE);
const spinPool = {};

for (let i = 1; i <= totalGroups; i++) {
  groupSelect.innerHTML += `<option value="${i}">Nhóm ${i}</option>`;
  resetGroup(i);
}

function resetGroup(g) {
  spinPool[g] = personList.slice((g - 1) * GROUP_SIZE, g * GROUP_SIZE);
}

groupSelect.addEventListener("change", () => {
  const g = +groupSelect.value;
  resetGroup(g);
  renderGroup(g);
  giftGrid.innerHTML = "";
  slot.textContent = "Chưa mở hộp";
});

/* ==========================
   GROUP TABLE
========================== */
function renderGroup(g) {
  groupTable.innerHTML = "";
  spinPool[g].forEach(p => {
    groupTable.innerHTML += `
      <tr>
        <td>Nhóm ${g}</td>
        <td>${p.label}</td>
        <td>${p.avg.toFixed(2)}</td>
      </tr>`;
  });
}

/* ==========================
   GIFT LOGIC (FLIP CARD)
========================== */
let opened = false;

function createGifts(g) {
  giftGrid.innerHTML = "";
  slot.textContent = "🎁 Chọn một hộp";
  opened = false;

  const pool = spinPool[g];
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

      card.classList.add("open");
      slot.textContent = `🎉 Trúng: ${p.label}`;

      // remove khỏi pool
      const idx = pool.findIndex(x => x.label === p.label);
      if (idx !== -1) pool.splice(idx, 1);

      // khóa các hộp khác
      [...giftGrid.children].forEach(c => {
        c.onclick = null;
        if (c !== card) c.style.opacity = 0.4;
      });

      renderGroup(g);
    };

    giftGrid.appendChild(card);
  });
}

/* ==========================
   BUTTON EVENTS
========================== */
btnSpin.onclick = () => {
  const g = +groupSelect.value;
  createGifts(g);
};

/* RESET GIFT ONLY */
const btnReset = document.getElementById("btnReset");
btnReset.onclick = () => {
  const g = +groupSelect.value;
  createGifts(g);
};

/* ==========================
   GROUP CHANGE
========================== */
groupSelect.addEventListener("change", () => {
  const g = +groupSelect.value;
  resetGroup(g);
  renderGroup(g);
  createGifts(g);
});

/* ==========================
   INIT
========================== */
renderGroup(1);
createGifts(1);

