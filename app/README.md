# App Laica · Salud del tripulante (fases 1 y 2)

Aplicación web **offline** (PWA) del plan del proyecto ([docs/12](../docs/12-plan-de-proyecto.md)). Ya funcionan:

- **Fase 1, base:** 30 días simulados de un tripulante, con Laica, los 6 indicadores del reto y los eventos de la misión.
- **Fase 2, registro y alertas:** check‑in por teclado y clics, motor de alertas 🟢🟡🟠🔴, tarjetas coloreadas, panel de alertas con la acción sugerida y Laica que cambia de estado. Una barra permite recorrer la misión día por día.

## Cómo correrla

Requiere Node.js 18 o superior (funciona en Windows, macOS y Linux).

```bash
cd app
npm install
npm run dev
```

Abre `http://localhost:5173`. Para la versión final (la que funciona sin conexión):

```bash
npm run build
npm run preview
```

Las pruebas del generador de datos:

```bash
npm test
```

## Qué hay

| Archivo | Qué hace |
|---|---|
| `src/datos/indicadores.js` | Catálogo de indicadores, enlazado con los ids de la [matriz de riesgo](../docs/09-matriz-riesgo-indicadores.md) |
| `src/datos/generador.js` | Simula 30 días de forma reproducible (misma semilla, mismos datos) con los eventos del guion de la demo |
| `src/datos/db.js` | Guarda todo en IndexedDB, **solo en el dispositivo**; si no se puede, usa memoria |
| `src/motor/reglas.js` | Motor de alertas: umbrales por indicador, nivel general y estado de Laica |
| `src/motor/validacion.js` | Rechaza errores de tipeo en el check-in (por ejemplo 1650 en vez de 165) |
| `src/componentes/CheckIn.jsx` | Formulario de check-in: caras para el ánimo y campos opcionales |
| `src/componentes/Alertas.jsx` | Panel de alertas: motivo, acción, si hay que avisar al médico de vuelo y referencia |
| `src/App.jsx` | Pantalla principal: Laica, barra de días, alertas, tarjetas y eventos |
| `sw.plantilla.js` + `vite.config.js` | Service worker que guarda todos los archivos en la primera visita para funcionar sin conexión |
| `test/` | Pruebas con `node:test` (sin dependencias extra) |

La mascota se importa directamente desde [`assets/laica/laica.js`](../assets/laica/laica.js), así que hay una sola copia.

## Modelo de datos

Cada medición sigue el modelo de [docs/06 §6.3](../docs/06-propuesta-arquitectura.md):

```json
{ "astronauta_id": "A01", "timestamp": "2026-11-14T07:00:00.000Z", "dia": 29,
  "sistema": "Cardiovascular", "indicador": "fc", "matriz_id": "CV-01",
  "valor": 57, "unidad": "lpm", "fuente": "wearable", "calidad": 0.94 }
```

## Eventos simulados

| Días | Evento | Indicadores afectados |
|---|---|---|
| 8–10 | Racha de mal sueño | Sueño < 6 h, FC sube, ánimo baja |
| 18 | Tormenta solar (SEP) | Dosis +8 mSv |
| 21–26 | Semana de estrés | WHO‑5 ≈ 40, ánimo bajo, glucosa 128 mg/dL el día 25 |
| 24–26 | Presión en aumento | Hasta ≈ 155/100 mmHg |

## Umbrales de alerta

> **Ilustrativos.** Salen de guías clínicas públicas y de NASA‑STD‑3001, pero deben validarse con médicos de vuelo antes de cualquier uso real.

| Indicador | 🟡 Atención | 🟠 Revisar | 🔴 Urgente | Referencia |
|---|---|---|---|---|
| Presión arterial | ≥ 130/85 | ≥ 140/90 o sistólica < 90 | ≥ 160/100 | ACC/AHA 2017 |
| FC en reposo | > línea base + 2 DE, o + 1 DE tres días | > 100 lpm | > 120 o < 40 lpm | Línea base individual |
| SpO₂ | — | < 94 % | < 90 % | Oximetría clínica |
| Temperatura | ≥ 37,5 °C | ≥ 38 °C o < 35,5 °C | ≥ 39 °C | Fiebre clínica |
| Glucosa | ≥ 100 mg/dL | ≥ 126 o < 70 | ≥ 250 o < 54 | ADA |
| Sueño | < 5 h, o tres noches < 6 h | — | — | docs/06 §6.4 |
| Ánimo (1‑5) | ≤ 2 tres días | 1 | — | Autorreporte |
| WHO‑5 | < 50 | ≤ 28 | — | OMS |
| Masa corporal | pérdida ≥ 3 % | pérdida ≥ 5 % | — | OCHMO nutrición |
| Dosis acumulada | ≥ 50 % de 600 mSv | — | ≥ 80 % | NASA‑STD‑3001 |
| Tormenta solar (SEP) | — | — | Evento activo → refugio | DONKI |

**Estado de Laica:** tormenta solar → `radiacion`; alguna alerta roja → `urgente`; amarilla o naranja → `alerta`; todo verde → `reposo`. Saludar y celebrar duran 3 s y nunca tapan una alerta.

## Cómo probarlo

1. Abre la app: hoy está todo en verde.
2. **Hacer check-in** → presión 165/105 → Guardar. La tarjeta se pone roja, la alerta pide avisar al médico de vuelo y Laica pasa a `urgente`.
3. En **Eventos de la misión**, haz clic en "Día 18" (tormenta solar) o "Día 8–10" (mal sueño) para ver cómo estaba la misión ese día.
4. **Regenerar datos de prueba** borra lo ingresado y vuelve al inicio.

## Siguiente: fase 3

Silueta del cuerpo clicable: cada zona se colorea con el peor nivel de sus indicadores.
