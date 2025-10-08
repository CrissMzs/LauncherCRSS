const { ipcRenderer } = require("electron");

const form = document.getElementById("edit-form");
const messageDiv = document.getElementById("message");

const browseBtn = document.getElementById("browse-btn");
const gameUrlInput = document.getElementById("game-url");

const selectIconBtn = document.getElementById("select-icon");
const selectBgBtn = document.getElementById("select-bg");
const selectLogoBtn = document.getElementById("select-logo");
const iconPathInput = document.getElementById("icon-path");
const bgPathInput = document.getElementById("bg-path");
const logoPathInput = document.getElementById("logo-path");

let currentIndex = null;
let id = null;

// 📌 Al abrir el modal → rellenar datos básicos
ipcRenderer.on("edit-game-data", (event, { game, index }) => {
  currentIndex = index;
  /* document.getElementById("game-id").value = game.id || "sexo"; */
  id = game.id;
  document.getElementById("game-title").value = game.title || "";
  document.getElementById("game-type").value = game.type || "";
  document.getElementById("game-url").value = game.url || "";

  // ❌ Dejamos los inputs de imágenes vacíos
  iconPathInput.value = "";
  bgPathInput.value = "";
  logoPathInput.value = "";
});

// 📌 Selección de archivos
function handleBrowse() {
  ipcRenderer.invoke("select-launcher-path").then(filePath => {
    if (filePath) gameUrlInput.value = filePath;
  });
}

function handleSelectIcon() {
  ipcRenderer.invoke("select-image-file").then(filePath => {
    if (filePath) iconPathInput.value = filePath;
  });
}

function handleSelectBg() {
  ipcRenderer.invoke("select-image-file").then(filePath => {
    if (filePath) bgPathInput.value = filePath;
  });
}

function handleSelectLogo() {
  ipcRenderer.invoke("select-image-file").then(filePath => {
    if (filePath) logoPathInput.value = filePath;
  });
}

browseBtn.addEventListener("click", handleBrowse);
selectIconBtn.addEventListener("click", handleSelectIcon);
selectBgBtn.addEventListener("click", handleSelectBg);
selectLogoBtn.addEventListener("click", handleSelectLogo);

// 📌 Guardar cambios
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const updatedGame = {
    id: id,
    title: document.getElementById("game-title").value.trim(),
    type: document.getElementById("game-type").value.trim(),
    url: gameUrlInput.value.trim(),
    iconPath: iconPathInput.value.trim() || null,
    bgPath: bgPathInput.value.trim() || null,
    logoPath: logoPathInput.value.trim() || null,
  };

  if (!updatedGame.id || !updatedGame.title || !updatedGame.url) {
    showMessage("Faltan campos obligatorios", "error");
    return;
  }

  ipcRenderer.send("update-game-entry", { index: currentIndex, updatedGame });
});

// 📌 Respuesta de guardado
ipcRenderer.on("update-game-success", () => {
  showMessage("✅ Cambios guardados", "success");
  ipcRenderer.send("refresh-library");
  window.close();
});

ipcRenderer.on("update-game-error", (event, errorMsg) => {
  showMessage("❌ Error: " + errorMsg, "error");
});

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = "message " + type;
}

window.addEventListener('DOMContentLoaded', () => {
  // Avisamos al proceso principal que ya puede mandarnos los datos
  ipcRenderer.send('edit-game-window-ready');
});