import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { leerCSV, indexarMatriz } from "../src/datos/csv.js";
import { ZONAS, nivelZona, zonaMasGrave } from "../src/datos/zonas.js";
import { INDICADORES } from "../src/datos/indicadores.js";
import { evaluar } from "../src/motor/reglas.js";
import { generarMision } from "../src/datos/generador.js";

const matriz = indexarMatriz(readFileSync(new URL("../../data/indicadores.csv", import.meta.url), "utf8"));

test("el lector de CSV respeta comillas, comas y comillas dobles", () => {
  const filas = leerCSV('a,b\n"x, y","dijo ""hola"""\r\n1,2\n');
  assert.deepEqual(filas, [{ a: "x, y", b: 'dijo "hola"' }, { a: "1", b: "2" }]);
});

test("la matriz tiene los 47 indicadores", () => {
  assert.equal(Object.keys(matriz).length, 47);
  assert.equal(matriz["ME-01"].indicador, "Glucosa en sangre");
});

test("cada zona apunta a indicadores que existen", () => {
  for (const [id, z] of Object.entries(ZONAS)) {
    for (const c of z.claves) assert.ok(INDICADORES[c], `${id}: ${c}`);
    for (const m of z.matriz) assert.ok(matriz[m], `${id}: ${m}`);
  }
  for (const ind of Object.values(INDICADORES)) assert.ok(matriz[ind.matriz], ind.matriz);
});

test("las zonas toman el color del peor indicador", () => {
  const { mediciones, eventos } = generarMision({ inicio: "2026-10-16T00:00:00.000Z" });
  const hoy = evaluar({ mediciones, eventos, dia: 29 });
  assert.equal(nivelZona("corazon", hoy), "verde");
  assert.equal(nivelZona("ojos", hoy), "sin-datos");

  const pa = [
    { id: "a", indicador: "pa_sis", valor: 165, dia: 29, fuente: "manual", timestamp: "x" },
    { id: "b", indicador: "pa_dia", valor: 105, dia: 29, fuente: "manual", timestamp: "x" },
  ];
  const alta = evaluar({ mediciones: [...mediciones, ...pa], eventos, dia: 29 });
  assert.equal(nivelZona("corazon", alta), "rojo");
  assert.equal(zonaMasGrave(alta), "corazon");

  const tormenta = evaluar({ mediciones, eventos, dia: 17 });
  assert.equal(nivelZona("cuerpo", tormenta), "rojo");
  assert.equal(nivelZona("cabeza", evaluar({ mediciones, eventos, dia: 9 })), "amarillo");
});
