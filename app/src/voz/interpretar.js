// Intérprete de comandos de voz en español. Es una función pura: recibe el texto que
// transcribió el navegador y devuelve qué quiso decir el tripulante. Sin IA ni nube:
// reglas simples, predecibles y auditables (docs/12 §12.2).
//
// Ejemplos:
//   "mi presión es 120 sobre 80"        → { datos: { pa_sis: 120, pa_dia: 80 } }
//   "pulso 62 y temperatura 36 punto 8" → { datos: { fc: 62, temp: 36.8 } }
//   "dormí 6 horas y media"             → { datos: { sueno: 6.5 } }
//   "me siento muy bien"                → { datos: { animo: 5 } }
//   "¿cómo estoy?"                      → { intencion: "resumen" }

import { validar } from "../motor/validacion.js";

const NUMEROS = {
  cero: 0, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8,
  nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15,
};

export function normalizar(texto) {
  let t = texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  t = t.replace(/[¿?¡!;:]/g, " ").replace(/\.(?!\d)/g, " ");
  t = t.replace(/\b(cero|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince)\b/g, (p) => NUMEROS[p]);
  t = t.replace(/(\d)\s*(?:,|punto|coma)\s*(\d)/g, "$1.$2");
  t = t.replace(/(\d+)\s+(?:horas?\s+)?y\s+medi[ao]/g, (_, n) => `${n}.5`);
  return t.replace(/\s+/g, " ").trim();
}

const NUM = "(\\d{1,3}(?:\\.\\d)?)";
const HUECO = "[^\\d]{0,30}?"; // palabras entre el indicador y el número ("es de", "me salió")

const PATRONES = [
  { claves: ["pa_sis", "pa_dia"], re: new RegExp(`(?:presion|tension)${HUECO}(\\d{2,3})\\s*(?:sobre|/|con|-|y)?\\s*(\\d{2,3})`) },
  { claves: ["fc"], re: new RegExp(`(?:pulso|frecuencia(?: cardiaca)?|latidos|ritmo cardiaco)${HUECO}${NUM}`) },
  { claves: ["spo2"], re: new RegExp(`(?:saturacion|oxigeno|spo2)${HUECO}${NUM}`) },
  { claves: ["temp"], re: new RegExp(`(?:temperatura|fiebre)${HUECO}${NUM}`) },
  { claves: ["glucosa"], re: new RegExp(`(?:glucosa|azucar|glicemia|glucemia)${HUECO}${NUM}`) },
  { claves: ["sueno"], re: new RegExp(`(?:dormi|sueno|descanse)${HUECO}${NUM}`) },
  { claves: ["peso"], re: new RegExp(`(?:peso|masa corporal)${HUECO}${NUM}`) },
];

const ANIMO = [
  [1, /\b(muy mal|fatal|horrible|pesimo|terrible|fatal)\b/],
  [5, /\b(muy bien|excelente|genial|increible|super bien)\b/],
  [2, /\b(mal|triste|cansad[oa]|agotad[oa]|decaid[oa]|estresad[oa])\b/],
  [3, /\b(regular|mas o menos|normal|ahi vamos)\b/],
  [4, /\b(bien|contento|contenta|tranquil[oa])\b/],
];

const INTENCIONES = [
  ["confirmar", /^(si|si claro|claro|dale|ok|okay|vale|correcto|guardalo|guarda|si guardalo|si por favor|afirmativo)$/],
  ["cancelar", /^(no|cancela|cancelar|borra|borralo|no gracias|negativo|olvidalo)$/],
  ["resumen", /\b(como estoy|como voy|como me ves|resumen|mis alertas|alguna alerta|estado de salud)\b/],
  ["ayuda", /\b(ayuda|que puedes hacer|que te digo|que puedo decir|comandos)\b/],
  ["checkin", /\b(check ?in|registrar|formulario)\b/],
  ["gracias", /\b(gracias)\b/],
  ["saludo", /\b(hola|buenos dias|buenas tardes|buenas noches|buenas)\b/],
];

export function interpretar(texto) {
  const t = normalizar(texto ?? "");
  if (!t) return { intencion: "vacio", datos: {}, errores: {}, texto: t };

  for (const [intencion, re] of INTENCIONES.slice(0, 2)) if (re.test(t)) return { intencion, datos: {}, errores: {}, texto: t };

  const datos = {};
  for (const { claves, re } of PATRONES) {
    const m = t.match(re);
    if (m) claves.forEach((c, i) => { datos[c] = Number(m[i + 1]); });
  }
  if (/\b(me siento|estoy|siento|animo|me encuentro|hoy)\b/.test(t) && !/\b(como estoy|como voy)\b/.test(t)) {
    const hallado = ANIMO.find(([, re]) => re.test(t));
    if (hallado) datos.animo = hallado[0];
  }

  if (Object.keys(datos).length) {
    const { animo, ...numericos } = datos;
    const errores = validar(Object.fromEntries(Object.entries(numericos).map(([k, v]) => [k, String(v)])));
    return { intencion: "registrar", datos, errores, texto: t };
  }

  for (const [intencion, re] of INTENCIONES.slice(2)) if (re.test(t)) return { intencion, datos: {}, errores: {}, texto: t };
  return { intencion: "desconocida", datos: {}, errores: {}, texto: t };
}

const NOMBRE = {
  fc: (v) => `pulso ${v}`, spo2: (v) => `saturación ${v} %`, temp: (v) => `temperatura ${v} grados`,
  glucosa: (v) => `glucosa ${v}`, sueno: (v) => `${v} horas de sueño`, peso: (v) => `peso ${v} kilos`,
  animo: (v) => `ánimo ${["", "muy mal", "mal", "regular", "bien", "muy bien"][v]}`,
};

// Frase para que Laica repita lo que entendió antes de guardar.
export function describir(datos) {
  const partes = [];
  if (datos.pa_sis != null) partes.push(`presión ${datos.pa_sis} sobre ${datos.pa_dia}`);
  for (const [k, v] of Object.entries(datos)) if (NOMBRE[k]) partes.push(NOMBRE[k](v));
  return partes.length > 1 ? `${partes.slice(0, -1).join(", ")} y ${partes.at(-1)}` : partes[0] ?? "";
}
