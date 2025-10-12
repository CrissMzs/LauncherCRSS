const fs = require('fs');
const path = require('path');
const { getBasePath } = require('./getPath'); // usa tu ruta base

/**
 * Actualiza el tiempo jugado de un juego dentro de la librería.
 * 
 * @param {string} gameId - ID del juego (coincide con "id" en library.json)
 * @param {number} seconds - Tiempo jugado en segundos
 * @param {string} [fileName='library.json'] - Nombre del archivo de librería
 */
function setTimeOnGame(gameId, seconds, fileName = 'library.json') {
  try {
    const baseDir = getBasePath();
    const filePath = path.join(baseDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Archivo ${fileName} no encontrado en ${baseDir}`);
      return;
    }

    // Leer contenido actual
    const data = fs.readFileSync(filePath, 'utf-8');
    let library = [];

    try {
      library = JSON.parse(data);
    } catch (err) {
      console.error(`❌ Error al parsear ${fileName}:`, err);
      return;
    }

    // Buscar juego por ID
    const gameIndex = library.findIndex(entry => entry.id === gameId);
    if (gameIndex === -1) {
      console.warn(`⚠️ No se encontró juego con id: ${gameId}`);
      return;
    }

    const current = library[gameIndex];
    const prevTime = Number(current.time) || 0;
    const total = prevTime + seconds;

    // Guardar nuevo tiempo (redondeado a segundos)
    library[gameIndex].time = total;

    fs.writeFileSync(filePath, JSON.stringify(library, null, 2), 'utf-8');

    console.log(`💾 Tiempo actualizado para "${current.title}" → ${total} segundos`);
  } catch (err) {
    console.error(`❌ Error en setTimeOnGame(${gameId}):`, err);
  }
}

module.exports = { setTimeOnGame };
