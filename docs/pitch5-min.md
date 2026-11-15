# 13. Pitch: Misión Laica

*English version: [13-pitch.en.md](13-pitch.en.md).*

Debo mantenerme sereno para no Caer en la Locura | Es tarde

Porque las personas necesitamos hablar con otras personas y cuando estámos aislados tras de una pantalla en redes sociales y de la misma forma un astronauta que no tiene contacto con sus padres, hijos y amigos.

Guion del pitch en vivo (en español) para la sede Sangolquí, armado sobre la [rúbrica oficial](rubrica/README.md). Son **7 diapositivas** (el máximo; con 8 se pierde 1 punto) y unos **5 minutos** de exposición. La guía no fija la duración: hay ≈ 15 minutos por equipo para pitch, Q&A y calificación, así que **confirmen el tiempo con el Staff** y recorten la demo si les dan menos.

- **Diapositivas:** las del artefacto "Misión Laica — Pitch" (se exportan a PDF o PPTX). Las notas del orador de cada diapositiva tienen el texto de abajo.
- **Placeholders a llenar:** `[enlace público de Vercel]` y la nota sobre IA en las imágenes de Canva.

## 1. Estructura y tiempos

| # | Diapositiva | Tiempo | Rúbrica que cubre |
|---|---|---|---|
| 1 | Portada: Misión Laica | 0:00–0:30 | 3.1 alineación con el reto · 4.1 gancho narrativo |
| 2 | El problema: los 5 peligros | 0:30–1:15 | 1.2 sustento científico · 3.4 contexto · 3.5 usuario |
| 3 | La solución | 1:15–2:00 | 2.3 originalidad · 3.1 alineación |
| 4 | Datos de la NASA | 2:00–2:50 | **1.1, 1.3, 1.5** (el área con más peso en Best Use of Data/Science) |
| 5 | Arquitectura y **demo en vivo** | 2:50–4:00 | **2.1, 2.2, 2.5** · 4.2 UI |
| 6 | Impacto y hoja de ruta | 4:00–4:40 | 3.2, 3.3, 3.4, 3.5 |
| 7 | Transparencia y equipo | 4:40–5:00 | 1.5 · 4.5 · penalización de IA |

La historia sigue **Problema → Solución con datos → Impacto**, que es lo que la rúbrica pide para un 4 en storytelling (4.1).

## 2. Guion

### 1 · Portada (30 s)

> En Marte, un mensaje a la Tierra tarda hasta **22 minutos** en llegar, y otros 22 en volver. Si a las 3 de la mañana a un astronauta le sube la presión, ¿quién le dice si es grave?
>
> Somos el equipo Compumax Evolution, de Ecuador: Melany Irua, Diego Paz y Geovanny Basantes. Nuestro reto es *Create Health Monitoring Software for Astronauts on Space Missions*. Esta es **Misión Laica**… y ella es Laica.

*(Si la app está abierta, que Laica salude y ladre aquí: abre con energía.)*

### 2 · El problema (45 s)

> La NASA resume los riesgos del vuelo espacial en **5 peligros**: radiación, aislamiento, distancia, gravedad y un entorno hostil. Con 20 minutos de retraso, el tripulante no puede esperar a que tierra le conteste: tiene que darse cuenta solo de que algo cambió. Y el aislamiento no es un detalle: está en la lista oficial de riesgos del Human Research Program.
>
> ¿Quién lo usa? Tripulaciones de Artemis y de Marte, análogos como HERA y CHAPEA y, aquí en la Tierra, gente aislada: la estación ecuatoriana Pedro Vicente Maldonado en la Antártida, Galápagos o comunidades rurales lejos de un médico.

### 3 · La solución (45 s)

> Misión Laica es una app que **funciona sin internet**. Tiene cuatro piezas: un check‑in diario por voz, teclado o clics; un motor de alertas en verde, amarillo, naranja y rojo que dice qué hacer y cuándo avisar al médico de vuelo; un cuerpo humano clicable que se colorea según el peor indicador de cada zona; y Laica, la compañera.
>
> ¿Por qué una mascota? Porque las herramientas que ya existen **miden**, pero no **acompañan**. Laica cambia de tono: con todo en verde bromea; en una alerta roja deja el humor y da instrucciones claras.

### 4 · Datos de la NASA (50 s)

> No inventamos umbrales. Los límites salen de **NASA‑STD‑3001**, el estándar médico de la NASA: por ejemplo, el límite de radiación de carrera de 600 mSv. Del **Human Research Roadmap** sacamos los riesgos por sistema y armamos una **matriz de 47 indicadores** con probabilidad por gravedad, frecuencia de medición y cómo se recolecta cada uno. La API **DONKI** de la NASA da los eventos de partículas solares: nuestro script los descarga, y la tormenta solar de la demo sigue ese tipo de evento y activa la alerta de radiación (conectarlo en vivo es la fase 6).

*(Mostrar evidencia visual: la tabla de la matriz en [docs/09](09-matriz-riesgo-indicadores.md) o la salida de `python scripts/donki_radiacion.py`. Para el 3 en la pregunta 1.1 la rúbrica pide "capturas o gráficos".)*

### 5 · Arquitectura y demo en vivo (70 s)

> Por dentro: React y Vite como PWA que se guarda offline, datos en IndexedDB **solo en el dispositivo**, voz con la Web Speech API del navegador, sin nube, y Laica como componente web propio, con una app de escritorio en Electron. Todo es código abierto y tiene 33 pruebas automáticas.

Demo (ensayarla al menos tres veces):

1. Abrir la app: Laica saluda.
2. Decir en voz alta "mi presión es **165 sobre 105**". Laica repite lo que entendió, se confirma y salta la **alerta roja**.
3. Clic en el corazón del cuerpo: rojo, con la explicación y la acción.
4. Mover la barra al **día 17**: tormenta solar; Laica pasa a modo radiación y guía al refugio.
5. Volver a un día en verde y pulsar **🖥️ Sacarla al escritorio**: Laica sale del navegador, cae con gravedad y camina por la barra de tareas.

**Plan B:** si falla el micrófono, escribir el valor en el check‑in. Si falla la red, la app ya está guardada offline. Si falla todo, tener un video de respaldo de ≤ 30 s.

### 6 · Impacto (40 s)

> En el espacio, da autonomía médica a quien no puede esperar a tierra. En Ecuador, la misma app sirve a personal aislado en la Antártida, en Galápagos o en zonas rurales: funciona sin internet y en español. Es usable por voz, teclado o ratón, con lenguaje simple, y respeta la opción del sistema de reducir movimiento.
>
> Lo que sigue: banco de frases y memoria local; DONKI en vivo y frecuencia cardiaca por cámara; y después sensores reales y validación de los umbrales con médicos. Es una herramienta educativa: no reemplaza al médico de vuelo.

> **En la Tierra tenemos a quién llamar. En Marte, Laica es la que contesta primero.** Gracias.

## 3. Ronda de preguntas (Q&A)

Cada pregunta la responde quien tiene el rol (la rúbrica premia en 4.5 que se repartan las preguntas). Respuestas cortas: una idea, un dato, listo.

| Juez | Pregunta probable | Respuesta corta |
|---|---|---|
| RCD | ¿Los datos son reales? | Los del tripulante son simulados y reproducibles; los umbrales salen de NASA‑STD‑3001 y los eventos de radiación de DONKI. En una misión real se conectan a los sensores de a bordo. |
| RCD | ¿De dónde sale el 600 mSv? | Es el límite de exposición de carrera de NASA‑STD‑3001 Vol. 1 ([docs/01](01-riesgos-salud.md), [docs/09](09-matriz-riesgo-indicadores.md) RA‑01). |
| RCD | ¿Cómo eligieron los 47 indicadores? | De los riesgos del Human Research Roadmap y los 5 peligros; cada uno con probabilidad × gravedad, frecuencia y forma de medirlo ([docs/09](09-matriz-riesgo-indicadores.md)). |
| RCD | ¿Limitaciones? | Umbrales ilustrativos que deben validar médicos; sin sensores reales; la voz depende del navegador. |
| IET | ¿Por qué no IA para las alertas? | Las alertas deben ser predecibles y auditables. Un motor de reglas lo es y corre en cualquier equipo con poca energía. Un modelo local solo cambiaría las palabras, nunca la decisión. |
| IET | ¿Cómo funciona offline? | Un service worker guarda todos los archivos en la primera visita; los datos viven en IndexedDB. |
| IET | ¿Cómo entiende la voz? | Web Speech API del navegador, más un intérprete de reglas propio que reconoce frases como "120 sobre 80" y pide confirmación antes de guardar. |
| IET | ¿Cómo sale Laica del navegador? | Una app de escritorio en Electron con una ventana transparente que cubre la pantalla; la web la abre con un enlace `laica://`. |
| IR | ¿Quién lo usaría mañana? | Análogos (HERA, CHAPEA), entrenamiento de tripulaciones, y en Ecuador, personal aislado en la Antártida o en zonas rurales. |
| IR | ¿Cómo lo sostienen? | Código abierto y sin servidores: no cuesta mantenerlo. El siguiente paso es un piloto con un análogo o una universidad. |
| STP | ¿Por qué un perro? | Laica honra a la primera perrita en orbitar la Tierra; una compañera cálida combate el aislamiento, que es uno de los 5 peligros. |

## 4. Para subir de nota en Rigor científico (RCD)

Es el área más débil de una app de este tipo y pesa 50 % en Best Use of Data y Best Use of Science.

- Poner en la diapositiva 4 **una captura real**: la matriz de riesgo, la salida del script DONKI o la tarjeta de referencia de una alerta (cada alerta muestra su fuente).
- Pedir una clave gratis en [api.nasa.gov](https://api.nasa.gov/) y correr `NASA_API_KEY=... python scripts/donki_radiacion.py` antes del pitch (la `DEMO_KEY` se queda sin cupo rápido).
- Tener a mano los enlaces de [docs/02](02-estandares-nasa-std-3001.md) y [docs/04](04-datos-y-apis.md) para el Q&A.

## 5. Lista de entrega (antes de las 09:00 del domingo)

- [ ] Llenar los placeholders del pitch y exportarlo a PDF (7 páginas).
- [ ] Demo pública en Vercel abriendo en **modo incógnito**.
- [ ] Repositorio público con `LICENSE` en la raíz ✅.
- [ ] Ficha del proyecto en la plataforma global, en **español e inglés**.
- [ ] Marcar la declaración de uso de IA; confirmar si las imágenes de Canva son de IA y, si lo son, ponerles marca de agua.
- [ ] Sin logos de la NASA (el logo oficial de Space Apps sí se puede usar según su guía de marca).
- [ ] Ensayar la demo con el plan B.
