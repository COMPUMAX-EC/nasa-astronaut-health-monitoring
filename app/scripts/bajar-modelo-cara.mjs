// Descarga una sola vez el modelo de MediaPipe Face Landmarker (≈3.6 MB, licencia Apache 2.0)
// a app/modelos/. Después la app lo sirve desde sus propios archivos y funciona sin internet.
// Uso: npm run modelo-cara
import { mkdir, writeFile, stat } from "node:fs/promises";

const URL_MODELO = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const destino = new URL("../modelos/face_landmarker.task", import.meta.url);

try {
  const s = await stat(destino);
  if (s.size > 1_000_000) { console.log("El modelo ya está en app/modelos/face_landmarker.task"); process.exit(0); }
} catch { /* no existe todavía */ }

const res = await fetch(URL_MODELO);
if (!res.ok) throw new Error(`No se pudo descargar el modelo (HTTP ${res.status})`);
const datos = Buffer.from(await res.arrayBuffer());
await mkdir(new URL("../modelos/", import.meta.url), { recursive: true });
await writeFile(destino, datos);
console.log(`Modelo guardado: app/modelos/face_landmarker.task (${(datos.length / 1e6).toFixed(1)} MB)`);
