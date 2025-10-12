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
  keyEdit: document.getElementById("keyEdit-input"),
};

let isFirstOpen = false;
const closeBtn = document.getElementById("closeBtn");
const submit = document.getElementById("submit");
const resetColorsBtn = document.getElementById("resetColors");

// 🎨 Colores por defecto
const defaultColors = {
  colorBG1: "1a1919",
  colorBG2: "3d3d3d",
  colorBG3: "242424",
  colorBG4: "111111",
};

const colorPickers = ["colorBG1", "colorBG2", "colorBG3", "colorBG4"];

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

  // 🎨 Rellenar color pickers
  colorPickers.forEach((key) => {
    const input = document.getElementById(key);
    const savedValue = getValue(key) || defaultColors[key];
    input.value = `#${savedValue}`;
  });
});

// 🕹️ Al enfocar una caja de tecla, esperamos la siguiente tecla presionada
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

// 🎨 Escuchar cambios en los color pickers (solo vista previa, no guardan)
// 🎨 Color pickers — solo modifican visualmente el input, sin guardar ni enviar nada
colorPickers.forEach((key) => {
  const input = document.getElementById(key);

  // Cargar valor actual o por defecto
  const savedValue = getValue(key) || defaultColors[key];
  input.value = `#${savedValue}`;

  // Si lo mueves, solo cambia en pantalla (sin guardar, sin refresh)
  input.addEventListener("input", () => {
    // no hace nada más — sólo cambia visualmente
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

  // Guardar colores de fondo
  colorPickers.forEach((key) => {
    const input = document.getElementById(key);
    const hex = input.value.replace("#", "");
    setValue(key, hex);
  });

  // Enviar todo al main
  ipcRenderer.send("set-controls", controls);

  ipcRenderer.send("refresh-library");
  window.close();
});


// 🔻 Cerrar modal
closeBtn.addEventListener("click", () => {
  window.close();
});

// 🌍 Actualizar traducciones dinámicamente
ipcRenderer.on("set-language", (event, lang) => {
  initI18n(lang);
});

resetColorsBtn.addEventListener("click", () => {
  colorPickers.forEach((key) => {
    const input = document.getElementById(key);
    const savedValue = defaultColors[key];
    input.value = `#${savedValue}`;
  });
});

