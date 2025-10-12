const { getLibrary } = require("../services/getLibrary");
const { getBasePath } = require("../services/getPath");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");
const { getTranslate } = require("../services/getTranslate");

let inNavbar = false; // 👈 Nueva bandera

// ESTE ES EL MAS GRANDE DE MOMENTO. NO ROMPERLO.
// SOLO DIOS Y YO SABIAMOS COMO SE HIZO ESTO EN SU MOMENTO
// AHORA SOLO LO SABE DIOS.

// esto tiene un listener enorme que renderiza parte por parte cada cosa del HTML.
// lo mete en un bucle y va renderizando todas las entradas que tengamos.
// si tienes mas dudas de como funciona una parte especifica preguntame o preguntale a GPT.
// la logica no es complicada pero como es js, es algo chistosa.

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
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

        let logoURL = fs.existsSync(logoPath)
          ? pathToFileURL(logoPath).href
          : "";

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
      if (game.id === "add-new") {
        title.textContent = "";
      } else {
        title.textContent = game.title || "";
      }

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
    const gradientCanvas = document.getElementById("gradient-canvas");
    const navbar = document.getElementById("navbar");

    if (spinner) {
      setTimeout(() => {
        navbar.style.opacity = 1;
        gradientCanvas.style.zIndex = "0";
        spinner.classList.add("hidden");
      }, 1100);
    }
  }, 500);
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

    const event = new CustomEvent("activeGameChanged", {
      detail: {
        game: activeGame,
        nav: inNavbar,
        currentIndex,
      },
    });
    window.dispatchEvent(event);
  }
}

function updateBackgroundForIndex(index) {
  const wrappers = getWrappers();
  const bgContainer = document.querySelector(".game-background");
  const particlesDiv = document.querySelector(".particles");

  if (index < 0 || index >= wrappers.length) {
    if (bgContainer) bgContainer.style.backgroundImage = "none";
    particlesDiv.style.display = "block";
    particlesDiv.style.opacity = (getValue("particles") ?? 0) ? 1 : 0;
    return;
  }

  const library = getLibrary();
  const game = library[index];
  if (!game) return;

  if (particlesDiv) {
    if (game.id === "add-new") {
      particlesDiv.style.display = "block";
      particlesDiv.style.opacity = (getValue("particles") ?? 0) ? 1 : 0;
    } else {
      const show = getValue("particles") && getValue("alwaysParticles");
      particlesDiv.style.display = show ? "block" : "none";
      particlesDiv.style.opacity = show ? 1 : 0;
    }
  }

  const bgFileName = `${game.id}_background.png`;
  const bgPath = path.join(getBasePath(), "assets", bgFileName);

  if (fs.existsSync(bgPath)) {
    const bgUrl = pathToFileURL(bgPath).href;
    bgContainer.style.backgroundImage = `url('${bgUrl}')`;
  } else {
    bgContainer.style.backgroundImage = "none";
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

const navbarButtons = [document.getElementById("configBtn")]; // Puedes agregar más si tienes

function updateNavbarSelection(index) {
  navbarButtons.forEach((btn, i) => {
    btn.classList.toggle("focusConfig", i === index);
  });
}

let currentSection = "gallery"; // "navbar", "gallery", "controls"
let navbarIndex = 0;
let controlIndex = 0;

// 🕹️ Cargar teclas configuradas por el usuario
const keyEdit = (getValue("keyEdit") || "w").toLowerCase();
const keyUp = (getValue("keyUp") || "w").toLowerCase();
const keyDown = (getValue("keyDown") || "s").toLowerCase();
const keyLeft = (getValue("keyLeft") || "a").toLowerCase();
const keyRight = (getValue("keyRight") || "d").toLowerCase();
const keyAction = (getValue("keyAction") || "space").toLowerCase();

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  const wrappers = getWrappers();
  if (wrappers.length === 0) return;

  switch (true) {
    // ⬆️ SUBIR de sección
    case key === keyUp:
      if (currentSection === "controls") {
        currentSection = "gallery";
        resetControlsFocus();
        updateActiveItem();
        updateBackgroundForIndex(currentIndex);
      } else if (currentSection === "gallery") {
        currentSection = "navbar";
        inNavbar = true;
        const library = getLibrary();
        const game = library.length;
        updateBackgroundForIndex(game);
        updateActiveItem();
        updateNavbarSelection(navbarIndex);
        wrappers.forEach((w) => w.classList.remove("active"));
      }
      break;

    // ⬇️ BAJAR de sección
    case key === keyDown:
      if (currentSection === "navbar") {
        currentSection = "gallery";
        inNavbar = false;
        navbarButtons.forEach((btn) => btn.classList.remove("focusConfig"));
        updateActiveItem();
        scrollToIndex(currentIndex);
        updateBackgroundForIndex(currentIndex);
      } else if (currentSection === "gallery") {
        const library = getLibrary();
        const game = library[currentIndex];
        if (game.id == "add-new") {
          return;
        }
        currentSection = "controls";
        focusControls();
      }
      break;

    // ⬅️➡️ Navegación lateral
    case key === keyRight:
      if (currentSection === "navbar") {
        navbarIndex = (navbarIndex + 1) % navbarButtons.length;
        updateNavbarSelection(navbarIndex);
      } else if (currentSection === "gallery") {
        if (currentIndex < wrappers.length - 1) {
          currentIndex++;
          updateActiveItem();
          scrollToIndex(currentIndex);
          updateBackgroundForIndex(currentIndex);
        }
      } else if (currentSection === "controls") {
        moveControls(1);
      }
      break;

    case key === keyLeft:
      if (currentSection === "navbar") {
        navbarIndex =
          (navbarIndex - 1 + navbarButtons.length) % navbarButtons.length;
        updateNavbarSelection(navbarIndex);
      } else if (currentSection === "gallery") {
        if (currentIndex > 0) {
          currentIndex--;
          updateActiveItem();
          scrollToIndex(currentIndex);
          updateBackgroundForIndex(currentIndex);
        }
      } else if (currentSection === "controls") {
        moveControls(-1);
      }
      break;

    // Acción principal
    case keyAction.includes(key):
      e.preventDefault();
      if (currentSection === "navbar") {
        navbarButtons[navbarIndex]?.click();
      } else if (currentSection === "gallery") {
        const library = getLibrary();
        const game = library[currentIndex];
        if (!game) return;

        if (game.id === "add-new") {
          ipcRenderer.send("open-add-new-window");
        } else {
          const entry = wrappers[currentIndex].querySelector(".entry");
          if (entry) entry.click();
        }
      } else if (currentSection === "controls") {
        const buttons = document.querySelectorAll(
          "#game-content .btnsGame button"
        );
        if (buttons[controlIndex]) buttons[controlIndex].click();
      }
      break;

    // 📝 Editar (E) → no depende de configuración
    case key === keyEdit:
      if (currentSection === "gallery") {
        const library = getLibrary();
        const game = library[currentIndex];
        if (!game || game.id === "add-new") return;
        ipcRenderer.send("open-edit-window", { game, index: currentIndex });
      }
      break;
  }
});

function focusControls() {
  const buttons = document.querySelectorAll("#game-content .btnsGame button");
  if (buttons.length === 0) return;
  controlIndex = 0;
  buttons.forEach((b, i) => {
    b.classList.toggle("focused", i === 0);
  });
}

function moveControls(dir) {
  const buttons = document.querySelectorAll("#game-content .btnsGame button");
  if (buttons.length === 0) return;
  controlIndex = (controlIndex + dir + buttons.length) % buttons.length;
  buttons.forEach((b, i) => {
    b.classList.toggle("focused", i === controlIndex);
  });
}

function resetControlsFocus() {
  const buttons = document.querySelectorAll("#game-content .btnsGame button");
  buttons.forEach((b) => b.classList.remove("focused"));
}

ipcRenderer.on("refresh-library", () => {
  console.log("[Renderer] Refrescando librería...");
  location.reload();
});
