async function renderControls() {
  const controls = document.getElementById("controls");
  const showControls = getValue("showControls");

  // 🚫 Si no se deben mostrar, limpia y sal
  if (!showControls) {
    controls.innerHTML = "";
    return;
  }

  // 🔹 Cargar teclas desde config
  const keyUp = (getValue("keyUp") || "w").toLowerCase();
  const keyDown = (getValue("keyDown") || "s").toLowerCase();
  const keyLeft = (getValue("keyLeft") || "a").toLowerCase();
  const keyRight = (getValue("keyRight") || "d").toLowerCase();
  const keyAction = (getValue("keyAction") || " ").toLowerCase();

  // 🔹 Lista de acciones traducidas
  const controlList = [
    { key: formatKey(keyUp), label: getTranslate("keyUp") },
    { key: formatKey(keyDown), label: getTranslate("keyDown") },
    { key: formatKey(keyLeft), label: getTranslate("keyLeft") },
    { key: formatKey(keyRight), label: getTranslate("keyRight") },
    { key: formatKey(keyAction), label: getTranslate("keyAction") },
  ];

  // 🔹 Render dinámico
  controls.innerHTML = `
    <div class="controls-grid">
      ${controlList
        .map(
          (ctrl) => `
        <div class="control-item" data-key="${ctrl.key.toLowerCase()}">
          <div class="key-box">${ctrl.key.toUpperCase()}</div>
          <span class="key-label">${ctrl.label}</span>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  window.addEventListener("keydown", (e) => {
    const key = formatKeyLabel(e.key);
    const item = controls.querySelector(`.control-item[data-key="${key}"]`);
    if (item) item.querySelector(".key-box").classList.add("active");
  });

  window.addEventListener("keyup", (e) => {
    const key = formatKeyLabel(e.key);
    const item = controls.querySelector(`.control-item[data-key="${key}"]`);
    if (item) item.querySelector(".key-box").classList.remove("active");
  });
}

function formatKeyLabel(key) {
  const k = key.toLowerCase().trim();

  switch (k) {
    case " ":
      return getTranslate("space").toLowerCase();
    case "arrowup":
      return getTranslate("arrowup").toLowerCase();
    case "arrowdown":
      return getTranslate("arrowdown").toLowerCase();
    case "arrowleft":
      return getTranslate("arrowleft").toLowerCase();
    case "arrowright":
      return getTranslate("arrowright").toLowerCase();
    default:
      return k.toLowerCase();
  }
}

function formatKey(key) {
  const k = key.toLowerCase();

  switch (k) {
    case " ":
      return getTranslate("space").toUpperCase();
    case "arrowup":
      return getTranslate("arrowup").toUpperCase();
    case "arrowdown":
      return getTranslate("arrowdown").toUpperCase();
    case "arrowleft":
      return getTranslate("arrowleft").toUpperCase();
    case "arrowright":
      return getTranslate("arrowright").toUpperCase();
    default:
      return k.toUpperCase();
  }
}

// 🚀 Inicialización
async function startApp() {
  const lang = getValue("lang") || "en";
  await initI18n(lang);
  renderControls();
}

startApp();
