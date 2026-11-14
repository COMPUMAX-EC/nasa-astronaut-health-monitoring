# 5. Salud mental, análogos y autonomía médica

## 5.1 Comportamiento y rendimiento

- Human Factors and Behavioral Performance (HRP): https://www.nasa.gov/hrp/human-factors-and-behavioral-performance/
- Boletín de salud conductual (TB‑016): https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-016-behavioral-health.pdf
- Incidentes de salud conductual (TB‑014): https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-014-behavioral-health-mishaps.pdf
- Carga cognitiva (TB‑032): https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-032-cognitive-workload.pdf
- Desincronización circadiana (MTB‑009): https://www.nasa.gov/wp-content/uploads/2026/03/ochmo-mtb-009-circadian-desynchrony.pdf

**Qué aplicar en el software:** autoevaluaciones breves y diarias, test de vigilancia psicomotora (PVT), seguimiento del sueño, registro de interacciones del equipo y herramientas de afrontamiento (respiración, contacto con familia en diferido, ocio). Evitar que el seguimiento se sienta como vigilancia: los datos de salud mental deben ser **privados por defecto** y compartirse solo con consentimiento.

## 5.2 Misiones análogas (aislamiento en la Tierra)

| Análogo | Qué es | Enlace |
|---|---|---|
| **HERA** – Human Exploration Research Analog | Hábitat en JSC con misiones de 45 días en aislamiento | https://www.nasa.gov/mission/hera/ |
| **CHAPEA** – Crew Health and Performance Exploration Analog | Simulación de 1 año en un hábitat marciano impreso en 3D | https://www.nasa.gov/humans-in-space/chapea/ |
| CHAPEA: un año dentro del hábitat | Lecciones de la primera misión | https://www.nasa.gov/humans-in-space/nasas-simulated-mars-crew-marks-one-year-inside-habitat/ |
| Estudios en reposo en cama | Simulan los efectos de la microgravedad | https://www.nasa.gov/humans-in-space/one-small-step-without-ever-leaving-bed/ |
| Evaluación de análogos de entornos extremos (OCHMO) | Antártida, submarinos, etc. | https://www.nasa.gov/ochmo-extreme-environment-analogs-assessment-program/ |

## 5.3 NASA Twins Study

Comparación de Scott Kelly (340 días en la ISS) con su gemelo Mark en la Tierra: cambios en expresión génica, telómeros, sistema inmune, microbioma, cognición y visión. Es el mejor ejemplo de **monitoreo multiómico longitudinal**.

- https://www.nasa.gov/humans-in-space/twins-study/

## 5.4 Autonomía médica (Earth‑independent medical operations)

En Marte la comunicación tiene un retraso de hasta ~20 minutos en cada sentido y no hay evacuación. La tripulación debe detectar, diagnosticar y tratar por su cuenta. Fuentes:

- Operaciones médicas (TB‑044): https://www.nasa.gov/wp-content/uploads/2025/08/ochmo-tb-044-medical-operations.pdf
- Duración de misión e implicaciones médicas (TB‑007): https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-007-mission-duration.pdf
- Fármacos en vuelo (TB‑006): https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-006-pharmaceuticals.pdf
- Usabilidad (TB‑005): https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-005-usability.pdf
- Búsqueda en NTRS: `Earth independent medical operations`, `exploration medical capability`, `Integrated Medical Model` (ver [04-datos-y-apis.md](04-datos-y-apis.md#42-nasa-technical-reports-server-ntrs))

**Implicaciones de diseño:** funcionar 100 % sin conexión, sincronizar con la Tierra cuando haya enlace, explicar cada alerta en lenguaje claro y ofrecer pasos concretos, registrar todo para el análisis posterior por los médicos de vuelo.
