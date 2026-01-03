const listPreview = document.getElementById("listPreview");
const groupSelect = document.getElementById("groupSelect");
const groupTable = document.getElementById("groupTable");
const slot = document.getElementById("slot");
const btnSpin = document.getElementById("btnSpin");

const GROUP_SIZE = 4;

// ==========================
// LOAD DATA
// ==========================
const personList = JSON.parse(localStorage.getItem("personList"));

if (!personList || !personList.length) {
  alert("⚠️ Chưa có danh sách, quay lại trang Home");
  window.location.href = "/home/index.html";
}

// ==========================
// PREVIEW TABLE
// ==========================
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
    const group = Math.floor(i / GROUP_SIZE) + 1;
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${p.label}</td>
        <td>${p.avg.toFixed(2)}</td>
        <td>Nhóm ${group}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  listPreview.innerHTML = html;
}

// ==========================
// GROUP SELECT
// ==========================
const totalGroups = Math.ceil(personList.length / GROUP_SIZE);

for (let i = 1; i <= totalGroups; i++) {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = `Nhóm ${i}`;
  groupSelect.appendChild(opt);
}

groupSelect.addEventListener("change", () => {
  renderGroup(+groupSelect.value);
  slot.textContent = "Chưa quay";
});

// ==========================
// GROUP TABLE
// ==========================
function renderGroup(groupNumber) {
  groupTable.innerHTML = "";

  const start = (groupNumber - 1) * GROUP_SIZE;
  const groupList = personList.slice(start, start + GROUP_SIZE);

  groupList.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Nhóm ${groupNumber}</td>
      <td>${p.label}</td>
      <td>${p.avg.toFixed(2)}</td>
    `;
    groupTable.appendChild(tr);
  });
}

// default
renderGroup(1);

// ==========================
// SIMPLE SPIN
// ==========================
btnSpin.addEventListener("click", () => {
  const groupNumber = +groupSelect.value;
  const start = (groupNumber - 1) * GROUP_SIZE;
  const groupList = personList.slice(start, start + GROUP_SIZE);

  const winner = groupList[Math.floor(Math.random() * groupList.length)];
  slot.textContent = `🎉 ${winner.label}`;
});
