const i18next = require('i18next');
const path = require('path');
const fs = require('fs');

async function initI18n(lang = 'es') {
  const localesPath = path.join(__dirname, '..', 'i18n');
  const resources = {};

  // Cargamos manualmente los archivos de idiomas
  ['en', 'es'].forEach(l => {
    const file = path.join(localesPath, `${l}.json`);
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      resources[l] = { translation: JSON.parse(content) };
    }
  });

  await i18next.init({
    lng: lang,
    fallbackLng: 'en',
    resources
  });

  // Traduce todos los elementos con atributo data-i18n
  translateDOM();
}

function translateDOM() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = i18next.t(key);
  });
}

// Cambiar idioma dinámicamente si quieres
function changeLanguage(lang) {
  i18next.changeLanguage(lang);
  translateDOM();
}

module.exports = { initI18n, changeLanguage };
