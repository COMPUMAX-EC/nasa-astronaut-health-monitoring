// Bordes de las ventanas de otras aplicaciones, tal como se ven en pantalla: el borde de arriba
// de cada ventana es un piso donde Laica puede pararse y caminar; los costados son paredes y el
// borde de abajo es un techo. Una ventana tapa los bordes de las que están detrás, así que solo
// cuentan los tramos visibles. Funciona en la página (window.LaicaBordes) y en Node (pruebas).

(function (raiz) {
  // Quita de [a, b] los tramos tapados por los intervalos de "tapas". Devuelve tramos visibles.
  function restar(a, b, tapas) {
    let tramos = [[a, b]];
    for (const [c, d] of tapas) {
      const nuevos = [];
      for (const [p, q] of tramos) {
        if (d <= p || c >= q) { nuevos.push([p, q]); continue; }
        if (c > p) nuevos.push([p, c]);
        if (d < q) nuevos.push([d, q]);
      }
      tramos = nuevos;
      if (!tramos.length) break;
    }
    return tramos;
  }

  /**
   * ventanas: [{ id, x, y, w, h }] en coordenadas de la pantalla de Laica, de la de más arriba a
   * la de más abajo. W, H: tamaño de esa pantalla. Devuelve { pisos, paredes, techos }:
   *   pisos:   { id, x1, x2, y }  (borde de arriba visible, donde se puede parar)
   *   paredes: { id, x, y1, y2, lado: "izq" | "der" }
   *   techos:  { id, x1, x2, y }  (borde de abajo visible)
   */
  function calcularBordes(ventanas, W, H, { minPiso = 90, margen = 3, minTramo = 60 } = {}) {
    const pisos = [], paredes = [], techos = [];
    ventanas.forEach((v, i) => {
      const encima = ventanas.slice(0, i);
      const x1 = Math.max(0, v.x), x2 = Math.min(W, v.x + v.w);
      const y1 = Math.max(0, v.y), y2 = Math.min(H, v.y + v.h);
      if (x2 - x1 < minTramo || y2 - y1 < 20) return; // fuera de esta pantalla
      // Tapas horizontales: ventanas de encima que cubren esa altura.
      const tapasEn = (y) => encima.filter((o) => o.y < y && o.y + o.h > y).map((o) => [o.x, o.x + o.w]);
      const tapasVert = (x) => encima.filter((o) => o.x < x && o.x + o.w > x).map((o) => [o.y, o.y + o.h]);

      // Piso: el borde de arriba, si no está pegado al techo de la pantalla (ventana maximizada).
      if (v.y >= minPiso && v.y < H - 40) {
        for (const [a, b] of restar(x1, x2, tapasEn(v.y))) if (b - a >= minTramo) pisos.push({ id: v.id, x1: a, x2: b, y: v.y });
      }
      // Techo: el borde de abajo, si no toca el suelo de la pantalla.
      const abajo = v.y + v.h;
      if (abajo > margen && abajo < H - margen) {
        for (const [a, b] of restar(x1, x2, tapasEn(abajo))) if (b - a >= minTramo) techos.push({ id: v.id, x1: a, x2: b, y: abajo });
      }
      // Paredes: los costados, salvo los que coinciden con el borde de la pantalla.
      for (const [x, lado] of [[v.x, "izq"], [v.x + v.w, "der"]]) {
        if (x <= margen || x >= W - margen) continue;
        for (const [a, b] of restar(y1, y2, tapasVert(x))) if (b - a >= 40) paredes.push({ id: v.id, x, y1: a, y2: b, lado });
      }
    });
    return { pisos, paredes, techos };
  }

  const api = { calcularBordes, restar };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else raiz.LaicaBordes = api;
})(typeof window !== "undefined" ? window : globalThis);
