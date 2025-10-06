const { initI18n } = require("../services/i18n.js");

ipcRenderer.on("set-language", (event, lang) => {
  initI18n(lang);
});