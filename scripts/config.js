const { ipcRenderer } = require("electron");
const { getValue, setValue } = require("../services/getValueOnConfig.js");
const { initI18n } = require("../services/i18n.js");

const form = document.getElementById("config-form");
const usernameInput = document.getElementById("username-input");
const langSelect = document.getElementById("lang-select");

const keyInputs = {
  keyUp: document.getElementById("keyUp-input"),
  keyDown: document.getElementById("keyDown-input"),
  keyLeft: document.getElementById("keyLeft-input"),
  keyRight: document.getElementById("keyRight-input"),
  keyAction: document.getElementById("keyAction-input"),
};

let isFirstOpen = false;
const closeBtn = document.getElementById("closeBtn");
const submit = document.getElementById("submit");

// 🧩 Cargar valores actuales
ipcRenderer.on("isFirstOpen", (event, data) => {
  isFirstOpen = data.isFirstOpen;

  const currentUsername = getValue("username");
  const currentLang = getValue("lang");

  if (currentUsername) usernameInput.value = currentUsername;
  if (currentLang) langSelect.value = currentLang;

  // 🎮 Rellenar las teclas con su valor actual
  Object.keys(keyInputs).forEach((key) => {
    let value = getValue(key);

    if (value) {
      // Si es un espacio en blanco, mostrar como "SPACE"
      if (value === " ") value = "SPACE";

      keyInputs[key].value = value.toUpperCase();
    }
  });
});

// 🕹️ Al enfocar una caja, esperamos la siguiente tecla presionada
Object.keys(keyInputs).forEach((keyName) => {
  const input = keyInputs[keyName];

  input.addEventListener("focus", () => {
    input.value = ""; // limpiar al enfocar
  });

  input.addEventListener("keydown", (e) => {
    e.preventDefault();
    const key = e.key === " " ? "SPACE" : e.key.toUpperCase();
    input.value = key;
  });
});

// 💾 Guardar valores al enviar el formulario
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const lang = langSelect.value;

  // Guardar usuario e idioma
  ipcRenderer.send("set-username", username);
  ipcRenderer.send("set-language", lang);

  // Guardar teclas en objeto
  const controls = {};
  Object.keys(keyInputs).forEach((key) => {
    const value = keyInputs[key].value.trim();
    if (value) {
      controls[key] =
        value.toLowerCase() === "space" ? " " : value.toLowerCase();
    }
  });

  // Enviar todo al main
  ipcRenderer.send("set-controls", controls);

  ipcRenderer.send("refresh-library");
  window.close();
});

closeBtn.addEventListener("click", () => {
  window.close();
});

ipcRenderer.on("set-language", (event, lang) => {
  initI18n(lang);
});
