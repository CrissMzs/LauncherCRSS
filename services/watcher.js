// services/watcher.js
const { Tray, Menu, globalShortcut } = require("electron");
const path = require("path");
const { getAssetsPath } = require("./getPath");

let tray = null;

/**
 * Inicializa el tray y el atajo Ctrl+O
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

  // 🔥 Registrar atajo global
  try {
    globalShortcut.register("Control+O", launchMain);
    console.log("[WATCHER] ✅ Tray creado y escuchando Ctrl+O");
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
