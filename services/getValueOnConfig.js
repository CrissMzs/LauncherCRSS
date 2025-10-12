const fs = require("fs");
const path = require("path");
const os = require("os");
const { getBasePath } = require("./getPath");

// 📌 Ruta de AppData y archivo de configuración
const configDir = getBasePath();
const configPath = path.join(configDir, "config.json");

// 🧰 Asegura que el archivo existe
function ensureConfigFile() {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  if (!fs.existsSync(configPath)) {
    ipcRenderer.send("open-first-config", { isFirstOpen: true });
    const defaultConfig = {
      username: "Guest",
      lang: "en",
      particles: true,
      alwaysParticles: false,
      showControls: true,
      colorBG1: "1a1919",
      colorBG2: "3d3d3d",
      colorBG3: "242424",
      colorBG4: "111111",
      keyEdit: "e",
      keyUp: "w",
      keyDown: "s",
      keyLeft: "a",
      keyRight: "d",
      keyAction: " ",
    };
    fs.writeFileSync(
      configPath,
      JSON.stringify(defaultConfig, null, 2),
      "utf-8"
    );
  }
}

// 🔑 Función principal: obtener valor por key
function getValue(key) {
  ensureConfigFile();
  try {
    const data = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(data);
    return config[key] ?? null;
  } catch (err) {
    console.error(`Error leyendo config.json: ${err}`);
    return null;
  }
}

function setValue(key, value) {
  ensureConfigFile();
  const data = fs.readFileSync(configPath, "utf-8");
  const config = JSON.parse(data);
  config[key] = value;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

module.exports = { getValue, setValue };
