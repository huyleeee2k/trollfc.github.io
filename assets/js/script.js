const PASSWORD_HASH =
  "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";

const TARGET_URL = "https://forms.gle/H9QTDtXceYWeATsD9";

function openPopup(event) {
  if (event) event.stopPropagation();

  const popup = document.getElementById("popup");
  const input = document.getElementById("passwordInput");
  const errorText = document.getElementById("errorText");
  const toggleBtn = document.getElementById("togglePassword");

  popup.style.display = "flex";
  input.value = "";
  errorText.textContent = "";

  input.type = "password";
  toggleBtn.textContent = "🙉";

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

let errorTimer = null;

async function checkPassword() {
  const inputEl = document.getElementById("passwordInput");
  const errorText = document.getElementById("errorText");

  const inputHash = await sha256(inputEl.value.trim());

  if (inputHash === PASSWORD_HASH) {
    //window.open(TARGET_URL, "_blank");
    window.location.href = TARGET_URL;
    closePopup();
  } else {
    errorText.textContent = "❌ Mật khẩu không đúng";
    errorText.style.opacity = "1";

    if (errorTimer) clearTimeout(errorTimer);

    errorTimer = setTimeout(() => {
      errorText.style.opacity = "0";
      errorText.textContent = "";
    }, 2000);
  }
}


document.getElementById("passwordInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault(); // 🔒 chặn reload
    checkPassword();
  }
});

document.getElementById("togglePassword").addEventListener("click", function () {
  const input = document.getElementById("passwordInput");

  const isHidden = input.type === "password"; // trạng thái TRƯỚC khi đổi

  input.type = isHidden ? "text" : "password";
  this.textContent = isHidden ? "🙈" : "🙉";
});


window.addEventListener("click", e => {
  const popup = document.getElementById("popup");
  if (e.target === popup) closePopup();
});

document.querySelector(".popup-box").addEventListener("click", e => {
  e.stopPropagation();
});
