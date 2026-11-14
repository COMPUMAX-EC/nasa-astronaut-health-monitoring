import { test } from "node:test";
import assert from "node:assert/strict";
import { interpretar, describir, normalizar } from "../src/voz/interpretar.js";

const datos = (t) => interpretar(t).datos;

test("presión arterial en varias formas", () => {
  assert.deepEqual(datos("Mi presión es 120 sobre 80"), { pa_sis: 120, pa_dia: 80 });
  assert.deepEqual(datos("tensión 165/105"), { pa_sis: 165, pa_dia: 105 });
  assert.deepEqual(datos("la presión me salió de 130 con 85"), { pa_sis: 130, pa_dia: 85 });
});

test("varios datos en una frase y decimales dichos en voz", () => {
  assert.deepEqual(datos("pulso 62 y temperatura 36 punto 8"), { fc: 62, temp: 36.8 });
  assert.deepEqual(datos("temperatura 37,2"), { temp: 37.2 });
  assert.deepEqual(datos("dormí 6 horas y media"), { sueno: 6.5 });
  assert.deepEqual(datos("dormí siete horas"), { sueno: 7 });
  assert.deepEqual(datos("glucosa 95, saturación 97 y peso 73.5"), { glucosa: 95, spo2: 97, peso: 73.5 });
});

test("estado de ánimo", () => {
  assert.equal(datos("me siento muy bien").animo, 5);
  assert.equal(datos("hoy estoy cansado").animo, 2);
  assert.equal(datos("me siento muy mal").animo, 1);
  assert.equal(datos("estoy bien").animo, 4);
  assert.equal(datos("me siento regular").animo, 3);
});

test("preguntas y confirmaciones", () => {
  assert.equal(interpretar("¿Cómo estoy?").intencion, "resumen");
  assert.equal(interpretar("Sí").intencion, "confirmar");
  assert.equal(interpretar("no").intencion, "cancelar");
  assert.equal(interpretar("ayuda").intencion, "ayuda");
  assert.equal(interpretar("hola Laica").intencion, "saludo");
  assert.equal(interpretar("qué hora es en Marte").intencion, "desconocida");
});

test("valores imposibles quedan como error, no se guardan en silencio", () => {
  const r = interpretar("presión 300 sobre 80");
  assert.equal(r.intencion, "registrar");
  assert.ok(r.errores.pa_sis);
});

test("describir repite lo entendido", () => {
  assert.equal(describir({ pa_sis: 120, pa_dia: 80, fc: 62 }), "presión 120 sobre 80 y pulso 62");
  assert.equal(normalizar("¿Cómo   ESTÁS?"), "como estas");
});
