const { getValue } = require("../services/getValueOnConfig");

// aqui solo consigo el nombre de usuario, importo un servicio llamado getValue, el cual me obtiene
// el valor que le pido del archivo config en APPDATA/ROAMING/LAUNCHERCRSS
// si guardas alguna variable en ese archivo, puedes leerla asi

// esto agrega un listener al DOM, el DOM es el contenido REDERIZADO en la pagina
window.addEventListener("DOMContentLoaded", () => {
  // creamos una variable de texto que tiene EL NOMBRE EN EL ARCHIVO o si no hay nombre o no hay archivo
  // solo pone Usuario. Para eso sirve ||
  const username = getValue("username") || "Usuario";
  // creamos una variable que contenga el contenido de un span en el HTML, si te vas a main.html
  // en la seccion del navbar hay un span con id welcome-message
  // estamos obteniendolo y cambiandole el contenido a bienvenido, el nombre de usuario obtenido antes.
  const navbar = document.getElementById("welcome-message");
  navbar.textContent = `Wellcome, ${username}`;
});
