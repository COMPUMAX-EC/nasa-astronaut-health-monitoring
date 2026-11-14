// Motor de alertas: convierte las mediciones en niveles 🟢🟡🟠🔴 y en el estado de Laica.
//
// Los umbrales son ILUSTRATIVOS para el prototipo (ver docs/06 §6.4). Vienen de guías
// clínicas públicas y de NASA-STD-3001; antes de cualquier uso real deben validarse
// con médicos de vuelo. Cada regla dice de dónde sale en `referencia`.

import { INDICADORES } from "../datos/indicadores.js";

export const NIVELES = ["verde", "amarillo", "naranja", "rojo"];
export const ETIQUETA = { verde: "Normal", amarillo: "Atención", naranja: "Revisar", rojo: "Urgente" };
const peso = (n) => NIVELES.indexOf(n);
const peor = (a, b) => (peso(a) >= peso(b) ? a : b);

const REF = {
  pa: "Categorías ACC/AHA 2017; NASA-STD-3001 Vol. 1 (salud cardiovascular)",
  fc: "Línea base individual ±DE (docs/06 §6.4); riesgo cardiovascular del HRP",
  spo2: "Rangos clínicos de oximetría; NASA-STD-3001 Vol. 2 (atmósfera)",
  temp: "Definición clínica de fiebre (≥ 38 °C); riesgo inmune del HRP",
  glucosa: "Criterios de la ADA para glucosa en ayunas; boletín OCHMO de nutrición",
  sueno: "Regla de fatiga de docs/06 §6.4; riesgo de sueño y circadiano del HRP",
  animo: "Autorreporte diario; riesgo de salud conductual del HRP",
  who5: "Puntos de corte del WHO-5 (OMS): < 50 bienestar bajo, ≤ 28 tamizaje de depresión",
  peso: "Pérdida de masa corporal; boletín OCHMO de nutrición",
  dosis: "Límite de carrera de 600 mSv, NASA-STD-3001 Vol. 1",
  sep: "Evento de partículas solares (DONKI); protocolo de refugio",
};

// Orden cronológico por día; dentro del mismo día, lo ingresado a mano va después
// de lo simulado, para que el dato del tripulante sea siempre el más reciente.
export function ordenar(a, b) {
  return a.dia - b.dia || (a.fuente === "manual") - (b.fuente === "manual") || a.timestamp.localeCompare(b.timestamp);
}

function serie(mediciones, clave, dia) {
  return mediciones
    .filter((m) => m.indicador === clave && m.dia <= dia)
    .sort(ordenar);
}

function alerta(clave, nivel, motivo, accion, mensaje, referencia = REF[clave]) {
  const ind = INDICADORES[clave];
  return { clave, matriz_id: ind?.matriz, indicador: ind?.corto ?? clave, nivel, motivo, accion, mensaje, referencia,
    medico: nivel === "rojo" };
}

// Cada regla recibe la serie de su indicador (ya filtrada hasta el día evaluado)
// y devuelve una alerta o null.
const REGLAS = {
  pa_sis(s, ctx) {
    const sis = s.at(-1)?.valor;
    const dia = ctx.ultimo("pa_dia");
    if (sis == null || dia == null) return null;
    const txt = `${sis}/${dia} mmHg`;
    if (sis >= 160 || dia >= 100)
      return alerta("pa_sis", "rojo", `Presión muy alta: ${txt}`,
        "Siéntate, descansa 5 minutos y repite la medición. Si sigue igual, avisa al médico de vuelo.",
        `Presión ${txt}. Siéntate y repite la medición en 5 minutos. Si sigue igual, aviso al médico de vuelo.`, REF.pa);
    if (sis >= 140 || dia >= 90)
      return alerta("pa_sis", "naranja", `Presión alta: ${txt}`,
        "Repite la medición mañana a la misma hora; revisa sal, estrés y sueño.",
        `Tu presión está en ${txt}, más alta de lo normal. Mañana la medimos otra vez a la misma hora.`, REF.pa);
    if (sis >= 130 || dia >= 85)
      return alerta("pa_sis", "amarillo", `Presión algo elevada: ${txt}`,
        "Sigue midiendo a diario para ver la tendencia.",
        `Presión ${txt}: un poco arriba. Nada grave, solo la vigilo.`, REF.pa);
    if (sis < 90)
      return alerta("pa_sis", "naranja", `Presión baja: ${txt}`,
        "Hidrátate y levántate despacio; repite la medición.",
        `Presión baja (${txt}). Toma agua y levántate despacio, ¿sí?`, REF.pa);
    return null;
  },

  fc(s) {
    const v = s.at(-1)?.valor;
    if (v == null) return null;
    const { media, de } = INDICADORES.fc.base;
    if (v > 120 || v < 40)
      return alerta("fc", "rojo", `FC en reposo de ${v} lpm`, "Repite en reposo; si se mantiene, avisa al médico de vuelo.",
        `Tu frecuencia en reposo es ${v} lpm, fuera de rango. Repite la medición sentado; si sigue así, aviso al médico de vuelo.`);
    if (v > 100)
      return alerta("fc", "naranja", `FC en reposo alta: ${v} lpm`, "Revisa hidratación, cafeína, sueño y fiebre.",
        `FC en reposo de ${v} lpm. Revisemos agua, cafeína y sueño.`);
    const ult3 = s.slice(-3).map((m) => m.valor);
    if (v > media + 2 * de || (ult3.length === 3 && ult3.every((x) => x > media + de)))
      return alerta("fc", "amarillo", `FC en reposo sobre tu línea base (${v} lpm vs. ${media})`,
        "Suele deberse a mal sueño, estrés o deshidratación. Repite mañana.",
        `Tu FC en reposo subió a ${v} lpm (tu normal es ${media}). No es grave, pero conviene dormir más.`);
    return null;
  },

  spo2(s) {
    const v = s.at(-1)?.valor;
    if (v == null) return null;
    if (v < 90) return alerta("spo2", "rojo", `SpO₂ de ${v} %`, "Repite la medición; revisa CO₂ y O₂ de cabina; avisa al médico de vuelo.",
      `SpO₂ ${v} %. Repite la medición ya y revisemos el aire de la cabina. Aviso al médico de vuelo.`);
    if (v < 94) return alerta("spo2", "naranja", `SpO₂ baja: ${v} %`, "Repite en reposo y revisa la atmósfera de cabina.",
      `SpO₂ ${v} %, algo baja. Repite en reposo y miro los datos de la cabina.`);
    return null;
  },

  temp(s) {
    const v = s.at(-1)?.valor;
    if (v == null) return null;
    if (v >= 39) return alerta("temp", "rojo", `Fiebre alta: ${v} °C`, "Aíslate si hay síntomas, hidrátate y avisa al médico de vuelo.",
      `Fiebre de ${v} °C. Descansa, toma agua y aviso al médico de vuelo.`);
    if (v >= 38) return alerta("temp", "naranja", `Fiebre: ${v} °C`, "Revisa síntomas de infección y repite en 4 h.",
      `Tienes ${v} °C. Revisemos síntomas y medimos otra vez en 4 horas.`);
    if (v >= 37.5) return alerta("temp", "amarillo", `Temperatura algo alta: ${v} °C`, "Repite más tarde.",
      `${v} °C: un poco alta. La mido de nuevo más tarde.`);
    if (v < 35.5) return alerta("temp", "naranja", `Temperatura baja: ${v} °C`, "Abrígate y revisa la temperatura de cabina.",
      `${v} °C es bajo. Abrígate y reviso la temperatura de la cabina.`);
    return null;
  },

  glucosa(s) {
    const v = s.at(-1)?.valor;
    if (v == null) return null;
    if (v < 54 || v >= 250) return alerta("glucosa", "rojo", `Glucosa de ${v} mg/dL`,
      v < 54 ? "Toma 15 g de azúcar rápida y repite en 15 minutos; avisa al médico de vuelo." : "Repite la medición y avisa al médico de vuelo.",
      v < 54 ? `Glucosa muy baja (${v}). Toma algo dulce ahora y repetimos en 15 minutos.` : `Glucosa muy alta (${v}). Repite la medición; aviso al médico de vuelo.`);
    if (v < 70) return alerta("glucosa", "naranja", `Glucosa baja: ${v} mg/dL`, "Come algo y repite en 15 minutos.",
      `Glucosa en ${v}, baja. Come algo y la medimos de nuevo.`);
    if (v >= 126) return alerta("glucosa", "naranja", `Glucosa alta: ${v} mg/dL`, "Repite en ayunas; el estrés y la falta de sueño la suben.",
      `Glucosa en ${v}. Puede ser el estrés. Repite mañana en ayunas.`);
    if (v >= 100) return alerta("glucosa", "amarillo", `Glucosa en ayunas algo alta: ${v} mg/dL`, "Repite la próxima semana; cuida dieta y ejercicio.",
      `Glucosa en ayunas de ${v}, un poco arriba. La vigilamos.`);
    return null;
  },

  sueno(s) {
    const ult3 = s.slice(-3).map((m) => m.valor);
    const v = ult3.at(-1);
    if (v == null) return null;
    if (ult3.length === 3 && ult3.every((x) => x < 6))
      return alerta("sueno", "amarillo", `Tres noches con menos de 6 h (${ult3.join(", ")} h)`,
        "Riesgo de fatiga: evita tareas críticas cansado y adelanta la hora de dormir.",
        `Tres noches seguidas durmiendo poco. Hoy nada de heroísmos: tareas críticas con calma y a dormir temprano.`);
    if (v < 5) return alerta("sueno", "amarillo", `Dormiste solo ${v} h`, "Considera una siesta corta y dormir temprano.",
      `Solo ${v} h de sueño. ¿Una siesta corta más tarde?`);
    return null;
  },

  animo(s) {
    const ult3 = s.slice(-3).map((m) => m.valor);
    const v = ult3.at(-1);
    if (v == null) return null;
    if (v === 1) return alerta("animo", "naranja", "Ánimo muy bajo hoy",
      "Habla con alguien de la tripulación o con el equipo de apoyo psicológico.",
      "Hoy te sientes muy mal. No tienes que hacer nada más ahora. ¿Respiramos juntos un minuto?");
    if (ult3.length === 3 && ult3.every((x) => x <= 2)) return alerta("animo", "amarillo", "Ánimo bajo tres días seguidos",
      "Responde el WHO-5 y considera una conversación de apoyo.",
      "Llevas unos días difíciles. Aquí estoy. ¿Quieres contarme qué pasa?");
    return null;
  },

  who5(s) {
    const v = s.at(-1)?.valor;
    if (v == null) return null;
    if (v <= 28) return alerta("who5", "naranja", `WHO-5 de ${v}/100`, "Puntaje compatible con depresión: pide evaluación al equipo de apoyo psicológico.",
      `Tu bienestar está bajo (${v}/100). Sería bueno hablar con el equipo de apoyo. ¿Te ayudo a agendarlo?`);
    if (v < 50) return alerta("who5", "amarillo", `WHO-5 de ${v}/100 (bienestar bajo)`, "Refuerza descanso, contacto con familia y actividades agradables.",
      `Tu bienestar esta semana es ${v}/100. Busquemos un rato para algo que te guste.`);
    return null;
  },

  peso(s) {
    const v = s.at(-1)?.valor;
    if (v == null) return null;
    const base = INDICADORES.peso.base.media;
    const perdida = ((base - v) / base) * 100;
    if (perdida >= 5) return alerta("peso", "naranja", `Pérdida de ${perdida.toFixed(1)} % de masa corporal`, "Revisa ingesta calórica y de proteína.",
      `Has perdido ${perdida.toFixed(1)} % de tu masa. Revisemos lo que comes.`);
    if (perdida >= 3) return alerta("peso", "amarillo", `Pérdida de ${perdida.toFixed(1)} % de masa corporal`, "Vigila la ingesta.",
      `Bajaste ${perdida.toFixed(1)} % de masa. Lo vigilo.`);
    return null;
  },

  dosis(s) {
    const v = s.at(-1)?.valor;
    if (v == null) return null;
    const pct = (v / 600) * 100;
    if (pct >= 80) return alerta("dosis", "rojo", `Dosis acumulada: ${v} mSv (${pct.toFixed(0)} % del límite)`, "Reporta a tierra; limita actividades extravehiculares.",
      `Llevas ${pct.toFixed(0)} % del límite de radiación de carrera. Lo reporto a tierra.`);
    if (pct >= 50) return alerta("dosis", "amarillo", `Dosis acumulada: ${v} mSv (${pct.toFixed(0)} % del límite)`, "Planifica para reducir exposición.",
      `Ya vas por la mitad del límite de radiación de carrera. Planifiquemos con cuidado.`);
    return null;
  },
};

/**
 * Evalúa el estado del tripulante en un día de la misión.
 * @returns {{alertas, porIndicador, nivel, radiacion, estadoLaica}}
 */
export function evaluar({ mediciones, eventos = [], dia }) {
  const ctx = { ultimo: (clave) => serie(mediciones, clave, dia).at(-1)?.valor };
  const alertas = [];
  for (const [clave, regla] of Object.entries(REGLAS)) {
    const a = regla(serie(mediciones, clave, dia), ctx);
    if (a) alertas.push(a);
  }

  const sep = eventos.find((e) => e.tipo === "radiacion" && dia >= e.dia && dia <= e.hasta);
  if (sep) {
    alertas.push({ clave: "sep", matriz_id: "RA-02", indicador: "Radiación", nivel: "rojo", medico: false,
      motivo: sep.detalle, accion: "Ve al refugio de radiación y quédate hasta que termine el evento.",
      mensaje: "Evento de partículas solares. Ve al refugio ahora. Te aviso cuando baje.", referencia: REF.sep });
  }

  alertas.sort((a, b) => peso(b.nivel) - peso(a.nivel));

  const porIndicador = Object.fromEntries(Object.keys(INDICADORES).map((k) => [k, "verde"]));
  for (const a of alertas) if (a.clave in porIndicador) porIndicador[a.clave] = peor(porIndicador[a.clave], a.nivel);
  porIndicador.pa_dia = porIndicador.pa_sis;

  const nivel = alertas.reduce((n, a) => peor(n, a.nivel), "verde");
  const estadoLaica = sep ? "radiacion" : nivel === "rojo" ? "urgente" : nivel === "verde" ? "reposo" : "alerta";

  return { alertas, porIndicador, nivel, radiacion: Boolean(sep), estadoLaica };
}
