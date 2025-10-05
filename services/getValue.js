const fs = require('fs');
const path = require('path');
const os = require('os');
const { getBasePath } = require('./getPath');

const baseConfigDir = getBasePath();
/**
 * Obtiene el valor de una key dentro de un archivo JSON.
 * 
 * @param {string} key - La clave que quieres leer.
 * @param {string} fileName - El nombre del archivo (ej. "config.json").
 * @returns {any|null} - Valor de la key o null si no existe.
 */
function getValue(key, fileName) {
  try {
    const filePath = path.join(baseConfigDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Archivo ${fileName} no encontrado en ${baseConfigDir}`);
      return null;
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);

    return json[key] ?? null;
  } catch (err) {
    console.error(`❌ Error leyendo ${fileName}:`, err);
    return null;
  }
}

module.exports = { getValue };
