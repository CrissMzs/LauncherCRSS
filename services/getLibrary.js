const fs = require('fs');
const path = require('path');
const { getBasePath } = require('./getPath');

/**
 * Lee el archivo library.json desde la carpeta base
 * y retorna un array con los juegos.
 */
function getLibrary() {
  try {
    const filePath = path.join(getBasePath(), 'library.json');

    if (!fs.existsSync(filePath)) {
      console.warn('[getLibrary] No se encontró library.json, retornando lista vacía.');
      return [];
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);

    if (!Array.isArray(json)) {
      console.error('[getLibrary] El contenido de library.json no es un array válido.');
      return [];
    }

    return json;
  } catch (error) {
    console.error('[getLibrary] Error al leer library.json:', error);
    return [];
  }
}

module.exports = { getLibrary };
