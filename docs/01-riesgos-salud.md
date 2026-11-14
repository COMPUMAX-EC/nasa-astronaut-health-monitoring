# 1. Riesgos de salud en vuelos espaciales de larga duración

## 1.1 Los 5 peligros del vuelo espacial humano (RIDGE)

Fuentes: [NASA – 5 Hazards of Human Spaceflight](https://www.nasa.gov/hrp/hazards/) · [Infografía "The Human Body in Space"](https://www.nasa.gov/humans-in-space/human-body-in-space-infographic/) · [The Human Body in Space](https://www.nasa.gov/humans-in-space/the-human-body-in-space/)

| Peligro (RIDGE) | Efectos en el cuerpo | Qué debería monitorear el software |
|---|---|---|
| **R**adiación | Daño al ADN, cáncer, efectos en el sistema nervioso central, enfermedad cardiovascular degenerativa, síndrome agudo ante eventos solares | Dosis acumulada (dosímetro personal), alertas de eventos de partículas solares (SEP), síntomas (náusea, fatiga), recuento sanguíneo |
| **I**slamiento y confinamiento | Alteración del sueño, ánimo, conflictos, deterioro cognitivo | Cuestionarios de ánimo/estrés, test de vigilancia (PVT), actigrafía y sueño, diario |
| **D**istancia a la Tierra | Retraso de comunicaciones (hasta ~20 min a Marte), sin evacuación rápida | Autonomía: guías de decisión a bordo, triaje, funcionamiento offline |
| **G**ravedad alterada | Pérdida ósea y muscular, redistribución de fluidos, SANS (visión), desacondicionamiento cardiovascular, intolerancia ortostática, problemas sensoriomotores | Ejercicio realizado, fuerza, masa corporal, FC/PA, visión, marcadores óseos |
| **E**ntorno hostil/cerrado | CO₂, toxinas, microbios, ruido, alteración del sistema inmune, reactivación viral latente | CO₂ y calidad del aire, ruido, temperatura corporal, síntomas infecciosos, biomarcadores inmunes |

## 1.2 Riesgos oficiales del Human Research Program

- **Lista de riesgos del HRP:** https://www.nasa.gov/hrp/risks/
- **Human Research Roadmap – Riesgos:** https://humanresearchroadmap.nasa.gov/risks/
- **Evidence Reports (revisión científica de cada riesgo):** https://humanresearchroadmap.nasa.gov/evidence/

Riesgos más relevantes para el reto (búscalos por nombre en el Roadmap para leer su evidence report):

| Riesgo (nombre en el Roadmap) | Área | Relación con el reto |
|---|---|---|
| Risk of Bone Fracture / Early Onset Osteoporosis | Ósea | Pérdida ósea |
| Risk of Impaired Performance due to Reduced Muscle Mass, Strength & Endurance | Muscular | Ejercicio y fuerza |
| Risk of Cardiovascular Adaptations Contributing to Adverse Mission Performance and Health Outcomes | Cardiovascular | Eventos cardiovasculares |
| Risk of Orthostatic Intolerance During Re‑Exposure to Gravity | Cardiovascular | Llegada a Luna/Marte |
| Risk of Spaceflight Associated Neuro‑ocular Syndrome (SANS) | Visión | Cambios visuales |
| Risk of Adverse Health Event Due to Altered Immune Response | Inmune | Cambios inmunitarios |
| Risk of Adverse Cognitive or Behavioral Conditions and Psychiatric Disorders | Salud mental | Problemas de salud mental |
| Risk of Performance and Behavioral Health Decrements Due to Inadequate Cooperation, Coordination, Communication, and Psychosocial Adaptation within a Team | Equipo | Aislamiento y confinamiento |
| Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload | Sueño | Fatiga |
| Space radiation risks (cáncer, SNC, cardiovascular, síndromes agudos) | Radiación | Radiación espacial |
| Risk of Adverse Health Outcomes & Decrements in Performance Due to In‑flight Medical Conditions | Medicina de exploración | Autonomía médica |
| Risk of Performance Decrement and Crew Illness Due to Inadequate Food and Nutrition | Nutrición | Ingesta y peso |
| Risk of Adverse Health Effects Due to Host‑Microorganism Interactions | Microbiología | Entorno cerrado |

## 1.3 Elementos del HRP

| Elemento | Enlace |
|---|---|
| Human Health Countermeasures (ejercicio, nutrición, fármacos) | https://www.nasa.gov/hrp/human-health-countermeasures/ |
| Human Factors and Behavioral Performance (salud mental, sueño, equipo) | https://www.nasa.gov/hrp/human-factors-and-behavioral-performance/ |
| Space Radiation | https://www.nasa.gov/hrp/radiation/ |
| Research Operations & Integration (cómo se toman datos en la ISS) | https://www.nasa.gov/hrp/research-operations-integration/ |
| Investigación en curso | https://www.nasa.gov/hrp/ongoing-hrp-research/ |
| TRISH – Translational Research Institute for Space Health | https://www.nasa.gov/hrp/the-translational-research-institute-for-space-health-trish/ |
| Estrategia "3 pasos a Marte" | https://www.nasa.gov/humans-in-space/nasas-human-research-program-three-steps-to-mars/ |
| Paso 1: análogos terrestres | https://www.nasa.gov/humans-in-space/step-1-earth-analogs-help-advance-missions-to-moon-mars/ |
| Paso 3: Artemis como banco de pruebas para Marte | https://www.nasa.gov/humans-in-space/step-3-artemis-moon-missions-as-an-astronaut-testbed-for-mars/ |

## 1.4 Radiación

- HRP Space Radiation: https://www.nasa.gov/hrp/radiation/
- Space Radiation Analysis Group (SRAG, JSC — monitoreo operacional de dosis de la tripulación): https://srag.jsc.nasa.gov/
- Boletín técnico OCHMO de protección contra radiación: https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-020-radiation-protection.pdf
- Plan de protección contra radiación de Orion: https://www.nasa.gov/missions/artemis/orion/scientists-and-engineers-evaluate-orion-radiation-protection-plan/
- Límite de carrera en NASA‑STD‑3001 Vol. 1 (Rev. B en adelante): **600 mSv de dosis efectiva**, igual para todos los astronautas. Úsalo como denominador en un indicador de "% del límite de carrera consumido".
