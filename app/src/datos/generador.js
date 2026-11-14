// Generador de datos de prueba: simula los últimos N días de un tripulante en la estación.
// Es determinista: la misma semilla y la misma fecha de inicio dan siempre los mismos datos,
// para que la demo y las pruebas sean reproducibles.
//
// Los eventos siguen el guion de la demo (docs/12-plan-de-proyecto.md §12.6):
//   días 7-9   racha de mal sueño (FC sube, ánimo baja)
//   día 17     tormenta solar: evento de partículas solares (SEP), salto de dosis
//   días 20-25 semana de estrés (WHO-5 bajo, ánimo bajo, glucosa extra alta)
//   días 23-25 presión arterial en aumento
// Modelo de datos: docs/06-propuesta-arquitectura.md §6.3.

import { INDICADORES } from "./indicadores.js";

export const ASTRONAUTA = { id: "A01", nombre: "Tripulante A01", mision: "Estación orbital", perfil: "estacion" };

// PRNG mulberry32: pequeño, rápido y reproducible.
function prng(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(rand) {
  // Box-Muller
  const u = Math.max(rand(), 1e-12);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const redondear = (x, d) => Math.round(x * 10 ** d) / 10 ** d;
const limitar = (x, min, max) => Math.min(max, Math.max(min, x));

function enRango(dia, desde, hasta) {
  return dia >= desde && dia <= hasta;
}

// Desviación de cada indicador según los eventos del guion (en unidades del indicador).
function efecto(clave, dia) {
  const malSueno = enRango(dia, 7, 9);
  const estres = enRango(dia, 20, 25);
  switch (clave) {
    case "sueno":   return malSueno ? -2.0 : estres ? -0.8 : 0;
    case "fc":      return malSueno ? 6 : estres ? 4 : 0;
    case "animo":   return malSueno ? -1 : estres ? -1.6 : 0;
    case "pa_sis":  return dia === 23 ? 18 : dia === 24 ? 30 : dia === 25 ? 38 : estres ? 6 : 0;
    case "pa_dia":  return dia === 23 ? 10 : dia === 24 ? 18 : dia === 25 ? 25 : estres ? 3 : 0;
    case "temp":    return 0;
    default:        return 0;
  }
}

function fechaDia(inicio, dia, hora) {
  const d = new Date(inicio);
  d.setUTCDate(d.getUTCDate() + dia);
  d.setUTCHours(hora, 0, 0, 0);
  return d.toISOString();
}

/**
 * @param {object} op
 * @param {string|Date} op.inicio  fecha del día 0 (UTC)
 * @param {number} [op.dias=30]
 * @param {number} [op.semilla=2026]
 * @returns {{astronauta, lineasBase, mediciones, eventos}}
 */
export function generarMision({ inicio, dias = 30, semilla = 2026 }) {
  const rand = prng(semilla);
  const mediciones = [];
  const eventos = [];
  let dosis = 0;

  const medir = (clave, dia, hora, valor, fuente) => {
    const ind = INDICADORES[clave];
    mediciones.push({
      id: `${ASTRONAUTA.id}-${clave}-${dia}-${hora}`,
      astronauta_id: ASTRONAUTA.id,
      timestamp: fechaDia(inicio, dia, hora),
      dia,
      sistema: ind.sistema,
      indicador: clave,
      matriz_id: ind.matriz,
      valor: redondear(valor, ind.decimales),
      unidad: ind.unidad,
      fuente,
      calidad: redondear(limitar(0.93 + normal(rand) * 0.03, 0.7, 1), 2),
    });
  };

  const muestra = (clave, dia) => {
    const { media, de } = INDICADORES[clave].base;
    return media + efecto(clave, dia) + normal(rand) * de;
  };

  for (let dia = 0; dia < dias; dia++) {
    // Mañana: check-in con Laica y signos vitales
    medir("sueno", dia, 7, limitar(muestra("sueno", dia), 3, 10), "autorreporte");
    medir("fc", dia, 7, muestra("fc", dia), "wearable");
    medir("spo2", dia, 7, limitar(muestra("spo2", dia), 90, 100), "oximetro");
    medir("temp", dia, 7, muestra("temp", dia), "termometro");
    const sis = muestra("pa_sis", dia);
    medir("pa_sis", dia, 8, sis, "tensiometro");
    medir("pa_dia", dia, 8, muestra("pa_dia", dia), "tensiometro");
    medir("animo", dia, 21, limitar(Math.round(muestra("animo", dia)), 1, 5), "autorreporte");

    // Semanal: glucosa en ayunas, peso y WHO-5 (los días 0, 7, 14, 21, 28)
    if (dia % 7 === 0) {
      medir("glucosa", dia, 6, muestra("glucosa", dia), "glucometro");
      medir("peso", dia, 6, INDICADORES.peso.base.media - dia * 0.03 + normal(rand) * 0.3, "bascula_masa");
      const who5 = dia === 21 ? 40 + normal(rand) * 3 : muestra("who5", dia);
      medir("who5", dia, 20, limitar(who5, 0, 100), "cuestionario");
    }
    // Glucosa extra ante síntomas en la semana de estrés
    if (dia === 24) medir("glucosa", dia, 12, 128 + normal(rand) * 3, "glucometro");

    // Radiación: unos 0,5 mSv/día en órbita baja; la tormenta solar añade una dosis extra
    dosis += INDICADORES.dosis.base.media + normal(rand) * INDICADORES.dosis.base.de;
    if (dia === 17) dosis += 8;
    medir("dosis", dia, 23, dosis, "dosimetro");
  }

  eventos.push(
    { id: "EV-sueno", dia: 7, hasta: 9, tipo: "sueno", titulo: "Racha de mal sueño", detalle: "Tres noches con menos de 6 h de sueño", matriz_id: "SU-01" },
    { id: "EV-sep", dia: 17, hasta: 17, tipo: "radiacion", titulo: "Tormenta solar", detalle: "Evento de partículas solares (SEP): refugio durante 6 h", matriz_id: "RA-02" },
    { id: "EV-estres", dia: 20, hasta: 25, tipo: "estres", titulo: "Semana de estrés", detalle: "Carga de trabajo alta y bienestar WHO-5 bajo", matriz_id: "PS-01" },
    { id: "EV-pa", dia: 23, hasta: 25, tipo: "presion", titulo: "Presión arterial en aumento", detalle: "Tres días seguidos por encima de la línea base", matriz_id: "CV-03" },
  );
  eventos.forEach((e) => { e.timestamp = fechaDia(inicio, e.dia, 12); });

  const lineasBase = Object.entries(INDICADORES).map(([clave, ind]) => ({
    astronauta_id: ASTRONAUTA.id,
    indicador: clave,
    media: ind.base.media,
    desviacion: ind.base.de,
    periodo: "preflight-90d (simulado)",
  }));

  return { astronauta: ASTRONAUTA, lineasBase, mediciones, eventos };
}

// Día 0 de la simulación para que el último día sea hoy.
export function inicioParaHoy(dias = 30, hoy = new Date()) {
  const d = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - (dias - 1));
  return d.toISOString();
}
