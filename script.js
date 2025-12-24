const PASSWORD_HASH =
  "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";

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

  const inputHash = await sha256(inputEl.value.trim());

  if (inputHash === PASSWORD_HASH) {
    window.open(TARGET_URL, "_blank");
    closePopup();
  } else {
    errorText.textContent = "❌ Mật khẩu không đúng";
    popupBox.classList.add("shake");
    setTimeout(() => popupBox.classList.remove("shake"), 350);
  }
}

document.getElementById("passwordInput").addEventListener("keydown", e => {
  if (e.key === "Enter") checkPassword();
});

document.getElementById("togglePassword").addEventListener("click", function () {
  const input = document.getElementById("passwordInput");
  input.type = input.type === "password" ? "text" : "password";
  this.textContent = input.type === "password" ? "👁️" : "🙈";
});

window.addEventListener("click", e => {
  const popup = document.getElementById("popup");
  if (e.target === popup) closePopup();
});
