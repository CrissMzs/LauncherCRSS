const { app, Tray, Menu, globalShortcut } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const kill = require("tree-kill");

let tray = null;
let launcherProcess = null;

// 🟢 Lanzar el launcher principal (main.js)
function launchMain() {
  if (launcherProcess && !launcherProcess.killed) {
    console.log("[WATCHER] Launcher already running.");
    return;
  }

  console.log("[WATCHER] Starting Launcher...");
  launcherProcess = spawn("electron", ["./main.js"], {
    shell: true,
    detached: false,
    stdio: "ignore",
  });

  launcherProcess.unref();

  launcherProcess.on("exit", (code, signal) => {
    console.log(
      `[WATCHER] 💤 Launcher exited (code: ${code}, signal: ${signal})`
    );
    launcherProcess = null;
  });
}

// 🔴 Cerrar solo el launcher
function killMain() {
  if (launcherProcess && launcherProcess.pid && !launcherProcess.killed) {
    console.log("[WATCHER] 💤 Stopping Launcher...");
    kill(launcherProcess.pid, "SIGTERM", (err) => {
      if (err) {
        console.error("[WATCHER] Error stopping Launcher:", err);
      } else {
        console.log("[WATCHER] Launcher stopped successfully.");
        launcherProcess = null;
      }
    });
  } else {
    console.log("[WATCHER] No launcher process found.");
    launcherProcess = null;
  }
}

// 🪟 Crear menú del tray
function createTray() {
  const icon = path.join(__dirname, "assets", "ps5.png");
  tray = new Tray(icon);
  tray.setToolTip("Exodus");

  const menu = Menu.buildFromTemplate([
    { label: "Open Launcher", click: launchMain },
    {
      label: "Close Launcher",
      click: () => {
        killMain(); // Mata el launcher correctamente
        app.quit(); // Luego cierra el watcher
      },
    },
  ]);

  tray.setContextMenu(menu);
}

// 🚀 Iniciar watcher
app.whenReady().then(() => {
  createTray();
  launchMain();
  globalShortcut.register("Control+O", launchMain);
  console.log("[WATCHER] Ready and listening for Ctrl+O");
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  console.log("[WATCHER] Clean exit.");
});
