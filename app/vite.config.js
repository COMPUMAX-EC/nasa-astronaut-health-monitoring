import { createReadStream, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Genera sw.js con la lista de archivos de la compilación, para que la app
// funcione sin conexión desde la primera visita.
function serviceWorker() {
  return {
    name: "laica-service-worker",
    apply: "build",
    generateBundle(_, bundle) {
      const archivos = Object.keys(bundle).map((f) => "./" + f);
      const version = createHash("sha1").update(archivos.join("|")).digest("hex").slice(0, 8);
      const plantilla = readFileSync(new URL("./sw.plantilla.js", import.meta.url), "utf8");
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: plantilla.replace("__VERSION__", version).replace("__ARCHIVOS__", JSON.stringify(archivos)),
      });
    },
  };
}

// Detector de gestos de Laica (MediaPipe Face Landmarker): el motor WebAssembly sale del paquete
// @mediapipe/tasks-vision y el modelo de modelos/. Se sirven como archivos propios en mediapipe/
// (en desarrollo y en la compilación) para que la cámara funcione sin internet ni CDN.
function mediapipeLocal() {
  const de = (r) => fileURLToPath(new URL(r, import.meta.url));
  const archivos = {
    "mediapipe/vision_wasm_internal.js": de("./node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_internal.js"),
    "mediapipe/vision_wasm_internal.wasm": de("./node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_internal.wasm"),
    "mediapipe/face_landmarker.task": de("./modelos/face_landmarker.task"),
  };
  const tipo = (n) => (n.endsWith(".wasm") ? "application/wasm" : n.endsWith(".js") ? "text/javascript" : "application/octet-stream");
  return {
    name: "laica-mediapipe-local",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const n = decodeURIComponent((req.url || "").split("?")[0]).replace(/^\/+/, "");
        const f = archivos[n];
        if (!f || !existsSync(f)) return next();
        res.setHeader("Content-Type", tipo(n));
        createReadStream(f).pipe(res);
      });
    },
    generateBundle() {
      for (const [n, f] of Object.entries(archivos)) {
        if (existsSync(f)) this.emitFile({ type: "asset", fileName: n, source: readFileSync(f) });
        else this.warn(`Falta ${n}: la cámara de Laica no funcionará (ver app/modelos/README.md).`);
      }
    },
  };
}

// base "./" permite publicar la app en cualquier carpeta (GitHub Pages, USB, intranet de la nave).
// fs.allow ".." deja importar la mascota desde ../assets/laica sin duplicarla.
export default defineConfig({
  base: "./",
  plugins: [react(), mediapipeLocal(), serviceWorker()],
  server: { port: 5173, fs: { allow: [".."] } },
});
