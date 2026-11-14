import { test } from "node:test";
import assert from "node:assert/strict";
import { generarMision, inicioParaHoy } from "../src/datos/generador.js";
import { INDICADORES } from "../src/datos/indicadores.js";

const INICIO = "2026-10-16T00:00:00.000Z";

test("es determinista con la misma semilla", () => {
  assert.deepEqual(generarMision({ inicio: INICIO }), generarMision({ inicio: INICIO }));
});

test("genera 30 días de mediciones diarias", () => {
  const { mediciones } = generarMision({ inicio: INICIO });
  for (const clave of ["fc", "pa_sis", "pa_dia", "temp", "sueno", "animo", "spo2", "dosis"]) {
    assert.equal(mediciones.filter((m) => m.indicador === clave).length, 30, clave);
  }
  assert.equal(mediciones.filter((m) => m.indicador === "glucosa").length, 6); // 5 semanales + 1 ante síntomas
});

test("los ids son únicos y cada medición enlaza con la matriz", () => {
  const { mediciones } = generarMision({ inicio: INICIO });
  assert.equal(new Set(mediciones.map((m) => m.id)).size, mediciones.length);
  for (const m of mediciones) assert.equal(m.matriz_id, INDICADORES[m.indicador].matriz);
});

test("refleja los eventos del guion", () => {
  const { mediciones } = generarMision({ inicio: INICIO });
  const v = (clave, dia) => mediciones.find((m) => m.indicador === clave && m.dia === dia).valor;
  assert.ok(v("sueno", 8) < 6, "mal sueño el día 8");
  assert.ok(v("pa_sis", 25) >= 145, "presión alta el día 25");
  assert.ok(v("dosis", 17) - v("dosis", 16) > 5, "salto de dosis por la tormenta solar");
  assert.ok(v("who5", 21) < 50, "WHO-5 bajo en la semana de estrés");
});

test("los valores quedan en rangos fisiológicos", () => {
  const { mediciones } = generarMision({ inicio: INICIO });
  for (const m of mediciones.filter((x) => x.indicador === "animo")) assert.ok(m.valor >= 1 && m.valor <= 5);
  for (const m of mediciones.filter((x) => x.indicador === "spo2")) assert.ok(m.valor >= 90 && m.valor <= 100);
});

test("inicioParaHoy deja el último día en la fecha actual", () => {
  const hoy = new Date("2026-11-14T15:30:00Z");
  assert.equal(inicioParaHoy(30, hoy), INICIO);
});
