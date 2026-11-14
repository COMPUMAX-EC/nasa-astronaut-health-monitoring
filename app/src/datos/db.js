// Almacenamiento local con IndexedDB: los datos de salud nunca salen del dispositivo.
// Si IndexedDB no está disponible (modo privado, vista previa), se usa memoria
// y la app sigue funcionando, aunque sin guardar entre sesiones.

const NOMBRE = "laica-salud";
const VERSION = 1;
const ALMACENES = ["mediciones", "eventos", "meta"];

let memoria = null; // respaldo en memoria
let promesaDB = null;

function abrir() {
  if (promesaDB) return promesaDB;
  promesaDB = new Promise((resolve) => {
    try {
      const req = indexedDB.open(NOMBRE, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("mediciones")) {
          const s = db.createObjectStore("mediciones", { keyPath: "id" });
          s.createIndex("indicador", "indicador");
          s.createIndex("timestamp", "timestamp");
        }
        if (!db.objectStoreNames.contains("eventos")) db.createObjectStore("eventos", { keyPath: "id" });
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "clave" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return promesaDB;
}

function usarMemoria() {
  if (!memoria) memoria = Object.fromEntries(ALMACENES.map((a) => [a, new Map()]));
  return memoria;
}

function tx(db, almacen, modo, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(almacen, modo);
    const s = t.objectStore(almacen);
    const r = fn(s);
    t.oncomplete = () => resolve(r?.result);
    t.onerror = () => reject(t.error);
  });
}

export async function guardarVarios(almacen, filas) {
  const db = await abrir();
  if (!db) { const m = usarMemoria()[almacen]; filas.forEach((f) => m.set(f.id ?? f.clave, f)); return; }
  await tx(db, almacen, "readwrite", (s) => { filas.forEach((f) => s.put(f)); });
}

export async function leerTodos(almacen) {
  const db = await abrir();
  if (!db) return [...usarMemoria()[almacen].values()];
  return tx(db, almacen, "readonly", (s) => s.getAll());
}

export async function vaciar() {
  const db = await abrir();
  if (!db) { memoria = null; return; }
  await Promise.all(ALMACENES.map((a) => tx(db, a, "readwrite", (s) => { s.clear(); })));
}

export async function leerMeta(clave) {
  const db = await abrir();
  if (!db) return usarMemoria().meta.get(clave)?.valor;
  const fila = await tx(db, "meta", "readonly", (s) => s.get(clave));
  return fila?.valor;
}

export async function guardarMeta(clave, valor) {
  await guardarVarios("meta", [{ clave, valor }]);
}

export async function persistente() {
  return (await abrir()) !== null;
}
