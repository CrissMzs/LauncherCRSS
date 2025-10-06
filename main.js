// DEPENDENCIAS USADAS EN MAIN
const { app, BrowserWindow, ipcMain, shell } = require("electron");
const { ensureConfigFile } = require("./services/getValueOnConfig");
const { getValue } = require("./services/getValueOnConfig");
const { setValue } = require("./services/getValueOnConfig");
const { getBasePath } = require("./services/getPath");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { dialog } = require("electron");
const { putFirst } = require("./services/reOrder");

// main

// variables para la creacion de la pagina principal, modal (crear nuevo), modal editar
let addNewWin = null;
let mainWindow;
let editWindow = null;

// necesario para dev
try {
  require("electron-reload")(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`),
  });
} catch (e) {
  console.log("🔄 electron-reload no disponible en producción");
}

// crear constante que almacena main.html
const createWindow = () => {
  mainWindow = new BrowserWindow({
    fullscreen: true,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // favor no descomentar
  //mainWindow.webContents.openDevTools();

  mainWindow.loadFile("html/main.html");

  mainWindow.webContents.on("did-finish-load", () => {
    const lang = getValue("lang") || "en";
    mainWindow.webContents.send("set-language", lang);
  });
};

// uso de la constante para crear la pagina apenas se inicie el app
app.whenReady().then(() => {
  ensureAssetsFolder();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    ensureConfigFile();
    createWindow();
  }
});

// IPC's

/* Los ipc son como escuchas, basicamente los llamas desde otro componente (otro .js)
y los ejecutas aqui en el main, tiene que ser aqui porque este main es el unico js
que tiene permisos para acceder a carpetas, realizar cosas fuera de HTML, etc... */

// IPC PARA ABRIR LOS ACCESOS DIRECTOS
ipcMain.on("launch-game-request", (event, launchPath) => {
  // yo suelo usar los console.log para probar que si se esta llegando a esta parte
  // suponiendo que esto no se imprime en la consola es porque nunca estoy llamando a mi ipc
  // eso me hace volver a unos pasos atras y ver "Por que no se manda a llamar?"
  console.log("MAIN: Recibida solicitud de lanzamiento:", launchPath);

  // El shell de aqui viene del módulo de Electron, y básicamente sirve
  // para abrir cosas externas desde la aplicación, si le pasamos la referencia directa a un
  // acceso directo es como si dieras doble clic en un en el, asi podemos pasarle exe, etc.

  // Si te das cuenta recibimos desde el metodo un event y un LaunchPath, el LaunchPath
  // contiene la direccion exacta del acceso directo y al usar shell.openExternal(LaunchPath)
  // es suficiente para que ejecute lo que sea que haya en esa ruta con la aplicacion de windows
  // por defecto para abrirla.
  shell
    .openExternal(launchPath)
    .then(() => {
      console.log("MAIN: Juego lanzado con éxito.");
      // Tengo que se cierre el launcher cada vez que abrimos el app, de momento esta asi
      // tenia planeado que se minimice a la cinta de herramientas como lo hace Spotify
      // a demas de que quiero leer el admin de tareas para contar el tiempo de juego, etc...
      // de momento con que se cierre, esta bien.
      app.quit();
    })
    .catch((error) => {
      // el then y catch es basicamente lo que ya vieron en poo, si hay error, te dice cual fue.
      console.error("MAIN: Error al lanzar el juego:", error);
    });
});

// IPC PARA SELECTORES DE ARCHIVOS (FILE EXPLORER)

// este primero es para abrir un modal de seleccion de archivos, en caso de usarlo
// solo copiar la logica y elegir que tipo de extenciones estamos recibiendo.
ipcMain.handle("select-image-file", async () => {
  const result = await dialog.showOpenDialog({
    title: "Seleccionar imagen",
    properties: ["openFile"],
    filters: [
      { name: "Imágenes", extensions: ["png", "jpg", "jpeg", "webp"] },
      { name: "Todos los archivos", extensions: ["*"] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle("select-launcher-path", async () => {
  const result = await dialog.showOpenDialog({
    title: "Seleccionar ejecutable o acceso directo",
    properties: ["openFile"],
    filters: [
      {
        name: "Archivos ejecutables o accesos directos",
        extensions: ["exe", "lnk", "bat", "url"],
      },
      { name: "Todos los archivos", extensions: ["*"] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }

  return null;
});

// EL IPC PARA ABRIR EL MODAL
// a pesar de que mando a llamarlo desde otro componente (RenderLibrary), como dije, el unico
// que tiene poder sobre todo es este main, por eso uso un escucha para mandarlo a llamar y es
// tan simple como mandar a llamar el metodo que lo hace (esta hasta abajo)
ipcMain.on("open-add-new-window", () => {
  createAddNewWindow();
});
ipcMain.on("open-edit-window", (event, { game, index }) => {
  createEditWindow(game, index);
});
// IPC mas complejos

// agregar juego al json dentro de APPDATA/ROAMING/LAUNCHERCRSS/library.json
ipcMain.on("add-new-game-entry", async (event, gameData) => {
  try {
    const { id, title, type, url, iconPath, bgPath, logoPath } = gameData;
    const assetsPath = path.join(getBasePath(), "assets");
    const libraryPath = path.join(getBasePath(), "library.json");

    if (!fs.existsSync(assetsPath)) {
      fs.mkdirSync(assetsPath, { recursive: true });
    }

    const iconOutput = path.join(assetsPath, `${id}_ico.png`);
    console.log("[MAIN] Procesando imágenes:", { iconPath });
    await sharp(iconPath).resize({ width: 900 }).png().toFile(iconOutput);

    const bgOutput = path.join(assetsPath, `${id}_background.png`);
    console.log("[MAIN] Procesando imágenes:", { bgPath });
    await sharp(bgPath).resize({ width: 900 }).png().toFile(bgOutput);

    const logoOutput = path.join(assetsPath, `${id}_logo.png`);
    console.log("[MAIN] Procesando imágenes:", { logoPath });
    await sharp(logoPath).resize({ width: 900 }).png().toFile(logoOutput);

    if (!fs.existsSync(libraryPath)) {
      throw new Error("library.json no encontrado");
    }

    const rawLibrary = fs.readFileSync(libraryPath, "utf8");
    const library = JSON.parse(rawLibrary);

    const newEntry = { id, title, type, url };

    const addNewIndex = library.findIndex((item) => item.id === "add-new");
    if (addNewIndex !== -1) {
      library.splice(addNewIndex, 0, newEntry);
    } else {
      library.push(newEntry);
    }

    fs.writeFileSync(libraryPath, JSON.stringify(library, null, 2), "utf8");

    console.log(`[MAIN] ✅ Nueva entrada añadida: ${id}`);
    event.sender.send("add-new-game-success");
  } catch (error) {
    console.error("[MAIN] ❌ Error al añadir juego:", error);
    event.sender.send("add-new-game-error", error.message);
  }
});

ipcMain.handle("get-language", () => {
  return getValue("lang") || "es";
});

// 📌 Renderer cambia idioma → guardamos
ipcMain.on("set-language", (event, newLang) => {
  setValue("lang", newLang);
  console.log(`[MAIN] 🌍 Idioma actualizado a: ${newLang}`);
});

// el que se encarga de decir "ya se agrego, recarga la libreria visual de la app"
// si buscas la palabra "refresh-library" en scripts/RenderLibrary.js
// veras como se usa alla.
// Es como un escucha inverso, es decir, en lugar de usarlo aqui, de aqui lo emitimos.
ipcMain.on("refresh-library", () => {
  if (mainWindow) {
    mainWindow.webContents.send("refresh-library");
  }
});

// CON ESTO CIERRO EL MODAL EN AUTOMATICO CUANDO TERMINO DE AGREGAR UN JUEGO
// PARA VER SU USO BUSCAR "close-add-new-window", en scripts/RenderLibrary.js

// en teoria podriamos hacer que "addNewWin" se reciba desde el metodo para hacer que
// cierre cualquier ventana que se le mande por el argumento y no solo esa que tiene estatica.
// asi usariamos un solo metodo.
ipcMain.on("close-add-new-window", () => {
  if (addNewWin) {
    addNewWin.destroy();
    addNewWin = null;
  } else {
    console.log("[MAIN] 🔴 No hay ventana activa para cerrar");
  }
});

// con este recibimos un gameId y usamos reorderLibrary(), metodo el cual importamos desde el
// inicio del documento, viene de un servicio que cree llamado reOrder.js, el cual aun no tiene todas
// sus funciones, pero de momento lo que hace es poner al inicio el juego que acabamos de abrir.
ipcMain.on("reorder-library-entry", (event, gameId) => {
  putFirst(gameId);
});

// IPC PARA UPDATE

ipcMain.on("update-game-entry", async (event, { index, updatedGame }) => {
  try {
    const libraryPath = path.join(getBasePath(), "library.json");
    const assetsPath = path.join(getBasePath(), "assets");

    if (!fs.existsSync(libraryPath)) {
      throw new Error("library.json no encontrado");
    }

    const rawLibrary = fs.readFileSync(libraryPath, "utf8");
    const library = JSON.parse(rawLibrary);

    if (index < 0 || index >= library.length) {
      throw new Error("Índice fuera de rango");
    }

    // 📌 Recuperamos el ID original para construir rutas de imagen
    const originalId = library[index].id;
    const { id, title, type, url, iconPath, bgPath, logoPath } = updatedGame;

    // ⚡ Procesar nuevas imágenes solo si el usuario seleccionó alguna
    if (iconPath) {
      const iconOutput = path.join(assetsPath, `${id}_ico.png`);
      console.log("[MAIN] Actualizando ícono:", iconPath);
      await sharp(iconPath).resize({ width: 900 }).png().toFile(iconOutput);
    }

    if (bgPath) {
      const bgOutput = path.join(assetsPath, `${id}_background.png`);
      console.log("[MAIN] Actualizando fondo:", bgPath);
      await sharp(bgPath).resize({ width: 900 }).png().toFile(bgOutput);
    }

    if (logoPath) {
      const logoOutput = path.join(assetsPath, `${id}_logo.png`);
      console.log("[MAIN] Actualizando logo:", logoPath);
      await sharp(logoPath).resize({ width: 900 }).png().toFile(logoOutput);
    }

    // 📌 Reemplazamos los datos en la librería (sin perder imágenes)
    library[index] = { id, title, type, url };

    fs.writeFileSync(libraryPath, JSON.stringify(library, null, 2), "utf8");

    console.log(`[MAIN] ✅ Juego ${id} actualizado correctamente`);
    event.sender.send("update-game-success");
  } catch (error) {
    console.error("[MAIN] ❌ Error al actualizar juego:", error);
    event.sender.send("update-game-error", error.message);
  }
});

// aqui nos aseguramos que exista la carpeta assets en APPDATA/ROAMING/LAUNCHERCRSS/
// si necesitas otra carpeta, creala con otro metodo con la misma logica
// este metodo jamas se usaria de no ser porque esta en el mismo donde iniciamos la app.
/* app.whenReady().then(() => {
  ensureAssetsFolder();
  createWindow();
}); */
// entonces si necesitas otra carpeta agrega su metodo tambien ahi.
function ensureAssetsFolder() {
  const assetsPath = path.join(getBasePath(), "assets");
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
    // mas consolas para saber si esta creandose o no.
    console.log('[MAIN] Carpeta "assets" creada en:', assetsPath);
  } else {
    console.log('[MAIN] Carpeta "assets" ya existe en:', assetsPath);
  }
}

// estoy usando la variable let addNewWin = null;
// en caso de querer otro modal obviamente agregar una variable nueva y recrear la logica

function createAddNewWindow() {
  // si existe la ventana y no esta destruida, enfocarse en ella
  if (addNewWin && !addNewWin.isDestroyed()) {
    addNewWin.focus();
    return;
    // termina. Esto evita que se creen varias ventanas, porque ya existe una. (Una a la vez)
  }

  addNewWin = new BrowserWindow({
    width: 720, // ancho
    height: 800, // alto
    resizable: false, // se puede cambiar el ancho y alto?
    minimizable: false, // se puede minimizar?
    maximizable: false, // se puede maximizar?
    title: "Añadir juego", // titulo de la ventana
    parent: BrowserWindow.getAllWindows()[0] || null,
    modal: true, // es un modal?
    autoHideMenuBar: true, // oculta la cinta de opciones (File, Edit, Select, Window)
    frame: true, // Tiene botones del sistema? (Cerrar, maximizar, etc) Como ya quite dos alla arriba, dejo el de cerrar
    webPreferences: {
      nodeIntegration: true, // Esto le da permisos de edicion externa al HTML
      contextIsolation: false, // Esto dejarlo asi
      sandbox: false, // Un modo de prueba, dejarlo en false
    },
  });

  // con esto se carga, el path.join ya es una regla de node.js
  // se abre tan facil como con __dirname, carpeta, archivo.extension
  addNewWin.loadFile(path.join(__dirname, "html", "addNew.html"));

  addNewWin.webContents.on("did-finish-load", () => {
    const lang = getValue("lang") || "en";
    console.log("[MAIN] 🌍 Enviando idioma al modal:", lang);
    addNewWin.webContents.send("set-language", lang);
  });

  // al cerrar vaciar la variable de nuevo
  addNewWin.on("closed", () => {
    addNewWin = null;
  });
}

let editWin = null;

function createEditWindow(game, index) {
  if (editWin) {
    editWin.focus();
    return;
  }

  editWin = new BrowserWindow({
    width: 500,
    height: 700,
    resizable: false,
    minimizable: false,
    maximizable: false,
    modal: true,
    autoHideMenuBar: true, // oculta la cinta de opciones (File, Edit, Select, Window)
    parent: BrowserWindow.getFocusedWindow(),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  editWin.loadFile(path.join(__dirname, "html", "edit.html"));

  editWin.webContents.on("did-finish-load", () => {
    const lang = getValue("lang") || "en";
    editWin.webContents.send("set-language", lang);
  });

  // 👇 MUY IMPORTANTE: Esperamos a que la ventana cargue antes de enviar datos
  ipcMain.once("edit-game-window-ready", () => {
    editWin.webContents.send("edit-game-data", { game, index });
  });

  editWin.on("closed", () => {
    editWin = null;
  });
}
