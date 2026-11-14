// Zonas del cuerpo clicable (fase 3). Cada zona agrupa indicadores que la app ya registra
// (`claves`) y otros de la matriz de riesgo que aún no se registran (`matriz`), para explicar
// por qué importan en el espacio: responde la pregunta guía "¿por qué hace falta este examen?".

export const ZONAS = {
  cabeza: {
    nombre: "Mente y sueño",
    porque: "El aislamiento, el confinamiento y los turnos alteran el sueño y el ánimo. La fatiga provoca errores en tareas críticas.",
    claves: ["sueno", "animo", "who5"],
    matriz: ["CO-01", "PS-02"],
  },
  ojos: {
    nombre: "Ojos",
    porque: "En microgravedad los fluidos suben a la cabeza y pueden hinchar el nervio óptico y cambiar la visión (síndrome SANS).",
    claves: [],
    matriz: ["VI-01", "VI-02"],
  },
  pulmones: {
    nombre: "Pulmones y aire",
    porque: "El aire de la cabina se recicla. Si sube el CO₂ o baja el oxígeno, la saturación cae y aparecen dolor de cabeza y cansancio.",
    claves: ["spo2"],
    matriz: ["EN-01"],
  },
  corazon: {
    nombre: "Corazón",
    porque: "Sin gravedad el corazón trabaja menos y se desacondiciona. Al volver a la gravedad puede haber mareos al ponerse de pie.",
    claves: ["pa_sis", "fc"],
    matriz: ["CV-06"],
  },
  abdomen: {
    nombre: "Metabolismo",
    porque: "La inactividad y el estrés alteran la glucosa. El calcio que pierden los huesos puede formar cálculos en los riñones.",
    claves: ["glucosa"],
    matriz: ["RN-01"],
  },
  piernas: {
    nombre: "Músculos y huesos",
    porque: "Sin carga sobre el esqueleto se pierde entre 1 y 1,5 % de densidad ósea al mes, sobre todo en caderas y piernas, y también masa muscular.",
    claves: ["peso"],
    matriz: ["OS-01", "MU-01"],
  },
  cuerpo: {
    nombre: "Todo el cuerpo: radiación e infecciones",
    porque: "Lejos de la Tierra la radiación aumenta el riesgo de cáncer y daña tejidos; las tormentas solares obligan a ir al refugio. El sistema inmune también se debilita.",
    claves: ["dosis", "temp"],
    matriz: ["RA-02"],
  },
};

export const ORDEN_ZONAS = ["cabeza", "ojos", "pulmones", "corazon", "abdomen", "piernas", "cuerpo"];

const ORDEN_NIVEL = ["verde", "amarillo", "naranja", "rojo"];

// Nivel de una zona: el peor de sus indicadores. "sin-datos" si la app aún no mide nada ahí.
export function nivelZona(id, estado) {
  const zona = ZONAS[id];
  if (!zona.claves.length) return "sin-datos";
  let nivel = "verde";
  for (const c of zona.claves) {
    const n = estado.porIndicador[c] ?? "verde";
    if (ORDEN_NIVEL.indexOf(n) > ORDEN_NIVEL.indexOf(nivel)) nivel = n;
  }
  if (id === "cuerpo" && estado.radiacion) nivel = "rojo";
  return nivel;
}

// La zona más grave, para mostrarla primero.
export function zonaMasGrave(estado) {
  let mejor = "corazon", peso = -1;
  for (const id of ORDEN_ZONAS) {
    const p = ORDEN_NIVEL.indexOf(nivelZona(id, estado));
    if (p > peso) { mejor = id; peso = p; }
  }
  return peso > 0 ? mejor : "corazon";
}
