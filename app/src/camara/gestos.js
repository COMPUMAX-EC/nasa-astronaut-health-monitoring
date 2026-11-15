// Traduce lo que ve la cámara (los "blendshapes" de la cara, valores 0..1, y la matriz de
// orientación de la cabeza) en señales simples para Laica: sonrisa, risa, tristeza, sorpresa,
// boca abierta y hacia dónde gira o inclina la cabeza. Funciones puras: se prueban sin cámara.
// Nada de esto se guarda ni sale del equipo; es solo para que Laica reaccione en el momento.

const limitar = (v, a = -1, b = 1) => Math.max(a, Math.min(b, v));

/** Convierte la lista de categorías de MediaPipe en un objeto { nombre: valor }. */
export function aMapa(categorias = []) {
  const m = {};
  for (const c of categorias) m[c.categoryName] = c.score;
  return m;
}

/**
 * Lee una cara: b = mapa de blendshapes, matriz = 16 números (columna mayor) o null.
 * giro e inclinacion van de -1 a 1, en el sentido de la imagen en espejo (como se ve uno en
 * la pantalla): giro > 0 = la persona gira hacia su derecha, inclinacion > 0 = ladea la cabeza
 * hacia su derecha.
 */
export function leerCara(b, matriz = null) {
  const v = (k) => b[k] ?? 0;
  const prom = (a, c) => (v(a) + v(c)) / 2;
  const cara = {
    sonrisa: prom("mouthSmileLeft", "mouthSmileRight"),
    tristeza: prom("mouthFrownLeft", "mouthFrownRight"),
    cejasTristes: v("browInnerUp"),
    cejasArriba: (v("browInnerUp") + prom("browOuterUpLeft", "browOuterUpRight")) / 2,
    ceño: prom("browDownLeft", "browDownRight"),
    bocaAbierta: v("jawOpen"),
    ojosCerrados: prom("eyeBlinkLeft", "eyeBlinkRight"),
    giro: 0, inclinacion: 0, cabeceo: 0,
  };
  if (matriz && matriz.length >= 16) {
    // Rotación R en columna mayor: r[fila][col] = m[col * 4 + fila].
    const r = (f, c) => matriz[c * 4 + f];
    const yaw = Math.asin(limitar(-r(2, 0)));
    const roll = Math.atan2(r(1, 0), r(0, 0));
    const pitch = Math.atan2(r(2, 1), r(2, 2));
    cara.giro = limitar(-yaw / 0.6);
    cara.inclinacion = limitar(-roll / 0.5);
    cara.cabeceo = limitar(pitch / 0.5);
  }
  return cara;
}

/**
 * Detector de ánimo con memoria: suaviza los valores, exige que el gesto dure un poco
 * (no reacciona a un parpadeo) y deja pasar un tiempo entre reacciones del mismo tipo.
 * actualizar(cara, t) devuelve "risa", "sonrisa", "tristeza", "sorpresa" o null.
 */
export function crearAnimo(opciones = {}) {
  const o = {
    risa: { sostener: 400, espera: 6000 },
    sonrisa: { sostener: 900, espera: 9000 },
    tristeza: { sostener: 2500, espera: 45000 },
    sorpresa: { sostener: 250, espera: 4000 },
    ...opciones,
  };
  const s = { sonrisa: 0, tristeza: 0, cejasTristes: 0, cejasArriba: 0, boca: 0 };
  const desde = {};
  const ultima = {};
  let tPrev = null;

  const condiciones = () => ({
    risa: s.sonrisa > 0.55 && s.boca > 0.22,
    sonrisa: s.sonrisa > 0.5,
    // Boca hacia abajo, sin sonrisa; las cejas levantadas al centro refuerzan la señal.
    tristeza: s.sonrisa < 0.15 && (s.tristeza > 0.3 || (s.tristeza > 0.15 && s.cejasTristes > 0.35)),
    sorpresa: s.cejasArriba > 0.55 && s.boca > 0.35 && s.sonrisa < 0.3,
  });

  return function actualizar(cara, t) {
    if (!cara) { for (const k in desde) delete desde[k]; tPrev = null; return null; }
    const dt = tPrev == null ? 0.1 : Math.min(0.5, (t - tPrev) / 1000);
    tPrev = t;
    const a = 1 - Math.exp(-dt / 0.15); // suavizado ~150 ms
    s.sonrisa += (cara.sonrisa - s.sonrisa) * a;
    s.tristeza += (cara.tristeza - s.tristeza) * a;
    s.cejasTristes += (cara.cejasTristes - s.cejasTristes) * a;
    s.cejasArriba += (cara.cejasArriba - s.cejasArriba) * a;
    s.boca += (cara.bocaAbierta - s.boca) * a;

    const c = condiciones();
    // Orden de prioridad: la risa gana a la sonrisa, y cualquiera de las dos anula la tristeza.
    for (const tipo of ["risa", "sorpresa", "sonrisa", "tristeza"]) {
      if (!c[tipo]) { delete desde[tipo]; continue; }
      desde[tipo] ??= t;
      const listo = t - desde[tipo] >= o[tipo].sostener;
      const libre = ultima[tipo] == null || t - ultima[tipo] >= o[tipo].espera;
      if (listo && libre) {
        ultima[tipo] = t;
        if (tipo === "risa") ultima.sonrisa = t; // tras reírse no repite con "sonrisa"
        delete desde[tipo];
        return tipo;
      }
      if (tipo === "risa" || tipo === "sonrisa") break; // mientras sonríe no evalúa tristeza
    }
    return null;
  };
}
