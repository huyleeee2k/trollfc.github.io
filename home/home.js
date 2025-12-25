const input = document.getElementById("sheetInput");
const preview = document.getElementById("preview");
const btnLoad = document.getElementById("btnLoad");
const btnReset = document.getElementById("btnReset");

/* ==========================
   UTILS
========================== */
function extractSheetId(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/* ===== FORMAT DATE (FIX CHỈ HIỂN THỊ 1 CỘT) ===== */
function formatGvizDate(value) {
  // Case 1: Date object
  if (value instanceof Date) {
    return value.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  // Case 2: "Date(yyyy,mm,dd,hh,mm,ss)"
  if (typeof value === "string") {
    const match = value.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
    if (match) {
      const [, y, m, d, h, min, s] = match.map(Number);
      const date = new Date(y, m, d, h, min, s);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    }
  }

  return value ?? "";
}

/* ==========================
   LOAD DATA
========================== */
async function loadSheetData() {
  const url = input.value.trim();
  const sheetId = extractSheetId(url);

  if (!sheetId) {
    alert("❌ Link Google Sheets không hợp lệ");
    return;
  }

  preview.classList.remove("empty");
  preview.innerHTML = "⏳ Đang tải dữ liệu...";

  const apiUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

  try {
    const res = await fetch(apiUrl);
    const text = await res.text();

    const json = JSON.parse(text.substring(47, text.length - 2));
    const columns = json.table.cols.map(c => c.label || "");
    const rows = json.table.rows;

    renderTable(columns, rows);
  } catch (err) {
    preview.innerHTML = "❌ Không thể đọc dữ liệu từ Google Sheets";
    console.error(err);
  }
}

/* ==========================
   RENDER TABLE (HOÁN ĐỔI + FIX DATE)
========================== */
function renderTable(columns, rows) {
  if (!rows.length) {
    preview.innerHTML = "⚠ Sheet không có dữ liệu";
    return;
  }

  const rowCount = rows.length;
  const colCount = columns.length;

  let html = `<table class="data-table"><thead><tr>`;

  // 🔹 Ô trống góc trên trái
  html += `<th></th>`;

  // 🔹 HEADER: lấy cột thứ 2 (index = 1) làm tiêu đề
  for (let r = 0; r < rowCount; r++) {
    const cell = rows[r].c[1];
    html += `<th>${cell ? cell.v : ""}</th>`;
  }

  html += `</tr></thead><tbody>`;

  // 🔹 BODY: bắt đầu từ cột dữ liệu thật (index = 2)
  for (let c = 2; c < colCount; c++) {
    html += `<tr>`;

    // 👉 Tên hàng (header gốc của Sheet)
    html += `<td class="row-header">${columns[c] || ""}</td>`;

    for (let r = 0; r < rowCount; r++) {
      const cell = rows[r].c[c];
      html += `<td>${cell ? cell.v : ""}</td>`;
    }

    html += `</tr>`;
  }

  html += `</tbody></table>`;
  preview.innerHTML = html;
}



/* ==========================
   RESET
========================== */
function resetData() {
  input.value = "";
  preview.classList.add("empty");
  preview.innerHTML = `
    <p>
      Chưa có dữ liệu<br>
      Hãy nhập link Google Sheets và bấm “Nhập dữ liệu”
    </p>
  `;
}

/* ==========================
   EVENTS
========================== */
btnLoad.addEventListener("click", loadSheetData);
btnReset.addEventListener("click", resetData);
