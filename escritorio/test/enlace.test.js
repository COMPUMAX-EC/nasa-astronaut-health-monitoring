const test = require("node:test");
const assert = require("node:assert/strict");
const { leerEnlace } = require("../enlace.js");

test("lee el punto de salida, el estado y el mensaje", () => {
  const p = leerEnlace("laica://salir?x=640&y=360&estado=celebrar&msg=Hola");
  assert.deepEqual(p, { accion: "salir", x: 640, y: 360, estado: "celebrar", mensaje: "Hola", gravedad: null, patas: null });
});

test("lee la gravedad y las patas", () => {
  const p = leerEnlace("laica://salir?gravedad=1&patas=cuatro");
  assert.equal(p.gravedad, true);
  assert.equal(p.patas, "cuatro");
  assert.equal(leerEnlace("laica://salir?gravedad=0").gravedad, false);
  assert.equal(leerEnlace("laica://salir?patas=seis").patas, null);
});

test("acepta la barra final que agrega Windows", () => {
  assert.equal(leerEnlace("laica://volver/").accion, "volver");
  assert.equal(leerEnlace("laica://salir/?x=1&y=2").x, 1);
});

test("ignora valores raros y estados desconocidos", () => {
  const p = leerEnlace("laica://salir?x=abc&estado=borrar");
  assert.equal(p.x, null);
  assert.equal(p.y, null);
  assert.equal(p.estado, "reposo");
  assert.equal(leerEnlace("no es un enlace").accion, "salir");
});

test("recorta mensajes largos", () => {
  assert.equal(leerEnlace(`laica://salir?msg=${"a".repeat(500)}`).mensaje.length, 140);
});
