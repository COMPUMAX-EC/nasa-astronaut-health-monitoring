import { test } from "node:test";
import assert from "node:assert/strict";
import { siguiente, PREGUNTAS, CASUAL } from "../src/voz/charla.js";

function conversar(n) {
  const historial = [];
  for (let i = 0; i < n; i++) {
    const s = siguiente(historial);
    historial.push({ tipo: s.tipo === "casual" ? "casual" : s.area, id: s.id });
  }
  return historial;
}

test("mezcla dos charlas casuales y una pregunta de salud", () => {
  const h = conversar(9).map((x) => (x.tipo === "casual" ? "c" : "s")).join("");
  assert.equal(h, "ccsccsccs");
});

test("las preguntas de salud alternan mente y cuerpo", () => {
  const areas = conversar(12).filter((x) => x.tipo !== "casual").map((x) => x.tipo);
  for (let i = 1; i < areas.length; i++) assert.notEqual(areas[i], areas[i - 1]);
});

test("no repite lo dicho recientemente", () => {
  const h = conversar(8).map((x) => x.id);
  assert.equal(new Set(h).size, h.length);
});

test("cada pregunta tiene respuestas para todas sus opciones y las graves piden ayuda", () => {
  for (const p of PREGUNTAS) {
    assert.ok(p.opciones.length >= 2, p.id);
    for (const o of p.opciones) assert.ok(o.etiqueta && o.respuesta, `${p.id}/${o.etiqueta}`);
    for (const o of p.opciones.filter((x) => x.cuidado)) assert.match(o.respuesta, /médico|apoyo|equipo/);
  }
  assert.ok(CASUAL.length >= 6);
});

test("solo el ánimo se guarda, en la escala 1 a 5", () => {
  const conDato = PREGUNTAS.flatMap((p) => p.opciones.filter((o) => o.guardar).map((o) => o.guardar));
  assert.deepEqual(conDato.map((d) => d.animo), [1, 2, 3, 4, 5]);
});
