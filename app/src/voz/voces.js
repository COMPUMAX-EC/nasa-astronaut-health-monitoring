// Cómo hacer que Laica suene menos robótica (funciones puras, con pruebas):
// 1. Elegir la mejor voz instalada: las neuronales ("Natural"/"Neural" en Edge, "Google" en Chrome)
//    suenan mucho más humanas que las voces clásicas de escritorio de Windows.
// 2. Decir las abreviaturas como una persona: "mmHg" → "milímetros de mercurio", "120/80" → "120 sobre 80".
// 3. Hablar frase por frase, con pausas, en vez de un solo bloque largo.

const BUENAS = [
  [/natural|neural/i, 60],
  [/google/i, 40],
  [/premium|enhanced|mejorad/i, 35],
  [/online/i, 15],
];
const MALAS = [[/espeak|desktop|compact/i, -30]];
// Acentos latinoamericanos primero (el equipo es de Ecuador); luego España.
const REGIONES = ["es-ec", "es-co", "es-pe", "es-mx", "es-us", "es-419", "es-ar", "es-cl", "es-es"];

export function puntuarVoz(v, idiomaPreferido = "es-EC") {
  const lang = (v.lang ?? "").toLowerCase().replace("_", "-");
  if (!lang.startsWith("es")) return -Infinity;
  let p = 0;
  for (const [re, n] of [...BUENAS, ...MALAS]) if (re.test(v.name ?? "")) p += n;
  if (lang === idiomaPreferido.toLowerCase()) p += 12;
  const i = REGIONES.indexOf(lang);
  p += i === -1 ? 0 : (REGIONES.length - i);
  if (v.localService) p += 3; // funciona sin conexión
  return p;
}

export function ordenarVoces(voces, idiomaPreferido) {
  return voces
    .map((v) => ({ v, p: puntuarVoz(v, idiomaPreferido) }))
    .filter((x) => x.p > -Infinity)
    .sort((a, b) => b.p - a.p)
    .map((x) => x.v);
}

const REEMPLAZOS = [
  [/(\d+)\/100\b/g, "$1 de 100"],
  [/(\d{2,3})\s*\/\s*(\d{2,3})\s*mmHg/g, "$1 sobre $2"],
  [/(\d{2,3})\s*\/\s*(\d{2,3})/g, "$1 sobre $2"],
  [/mmHg/g, "milímetros de mercurio"],
  [/(\d)\s*lpm\b/g, "$1 latidos por minuto"],
  [/\blpm\b/g, "latidos por minuto"],
  [/mg\/dL/g, "miligramos por decilitro"],
  [/(\d)\s*°C/g, "$1 grados"],
  [/(\d)\s*mSv/g, "$1 milisieverts"],
  [/(\d)\s*kg\b/g, "$1 kilos"],
  [/(\d)\s*h\b/g, "$1 horas"],
  [/(\d)\s*%/g, "$1 por ciento"],
  [/SpO₂|SpO2/g, "saturación de oxígeno"],
  [/CO₂/g, "CO2"],
  [/WHO-5/g, "índice de bienestar WHO 5"],
  [/\bFC\b/g, "frecuencia cardiaca"],
  [/\bSEP\b/g, "partículas solares"],
  [/(\d)\.(\d)/g, "$1 punto $2"],
  [/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, ""],
  [/\s*·\s*/g, ", "],
];

export function prepararTexto(texto) {
  let t = String(texto ?? "");
  for (const [re, r] of REEMPLAZOS) t = t.replace(re, r);
  return t.replace(/\s+/g, " ").trim();
}

// Divide en frases cortas: así la voz respira entre ideas y Chrome no corta textos largos.
export function dividirFrases(texto) {
  return prepararTexto(texto)
    .split(/(?<=[.!?…])\s+(?=[¿¡A-ZÁÉÍÓÚÑ0-9"])/)
    .map((f) => f.trim())
    .filter(Boolean);
}

// Etiqueta legible para el selector: "Dalia (México) · natural".
export function etiquetaVoz(v) {
  const nombre = (v.name ?? "").replace(/^(Microsoft|Google)\s+/i, "").replace(/\s+Online.*$/i, "").replace(/\s*-\s*Spanish.*$/i, "");
  const calidad = /natural|neural/i.test(v.name) ? " · natural" : /google/i.test(v.name) ? " · Google" : "";
  return `${nombre} (${v.lang})${calidad}`;
}
