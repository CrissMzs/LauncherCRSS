// scripts/openGame.js
const { ipcRenderer } = require('electron'); 

function launchGameRequest(launchPath, gameId) {
    console.log(`RENDERER: Reordenando librería para ID: ${gameId}`);
    ipcRenderer.send('reorder-library-entry', gameId);  // 👈 primero reordena

    console.log(`RENDERER: Solicitud de IPC enviada para: ${launchPath}`);
    ipcRenderer.send('launch-game-request', launchPath);
}

// Hacer la función accesible globalmente
window.openGame = launchGameRequest;
