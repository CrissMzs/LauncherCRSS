const { ipcRenderer } = require("electron");
const { getValue } = require("../services/getValueOnConfig.js");

const form = document.getElementById("config-form");
const usernameInput = document.getElementById("username-input");
const langSelect = document.getElementById("lang-select");

let isFirstOpen = false;

ipcRenderer.on("isFirstOpen", (event, data) => {
  isFirstOpen = data.isFirstOpen;

  if (!isFirstOpen) {
    const currentUsername = getValue("username");
    const currentLang = getValue("lang");

    if (currentUsername) usernameInput.value = currentUsername;
    if (currentLang) langSelect.value = currentLang;
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const lang = langSelect.value;

  ipcRenderer.send("set-username", username);
  ipcRenderer.send("set-language", lang);

  ipcRenderer.send("refresh-library");
  window.close();
});
