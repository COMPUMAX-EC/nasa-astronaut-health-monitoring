// Laica en el escritorio: una ventana transparente, sin marco y siempre encima que cubre la
// pantalla. Los clics pasan a través de ella salvo cuando el cursor está sobre Laica.
// La app web la llama con enlaces laica:// (ver enlace.js).

const { app, BrowserWindow, screen, ipcMain, Menu, Tray, globalShortcut, nativeImage } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { leerEnlace } = require("./enlace.js");
const { vigilarVentanas } = require("./ventanas.js");

// Modo de prueba: LAICA_CAPTURA=archivo.png guarda una captura de la ventana y cierra.
const CAPTURA = process.env.LAICA_CAPTURA;

if (!CAPTURA) {
  // Registra laica:// para que el botón de la app web pueda abrir esta app.
  if (process.defaultApp) {
    app.setAsDefaultProtocolClient("laica", process.execPath, [path.resolve(process.argv[1])]);
  } else {
    // El .exe portable se descomprime en una carpeta temporal en cada arranque: se registra el
    // .exe original para que el enlace siga funcionando después.
    app.setAsDefaultProtocolClient("laica", process.env.PORTABLE_EXECUTABLE_FILE || process.execPath, []);
  }
}

const enlaceDe = (argv) => argv.find((a) => a.startsWith("laica://"));
let ventana = null;
let listo = false;
let zonaActual = null;
let ultimasVentanas = [];
let pararVigia = () => {};
let bandeja = null;
let pausada = false;
const ATAJO = "Control+Alt+L";

// Pausa: Laica se esconde (sin ladrar ni recordatorios) hasta que la reactives
// desde el ícono junto al reloj, con Ctrl+Alt+L o con el botón de la app web.
function pausar(si = !pausada) {
  if (!ventana) return;
  pausada = si;
  if (si) ventana.hide();
  else { ventana.showInactive(); ventana.setAlwaysOnTop(true, "screen-saver"); }
  ventana.webContents.send("orden", si ? "pausa" : "seguir");
  actualizarBandeja();
}

function actualizarBandeja() {
  if (!bandeja) return;
  bandeja.setToolTip(pausada ? "Laica (en pausa)" : "Laica");
  bandeja.setContextMenu(Menu.buildFromTemplate([
    { label: pausada ? "Reanudar a Laica" : "Pausar a Laica", accelerator: ATAJO, click: () => pausar() },
    { type: "separator" },
    { label: "Salir (volver al navegador)", click: () => app.quit() },
  ]));
}

function crearBandeja() {
  if (bandeja || CAPTURA) return;
  bandeja = new Tray(nativeImage.createFromPath(path.join(__dirname, "icono-bandeja.png")));
  bandeja.on("click", () => pausar());
  actualizarBandeja();
  globalShortcut.register(ATAJO, () => pausar());
}

// Las ventanas de los demás programas, en píxeles de la pantalla de Laica (DIP), para que
// camine sobre sus bordes. Windows las entrega en píxeles físicos: se convierten con la escala.
function enviarVentanas() {
  if (!ventana || !listo || !zonaActual) return;
  const lista = ultimasVentanas.map((v) => {
    const r = process.platform === "win32" ? screen.screenToDipRect(null, { x: v.x, y: v.y, width: v.w, height: v.h }) : { x: v.x, y: v.y, width: v.w, height: v.h };
    return { id: v.id, x: r.x - zonaActual.x, y: r.y - zonaActual.y, w: r.width, h: r.height };
  });
  ventana.webContents.send("ventanas", lista);
}
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
  zonaActual = zona;
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
      enviarVentanas();
    });
    ventana.webContents.on("console-message", (_e, _nivel, texto) => console.log("[laica]", texto));
    ventana.on("closed", () => { ventana = null; listo = false; pararVigia(); });
    if (!CAPTURA || process.env.LAICA_VENTANAS) pararVigia = vigilarVentanas((lista) => { ultimasVentanas = lista; enviarVentanas(); });
    ventana.loadFile(path.join(__dirname, "index.html"));
    crearBandeja();
  } else {
    ventana.setBounds(zona);
    if (pausada) pausar(false); // el botón de la app web también la reactiva
  }
  enviar("salir", datos);

  if (CAPTURA && process.env.LAICA_PRUEBA) {
    // Prueba: ventanas falsas (JSON) en lugar de las reales, y el estado de Laica cada 250 ms.
    const falsas = process.env.LAICA_PRUEBA;
    const t = setInterval(() => {
      if (!ventana || !listo) return;
      ventana.webContents.executeJavaScript(`window.laicaVentanas?.(${falsas}); JSON.stringify(window.laicaDepurar?.())`)
        .then((e) => console.log("[prueba]", e)).catch(() => {});
    }, 250);
    app.on("will-quit", () => clearInterval(t));
  }
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
    { label: `Pausar (${ATAJO.replace("Control", "Ctrl")})`, click: () => pausar(true) },
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
  app.on("will-quit", () => { pararVigia(); globalShortcut.unregisterAll(); });
}
