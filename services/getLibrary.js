const fs = require('fs');
const path = require('path');
const { getBasePath } = require('./getPath');

/**
 * Lee el archivo library.json desde la carpeta base.
 * Si no existe, lo crea con una estructura base.
 */
function getLibrary() {
  try {
    const filePath = path.join(getBasePath(), 'library.json');

    if (!fs.existsSync(filePath)) {
      console.warn('[getLibrary] No se encontró library.json. Creando archivo nuevo...');
      
      const defaultLibrary = [
        {
          id: 'add-new',
          title: 'Añadir Juego',
          type: 'special',
          url: 'null'
        }
      ];

      fs.writeFileSync(filePath, JSON.stringify(defaultLibrary, null, 2), 'utf-8');
      console.log('[getLibrary] library.json creado con estructura base.');
      return defaultLibrary;
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);

    if (!Array.isArray(json)) {
      console.error('[getLibrary] El contenido de library.json no es un array válido. Restaurando...');
      
      const defaultLibrary = [
        {
          id: 'add-new',
          title: 'Añadir Juego',
          type: 'special',
          url: 'null'
        }
      ];
      
      fs.writeFileSync(filePath, JSON.stringify(defaultLibrary, null, 2), 'utf-8');
      return defaultLibrary;
    }

    return json;
  } catch (error) {
    console.error('[getLibrary] Error al leer o crear library.json:', error);
    return [];
  }
}

module.exports = { getLibrary };
