const { contextBridge, ipcRenderer } = require("electron");

// Lo único que la página de Laica puede pedirle a la app.
contextBridge.exposeInMainWorld("escritorio", {
  raton: (atrapar) => ipcRenderer.send("raton", Boolean(atrapar)),
  menu: () => ipcRenderer.send("menu"),
  alSalir: (cb) => ipcRenderer.on("salir", (_e, datos) => cb(datos)),
  alOrden: (cb) => ipcRenderer.on("orden", (_e, orden) => cb(orden)),
});
