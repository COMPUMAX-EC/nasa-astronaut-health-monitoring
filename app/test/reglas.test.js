import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluar } from "../src/motor/reglas.js";
import { generarMision } from "../src/datos/generador.js";

const { mediciones, eventos } = generarMision({ inicio: "2026-10-16T00:00:00.000Z" });
const estado = (dia, extra = []) => evaluar({ mediciones: [...mediciones, ...extra], eventos, dia });

function manual(indicador, valor, dia = 29) {
  return { id: `m-${indicador}`, indicador, valor, dia, fuente: "manual", timestamp: "2026-11-14T00:00:00.000Z" };
}

test("el último día de la simulación está en verde", () => {
  const e = estado(29);
  assert.equal(e.nivel, "verde", JSON.stringify(e.alertas));
  assert.equal(e.estadoLaica, "reposo");
});

test("165/105 mmHg da alerta roja y Laica pasa a urgente", () => {
  const e = estado(29, [manual("pa_sis", 165), manual("pa_dia", 105)]);
  assert.equal(e.porIndicador.pa_sis, "rojo");
  assert.equal(e.porIndicador.pa_dia, "rojo");
  assert.equal(e.estadoLaica, "urgente");
  assert.ok(e.alertas[0].medico, "una alerta roja pide avisar al médico de vuelo");
});

test("la racha de mal sueño enciende fatiga y FC", () => {
  const e = estado(9);
  assert.equal(e.porIndicador.sueno, "amarillo");
  assert.notEqual(e.porIndicador.fc, "verde");
  assert.equal(e.estadoLaica, "alerta");
});

test("la tormenta solar pone a Laica en radiación", () => {
  const e = estado(17);
  assert.ok(e.radiacion);
  assert.equal(e.estadoLaica, "radiacion");
  assert.equal(estado(18).radiacion, false);
});

test("la semana de estrés baja el WHO-5 y sube la presión", () => {
  assert.equal(estado(21).porIndicador.who5, "amarillo");
  assert.ok(["naranja", "rojo"].includes(estado(25).porIndicador.pa_sis));
  assert.equal(estado(24).porIndicador.glucosa, "naranja");
});

test("umbrales de glucosa, temperatura y SpO2", () => {
  assert.equal(estado(29, [manual("glucosa", 50)]).porIndicador.glucosa, "rojo");
  assert.equal(estado(29, [manual("temp", 38.2)]).porIndicador.temp, "naranja");
  assert.equal(estado(29, [manual("spo2", 92)]).porIndicador.spo2, "naranja");
});

test("las alertas salen ordenadas de la más grave a la menos grave", () => {
  const e = estado(29, [manual("temp", 37.6), manual("pa_sis", 170), manual("pa_dia", 95)]);
  assert.deepEqual(e.alertas.map((a) => a.nivel), ["rojo", "amarillo"]);
});

import { validar } from "../src/motor/validacion.js";

test("la validación rechaza errores de tipeo y presión incompleta", () => {
  assert.deepEqual(validar({ pa_sis: "165", pa_dia: "105" }), {});
  assert.ok(validar({ pa_sis: "1650", pa_dia: "105" }).pa_sis);
  assert.ok(validar({ pa_sis: "165" }).pa_dia);
  assert.ok(validar({ pa_sis: "80", pa_dia: "90" }).pa_sis);
  assert.deepEqual(validar({ temp: "36,8" }), {});
});
