const { ipcRenderer } = require('electron'); 

// tengo entendido que siempre que usemos ipc tendremos que importar el renderer, pero como ya se usa
// desde aqui, todos los demas ya lo toman en cuenta tambien, entonces si te da error algo como
// ipcRenderer is already rendered o algo asi, elimina tu importacion, ya esta aqui.

function launchGameRequest(launchPath, gameId) {
    // esto recibe una ruta al acceso directo y una id, la cual usaremos para reordenar
    // primero se reordena, estos metodos ya estan en main.js y luego se abre.
    ipcRenderer.send('reorder-library-entry', gameId);
    ipcRenderer.send('launch-game-request', launchPath);
}

// Hacer la función accesible globalmente
// de igual forma esto esta en reOrder.js, esto es para poder importarlo desde otro archivo
window.openGame = launchGameRequest;
