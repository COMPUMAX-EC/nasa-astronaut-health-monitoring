import { readFileSync } from "node:fs";
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

// base "./" permite publicar la app en cualquier carpeta (GitHub Pages, USB, intranet de la nave).
// fs.allow ".." deja importar la mascota desde ../assets/laica sin duplicarla.
export default defineConfig({
  base: "./",
  plugins: [react(), serviceWorker()],
  server: { port: 5173, fs: { allow: [".."] } },
});
