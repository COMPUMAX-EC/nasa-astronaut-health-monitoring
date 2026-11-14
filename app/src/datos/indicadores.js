// Catálogo de los indicadores que usa la app en la fase 1.
// `matriz` enlaza con el id de docs/09-matriz-riesgo-indicadores.md y data/indicadores.csv.
// `base` es la línea base simulada (media y desviación) de un tripulante sano.
// Los rangos son ilustrativos: los umbrales reales se fijan en la fase 2 con NASA-STD-3001.

export const INDICADORES = {
  fc:      { matriz: "CV-01", nombre: "Frecuencia cardiaca en reposo", corto: "FC reposo", unidad: "lpm",  sistema: "Cardiovascular", zona: "corazon",  frecuencia: "diaria",  base: { media: 60,  de: 2.5 }, decimales: 0 },
  pa_sis:  { matriz: "CV-03", nombre: "Presión arterial sistólica",    corto: "PA sistólica", unidad: "mmHg", sistema: "Cardiovascular", zona: "corazon", frecuencia: "diaria", base: { media: 116, de: 4 },   decimales: 0 },
  pa_dia:  { matriz: "CV-03", nombre: "Presión arterial diastólica",   corto: "PA diastólica", unidad: "mmHg", sistema: "Cardiovascular", zona: "corazon", frecuencia: "diaria", base: { media: 75, de: 3 },   decimales: 0 },
  spo2:    { matriz: "CV-05", nombre: "Saturación de oxígeno",         corto: "SpO₂",      unidad: "%",    sistema: "Cardiovascular", zona: "pulmones", frecuencia: "diaria",  base: { media: 98,  de: 0.6 }, decimales: 0 },
  glucosa: { matriz: "ME-01", nombre: "Glucosa en sangre (ayunas)",    corto: "Glucosa",   unidad: "mg/dL", sistema: "Metabólico",    zona: "abdomen",  frecuencia: "semanal", base: { media: 90,  de: 4 },   decimales: 0 },
  temp:    { matriz: "IN-01", nombre: "Temperatura corporal",          corto: "Temperatura", unidad: "°C", sistema: "Inmune",         zona: "cabeza",   frecuencia: "diaria",  base: { media: 36.7, de: 0.15 }, decimales: 1 },
  sueno:   { matriz: "SU-01", nombre: "Horas de sueño",                corto: "Sueño",     unidad: "h",    sistema: "Sueño",          zona: "cabeza",   frecuencia: "diaria",  base: { media: 7.2, de: 0.35 }, decimales: 1 },
  animo:   { matriz: "PS-01", nombre: "Estado de ánimo (autorreporte)", corto: "Ánimo",    unidad: "1-5",  sistema: "Salud mental",   zona: "cabeza",   frecuencia: "diaria",  base: { media: 4,   de: 0.4 }, decimales: 0 },
  who5:    { matriz: "PS-01", nombre: "Bienestar WHO-5",               corto: "WHO-5",     unidad: "0-100", sistema: "Salud mental",  zona: "cabeza",   frecuencia: "semanal", base: { media: 72,  de: 4 },   decimales: 0 },
  peso:    { matriz: "MU-02", nombre: "Masa corporal",                 corto: "Peso",      unidad: "kg",   sistema: "Muscular",       zona: "piernas",  frecuencia: "semanal", base: { media: 74,  de: 0.3 }, decimales: 1 },
  dosis:   { matriz: "RA-01", nombre: "Dosis de radiación acumulada",  corto: "Dosis",     unidad: "mSv",  sistema: "Radiación",      zona: "cuerpo",   frecuencia: "continua", base: { media: 0.5, de: 0.03 }, decimales: 1 },
};

// Los seis indicadores que cita el enunciado oficial del reto, en el orden de la pantalla.
export const PRINCIPALES = ["pa_sis", "fc", "glucosa", "temp", "sueno", "animo"];
