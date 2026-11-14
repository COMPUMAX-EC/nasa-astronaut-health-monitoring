// Laica en el escritorio: una ventana transparente, sin marco y siempre encima que cubre la
// pantalla. Los clics pasan a través de ella salvo cuando el cursor está sobre Laica.
// La app web la llama con enlaces laica:// (ver enlace.js).

const { app, BrowserWindow, screen, ipcMain, Menu } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { leerEnlace } = require("./enlace.js");

// Modo de prueba: LAICA_CAPTURA=archivo.png guarda una captura de la ventana y cierra.
const CAPTURA = process.env.LAICA_CAPTURA;

if (!CAPTURA) {
  // Registra laica:// para que el botón de la app web pueda abrir esta app.
  if (process.defaultApp) {
    app.setAsDefaultProtocolClient("laica", process.execPath, [path.resolve(process.argv[1])]);
  } else {
    app.setAsDefaultProtocolClient("laica");
  }
}

const enlaceDe = (argv) => argv.find((a) => a.startsWith("laica://"));
let ventana = null;
let listo = false;
let pendiente = null;

function enviar(canal, datos) {
  if (listo) ventana.webContents.send(canal, datos);
  else pendiente = [canal, datos];
}

function mostrar(pedido) {
  const punto = pedido.x != null && pedido.y != null
    ? { x: Math.round(pedido.x), y: Math.round(pedido.y) }
    : screen.getCursorScreenPoint();
  // El área de trabajo deja fuera la barra de tareas: así Laica camina sobre ella.
  const zona = screen.getDisplayNearestPoint(punto).workArea;
  const datos = { ...pedido, x: punto.x - zona.x, y: punto.y - zona.y };

  if (!ventana) {
    ventana = new BrowserWindow({
      ...zona,
      transparent: true,
      frame: false,
      resizable: false,
      movable: false,
      skipTaskbar: true,
      hasShadow: false,
      focusable: false,
      fullscreenable: false,
      alwaysOnTop: true,
      backgroundColor: "#00000000",
      webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, sandbox: true, backgroundThrottling: false },
    });
    ventana.setAlwaysOnTop(true, "screen-saver");
    ventana.setIgnoreMouseEvents(true, { forward: true });
    ventana.webContents.on("did-finish-load", () => {
      listo = true;
      if (pendiente) ventana.webContents.send(...pendiente);
      pendiente = null;
    });
    ventana.webContents.on("console-message", (_e, _nivel, texto) => console.log("[laica]", texto));
    ventana.on("closed", () => { ventana = null; listo = false; });
    ventana.loadFile(path.join(__dirname, "index.html"));
  } else {
    ventana.setBounds(zona);
  }
  enviar("salir", datos);

  if (CAPTURA) {
    setTimeout(async () => {
      const info = await ventana.webContents.executeJavaScript(
        `JSON.stringify({ ...window.laicaDepurar?.(), definida: !!customElements.get("laica-mascota"), sombra: !!document.querySelector("laica-mascota").shadowRoot,
          mueve: document.getElementById("laica").style.transform,
          esqueleto: !!document.querySelector("laica-mascota")._rig && document.querySelector("laica-mascota").shadowRoot.querySelector(".foto")?.classList.contains("rig-on"), burbuja: document.querySelector(".burbuja").textContent,
          tam: [innerWidth, innerHeight] })`);
      console.log("[laica] estado", info);
      const img = await ventana.webContents.capturePage();
      fs.writeFileSync(CAPTURA, img.toPNG());
      console.log("[laica] captura guardada", CAPTURA);
      app.quit();
    }, Number(process.env.LAICA_ESPERA || 2500));
  }
}

function atender(url) {
  const pedido = leerEnlace(url || "laica://salir");
  if (pedido.accion === "volver") app.quit();
  else mostrar(pedido);
}

ipcMain.on("raton", (_e, atrapar) => ventana?.setIgnoreMouseEvents(!atrapar, { forward: true }));
ipcMain.on("menu", (_e, opciones = {}) => {
  if (!ventana) return;
  const orden = (o) => () => ventana?.webContents.send("orden", o);
  Menu.buildFromTemplate([
    { label: "Explorar", click: orden("explorar") },
    { label: "Caminar por la barra de tareas", click: orden("caminar") },
    { label: "Esconderse y asomarse", click: orden("asomarse") },
    { label: "Olfatear", click: orden("oler") },
    { label: "Rastrear", click: orden("rastrear") },
    { label: "Pararse en dos patas", click: orden("parada") },
    { type: "separator" },
    { label: "Gravedad", type: "checkbox", checked: Boolean(opciones.gravedad), click: orden("gravedad") },
    { label: "En cuatro patas", type: "checkbox", checked: Boolean(opciones.cuatro), click: orden("cuatro") },
    { label: "Ladridos", type: "checkbox", checked: opciones.sonido !== false, click: orden("sonido") },
    { type: "separator" },
    { label: "Volver al navegador", click: () => app.quit() },
  ]).popup({ window: ventana });
});

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (_e, argv) => atender(enlaceDe(argv)));
  app.on("open-url", (e, url) => { e.preventDefault(); app.whenReady().then(() => atender(url)); });
  app.whenReady().then(() => atender(enlaceDe(process.argv)));
  app.on("window-all-closed", () => app.quit());
}
