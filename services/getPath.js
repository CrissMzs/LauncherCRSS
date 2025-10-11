const path = require("path");
const os = require("os");
const { app } = require("electron");

/**
 * 🗂 Retorna la ruta base de configuración del usuario
 * (NO MODIFICAR, usada por config.json y library.json)
 */
function getBasePath() {
  return path.join(os.homedir(), "AppData", "Roaming", "exodus");
}

/**
 * 🖼 Retorna la ruta real de los assets según el entorno
 *
 * - En desarrollo: usa la carpeta local del proyecto
 * - En el build (EXE): usa la carpeta "resources/assets"
 */
function getAssetsPath() {
  if (app && app.isPackaged) {
    // 🔹 Ruta en el .exe (build final)
    return path.join(process.resourcesPath, "assets");
  } else {
    // 🔹 Ruta local durante desarrollo
    return path.join(__dirname, "../assets");
  }
}

module.exports = { getBasePath, getAssetsPath };
