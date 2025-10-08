const gameContent = document.getElementById("game-content");

/**
 * Renderiza el logo grande del juego activo.
 * @param {object} game - Objeto del juego seleccionado
 */
function renderGameContent(game, nav) {
  if (!game || !game.id || (game.id=='add-new') || nav) {
    gameContent.innerHTML = "";
    return;
  }

  // Ruta esperada del logo
  const logoFileName = `${game.id}_logo.png`;
  const logoPath = path.join(getBasePath(), "assets", logoFileName);

  if (fs.existsSync(logoPath)) {
    const logoURL = pathToFileURL(logoPath).href;
    gameContent.innerHTML = `
      <div class="game-logo-container">
        <img src="${logoURL}" alt="${game.title}" class="game-logo">
      </div>
    `;
  } else {
    gameContent.innerHTML = `<p style="text-align:center; opacity:0.7;">(Sin logo disponible)</p>`;
  }
}

// 📡 Escucha cambios de juego activo desde renderLibrary.js
window.addEventListener("activeGameChanged", (e) => {
  renderGameContent(e.detail.game, e.detail.nav);
});

