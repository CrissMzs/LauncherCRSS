const { getLibrary } = require("../services/getLibrary");
const { getBasePath } = require("../services/getPath");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

// ESTE ES EL MAS GRANDE DE MOMENTO. NO ROMPERLO.
// SOLO DIOS Y YO SABIAMOS COMO SE HIZO ESTO EN SU MOMENTO
// AHORA SOLO LO SABE DIOS.

// esto tiene un listener enorme que renderiza parte por parte cada cosa del HTML.
// lo mete en un bucle y va renderizando todas las entradas que tengamos.
// si tienes mas dudas de como funciona una parte especifica preguntame o preguntale a GPT.
// la logica no es complicada pero como es js, es algo chistosa.

window.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("game-gallery");
  const library = getLibrary();
  const leftSpacer = document.createElement("div");
  leftSpacer.style.flex = "0 0 60px";
  gallery.appendChild(leftSpacer);

  library.forEach((game) => {
    const entryWrapper = document.createElement("div");
    entryWrapper.classList.add("entry-wrapper");

    const entry = document.createElement("div");
    entry.classList.add("entry");

    if (game.type === "special") {
      entry.classList.add("special-entry");
      entry.textContent = game.icon || "+";
    } else {
      const icoFileName = `${game.id}_ico.png`;
      const logoFileName = `${game.id}_logo.png`;

      const icoPath = path.join(getBasePath(), "assets", icoFileName);
      const logoPath = path.join(getBasePath(), "assets", logoFileName);

      let icoURL = fs.existsSync(icoPath)
        ? pathToFileURL(icoPath).href
        : "https://via.placeholder.com/300x400?text=No+Image";

      let logoURL = fs.existsSync(logoPath) ? pathToFileURL(logoPath).href : "";

      const bgDiv = document.createElement("div");
      bgDiv.classList.add("entry-bg");
      bgDiv.style.backgroundImage = `url('${icoURL}')`;

      const overlayDiv = document.createElement("div");
      overlayDiv.classList.add("entry-overlay");
      if (logoURL) {
        overlayDiv.style.backgroundImage = `url('${logoURL}')`;
      }

      entry.appendChild(bgDiv);
      entry.appendChild(overlayDiv);

      if (game.url && game.url !== "null") {
        entry.addEventListener("click", () => openGame(game.url, game.id));
      }
    }

    const title = document.createElement("p");
    title.classList.add("game-title");
    title.textContent = game.title || "";

    entryWrapper.appendChild(entry);
    entryWrapper.appendChild(title);
    gallery.appendChild(entryWrapper);
  });

  // aqui hacemos el el "select sea el primero"
  if (library.length > 0) {
    currentIndex = 0;
    updateActiveItem();
    updateBackgroundForIndex(currentIndex);
  }

  const wrapperWidth =
    document.querySelector(".entry-wrapper")?.offsetWidth || 240;
  const galleryWidth = gallery.clientWidth;
  const spacerWidth = galleryWidth - wrapperWidth - 40;

  const spacer = document.createElement("div");
  spacer.style.flex = "0 0 auto";
  spacer.style.width = `${spacerWidth}px`;
  gallery.appendChild(spacer);

  const spinner = document.getElementById("loading-spinner");
  if (spinner) {
    setTimeout(() => {
      spinner.classList.add("hidden");
    }, 300);
  }
});

const gallery = document.getElementById("game-gallery");
let currentIndex = -1;

function getWrappers() {
  return Array.from(gallery.querySelectorAll(".entry-wrapper"));
}

function updateActiveItem() {
  const wrappers = getWrappers();
  wrappers.forEach((w) => w.classList.remove("active"));

  if (currentIndex >= 0 && currentIndex < wrappers.length) {
    wrappers[currentIndex].classList.add("active");

    // con esto notifico al renderGameContent.js el cambio del juego seleccionado
    const library = getLibrary();
    const activeGame = library[currentIndex];

    const event = new CustomEvent("activeGameChanged", { detail: activeGame });
    window.dispatchEvent(event);
  }
}

function updateBackgroundForIndex(index) {
  const wrappers = getWrappers();
  if (index < 0 || index >= wrappers.length) return;

  const library = getLibrary();
  const game = library[index];
  if (!game) return;

  const particlesDiv = document.querySelector('.particles');
  if (particlesDiv) {
    let opacity;
    let allways = 0;
    let display = "none";
    if (game.id === 'add-new') {
      particlesDiv.style.display = 'block';
      particlesDiv.style.opacity = (getValue("particles") ?? 0) ? 1 : 0;
    } else {
      particlesDiv.style.display = (getValue("particles") && getValue("alwaysParticles")) ? "block" : "none";
      particlesDiv.style.opacity = (getValue("particles") && getValue("alwaysParticles")) ? 1 : 0;
    }
  }

  const bgFileName = `${game.id}_background.png`;
  const bgPath = path.join(getBasePath(), 'assets', bgFileName);

  const bgContainer = document.querySelector('.game-background');
  if (fs.existsSync(bgPath)) {
    const bgUrl = pathToFileURL(bgPath).href;
    bgContainer.style.backgroundImage = `url('${bgUrl}')`;
  } else {
    bgContainer.style.backgroundImage = `none`;
  }
}

function scrollToIndex(index) {
  const wrappers = getWrappers();
  if (index < 0 || index >= wrappers.length) return;

  const target = wrappers[index];

  const baseWidth = 150;
  const activeWidth = 180;
  const margin = 40;

  let left = target.offsetLeft - margin;

  if (target.classList.contains("active")) {
    const diff = activeWidth - baseWidth;
    left -= diff / 2;
  }

  gallery.scrollTo({
    left,
    behavior: "smooth",
  });
}

window.addEventListener("keydown", (e) => {
  const wrappers = getWrappers();
  if (wrappers.length === 0) return;

  switch (e.key.toLowerCase()) {
    case "d":
      if (currentIndex < wrappers.length - 1) {
        currentIndex++;
        updateActiveItem();
        scrollToIndex(currentIndex);
        updateBackgroundForIndex(currentIndex);
      }
      break;
    case "a":
      if (currentIndex > 0) {
        currentIndex--;
        updateActiveItem();
        scrollToIndex(currentIndex);
        updateBackgroundForIndex(currentIndex);
      }
      break;

case "e":
  {
    const library = getLibrary();
    const game = library[currentIndex];
    if (!game) return;
    if (game.id === "add-new") return;

    const { ipcRenderer } = require("electron");
    ipcRenderer.send("open-edit-window", { game, index: currentIndex });
  }
  break;

    case "enter":
    case " ":
      e.preventDefault();
      if (currentIndex >= 0) {
        const wrappers = getWrappers();
        const library = getLibrary();
        const game = library[currentIndex];
        if (!game) return;

        if (game.id === "add-new") {
          const { ipcRenderer } = require("electron");

          ipcRenderer.send("open-add-new-window");
        } else {
          const entry = wrappers[currentIndex].querySelector(".entry");
          if (entry) {
            entry.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          }
        }
      }
      break;
  }
});

ipcRenderer.on("refresh-library", () => {
  console.log("[Renderer] Refrescando librería...");
  location.reload();
});
