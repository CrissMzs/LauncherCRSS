/* de igual forma deberia tener su propio js en scripts */

/* TODO ESTO HACE QUE EL ENVIO DEL FORMULARIO SIRVA, EN CASO DE HACER UN SEGUNDO FORMULARIO
        IMITAR LOGICA */

const { ipcRenderer } = require("electron");

const form = document.getElementById("add-form");
const messageDiv = document.getElementById("message");

const browseBtn = document.getElementById("browse-btn");
const gameUrlInput = document.getElementById("game-url");

const selectIconBtn = document.getElementById("select-icon");
const selectBgBtn = document.getElementById("select-bg");
const selectLogoBtn = document.getElementById("select-logo");
const iconPathInput = document.getElementById("icon-path");
const bgPathInput = document.getElementById("bg-path");
const logoPathInput = document.getElementById("logo-path");

function handleBrowse() {
  ipcRenderer.invoke("select-launcher-path").then((filePath) => {
    if (filePath) {
      gameUrlInput.value = filePath;
    }
  });
}

function handleSelectIcon() {
  ipcRenderer.invoke("select-image-file").then((filePath) => {
    if (filePath) iconPathInput.value = filePath;
  });
}

function handleSelectBg() {
  ipcRenderer.invoke("select-image-file").then((filePath) => {
    if (filePath) bgPathInput.value = filePath;
  });
}

function handleSelectLogo() {
  ipcRenderer.invoke("select-image-file").then((filePath) => {
    if (filePath) logoPathInput.value = filePath;
  });
}

browseBtn.addEventListener("click", handleBrowse);
selectIconBtn.addEventListener("click", handleSelectIcon);
selectBgBtn.addEventListener("click", handleSelectBg);
selectLogoBtn.addEventListener("click", handleSelectLogo);

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("game-id").value.trim();
  const title = document.getElementById("game-title").value.trim();
  const type = document.getElementById("game-type").value.trim();
  const url = document.getElementById("game-url").value.trim();
  const iconPath = iconPathInput.value.trim();
  const bgPath = bgPathInput.value.trim();
  const logoPath = logoPathInput.value.trim();

  if (!id || !title || !iconPath || !bgPath || !logoPath) {
    showMessage("Faltan campos obligatorios", "error");
    return;
  }

  ipcRenderer.send("add-new-game-entry", {
    id,
    title,
    type,
    url,
    iconPath,
    bgPath,
    logoPath,
  });
});

ipcRenderer.on("add-new-game-success", () => {
  form.reset();
  ipcRenderer.send("refresh-library");
  ipcRenderer.send("close-add-new-window");
  cleanupListeners();
  console.log("[RENDERER] 🎯 Evento de éxito recibido, solicitando cierre...");
});

ipcRenderer.on("add-new-game-error", (event, errorMsg) => {
  showMessage("Error: " + errorMsg, "error");
});

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = type;
}

function cleanupListeners() {
  browseBtn.removeEventListener("click", handleBrowse);
  selectIconBtn.removeEventListener("click", handleSelectIcon);
  selectBgBtn.removeEventListener("click", handleSelectBg);
  selectLogoBtn.removeEventListener("click", handleSelectLogo);
  form.removeEventListener("submit", handleSubmit);
}
