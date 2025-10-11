const path = require("path");

module.exports = {
  packagerConfig: {
    "asar": {
      "unpack": "**/node_modules/{sharp,@img}/**/*"
    },
    icon: path.join(__dirname, "assets", "ps5"), 
    extraResource: [
      './assets' 
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-zip", // Portable .zip para Windows
      platforms: ["win32"],
    },
    /* {
      name: "@electron-forge/maker-squirrel", // Instalable opcional
      config: {
        name: "ExodusLauncher",
        setupExe: "ExodusLauncher_Setup.exe",
        setupIcon: path.join(__dirname, "assets", "ps5.ico"),
      },
    }, */
  ],
};
