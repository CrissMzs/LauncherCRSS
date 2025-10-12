const i18next = require('i18next');

/**
 * Obtiene la traducción de una clave según el idioma actual.
 * @param {string} key - Clave de traducción (por ejemplo: 'play', 'welcome', etc.)
 * @returns {string} - Texto traducido según el idioma activo
 */
function getTranslate(key) {
  if (!i18next.isInitialized) {
    console.warn('[i18n] ⚠️ i18next no está inicializado aún');
    return key; // devuelve la key como fallback
  }

  return i18next.t(key);
}

module.exports = { getTranslate };