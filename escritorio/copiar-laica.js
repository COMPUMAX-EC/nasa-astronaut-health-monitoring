// Copia a Laica (componente, fotos y sonidos) desde assets/laica a escritorio/laica, para que la
// app de escritorio sea autónoma y se pueda empaquetar como .exe. Se ejecuta solo antes de
// "npm start" y "npm run exe".
const fs = require("node:fs");
const path = require("node:path");

const origen = path.join(__dirname, "..", "assets", "laica");
const destino = path.join(__dirname, "laica");
fs.rmSync(destino, { recursive: true, force: true });
fs.mkdirSync(path.join(destino, "canva"), { recursive: true });
fs.mkdirSync(path.join(destino, "sonidos"), { recursive: true });
fs.copyFileSync(path.join(origen, "laica.js"), path.join(destino, "laica.js"));
for (const f of fs.readdirSync(path.join(origen, "canva"))) {
  if (f.endsWith(".webp")) fs.copyFileSync(path.join(origen, "canva", f), path.join(destino, "canva", f));
}
for (const f of fs.readdirSync(path.join(origen, "sonidos"))) {
  fs.copyFileSync(path.join(origen, "sonidos", f), path.join(destino, "sonidos", f));
}
console.log("Laica copiada a escritorio/laica");
