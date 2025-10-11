window.addEventListener("DOMContentLoaded", async () => {
  const logo = document.getElementById("loader-logo");
  if (!logo) return;

  try {
    const iconPath = await ipcRenderer.invoke("get-logo-path");
    logo.src = `file://${iconPath.replace(/\\/g, "/")}`; // ruta absoluta válida
  } catch (err) {
    console.error("⚠️ Error cargando el logo:", err);
  }
});