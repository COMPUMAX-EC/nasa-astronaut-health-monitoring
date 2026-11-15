import { test } from "node:test";
import assert from "node:assert/strict";
import { aMapa, leerCara, crearAnimo } from "../src/camara/gestos.js";

const cara = (valores) => leerCara(valores);
// Simula la cámara a 15 cuadros por segundo durante ms milisegundos.
function correr(animo, valores, ms, t0 = 0) {
  const eventos = [];
  for (let t = t0; t <= t0 + ms; t += 66) {
    const e = animo(cara(valores), t);
    if (e) eventos.push(e);
  }
  return eventos;
}

const NEUTRA = {};
const SONRISA = { mouthSmileLeft: 0.8, mouthSmileRight: 0.8 };
const RISA = { mouthSmileLeft: 0.85, mouthSmileRight: 0.85, jawOpen: 0.5 };
const TRISTE = { mouthFrownLeft: 0.45, mouthFrownRight: 0.4, browInnerUp: 0.5 };

test("aMapa y leerCara promedian ambos lados", () => {
  const m = aMapa([{ categoryName: "mouthSmileLeft", score: 0.6 }, { categoryName: "mouthSmileRight", score: 0.4 }]);
  assert.equal(leerCara(m).sonrisa, 0.5);
  assert.equal(leerCara({}).giro, 0);
});

test("una cara neutra no dispara nada", () => {
  assert.deepEqual(correr(crearAnimo(), NEUTRA, 5000), []);
});

test("reírse dispara risa una sola vez y no repite como sonrisa", () => {
  assert.deepEqual(correr(crearAnimo(), RISA, 3000), ["risa"]);
});

test("una sonrisa sostenida dispara sonrisa; un destello corto no", () => {
  assert.deepEqual(correr(crearAnimo(), SONRISA, 2000), ["sonrisa"]);
  assert.deepEqual(correr(crearAnimo(), SONRISA, 300), []);
});

test("la tristeza necesita durar unos segundos y luego espera antes de repetir", () => {
  const animo = crearAnimo();
  assert.deepEqual(correr(animo, TRISTE, 1500), []);
  assert.deepEqual(correr(animo, TRISTE, 3000, 1566), ["tristeza"]);
  assert.deepEqual(correr(animo, TRISTE, 20000, 4700), []);
});

test("sin cara se reinicia la cuenta del gesto", () => {
  const animo = crearAnimo();
  correr(animo, TRISTE, 2000);
  animo(null, 2100);
  assert.deepEqual(correr(animo, TRISTE, 2000, 2200), []);
});

test("la matriz de la cabeza da giro e inclinación entre -1 y 1", () => {
  const giro = (rad) => { // rotación sobre el eje Y
    const c = Math.cos(rad), s = Math.sin(rad);
    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  };
  const a = leerCara({}, giro(0.3)), b = leerCara({}, giro(-0.3));
  assert.ok(Math.abs(a.giro) > 0.4 && Math.abs(a.giro) <= 1);
  assert.equal(Math.sign(a.giro), -Math.sign(b.giro));
  assert.equal(leerCara({}, giro(2)).giro, Math.sign(leerCara({}, giro(2)).giro));
});
