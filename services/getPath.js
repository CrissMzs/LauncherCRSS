const path = require('path');
const os = require('os');

/**
 * Retorna la ruta base de la carpeta de configuración de la app
 * FAVOR DE USAR ESTE METODO PARA OBTENER LA DIRECCION DE LA CARPETA DE USO
 * USARLO EN "DURO" ES INCORRECTO
 * (por ejemplo: C:\Users\[Usuario]\AppData\Roaming\LauncherCRSS)
 */
function getBasePath() {
  return path.join(os.homedir(), 'AppData', 'Roaming', 'LauncherCRSS');
}

module.exports = { getBasePath };
