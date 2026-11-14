# App Laica · Salud del tripulante (fases 1 a 3 y voz)

Aplicación web **offline** (PWA) del plan del proyecto ([docs/12](../docs/12-plan-de-proyecto.md)). Ya funcionan:

- **Fase 1, base:** 30 días simulados de un tripulante, con Laica, los 6 indicadores del reto y los eventos de la misión.
- **Fase 2, registro y alertas:** check‑in por teclado y clics, motor de alertas 🟢🟡🟠🔴, tarjetas coloreadas, panel de alertas con la acción sugerida y Laica que cambia de estado. Una barra permite recorrer la misión día por día.
- **Fase 3, cuerpo clicable:** figura humana con 7 zonas. Cada una toma el color de su peor indicador y explica por qué importa en el espacio, con datos de la [matriz de riesgo](../docs/09-matriz-riesgo-indicadores.md).
- **Voz:** Laica habla y escucha comandos en español.
- **Identidad de misión:** "Misión Laica" con un parche propio (huella de corgi orbitando la Tierra) y crédito al NASA Space Apps Challenge 2026. **No usa el logo de la NASA:** la agencia no permite usar su insignia ni su logotipo sin autorización.
- **Laica protagonista:** escena espacial animada (estrellas, estrellas fugaces, planeta con luna). Laica pasea cuando todo va bien y se planta al frente cuando hay una alerta. Si la tocas, salta y responde con humor; si hay una alerta, vuelve al tema. Al bajar por la página, una Laica pequeña te acompaña desde la esquina, y al elegir una zona del cuerpo te explica por qué importa. Todo el movimiento se apaga si el sistema pide reducir animaciones.

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
| `src/componentes/CuerpoHumano.jsx` | Figura clicable (ratón, teclado o botones) y panel de detalle de cada zona |
| `src/datos/zonas.js` | Zonas del cuerpo, sus indicadores y por qué importan |
| `src/datos/matriz.js` + `csv.js` | Incluye `data/indicadores.csv` en la app para explicar cada indicador sin conexión |
| `src/voz/interpretar.js` | Entiende frases como "mi presión es 120 sobre 80" o "¿cómo estoy?" (reglas, sin IA ni nube) |
| `src/voz/voz.js` | Hablar y escuchar con la Web Speech API del navegador |
| `src/voz/useConversacion.js` | Conversación: escuchar → repetir lo entendido → confirmar → guardar → responder |
| `src/App.jsx` | Pantalla principal: Laica, barra de días, alertas, cuerpo, tarjetas y eventos |
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

## Voz: hablar con Laica

Toca **🎤 Hablar con Laica** y di, por ejemplo:

| Frase | Qué hace |
|---|---|
| "Mi presión es 120 sobre 80" | Laica repite lo que entendió y pregunta "¿Lo guardo?". Responde **sí** o **no** (en voz o con los botones) |
| "Pulso 62 y temperatura 36 punto 8" | Varios datos en una frase |
| "Dormí 6 horas y media" · "Me siento bien" | Sueño y ánimo |
| "¿Cómo estoy?" | Resume las alertas activas |
| "Ayuda" · "Check-in" | Lista de comandos · abre el formulario |

**🔊 Voz activada** hace que Laica lea en voz alta sus mensajes. Debajo aparece **Voz de Laica** para elegir la voz y probarla.

Para que suene menos robótica, Laica:
- Elige sola la voz más natural instalada: primero las neuronales ("natural" en Microsoft Edge), luego las de Google en Chrome, y prefiere acentos latinoamericanos.
- Dice las abreviaturas como una persona: "118/76 mmHg" → "118 sobre 76", "lpm" → "latidos por minuto".
- Habla frase por frase, con tono normal, y sube un poco el tono en las preguntas.

> **La mejor voz depende del navegador.** Windows solo trae voces básicas (Helena, Laura, Pablo). Para la demo usen **Microsoft Edge**, que trae voces neuronales en español gratis, por ejemplo Dalia (México) o Andrea (Ecuador); necesitan internet. Chrome trae "Google español".

- **Siempre confirma antes de guardar:** un error de reconocimiento no debe convertirse en un dato médico.
- **Navegadores:** hablar funciona en todos los modernos; escuchar, en Chrome y Edge (Firefox no lo trae).
- **Privacidad:** Chrome y Edge envían el audio a su servicio de reconocimiento, así que escuchar necesita internet y el audio sale del dispositivo. La app lo avisa. Para una misión real habría que usar un reconocedor local (por ejemplo Vosk o Whisper en el dispositivo; ver [docs/08](../docs/08-computo-ia-y-limitaciones.md)).
- El micrófono requiere HTTPS (o localhost).

## Despliegue en Vercel

El repo tiene [`vercel.json`](../vercel.json) en la raíz: instala y compila `app/` y publica `app/dist`. Se compila desde la raíz porque la app importa la mascota (`assets/laica`) y la matriz (`data/indicadores.csv`).

1. En [vercel.com/new](https://vercel.com/new), importa el repo de GitHub.
2. Deja la carpeta raíz del proyecto como `./` (no `app`). Vercel toma el resto de `vercel.json`.
3. Cada push a `main` vuelve a desplegar.

## Siguiente: fase 4

Personalidad de Laica: banco de frases con niveles de humor (ver [docs/12 §12.2](../docs/12-plan-de-proyecto.md)).
