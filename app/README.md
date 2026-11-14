# App Laica · Salud del tripulante (fase 1)

Aplicación web **offline** (PWA) del plan del proyecto ([docs/12](../docs/12-plan-de-proyecto.md)). Esta es la **fase 1, la base**: muestra 30 días simulados de un tripulante, con Laica, los 6 indicadores del reto y los eventos de la misión.

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
| `src/App.jsx` | Pantalla inicial: saludo de Laica, tarjetas con tendencia y eventos |
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

## Siguiente: fase 2

Formularios de registro y motor de alertas 🟢🟡🟠🔴. Con eso, los eventos de arriba deberán encender las alertas y cambiar el estado de Laica.
