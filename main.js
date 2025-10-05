const { app, BrowserWindow, ipcMain, shell } = require('electron'); 
const { ensureConfigFile } = require('./services/getValueOnConfig');
const { getBasePath } = require('./services/getPath');  // ✅ Importa tu servicio
const path = require('path');
const fs = require('fs');
const sharp = require('sharp'); // 👈 para redimensionar imágenes
const { dialog } = require('electron');
const { reorderLibrary } = require('./services/reOrder');  // 👈 al inicio

let addNewWin = null;
let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    
    fullscreen: true, 

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

    mainWindow.webContents.openDevTools()
  
  mainWindow.loadFile('html/main.html')
}

ipcMain.on('launch-game-request', (event, launchPath) => {
    console.log('MAIN: Recibida solicitud de lanzamiento:', launchPath);
    
    shell.openExternal(launchPath) 
        .then(() => {
            console.log('MAIN: Juego lanzado con éxito.');
            app.quit(); 
        })
        .catch(error => {
            console.error('MAIN: Error al lanzar el juego:', error);
        });
});

function createAddNewWindow() {
  if (addNewWin && !addNewWin.isDestroyed()) {
    addNewWin.focus();
    return;
  }

  addNewWin = new BrowserWindow({
    width: 720,
    height: 520,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: 'Añadir juego',
    parent: BrowserWindow.getAllWindows()[0] || null, // opcional: como hija de la principal
    modal: true, // pon true si la quieres modal
     autoHideMenuBar: true,   // 👈 Oculta la barra de menú automáticamente
    frame: true,            // Si quieres quitar también los bordes del sistema, pon false
    webPreferences: {
      nodeIntegration: true,     // tú ya lo usas así
      contextIsolation: false,    // tú ya lo usas así
      sandbox: false // 👈 asegúrate de que esté desactivado
    }
  });

  addNewWin.loadFile(path.join(__dirname, 'html', 'addNew.html'));

  addNewWin.on('closed', () => {
    addNewWin = null;
  });
}

  ipcMain.handle('select-image-file', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Seleccionar imagen',
    properties: ['openFile'],
    filters: [
      { name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'webp'] },
      { name: 'Todos los archivos', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Canal IPC para abrir la ventana
ipcMain.on('open-add-new-window', () => {
  createAddNewWindow();
});

ipcMain.on('add-new-game-entry', async (event, gameData) => {
  try {
    const { id, title, type, url, iconPath, bgPath, logoPath } = gameData;
    const assetsPath = path.join(getBasePath(), 'assets');
    const libraryPath = path.join(getBasePath(), 'library.json');

    // 📌 Asegurar que la carpeta assets existe
    if (!fs.existsSync(assetsPath)) {
      fs.mkdirSync(assetsPath, { recursive: true });
    }

    // 📸 Procesar y guardar icono
    const iconOutput = path.join(assetsPath, `${id}_ico.png`);
    console.log('[MAIN] Procesando imágenes:', { iconPath });
    await sharp(iconPath)
      .resize({ width: 900 }) // mantiene proporción automáticamente
      .png()
      .toFile(iconOutput);

    // 🌄 Procesar y guardar background
    const bgOutput = path.join(assetsPath, `${id}_background.png`);
    console.log('[MAIN] Procesando imágenes:', { bgPath });
    await sharp(bgPath)
      .resize({ width: 900 })
      .png()
      .toFile(bgOutput);


      const logoOutput = path.join(assetsPath, `${id}_logo.png`);
    console.log('[MAIN] Procesando imágenes:', { logoPath });
    await sharp(logoPath)
      .resize({ width: 900 })
      .png()
      .toFile(logoOutput);
    // 📚 Leer librería
    if (!fs.existsSync(libraryPath)) {
      throw new Error('library.json no encontrado');
    }

    const rawLibrary = fs.readFileSync(libraryPath, 'utf8');
    const library = JSON.parse(rawLibrary);

    // 📝 Crear nueva entrada
    const newEntry = { id, title, type, url };

    // Insertar antes de 'add-new'
    const addNewIndex = library.findIndex(item => item.id === 'add-new');
    if (addNewIndex !== -1) {
      library.splice(addNewIndex, 0, newEntry);
    } else {
      library.push(newEntry);
    }

    // 💾 Guardar librería actualizada
    fs.writeFileSync(libraryPath, JSON.stringify(library, null, 2), 'utf8');

    console.log(`[MAIN] ✅ Nueva entrada añadida: ${id}`);
    event.sender.send('add-new-game-success');
  } catch (error) {
    console.error('[MAIN] ❌ Error al añadir juego:', error);
    event.sender.send('add-new-game-error', error.message);
  }
});

ipcMain.handle('select-launcher-path', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Seleccionar ejecutable o acceso directo',
    properties: ['openFile'],
    filters: [
      { name: 'Archivos ejecutables o accesos directos', extensions: ['exe', 'lnk', 'bat', 'url'] },
      { name: 'Todos los archivos', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }

  return null;
});

ipcMain.on('refresh-library', () => {
  if (mainWindow) {
    // 👇 Enviamos un mensaje al renderer principal
    mainWindow.webContents.send('refresh-library');
  }
});

ipcMain.on('close-add-new-window', () => {
  console.log('[MAIN] ❗ Evento close-add-new-window recibido');
  if (addNewWin) {
    console.log('[MAIN] Ventana actual ID:', addNewWin.id, ' Destruida?', addNewWin.isDestroyed());
    addNewWin.destroy();
    console.log('[MAIN] 🟢 Ventana destruida');
    addNewWin = null;
  } else {
    console.log('[MAIN] 🔴 No hay ventana activa para cerrar');
  }
});

ipcMain.on('reorder-library-entry', (event, gameId) => {
  reorderLibrary(gameId);
});

// 🧰 Función que asegura la carpeta "assets"
function ensureAssetsFolder() {
  const assetsPath = path.join(getBasePath(), 'assets');
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
    console.log('[MAIN] Carpeta "assets" creada en:', assetsPath);
  } else {
    console.log('[MAIN] Carpeta "assets" ya existe en:', assetsPath);
  }
}

// 🟢 Al iniciar la app, creamos carpeta assets si no existe
app.whenReady().then(() => {
  ensureAssetsFolder();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    ensureConfigFile();
    createWindow()
  }
})
