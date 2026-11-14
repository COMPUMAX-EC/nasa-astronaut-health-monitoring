# 10. Soluciones similares al reto

Lista de soluciones **reales** (de agencias espaciales, institutos de investigación, empresas y equipos de hackathon) que resuelven parte del problema. Sirve para:

1. **No reinventar:** tomar ideas probadas.
2. **Diferenciarse:** mostrar al jurado qué hueco cubre nuestra solución.
3. **Citar antecedentes** en la presentación.

> Información recopilada el 2026‑11‑14. El estado de cada proyecto puede haber cambiado; varios datos vienen de prensa y no de documentos oficiales.

## 10.1 Mapa rápido

| # | Solución | Quién | Tipo | Qué cubre del reto |
|---|---|---|---|---|
| 1 | Crew Medical Officer Digital Assistant (CMO‑DA) | NASA + Google | Asistente médico con IA | Diagnóstico y decisiones médicas autónomas |
| 2 | AMOS – Autonomous Medical Officer Support | NASA | Software de guía de procedimientos | Actuar ante un problema médico sin la Tierra |
| 3 | MEDICS | NASA | Sistema de apoyo a decisiones médicas | Triaje y diagnóstico en exploración |
| 4 | EIMO – Earth‑Independent Medical Operations | NASA | Marco/concepto de operaciones | Arquitectura de la autonomía médica |
| 5 | Bio‑Monitor / Astroskin | Agencia Espacial Canadiense + Hexoskin | Wearable (camiseta inteligente) | Signos vitales continuos |
| 6 | Wearable Monitoring (ISS) | NASA / ISS | Experimento con chaleco de sensores | FC y respiración durante el sueño |
| 7 | Cognition | Univ. de Pensilvania + NASA | Batería de tests cognitivos | Rendimiento cognitivo (estándar de NASA) |
| 8 | Virtual Space Station | Dartmouth + NASA | Autoayuda psicológica interactiva | Salud mental en aislamiento |
| 9 | CIMON | DLR + Airbus + IBM | Asistente robótico con IA | Interacción, apoyo y bienestar de la tripulación |
| 10 | Astrobee | NASA Ames | Robot volador con cámaras | Plataforma móvil para sensores y cámaras |
| 11 | EXPAND | TRISH (Baylor) + TrialX | Base de datos de salud | Datos de misiones comerciales (Polaris Dawn, Fram2…) |
| 12 | AstroRad / Active Dosimeter | StemRad, ESA | Protección y medición de radiación | Radiación (probados en Artemis I) |
| 13 | Proyectos de NASA Space Apps | Equipos de hackathon | Prototipos | Diversos (ver 10.4) |
| 14 | Wearables comerciales | Hexoskin, Garmin, Apple, BioButton… | Productos de consumo y clínicos | Signos vitales, sueño y actividad |

## 10.2 Soluciones de agencias e institutos

### 1. Crew Medical Officer Digital Assistant (CMO‑DA) — NASA + Google

- **Qué es:** prueba de concepto de un sistema de apoyo a decisiones clínicas para misiones lejanas. Interacción por voz, texto e imágenes.
- **Cómo funciona:** modelo de IA en Google Cloud (Vertex AI). NASA es dueña del código y participa en el ajuste del modelo. Se probó con casos simulados (lesión de tobillo, dolor de flanco, dolor de oído) evaluados por médicos, uno de ellos astronauta.
- **Qué tomar:** interfaz multimodal, explicación del razonamiento clínico, evaluación por médicos.
- **Hueco que deja:** depende de la nube y se centra en diagnosticar *cuando ya hay un problema*. **Nuestra solución:** monitoreo continuo y preventivo, 100 % offline.
- Fuentes: [Google Public Sector](https://publicsector.google/ai/how-google-and-nasa-are-testing-ai-for-medical-care-in-space/) · [Space.com](https://www.space.com/technology/nasa-and-google-test-ai-medical-assistant-for-astronaut-missions-to-the-moon-and-mars) · [Paper del HRP sobre IA (NTRS)](https://ntrs.nasa.gov/citations/20260001797)

### 2. AMOS – Autonomous Medical Officer Support — NASA

- **Qué es:** software que guía paso a paso a un tripulante no médico en procedimientos médicos; probado en la ISS.
- **Qué tomar:** las tarjetas de "Qué hacer" de nuestras alertas pueden seguir su formato de procedimiento guiado.
- Fuentes: [Demos de AMOS en la ISS (NTRS)](https://ntrs.nasa.gov/citations/20240012964) · [AMOS: guía de procedimientos independiente de la Tierra (NTRS)](https://ntrs.nasa.gov/citations/20220014327)

### 3. MEDICS — NASA

- **Qué es:** sistema de apoyo a decisiones médicas para exploración de larga duración.
- **Qué tomar:** lógica de triaje y priorización de condiciones médicas.
- Fuente: [MEDICS (NTRS)](https://ntrs.nasa.gov/citations/20200000615)

### 4. EIMO – Earth‑Independent Medical Operations — NASA

- **Qué es:** el marco con el que NASA planea que la tripulación detecte, diagnostique y trate sin la Tierra. Incluye el "Datascope", la capa de datos médicos a bordo.
- **Qué tomar:** usar su terminología y arquitectura para que el jurado vea que la solución encaja en la estrategia de NASA.
- Fuentes: [Concepto de operaciones EIMO 2024 (NTRS)](https://ntrs.nasa.gov/citations/20240001402) · [EIMO Datascope (NTRS)](https://ntrs.nasa.gov/citations/20240000914)

### 5. Bio‑Monitor / Astroskin — CSA + Hexoskin

- **Qué es:** camiseta y banda de cabeza con sensores: FC, ECG, respiración, SpO₂, presión arterial, temperatura de la piel, actividad y sueño. La probó por primera vez en la ISS David Saint‑Jacques en 2019 y la validó en órbita Luca Parmitano (ESA). Se estudia una versión rediseñada para la estación lunar Gateway.
- **Qué tomar:** es la **fuente de datos realista** de nuestro prototipo; podemos simular su formato de salida.
- **Hueco que deja:** recolecta datos, pero la evaluación la hacen investigadores en tierra. **Nuestra solución:** la interpretación y las alertas a bordo, para el propio astronauta.
- Fuentes: [CSA Bio‑Monitor](https://www.asc-csa.gc.ca/eng/sciences/bio-monitor.asp) · [Space.com: camisetas inteligentes para Gateway](https://www.space.com/space-exploration/artemis/astronauts-on-nasas-moon-orbiting-gateway-space-station-will-wear-smart-undershirts-to-stay-healthy) · [Hexoskin y astronautas](https://hexoskin.com/blogs/news/tagged/astronauts)

### 6. Wearable Monitoring y otras pruebas de wearables en la ISS — NASA

- **Qué es:** chaleco con sensores que registra FC y respiración durante el sueño para estudiar cómo la actividad cardiaca afecta la calidad del sueño. NASA reúne varios proyectos de wearables en la ISS.
- **Qué tomar:** combinar señales cardiacas y de sueño (CV‑02 + SU‑01 en la [matriz](09-matriz-riesgo-indicadores.md)).
- Fuente: [NASA – Wearable Tech for Space Station Research](https://www.nasa.gov/missions/station/wearable-tech-for-space-station-research/)

### 7. Cognition — Universidad de Pensilvania + NASA

- **Qué es:** batería de 10 tests cognitivos (≈20 min) diseñada para astronautas. Forma parte de las medidas estándar de salud conductual y rendimiento de NASA en la ISS.
- **Qué tomar:** el diseño de nuestros tests CO‑01/CO‑02; la idea de que la autoevaluación subjetiva y el rendimiento objetivo pueden no coincidir.
- Fuentes: [Penn – Astronaut Behavioral Health](https://www.med.upenn.edu/uep/astronaut.html) · [Phys.org (2014)](https://phys.org/news/2014-11-team-cognitive-battery-spaceflight.html)

### 8. Virtual Space Station — Dartmouth + NASA

- **Qué es:** herramientas de autoayuda interactivas para que los astronautas prevengan, detecten y manejen problemas psicosociales (depresión, conflictos) de forma **confidencial** en su portátil. Usa terapia de resolución de problemas.
- **Qué tomar:** confidencialidad y control del astronauta sobre sus datos, coherente con nuestro módulo facial con privacidad desde el diseño.
- Fuente: [Dartmouth (2014)](https://home.dartmouth.edu/news/2014/10/houston-we-have-problembut-no-worries-our-virtual-therapist-it)

### 9. CIMON — DLR + Airbus + IBM

- **Qué es:** asistente esférico flotante con IA y reconocimiento de voz que acompañó a astronautas en la ISS.
- **Qué tomar:** interacción por voz para reducir la carga de trabajo; lecciones sobre la aceptación de asistentes por la tripulación.
- Fuente: [DLR – CIMON](https://www.dlr.de/en/research-and-transfer/projects-and-missions/horizons/cimon)

### 10. Astrobee — NASA Ames

- **Qué es:** robots voladores libres en la ISS, con cámaras y capacidad para cargar experimentos.
- **Qué tomar:** una plataforma móvil para el módulo de cámara (por ejemplo, observar el ejercicio sin una cámara fija).
- Fuente: [NASA Astrobee](https://www.nasa.gov/ames/astrobee/)

### 11. EXPAND — TRISH + TrialX

- **Qué es:** iniciativa del Translational Research Institute for Space Health que recoge datos biomédicos de vuelos comerciales antes, durante y después del vuelo: cognición, postura, ultrasonido, datos ómicos, wearables (Garmin, BioButton) y radiación. Incluye Polaris Dawn y Fram2.
- **Qué tomar:** su **esquema de datos multimisión** y los tipos de dispositivos comerciales que ya volaron.
- Fuentes: [TRISH – EXPAND](https://www.bcm.edu/academic-centers/space-medicine/translational-research-institute/research/commercial-spaceflight) · [TrialX – base de datos EXPAND](https://trialx.com/space-health-research-expand-database/) · [TRISH – wearable para la atención del astronauta](https://www.bcm.edu/academic-centers/space-medicine/translational-research-institute/research/trish-innovations/a-wearable-to-focus-the-astronaut-mind)

### 12. AstroRad y dosímetros activos — StemRad, ESA

- **Qué es:** chaleco de protección contra eventos de partículas solares y dosímetros activos de ESA; ambos volaron en Orion durante Artemis I (2022).
- **Qué tomar:** la alerta de radiación (RA‑02) puede recomendar "ponerse el chaleco o ir al refugio".
- Fuente: búsqueda en [NTRS](https://ntrs.nasa.gov/) con `AstroRad Artemis I` y `Orion radiation measurements`. Plan de protección de Orion: [NASA](https://www.nasa.gov/missions/artemis/orion/scientists-and-engineers-evaluate-orion-radiation-protection-plan/)

## 10.3 Herramientas comerciales en la Tierra (análogos)

| Producto | Qué mide | Relación con el espacio |
|---|---|---|
| Hexoskin (versión comercial de Astroskin) | ECG, respiración, actividad, sueño | Misma empresa que el wearable de la ISS |
| Garmin, BioButton | FC, actividad, temperatura | Usados en misiones comerciales (EXPAND) |
| Relojes y anillos inteligentes | FC, VFC, sueño, SpO₂ | Buena referencia de interfaz: puntuación diaria de "recuperación" o "preparación" |
| Apps de salud mental con check‑in diario | Ánimo, estrés | Modelo para el check‑in de 2 minutos |

**Qué tomar de ellas:** el concepto de una **puntuación diaria de preparación** que resume varias señales, y la visualización de tendencias frente a la línea base personal.

## 10.4 Proyectos de NASA Space Apps relacionados

| Año | Proyecto / reto | Qué hizo | Fuente |
|---|---|---|---|
| 2025 | **SpaceGenes+** (ganador global, Mejor Uso de la Ciencia) | Panel interactivo sobre cómo la radiación y la microgravedad afectan la salud del astronauta a nivel molecular (reto *Build a Space Biology Knowledge Engine*) | [NASA – ganadores 2025](https://www.nasa.gov/learning-resources/stem-engagement-at-nasa/nasa-announces-2025-international-space-apps-challenge-global-winners/) |
| 2020 | Reto **Sleep Shift Scheduling Tool** | Herramientas para planificar turnos y sueño de la tripulación | [Equipo Morpheus SleepTech](https://2020.spaceappschallenge.org/challenges/sustain/sleep-shift-scheduling-tool/teams/morpheus-sleeptech) |
| 2016 | **Canaria** (ganador global, Mejor Uso de Hardware) | Auricular impreso en 3D que mide FC y oxígeno en sangre | [IoT Now](https://www.iot-now.com/2016/06/06/48175-university-surrey-students-project-canaria-wins-global-nasa-spaceapps-challenge-2016/) |
| 2015 | App para smartwatch de astronautas | Concurso de NASA para una app de reloj para la ISS | [Wareable](https://www.wareable.com/smartwatches/astronaut-smartwatch-app-nasa-iss-2015) |
| 2014–2015 | Reto **Fit as a MOoSE** (Metabolic Observations of Space Explorers) | Monitoreo metabólico y de ejercicio de astronautas | [Space Apps 2014](https://2014.spaceappschallenge.org/challenge/fit-moose-metabolic-observations-space-explorers/) |
| 2018 | Reto *Make Sense Out of Mars* (equipo SpaceMed) | Sensores para salud en Marte | [SpaceMed](https://2018.spaceappschallenge.org/challenges/can-you-build/make-sense-out-mars/teams/spacemed-1/project) |

## 10.5 ¿Qué hueco cubre nuestra solución?

| Capacidad | CMO‑DA | AMOS | Astroskin | Cognition | VSS | EXPAND | **Nuestra solución** |
|---|---|---|---|---|---|---|---|
| Recolecta indicadores de varios sistemas | ◐ | — | ✅ | — | — | ✅ | ✅ |
| Evalúa el estado a bordo (no en tierra) | ✅ | ✅ | — | ◐ | ◐ | — | ✅ |
| Monitoreo continuo y preventivo | — | — | ✅ | ◐ | — | — | ✅ |
| Línea base personal y tendencias | — | — | — | ✅ | — | — | ✅ |
| Alertas con acción concreta | ◐ | ✅ | — | — | ◐ | — | ✅ |
| Funciona sin conexión | — (nube) | ✅ | ◐ | ✅ | ✅ | — | ✅ |
| Salud mental con privacidad desde el diseño | — | — | — | — | ✅ | — | ✅ |
| Prioriza por matriz de riesgo | — | — | — | — | — | — | ✅ |
| Módulo de cámara (pose, piel, ánimo) | ◐ (imágenes) | — | — | — | — | — | ✅ |

✅ sí · ◐ parcial · — no (según la información pública disponible)

**Mensaje para el pitch:** las soluciones existentes son **piezas sueltas**: un wearable recolecta, un test cognitivo mide, un asistente diagnostica cuando ya hay un problema. Nuestra propuesta las **integra en un solo panel offline** que el astronauta usa a diario para saber cómo está y qué hacer, priorizado por riesgo y con privacidad desde el diseño.
