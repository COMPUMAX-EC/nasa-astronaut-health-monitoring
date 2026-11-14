// Validación del check-in. Los rangos rechazan errores de tipeo (por ejemplo 1650 en vez de 165),
// no valores clínicos: un valor raro pero posible se guarda y lo juzga el motor de alertas.

export const CAMPOS = [
  { clave: "pa_sis", etiqueta: "Presión sistólica", unidad: "mmHg", min: 60, max: 260, paso: 1 },
  { clave: "pa_dia", etiqueta: "Presión diastólica", unidad: "mmHg", min: 30, max: 160, paso: 1 },
  { clave: "fc", etiqueta: "FC en reposo", unidad: "lpm", min: 25, max: 220, paso: 1 },
  { clave: "spo2", etiqueta: "SpO₂", unidad: "%", min: 50, max: 100, paso: 1 },
  { clave: "temp", etiqueta: "Temperatura", unidad: "°C", min: 33, max: 43, paso: 0.1 },
  { clave: "glucosa", etiqueta: "Glucosa", unidad: "mg/dL", min: 20, max: 600, paso: 1 },
  { clave: "sueno", etiqueta: "Horas de sueño", unidad: "h", min: 0, max: 16, paso: 0.5 },
  { clave: "peso", etiqueta: "Masa corporal", unidad: "kg", min: 30, max: 200, paso: 0.1 },
];

export function validar(valores) {
  const errores = {};
  for (const c of CAMPOS) {
    const txt = valores[c.clave];
    if (txt === undefined || txt === "") continue;
    const n = Number(String(txt).replace(",", "."));
    if (!Number.isFinite(n)) errores[c.clave] = "Escribe un número";
    else if (n < c.min || n > c.max) errores[c.clave] = `Entre ${c.min} y ${c.max} ${c.unidad}`;
  }
  const s = valores.pa_sis, d = valores.pa_dia;
  const unaSola = (s && !d) || (!s && d);
  if (unaSola) errores[s ? "pa_dia" : "pa_sis"] = "La presión necesita los dos valores";
  else if (s && d && !errores.pa_sis && !errores.pa_dia && Number(s) <= Number(d))
    errores.pa_sis = "La sistólica debe ser mayor que la diastólica";
  return errores;
}

