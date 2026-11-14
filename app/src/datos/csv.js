// Lector de CSV mínimo (RFC 4180: comillas, comas y saltos de línea dentro de comillas).
// Se usa para leer data/indicadores.csv, la matriz de riesgo generada por scripts/generar_matriz.py.
export function leerCSV(texto) {
  const filas = [];
  let fila = [], campo = "", comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo); campo = "";
      if (fila.some((x) => x !== "")) filas.push(fila);
      fila = [];
    } else campo += c;
  }
  if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila); }
  const [cabecera, ...resto] = filas;
  return resto.map((f) => Object.fromEntries(cabecera.map((h, i) => [h.replace(/^﻿/, ""), f[i] ?? ""])));
}

export function indexarMatriz(texto) {
  return Object.fromEntries(leerCSV(texto).map((f) => [f.id, f]));
}
