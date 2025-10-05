// services/reOrder.js
const fs = require('fs');
const path = require('path');
const { getBasePath } = require('./getPath');

/**
 * Mueve el juego con el id indicado a la primera posición del archivo library.json.
 * Mantiene el elemento "add-new" al final.
 * @param {string} gameId - ID del juego que se desea mover
 */
function reorderLibrary(gameId) {
  try {
    const libraryPath = path.join(getBasePath(), 'library.json');

    if (!fs.existsSync(libraryPath)) {
      console.warn('[reOrder] library.json no encontrado.');
      return;
    }

    const raw = fs.readFileSync(libraryPath, 'utf8');
    const library = JSON.parse(raw);

    // Buscar el juego
    const index = library.findIndex(item => item.id === gameId);
    if (index === -1) {
      console.warn(`[reOrder] No se encontró el juego con ID "${gameId}"`);
      return;
    }

    // Extraer el juego y volver a insertarlo al inicio
    const [game] = library.splice(index, 1);

    // Si es 'add-new', no hacemos nada
    if (game.id === 'add-new') return;

    // Eliminar si ya existe un duplicado en la lista (por seguridad)
    const filtered = library.filter(item => item.id !== game.id);

    // Reinsertar al inicio
    filtered.unshift(game);

    // Reubicar 'add-new' siempre al final
    const addNewIndex = filtered.findIndex(item => item.id === 'add-new');
    if (addNewIndex !== -1) {
      const [addNewItem] = filtered.splice(addNewIndex, 1);
      filtered.push(addNewItem);
    }

    // Guardar la nueva lista
    fs.writeFileSync(libraryPath, JSON.stringify(filtered, null, 2), 'utf8');
    console.log(`[reOrder] 📌 Se movió "${game.id}" al primer lugar de la librería.`);
  } catch (error) {
    console.error('[reOrder] ❌ Error al reordenar la librería:', error);
  }
}

module.exports = { reorderLibrary };
