# Datos abiertos de la NASA usados · NASA Open Data Used

**Proyecto / Project:** Misión Laica · NASA Space Apps Challenge 2026, Sangolquí

## Español

### Fuentes oficiales y cómo se usan

| Fuente oficial (enlace) | Qué tomamos | Dónde actúa en el proyecto |
|---|---|---|
| [NASA‑STD‑3001 Vol. 1: salud de la tripulación](https://www.nasa.gov/reference/nasa-std-3001v1/) | Límites médicos; por ejemplo, el límite de radiación de carrera de **600 mSv** | Umbrales del motor de alertas ([app/src/motor/reglas.js](../app/src/motor/reglas.js)) |
| [NASA‑STD‑3001 Vol. 2: factores humanos y hábitat](https://www.nasa.gov/reference/nasa-std-3001v2/) | Rangos de atmósfera y hábitat (SpO₂, CO₂, temperatura) | Umbrales de SpO₂ y entorno |
| [Boletines técnicos OCHMO](https://www.nasa.gov/ochmo/hsa-standards/ochmo-technical-briefs/) | Protección contra radiación y otros temas por sistema | Referencias de la matriz de riesgo |
| [Human Research Program: 5 peligros](https://www.nasa.gov/hrp/hazards/) y [riesgos del HRP](https://www.nasa.gov/hrp/risks/) | Los 5 peligros (radiación, aislamiento, distancia, gravedad, entorno hostil) y la lista oficial de riesgos | Planteamiento del problema y zonas del cuerpo |
| [Human Research Roadmap: riesgos](https://humanresearchroadmap.nasa.gov/risks/) y [evidencia](https://humanresearchroadmap.nasa.gov/evidence/) | Riesgos y evidencia por sistema corporal | **Matriz de 47 indicadores** (probabilidad × gravedad) en [docs/09](../docs/09-matriz-riesgo-indicadores.md) y [data/indicadores.csv](../data/indicadores.csv) |
| [DONKI: Space Weather Database](https://ccmc.gsfc.nasa.gov/tools/DONKI/) vía la [API de NASA](https://api.nasa.gov/) | Eventos de partículas solares (SEP) y fulguraciones (FLR) | [scripts/donki_radiacion.py](../scripts/donki_radiacion.py) los descarga; la alerta de radiación ("ve al refugio") sigue ese tipo de evento |
| [Open Science Data Repository (OSDR)](https://osdr.nasa.gov/bio/repo/) | Estudios de biología y fisiología espacial | [scripts/osdr_datasets.py](../scripts/osdr_datasets.py); sustento de las explicaciones |
| [NASA Technical Reports Server (NTRS)](https://ntrs.nasa.gov/) | Papers técnicos sobre monitoreo de salud | [scripts/buscar_ntrs.py](../scripts/buscar_ntrs.py) |
| [NASA Twins Study](https://www.nasa.gov/humans-in-space/twins-study/), [HERA](https://www.nasa.gov/mission/hera/), [CHAPEA](https://www.nasa.gov/humans-in-space/chapea/) | Efectos de misiones largas, aislamiento y análogos | Salud mental, usuarios y casos de uso ([docs/05](../docs/05-salud-mental-y-autonomia.md)) |
| [NASA Life Sciences Portal (NLSP)](https://nlsp.nasa.gov/) | Catálogo de datos de ciencias de la vida | Referencia ([docs/04](../docs/04-datos-y-apis.md)) |

### Cómo se procesan

1. **Fuentes:** leímos los estándares y riesgos oficiales.
2. **Matriz de riesgo:** para cada uno de los 47 indicadores, probabilidad × gravedad (1 a 25), frecuencia de medición, forma de medirlo e instrumentación a bordo. La regenera [scripts/generar_matriz.py](../scripts/generar_matriz.py).
3. **Reglas:** cada indicador tiene umbrales verde, amarillo, naranja y rojo, con su referencia, y cada alerta muestra su fuente en la app.
4. **Nivel y acción:** el motor da el nivel general, la acción sugerida y si hay que avisar al médico de vuelo. Laica cambia de estado según ese nivel.

**Transparencia:** los datos del tripulante en la demo son **simulados** (30 días, semilla fija, reproducibles), porque no hay sensores reales. Los umbrales y los eventos de radiación vienen de las fuentes oficiales de arriba. Los umbrales son ilustrativos y deben validarse con médicos antes de cualquier uso real.

## English

### Official sources and how they are used

| Official source | What we take | Where it acts in the project |
|---|---|---|
| [NASA‑STD‑3001 Vol. 1](https://www.nasa.gov/reference/nasa-std-3001v1/) | Medical limits; for example, the **600 mSv** career radiation limit | Alert engine thresholds |
| [NASA‑STD‑3001 Vol. 2](https://www.nasa.gov/reference/nasa-std-3001v2/) | Atmosphere and habitat ranges | SpO₂ and environment thresholds |
| [OCHMO technical briefs](https://www.nasa.gov/ochmo/hsa-standards/ochmo-technical-briefs/) | Radiation protection and other topics | Risk matrix references |
| [HRP 5 Hazards](https://www.nasa.gov/hrp/hazards/), [HRP risks](https://www.nasa.gov/hrp/risks/) | The 5 hazards and the official risk list | Problem statement, body zones |
| [Human Research Roadmap](https://humanresearchroadmap.nasa.gov/risks/) | Risks and evidence by body system | **47‑indicator risk matrix** (likelihood × severity) |
| [DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) via the [NASA API](https://api.nasa.gov/) | Solar energetic particle events and flares | `scripts/donki_radiacion.py`; the radiation alert follows that event type |
| [OSDR](https://osdr.nasa.gov/bio/repo/), [NTRS](https://ntrs.nasa.gov/), [NLSP](https://nlsp.nasa.gov/) | Space biology studies and technical papers | Scripts and explanations |
| [Twins Study](https://www.nasa.gov/humans-in-space/twins-study/), [HERA](https://www.nasa.gov/mission/hera/), [CHAPEA](https://www.nasa.gov/humans-in-space/chapea/) | Long‑duration, isolation and analog missions | Mental health, users and use cases |

### Processing

Official sources → risk matrix (likelihood × severity, frequency, collection method) → threshold rules for each indicator (green, yellow, orange, red, with the source shown on every alert) → overall level, suggested action and whether to call the flight surgeon.

**Transparency:** crew data in the demo are **simulated** (30 days, fixed seed, reproducible). Thresholds and radiation events come from the official sources above. Thresholds are illustrative and must be clinically validated before any real use.
