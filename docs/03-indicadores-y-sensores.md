# 3. Indicadores de salud y sensores

Propuesta de **qué medir**, organizada por sistema corporal y vinculada a la fuente NASA que la justifica. Las frecuencias son sugerencias de diseño para el MVP, no prescripciones médicas.

## 3.1 Matriz de indicadores

| Sistema | Indicador | Cómo se obtiene | Frecuencia sugerida | Fuente NASA |
|---|---|---|---|---|
| **Cardiovascular** | Frecuencia cardiaca, VFC (HRV) | Wearable / ECG | Continua | [Riesgos HRP](https://www.nasa.gov/hrp/risks/), [TB‑019](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-019-orthostatic-intolerance.pdf) |
| | Presión arterial | Tensiómetro | Diaria | NASA‑STD‑3001 Vol. 1 |
| | Síntomas de trombosis (dolor/hinchazón en cuello o piernas) | Autorreporte | Diaria | [MTB‑007](https://www.nasa.gov/wp-content/uploads/2026/01/ochmo-mtb-007-venous-thrombosis-in-spaceflight.pdf) |
| **Óseo** | Minutos de ejercicio resistivo, carga | Registro del equipo de ejercicio | Por sesión | [MTB‑013](https://www.nasa.gov/wp-content/uploads/2026/02/ochmo-mtb-013-bone-loss.pdf) |
| | Calcio urinario / marcadores de resorción | Análisis a bordo | Semanal–mensual | [MTB‑013](https://www.nasa.gov/wp-content/uploads/2026/02/ochmo-mtb-013-bone-loss.pdf) |
| **Muscular** | Fuerza (dinamometría), masa corporal | Test + báscula de masa | Semanal | [Human Health Countermeasures](https://www.nasa.gov/hrp/human-health-countermeasures/) |
| **Visión (SANS)** | Agudeza visual, rejilla de Amsler, síntomas | Test en tableta | Semanal | [MTB‑001](https://www.nasa.gov/wp-content/uploads/2024/02/ochmo-mtb-001-sans.pdf) |
| **Inmune** | Temperatura, síntomas infecciosos, lesiones cutáneas, herpes labial (reactivación viral) | Termómetro + autorreporte | Diaria | [Riesgos HRP](https://www.nasa.gov/hrp/risks/), [Twins Study](https://www.nasa.gov/humans-in-space/twins-study/) |
| **Radiación** | Dosis personal acumulada; eventos SEP | Dosímetro + [DONKI](04-datos-y-apis.md#44-clima-espacial-donki) | Continua | [HRP Radiation](https://www.nasa.gov/hrp/radiation/), [TB‑020](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-020-radiation-protection.pdf), [SRAG](https://srag.jsc.nasa.gov/) |
| **Sueño / circadiano** | Duración y calidad del sueño, hora de luz | Actigrafía + diario | Diaria | [MTB‑009](https://www.nasa.gov/wp-content/uploads/2026/03/ochmo-mtb-009-circadian-desynchrony.pdf), [TB‑041](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-041-sleep-accommodations.pdf) |
| **Cognitivo** | Tiempo de reacción (PVT), memoria de trabajo | Mini test de 3–5 min | Diaria / semanal | [TB‑032](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-032-cognitive-workload.pdf), [HFBP](https://www.nasa.gov/hrp/human-factors-and-behavioral-performance/) |
| **Salud mental** | Ánimo, estrés, soledad, conflicto en el equipo | Cuestionario breve | Diaria | [TB‑016](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-016-behavioral-health.pdf), [TB‑014](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-014-behavioral-health-mishaps.pdf) |
| **Nutrición** | Calorías, agua, peso | Registro de comidas | Diaria | [TB‑013](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-013-food-and-nutrition.pdf) |
| **Sensoriomotor** | Mareo, equilibrio (sobre todo tras aterrizar) | Autorreporte + test | Según fase | [TB‑010](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-010-sensorimotor.pdf), [MTB‑004](https://www.nasa.gov/wp-content/uploads/2025/09/ochmo-mtb-004-space-adaptation-sickness-sas.pdf) |
| **Entorno** | CO₂, O₂, temperatura, humedad, ruido | Sensores del hábitat | Continua | [TB‑003](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-003-habitable-atmosphere.pdf), [TB‑035](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-035-acoustics.pdf), NASA‑STD‑3001 Vol. 2 |

## 3.2 Wearables usados en el espacio (referencias reales)

| Dispositivo | Qué mide | Enlace |
|---|---|---|
| **Bio‑Monitor / Astroskin** (Agencia Espacial Canadiense) | ECG, respiración, SpO₂, presión arterial, temperatura, actividad, sueño — usado en la ISS | https://www.asc-csa.gc.ca/eng/sciences/bio-monitor.asp |
| Estudio de salud y rendimiento en Crew‑13 | Ejemplo actual de un protocolo de medición | https://www.nasa.gov/humans-in-space/nasa-to-study-human-health-performance-during-crew-13-mission/ |

## 3.3 Lógica de evaluación recomendada

1. **Línea base personal:** NASA hace vigilancia longitudinal de cada astronauta ([TB‑043](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-043-longitudinal-health-surveillance.pdf)). El software debe comparar cada valor con la línea base *de esa persona* antes del vuelo, no solo con rangos poblacionales.
2. **Tendencias, no solo valores sueltos:** pendiente de 7/30 días (por ejemplo, la masa corporal o la calidad del sueño bajando de forma sostenida).
3. **Semáforo:** 🟢 normal · 🟡 vigilar (desviación > 1 DE de la línea base o tendencia negativa) · 🔴 actuar (umbral del estándar superado o síntomas de alarma).
4. **Acción asociada:** cada alerta enlaza a una guía de qué hacer (contramedida, repetir medición, consultar con el equipo o con el control de misión cuando haya comunicación).
