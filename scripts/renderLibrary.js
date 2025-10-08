const { getLibrary } = require("../services/getLibrary");
const { getBasePath } = require("../services/getPath");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

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
    particlesDiv.style.opacity = getValue("particles") ?? 0 ? 1 : 0;
    return;
  }

  const library = getLibrary();
  const game = library[index];
  if (!game) return;

  if (particlesDiv) {
    if (game.id === "add-new") {
      particlesDiv.style.display = "block";
      particlesDiv.style.opacity = getValue("particles") ?? 0 ? 1 : 0;
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

window.addEventListener("keydown", (e) => {
  const wrappers = getWrappers();
  if (wrappers.length === 0) return;

  switch (e.key.toLowerCase()) {
    case "d":
      if (currentIndex < wrappers.length - 1 && !inNavbar) {
        currentIndex + 1;
        updateActiveItem();
        scrollToIndex(currentIndex);
        updateBackgroundForIndex(currentIndex);
      }
      break;
    case "a":
      if (currentIndex > 0 && !inNavbar) {
        currentIndex - 1;
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
        if (game.id === "add-new" || inNavbar) return;

        const { ipcRenderer } = require("electron");
        ipcRenderer.send("open-edit-window", { game, index: currentIndex });
      }
      break;

    case "enter":
    case " ":
      e.preventDefault();
      if (currentIndex >= 0 && !inNavbar) {
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

const navbarButtons = [document.getElementById("configBtn")]; // Puedes agregar más si tienes

function updateNavbarSelection(index) {
  navbarButtons.forEach((btn, i) => {
    btn.classList.toggle("nav-active", i === index);
  });
}

let navbarIndex = 0;

window.addEventListener("keydown", (e) => {
  const wrappers = getWrappers();
  if (wrappers.length === 0) return;

  switch (e.key.toLowerCase()) {
    // ⬆️ SUBIR a navbar
    case "w":
      if (!inNavbar) {
        inNavbar = true;
        updateNavbarSelection(navbarIndex);
        const library = getLibrary();
        const game = library.length;
        updateBackgroundForIndex(game);
        updateActiveItem()
        const wrappers = getWrappers();
        wrappers.forEach((w) => w.classList.remove("active"));
      }
      break;

    // ⬇️ BAJAR a galería
    case "s":
      if (inNavbar) {
        inNavbar = false;
        navbarButtons.forEach((btn) => btn.classList.remove("nav-active"));
        updateActiveItem();
        scrollToIndex(currentIndex);
        updateBackgroundForIndex(currentIndex);
      }
      break;

    // ⬅️➡️ Mover dentro de navbar o galería
    case "d":
      if (inNavbar) {
        navbarIndex = (navbarIndex + 1) % navbarButtons.length;
        updateNavbarSelection(navbarIndex);
      } else {
        if (currentIndex < wrappers.length - 1) {
          currentIndex++;
          updateActiveItem();
          scrollToIndex(currentIndex);
          updateBackgroundForIndex(currentIndex);
        }
      }
      break;

    case "a":
      if (inNavbar) {
        navbarIndex =
          (navbarIndex - 1 + navbarButtons.length) % navbarButtons.length;
        updateNavbarSelection(navbarIndex);
      } else {
        if (currentIndex > 0) {
          currentIndex--;
          updateActiveItem();
          scrollToIndex(currentIndex);
          updateBackgroundForIndex(currentIndex);
        }
      }
      break;

    // ✅ Enter o espacio → Ejecutar acción
    case "enter":
    case " ":
      e.preventDefault();
      if (inNavbar) {
        navbarButtons[navbarIndex]?.click();
      } else {
        const library = getLibrary();
        const game = library[currentIndex];
        if (!game) return;

        if (game.id === "add-new") {
          ipcRenderer.send("open-add-new-window");
        } else {
          const entry = wrappers[currentIndex].querySelector(".entry");
          if (entry) entry.click();
        }
      }
      break;

    // 📝 Editar (E) solo si estás en galería
    case "e":
      if (!inNavbar) {
        const library = getLibrary();
        const game = library[currentIndex];
        if (!game || game.id === "add-new") return;
        ipcRenderer.send("open-edit-window", { game, index: currentIndex });
      }
      break;
  }
});

ipcRenderer.on("refresh-library", () => {
  console.log("[Renderer] Refrescando librería...");
  location.reload();
});
