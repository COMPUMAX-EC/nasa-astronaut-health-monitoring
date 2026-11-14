# Guía y rúbrica oficial — Sede Sangolquí 2026

Documento original: [guia-participantes-y-rubrica-sangolqui-2026.pdf](guia-participantes-y-rubrica-sangolqui-2026.pdf) (19 páginas, Comité Organizador NASA Space Apps Challenge Sangolquí 2026, ESPE). Aquí va el resumen de lo que nos afecta y dónde lo cubrimos.

## Fechas clave (domingo 15 de noviembre de 2026)

| Hora | Qué pasa |
|---|---|
| **09:00** | Entrega obligatoria en el formulario de la sede **y** en la plataforma global de NASA |
| 09:30–10:45 | Auditoría técnica del Staff (enlaces, datos NASA, repositorio, formato) |
| 11:00 | Los mentores dejan de intervenir; empiezan los pitches |
| 11:00–13:30 | **Pitch en español + Q&A**, 4 salas, 4 jueces por sala, 10 equipos por sala |
| 15:00–16:00 | Premiación y anuncio de nominados globales |

Nuestro reto (*Create Health Monitoring Software for Astronauts on Space Missions*) está en el **Bloque 2** de mentores (aplicaciones funcionales, salud y fisiología espacial).

## Penalizaciones del Staff (se restan de la nota final)

| Requisito | Penalización | Estado en el repo |
|---|---|---|
| Citar y enlazar datos abiertos de NASA | −2 | ✅ [docs/04](../04-datos-y-apis.md), [docs/02](../02-estandares-nasa-std-3001.md), diapositiva 4 |
| Repositorio público con **archivo de licencia en la raíz** | −2 | ✅ [LICENSE](../../LICENSE) (MIT para el código; textos CC BY 4.0) |
| Todos los enlaces abren en incógnito (sin 404 ni permisos) | −1 | ⚠️ Probar el link de la demo (Vercel) y el de las diapositivas en incógnito |
| **Máximo 7 diapositivas** (o video ≤ 30 s, tolerancia 35 s) | −1 | ✅ El pitch tiene 7 |
| Declaración de IA, marca de agua en imágenes hechas con IA, sin logos NASA | −1 | ✅ Diapositiva 7; ⚠️ confirmar si las imágenes de Canva son de IA |
| Ficha y entregables en **español e inglés** | −1 | ✅ [docs/13](../13-pitch.md) y [docs/13 (EN)](../13-pitch.en.md); ⚠️ la ficha de la plataforma también |

## Rúbrica en vivo: 4 áreas × 5 preguntas (escala 1 a 5)

| Área | Juez | Qué mira | Preguntas |
|---|---|---|---|
| **RCD** Rigor científico y datos | Experto RCD | Datos NASA reales y bien usados, ciencia correcta, procesamiento explicado | 1.1 uso evidente de datos NASA · 1.2 sustento científico · 1.3 cómo se procesaron los datos · 1.4 dominio en Q&A · 1.5 transparencia y atribución |
| **IET** Innovación y ejecución técnica | Experto IET | Prototipo que funciona, arquitectura, originalidad | 2.1 demo del MVP · 2.2 arquitectura explicada · 2.3 creatividad · 2.4 defensa técnica en Q&A · 2.5 factibilidad y reproducibilidad |
| **IR** Impacto y relevancia | Experto IR | Alineación con el reto, impacto, escalabilidad, contexto, usuario | 3.1 alineación con el reto · 3.2 magnitud del impacto · 3.3 adopción post‑hackathon · 3.4 pertinencia territorial o de misión · 3.5 accesibilidad y usabilidad |
| **STP** Storytelling y presentación | Experto STP | Narrativa, diseño visual, tiempo, oratoria, equipo en Q&A | 4.1 estructura narrativa · 4.2 calidad visual y UI · 4.3 gestión del tiempo · 4.4 expresión oral · 4.5 cohesión en Q&A |

El 5 se reserva para lo "verdaderamente sobresaliente". El 4 suele pedir **explicar con claridad** (de qué misión vienen los datos, el pipeline, la arquitectura) y **defender en Q&A**.

## Cómo se convierte en nominaciones

Cada categoría global pondera las 4 áreas de forma distinta. Nota base = Σ(promedio del área × 20 × peso). Cada voto de juez para una categoría suma **+3** (máx. +12); las penalizaciones restan.

| Categoría | RCD | IET | IR | STP | ¿Nos conviene? |
|---|---|---|---|---|---|
| Best Use of Data | 50 % | 20 % | 15 % | 15 % | |
| Best Use of Science | 50 % | 20 % | 20 % | 10 % | |
| Best Use of Technology | 20 % | 50 % | 15 % | 15 % | ✅ PWA offline + voz + escritorio |
| Best Mission Concept | 25 % | 35 % | 25 % | 15 % | |
| Galactic Impact | 15 % | 15 % | 50 % | 20 % | ✅ |
| Best Storytelling | 15 % | 15 % | 20 % | 50 % | ✅ Laica |
| **Art & Technology** | 15 % | 40 % | 15 % | 30 % | ✅✅ Laica (diseño + técnica) |
| Global Connection | 15 % | 15 % | 45 % | 25 % | |
| Local Impact | 15 % | 15 % | 50 % | 20 % | ✅ Antártida, Galápagos, zonas rurales |
| **Most Inspirational** | 10 % | 15 % | 25 % | 50 % | ✅✅ |

Nuestro punto fuerte natural es **IET + STP** (Art & Technology, Most Inspirational, Best Storytelling). El punto a reforzar es **RCD**: mostrar la evidencia de los datos NASA en pantalla y explicar el procesamiento (ver [docs/13](../13-pitch.md) §4).
