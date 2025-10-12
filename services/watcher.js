// services/watcher.js
const { Tray, Menu, globalShortcut } = require("electron");
const path = require("path");
const { getAssetsPath } = require("./getPath");
const { getValue } = require("./getValueOnConfig"); // ✅ Importa tu helper

let tray = null;

/**
 * Inicializa el tray y el atajo global desde config.json
 * @param {Electron.App} app - instancia de la app
 * @param {Function} launchMain - función que abre/crea la ventana principal
 * @param {Function} killMain - función que cierra la ventana
 */
function initWatcher(app, launchMain, killMain) {
  const icon = path.join(getAssetsPath(), "ps5.png");

  try {
    tray = new Tray(icon);
  } catch (err) {
    console.error("[WATCHER] ❌ No se pudo cargar el icono:", icon, err);
    return;
  }

  tray.setToolTip("Exodus");

  const menu = Menu.buildFromTemplate([
    { label: "Exodus" },
    { label: "Open Launcher", click: launchMain },
    {
      label: "Close Launcher",
      click: () => {
        if (killMain) killMain();
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(menu);

  // 🧩 Leer el atajo desde config.json
  let shortcut = getValue("shortcut");
  if (!shortcut || typeof shortcut !== "string" || shortcut.trim() === "") {
    shortcut = "Control+O"; // valor por defecto
  }

  // 🔥 Registrar atajo global dinámico
  try {
    const success = globalShortcut.register(shortcut, launchMain);
    if (success) {
      console.log(`[WATCHER] ✅ Tray creado y atajo registrado: ${shortcut}`);
    } else {
      console.warn(`[WATCHER] ⚠️ No se pudo registrar el atajo: ${shortcut}`);
    }
  } catch (err) {
    console.error("[WATCHER] ❌ Error registrando atajo:", err);
  }
}

/** Destruye tray y libera atajos */
function destroyWatcher() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
  globalShortcut.unregisterAll();
  console.log("[WATCHER] 🧹 Watcher destruido");
}

module.exports = { initWatcher, destroyWatcher };
