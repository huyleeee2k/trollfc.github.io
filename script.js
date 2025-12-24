const CORRECT_PASSWORD = "123456"; // 🔴 đổi mật khẩu tại đây
const TARGET_URL = "https://forms.gle/cgaTb9iYfeBZNUB3A";

function openPopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "flex";

  document.getElementById("passwordInput").value = "";
  document.getElementById("errorText").textContent = "";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

function checkPassword() {
  const input = document.getElementById("passwordInput").value;

  if (input === CORRECT_PASSWORD) {
    window.open(TARGET_URL, "_blank");
    closePopup();
  } else {
    document.getElementById("errorText").textContent =
      "❌ Mật khẩu không đúng";
  }
}
