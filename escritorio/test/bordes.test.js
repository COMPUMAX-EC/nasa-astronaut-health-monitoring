const test = require("node:test");
const assert = require("node:assert/strict");
const { calcularBordes, restar } = require("../bordes.js");

const W = 1366, H = 728;

test("restar quita los tramos tapados", () => {
  assert.deepEqual(restar(0, 100, [[20, 40], [60, 200]]), [[0, 20], [40, 60]]);
  assert.deepEqual(restar(0, 100, [[-10, 200]]), []);
  assert.deepEqual(restar(0, 100, []), [[0, 100]]);
});

test("una ventana sola da piso arriba, techo abajo y dos paredes", () => {
  const b = calcularBordes([{ id: "a", x: 300, y: 200, w: 500, h: 300 }], W, H);
  assert.deepEqual(b.pisos, [{ id: "a", x1: 300, x2: 800, y: 200 }]);
  assert.deepEqual(b.techos, [{ id: "a", x1: 300, x2: 800, y: 500 }]);
  assert.deepEqual(b.paredes.map((p) => [p.lado, p.x, p.y1, p.y2]), [["izq", 300, 200, 500], ["der", 800, 200, 500]]);
});

test("una ventana maximizada no da piso ni paredes (coinciden con la pantalla)", () => {
  const b = calcularBordes([{ id: "m", x: 0, y: 0, w: W, h: H }], W, H);
  assert.equal(b.pisos.length, 0);
  assert.equal(b.paredes.length, 0);
  assert.equal(b.techos.length, 0);
});

test("la ventana de encima tapa el borde de la de atrás", () => {
  const b = calcularBordes([
    { id: "arriba", x: 400, y: 100, w: 300, h: 400 }, // tapa el centro del borde de "atras"
    { id: "atras", x: 200, y: 250, w: 700, h: 300 },
  ], W, H);
  const pisoAtras = b.pisos.filter((p) => p.id === "atras").map((p) => [p.x1, p.x2]);
  assert.deepEqual(pisoAtras, [[200, 400], [700, 900]]);
});

test("detrás de una ventana maximizada no queda ningún borde", () => {
  const b = calcularBordes([
    { id: "max", x: 0, y: 0, w: W, h: H },
    { id: "chica", x: 300, y: 200, w: 400, h: 300 },
  ], W, H);
  assert.equal(b.pisos.length + b.paredes.length + b.techos.length, 0);
});

test("ignora ventanas de otra pantalla", () => {
  const b = calcularBordes([{ id: "otra", x: 1500, y: 200, w: 600, h: 400 }], W, H);
  assert.equal(b.pisos.length + b.paredes.length + b.techos.length, 0);
});
