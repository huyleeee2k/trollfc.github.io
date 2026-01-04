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
   GIFT LOGIC
========================== */
btnSpin.onclick = () => {
  const g = +groupSelect.value;
  const pool = spinPool[g];

  giftGrid.innerHTML = "";
  slot.textContent = "🎁 Chọn một hộp";

  if (pool.length === 0) {
    slot.textContent = "❌ Hết người";
    return;
  }

  if (pool.length === 1) {
    slot.textContent = `🏆 ${pool[0].label}`;
    pool.splice(0, 1);
    renderGroup(g);
    return;
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  shuffled.forEach((p, index) => {
    const box = document.createElement("div");
    box.className = "gift";
    box.textContent = "🎁";

    box.onclick = () => {
      if (box.classList.contains("opened")) return;

      box.classList.add("opened");
      box.textContent = p.label;
      slot.textContent = `🎉 Trúng: ${p.label}`;

      // remove khỏi pool
      const realIndex = pool.findIndex(x => x.label === p.label);
      pool.splice(realIndex, 1);

      // disable các hộp khác
      [...giftGrid.children].forEach(b => {
        b.onclick = null;
        if (!b.classList.contains("opened")) b.style.opacity = .4;
      });

      renderGroup(g);
    };

    giftGrid.appendChild(box);
  });
};

/* ==========================
   INIT
========================== */
renderGroup(1);
