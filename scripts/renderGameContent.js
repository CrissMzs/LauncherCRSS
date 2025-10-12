const gameContent = document.getElementById("game-content");

/**
 * Renderiza el logo grande del juego activo.
 * @param {object} game - Objeto del juego seleccionado
 */
function renderGameContent(game, nav, currentIndex) {
  if (!game || !game.id || game.id == "add-new" || nav) {
    gameContent.innerHTML = "";
    return;
  }

  // Ruta esperada del logo
  const logoFileName = `${game.id}_logo.png`;
  const logoPath = path.join(getBasePath(), "assets", logoFileName);

  if (fs.existsSync(logoPath)) {
    const logoURL = pathToFileURL(logoPath).href;

    // Render del contenido
    gameContent.innerHTML = `
      <div class="game-logo-container">
        <img src="${logoURL}" alt="${game.title}" class="game-logo">
      </div>
      <div class="btnsGame">
        <button class="playBtn">
          <span>${getTranslate('play')}</span>
        </button>
        <button id="optionBtn" class="optionBtn">
          <span>...</span>
        </button>
      </div>
    `;

    // 🔥 Conectamos el evento al botón recién creado
    const playBtn = gameContent.querySelector(".playBtn");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        window.openGame(game.url, game.id);
      });
    }

    const optionBtn = gameContent.querySelector("#optionBtn");
    if (optionBtn) {
      optionBtn.addEventListener("click", () => {
        ipcRenderer.send("open-edit-window", { game, currentIndex });
      });
    }
  } else {
    gameContent.innerHTML = `<p style="text-align:center; opacity:0.7;">(Sin logo disponible)</p>`;
  }
}

// 📡 Escucha cambios de juego activo desde renderLibrary.js
window.addEventListener("activeGameChanged", (e) => {
  renderGameContent(e.detail.game, e.detail.nav, e.detail.currentIndex);
});
