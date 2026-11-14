import { test } from "node:test";
import assert from "node:assert/strict";
import { ordenarVoces, prepararTexto, dividirFrases, etiquetaVoz } from "../src/voz/voces.js";

const VOCES = [
  { name: "Microsoft Helena - Spanish (Spain)", lang: "es-ES", localService: true },
  { name: "Microsoft Sabina Desktop - Spanish (Mexico)", lang: "es-MX", localService: true },
  { name: "Google español de Estados Unidos", lang: "es-US", localService: false },
  { name: "Microsoft Dalia Online (Natural) - Spanish (Mexico)", lang: "es-MX", localService: false },
  { name: "Microsoft Andrea Online (Natural) - Spanish (Ecuador)", lang: "es-EC", localService: false },
  { name: "Microsoft Zira - English (United States)", lang: "en-US", localService: true },
];

test("prefiere voces naturales y el acento local; descarta otros idiomas", () => {
  const orden = ordenarVoces(VOCES, "es-EC").map((v) => v.name);
  assert.match(orden[0], /Andrea.*Natural.*Ecuador/);
  assert.match(orden[1], /Dalia.*Natural/);
  assert.match(orden[2], /Google/);
  assert.ok(!orden.some((n) => /English/.test(n)));
  assert.match(orden.at(-1), /Desktop|Helena/);
});

test("dice las abreviaturas como una persona", () => {
  assert.equal(prepararTexto("Presión 165/105 mmHg."), "Presión 165 sobre 105.");
  assert.equal(prepararTexto("FC de 63 lpm"), "frecuencia cardiaca de 63 latidos por minuto");
  assert.equal(prepararTexto("Glucosa 128 mg/dL, 36.8 °C"), "Glucosa 128 miligramos por decilitro, 36 punto 8 grados");
  assert.equal(prepararTexto("Dormiste 5.5 h 🟢"), "Dormiste 5 punto 5 horas");
  assert.equal(prepararTexto("WHO-5 de 40/100"), "índice de bienestar WHO 5 de 40 de 100");
});

test("divide en frases para hablar con pausas", () => {
  assert.deepEqual(dividirFrases("Presión 165/105 mmHg. Siéntate. ¿Repetimos?"),
    ["Presión 165 sobre 105.", "Siéntate.", "¿Repetimos?"]);
});

test("etiqueta legible para el selector", () => {
  assert.equal(etiquetaVoz(VOCES[4]), "Andrea (es-EC) · natural");
});
