const PASSWORD_HASH = "8d969eef6ecad3c29a3a629280e686cff8fab2e7f3a6f3f6c5f2b7c7c2f1b3c1";
const TARGET_URL = "https://forms.gle/cgaTb9iYfeBZNUB3A";

function openPopup() {
  const popup = document.getElementById("popup");
  const input = document.getElementById("passwordInput");
  const errorText = document.getElementById("errorText");

  popup.style.display = "flex";
  input.value = "";
  errorText.textContent = "";
  input.focus();
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

/* ===== SHA-256 HASH ===== */
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function checkPassword() {
  const inputEl = document.getElementById("passwordInput");
  const popupBox = document.querySelector(".popup-box");
  const errorText = document.getElementById("errorText");

  const inputHash = await sha256(inputEl.value);

  if (inputHash === PASSWORD_HASH) {
    window.open(TARGET_URL, "_blank");
    closePopup();
  } else {
    errorText.textContent = "❌ Mật khẩu không đúng";

    popupBox.classList.add("shake");
    setTimeout(() => popupBox.classList.remove("shake"), 350);
  }
}

/* Enter để xác nhận */
document.getElementById("passwordInput").addEventListener("keydown", e => {
  if (e.key === "Enter") checkPassword();
});

// Toggle hiện / ẩn mật khẩu
document.getElementById("togglePassword").addEventListener("click", function () {
  const input = document.getElementById("passwordInput");

  if (input.type === "password") {
    input.type = "text";
    this.textContent = "🙈";
  } else {
    input.type = "password";
    this.textContent = "👁️";
  }
});


/* Click nền để đóng */
window.addEventListener("click", e => {
  const popup = document.getElementById("popup");
  if (e.target === popup) closePopup();
});
