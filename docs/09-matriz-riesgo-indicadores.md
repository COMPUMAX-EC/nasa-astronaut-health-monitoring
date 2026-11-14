# 9. Matriz de riesgo de indicadores de salud

> Archivo generado por `python scripts/generar_matriz.py`. Para cambiar valores edita el script y vuelve a ejecutarlo. Los mismos datos están en [`data/indicadores.csv`](../data/indicadores.csv) para usarlos directamente en la app.

La matriz sigue el esquema 5×5 de **probabilidad × gravedad** que NASA usa para gestionar riesgos. **Las puntuaciones son una estimación del equipo** a partir de la evidencia del [Human Research Program](https://www.nasa.gov/hrp/risks/) y de los boletines OCHMO, pensando en una misión de larga duración (≥ 6 meses o rumbo a Marte) *con* las contramedidas habituales. No son valores oficiales de NASA: ajústenlas y justifíquenlas en su presentación.

## 9.1 Escalas

| Valor | Probabilidad (P) — que ocurra durante la misión | Gravedad (G) — consecuencia si ocurre |
|---|---|---|
| 1 | **Rara**: Muy poco probable incluso en misiones largas | **Insignificante**: Sin efecto en la salud ni en la misión |
| 2 | **Improbable**: Ha ocurrido en pocos casos | **Menor**: Molestia; se resuelve a bordo sin afectar tareas |
| 3 | **Posible**: Ocurre en una parte de las tripulaciones | **Moderada**: Afecta el rendimiento o requiere tratamiento a bordo |
| 4 | **Probable**: Ocurre en la mayoría de misiones largas | **Mayor**: Daño de salud serio o duradero; compromete objetivos |
| 5 | **Casi segura**: Ocurre en prácticamente todos los astronautas | **Catastrófica**: Riesgo para la vida o pérdida de la misión |

**Puntaje = P × G** → 🟢 Bajo (1–4) · 🟡 Medio (5–9) · 🟠 Alto (10–15) · 🔴 Crítico (16–25)

## 9.2 Mapa de calor

Cada celda muestra los IDs de los indicadores con esa combinación.

| P \ G | 1 Insignificante | 2 Menor | 3 Moderada | 4 Mayor | 5 Catastrófica |
|---|---|---|---|---|---|
| **5 Casi segura** | 🟡 — | 🟠 MU-05, SM-01 | 🟠 CV-06, OS-01, OS-02, SM-02, SU-01 | 🔴 RA-01 | 🔴 — |
| **4 Probable** | 🟢 — | 🟡 CV-02, MU-02, IN-02, SU-03, CO-03, EN-03 | 🟠 CV-01, MU-01, MU-04, VI-01, VI-02, SU-02, CO-01, PS-02, NU-01, EN-01 | 🔴 — | 🔴 — |
| **3 Posible** | 🟢 — | 🟡 IN-03, EN-08 | 🟡 CV-03, MU-03, VI-03, IN-01, IN-04, CO-02, NU-02, EN-06 | 🟠 RN-01, PS-01, PS-03 | 🟠 — |
| **2 Improbable** | 🟢 — | 🟢 EN-04 | 🟡 — | 🟡 CV-05, CV-07, EN-05, EN-07 | 🟠 CV-04, RA-02 |
| **1 Rara** | 🟢 — | 🟢 — | 🟢 — | 🟢 — | 🟡 RA-03, EN-02 |

## 9.3 Matriz completa (ordenada por puntaje)

| ID | Sistema | Indicador (unidad) | Riesgo asociado | P | G | P×G | Nivel | Frecuencia de medición | Formas de recolectarlo | Fuente |
|---|---|---|---|---|---|---|---|---|---|---|
| RA-01 | Radiación | Dosis efectiva acumulada (mSv (% de 600 mSv)) | Cáncer y efectos degenerativos | 5 | 4 | **20** | 🔴 Crítico | Continua | • Dosímetro personal activo<br>• Dosímetro pasivo<br>• Monitores de radiación del vehículo | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-020-radiation-protection.pdf) |
| CV-06 | Cardiovascular | Respuesta ortostática (FC/PA al ponerse de pie) (Δ lpm, Δ mmHg) | Intolerancia ortostática al volver a la gravedad | 5 | 3 | **15** | 🟠 Alto | Antes y después del aterrizaje | • Test activo de bipedestación con tensiómetro + ECG<br>• Simulación con presión negativa en la parte inferior del cuerpo (LBNP) | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-019-orthostatic-intolerance.pdf) |
| OS-01 | Óseo | Densidad mineral ósea (g/cm² (% cambio)) | Pérdida ósea y fractura | 5 | 3 | **15** | 🟠 Alto | Antes y después de la misión | • DXA / QCT en tierra<br>• Ultrasonido óseo cuantitativo a bordo (experimental) | [ver](https://www.nasa.gov/wp-content/uploads/2026/02/ochmo-mtb-013-bone-loss.pdf) |
| OS-02 | Óseo | Marcadores de resorción ósea (calcio, NTX en orina) (mg/día) | Pérdida ósea | 5 | 3 | **15** | 🟠 Alto | Mensual | • Muestra de orina + analizador portátil<br>• Muestras congeladas para análisis en tierra | [ver](https://www.nasa.gov/wp-content/uploads/2026/02/ochmo-mtb-013-bone-loss.pdf) |
| SM-02 | Sensoriomotor | Equilibrio y marcha tras aterrizaje (puntaje / s) | Alteración sensoriomotora | 5 | 3 | **15** | 🟠 Alto | Tras cada transición de gravedad | • Test de equilibrio con IMU del wearable<br>• Prueba funcional cronometrada<br>• Pose con cámara (visión artificial) | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-010-sensorimotor.pdf) |
| SU-01 | Sueño | Duración y eficiencia del sueño (h, %) | Pérdida de sueño, fatiga | 5 | 3 | **15** | 🟠 Alto | Diaria | • Actigrafía (muñeca o anillo)<br>• Diario de sueño en la app | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-041-sleep-accommodations.pdf) |
| CO-01 | Cognitivo | Vigilancia psicomotora (PVT) (ms, lapsos) | Deterioro del rendimiento por fatiga | 4 | 3 | **12** | 🟠 Alto | Diaria (3 min) | • Test PVT en tableta o PC | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-032-cognitive-workload.pdf) |
| CV-01 | Cardiovascular | Frecuencia cardiaca en reposo (lpm) | Desacondicionamiento cardiovascular | 4 | 3 | **12** | 🟠 Alto | Continua (resumen diario) | • Wearable de pecho o muñeca (Bio-Monitor/Astroskin, banda)<br>• Oxímetro de dedo<br>• rPPG con cámara (opcional) | [ver](https://www.nasa.gov/hrp/risks/) |
| EN-01 | Entorno | CO2 en cabina (mmHg (ppCO2)) | Dolor de cabeza, deterioro cognitivo | 4 | 3 | **12** | 🟠 Alto | Continua | • Monitor de CO2 fijo del hábitat<br>• Monitor portátil personal de CO2 | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-003-habitable-atmosphere.pdf) |
| MU-01 | Muscular | Fuerza máxima (prensa, agarre) (kg / N) | Pérdida de fuerza y masa muscular | 4 | 3 | **12** | 🟠 Alto | Semanal | • Dinamómetro de mano<br>• Datos del equipo de ejercicio resistivo<br>• Test de 1RM estimado | [ver](https://www.nasa.gov/hrp/human-health-countermeasures/) |
| MU-04 | Muscular | Capacidad aeróbica (VO2 máx. estimado) (ml/kg/min) | Desacondicionamiento físico | 4 | 3 | **12** | 🟠 Alto | Mensual | • Prueba submáxima en bicicleta con FC<br>• Estimación por wearable | [ver](https://www.nasa.gov/hrp/human-health-countermeasures/) |
| NU-01 | Nutrición | Ingesta calórica y de proteína (kcal/día, g/día) | Desnutrición | 4 | 3 | **12** | 🟠 Alto | Diaria | • Escaneo de código de barras de los paquetes de comida<br>• Foto de la comida (visión artificial)<br>• Registro manual | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-013-food-and-nutrition.pdf) |
| PS-01 | Salud mental | Estado de ánimo y estrés (escala) | Condiciones conductuales adversas | 3 | 4 | **12** | 🟠 Alto | Diaria | • Cuestionario breve en la app<br>• Diario personal<br>• Análisis de voz en el dispositivo (opcional) | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-016-behavioral-health.pdf) |
| PS-02 | Salud mental | Soledad y aislamiento percibido (escala) | Problemas psicosociales por aislamiento | 4 | 3 | **12** | 🟠 Alto | Semanal | • Cuestionario en la app<br>• Registro de contacto con familia | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-016-behavioral-health.pdf) |
| PS-03 | Salud mental | Cohesión y conflicto del equipo (escala) | Fallas de cooperación y comunicación del equipo | 3 | 4 | **12** | 🟠 Alto | Semanal | • Encuesta anónima del equipo<br>• Registro de incidentes | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-016-behavioral-health.pdf) |
| RN-01 | Renal | Riesgo de cálculo renal (calcio urinario, volumen de orina) (mg/día, L/día) | Cálculo renal | 3 | 4 | **12** | 🟠 Alto | Semanal | • Registro de volumen de orina<br>• Tira reactiva / analizador de orina<br>• Ultrasonido renal guiado ante síntomas | [ver](https://www.nasa.gov/hrp/risks/) |
| SU-02 | Sueño | Alineación circadiana (horarios, exposición a luz) (h de desfase, lux) | Desincronización circadiana | 4 | 3 | **12** | 🟠 Alto | Diaria | • Actígrafo con sensor de luz<br>• Registro de horarios de trabajo | [ver](https://www.nasa.gov/wp-content/uploads/2026/03/ochmo-mtb-009-circadian-desynchrony.pdf) |
| VI-01 | Visión (SANS) | Agudeza visual y rejilla de Amsler (logMAR / sí-no) | SANS | 4 | 3 | **12** | 🟠 Alto | Semanal | • Test de agudeza en tableta<br>• Rejilla de Amsler digital | [ver](https://www.nasa.gov/wp-content/uploads/2024/02/ochmo-mtb-001-sans.pdf) |
| VI-02 | Visión (SANS) | Edema de disco óptico / grosor retiniano (µm) | SANS | 4 | 3 | **12** | 🟠 Alto | Mensual | • OCT a bordo<br>• Fondo de ojo con cámara<br>• Ultrasonido ocular | [ver](https://www.nasa.gov/wp-content/uploads/2024/02/ochmo-mtb-001-sans.pdf) |
| CV-04 | Cardiovascular | Ritmo cardiaco / arritmias (ECG) (eventos/día) | Arritmia o evento cardiaco | 2 | 5 | **10** | 🟠 Alto | Continua o semanal (Holter 24 h) | • ECG de una derivación en wearable<br>• Holter de 24 h<br>• ECG de 12 derivaciones del kit médico | [ver](https://www.nasa.gov/hrp/risks/) |
| MU-05 | Musculoesquelético | Dolor lumbar / articular y lesiones (hombro) (escala 0-10) | Dolor de espalda, lesión de hombro | 5 | 2 | **10** | 🟠 Alto | Diaria (autorreporte) | • Escala de dolor en la app<br>• Mapa corporal interactivo | [ver](https://www.nasa.gov/wp-content/uploads/2025/09/ochmo-mtb-006-shoulder-injury.pdf) |
| RA-02 | Radiación | Evento de partículas solares (SEP) en curso (evento sí/no, flujo) | Síndrome agudo por radiación | 2 | 5 | **10** | 🟠 Alto | Continua | • API DONKI de NASA<br>• Detector de partículas a bordo<br>• Aviso del control de misión | [ver](https://ccmc.gsfc.nasa.gov/tools/DONKI/) |
| SM-01 | Sensoriomotor | Mareo espacial (náusea, desorientación) (escala 0-10) | Mareo espacial (SAS) | 5 | 2 | **10** | 🟠 Alto | Diaria (primeros días y tras transiciones de gravedad) | • Escala de síntomas en la app | [ver](https://www.nasa.gov/wp-content/uploads/2025/09/ochmo-mtb-004-space-adaptation-sickness-sas.pdf) |
| CO-02 | Cognitivo | Batería cognitiva (memoria, atención, razonamiento) (puntaje) | Deterioro cognitivo | 3 | 3 | **9** | 🟡 Medio | Semanal | • Batería de tests en la app | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-032-cognitive-workload.pdf) |
| CV-03 | Cardiovascular | Presión arterial (mmHg) | Adaptaciones cardiovasculares | 3 | 3 | **9** | 🟡 Medio | Diaria | • Tensiómetro automático de brazo<br>• Wearable con presión arterial (Astroskin) | [ver](https://www.nasa.gov/reference/nasa-std-3001v1/) |
| EN-06 | Entorno | Carga microbiana de aire y superficies (UFC) | Infecciones, contaminación | 3 | 3 | **9** | 🟡 Medio | Mensual | • Muestreo de superficies y aire<br>• Secuenciación a bordo | [ver](https://www.nasa.gov/wp-content/uploads/2025/05/ochmo-tb-046-microbiology-rev-a.pdf) |
| IN-01 | Inmune | Temperatura corporal (°C) | Infección | 3 | 3 | **9** | 🟡 Medio | Diaria y ante síntomas | • Termómetro digital<br>• Sensor de temperatura del wearable | [ver](https://www.nasa.gov/reference/nasa-std-3001v1/) |
| IN-04 | Inmune / Hematológico | Hemograma (leucocitos, linfocitos) (células/µL) | Alteración inmune, efecto de radiación | 3 | 3 | **9** | 🟡 Medio | Mensual | • Analizador de sangre portátil<br>• Muestras para análisis en tierra | [ver](https://www.nasa.gov/hrp/risks/) |
| MU-03 | Muscular | Volumen y adherencia al ejercicio (min/día, carga) | Pérdida ósea y muscular | 3 | 3 | **9** | 🟡 Medio | Por sesión | • Registro automático del equipo (cinta, bicicleta, resistivo)<br>• Wearable de actividad<br>• Pose estimada con cámara (visión artificial) | [ver](https://www.nasa.gov/hrp/human-health-countermeasures/) |
| NU-02 | Nutrición | Ingesta de agua / hidratación (L/día) | Deshidratación, cálculo renal | 3 | 3 | **9** | 🟡 Medio | Diaria | • Dispensador de agua conectado<br>• Registro manual | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-013-food-and-nutrition.pdf) |
| VI-03 | Visión (SANS) | Presión intraocular (mmHg) | SANS | 3 | 3 | **9** | 🟡 Medio | Mensual | • Tonómetro portátil | [ver](https://www.nasa.gov/wp-content/uploads/2024/02/ochmo-mtb-001-sans.pdf) |
| CO-03 | Cognitivo | Carga de trabajo percibida (NASA-TLX) (0-100) | Sobrecarga de trabajo | 4 | 2 | **8** | 🟡 Medio | Al final de cada jornada | • Cuestionario NASA-TLX en la app | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-032-cognitive-workload.pdf) |
| CV-02 | Cardiovascular | Variabilidad de la FC (VFC/HRV) (ms (RMSSD)) | Estrés autonómico, fatiga | 4 | 2 | **8** | 🟡 Medio | Diaria (al despertar) | • Banda de pecho con ECG<br>• Wearable de anillo o muñeca | [ver](https://www.nasa.gov/hrp/risks/) |
| CV-05 | Cardiovascular | Saturación de oxígeno (SpO2) (%) | Hipoxia por falla ambiental o enfermedad | 2 | 4 | **8** | 🟡 Medio | Continua (sueño) y ante síntomas | • Oxímetro de pulso<br>• Wearable con SpO2 | [ver](https://www.nasa.gov/reference/nasa-std-3001v1/) |
| CV-07 | Cardiovascular | Síntomas de trombosis venosa (cuello, piernas) (sí/no + escala) | Trombosis venosa | 2 | 4 | **8** | 🟡 Medio | Diaria (autorreporte) | • Cuestionario en la app<br>• Ultrasonido guiado de la vena yugular | [ver](https://www.nasa.gov/wp-content/uploads/2026/01/ochmo-mtb-007-venous-thrombosis-in-spaceflight.pdf) |
| EN-03 | Entorno | Nivel de ruido (dBA) | Pérdida auditiva, mal sueño | 4 | 2 | **8** | 🟡 Medio | Continua | • Dosímetro acústico personal<br>• Sonómetro fijo<br>• Micrófono del dispositivo | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-035-acoustics.pdf) |
| EN-05 | Entorno | Calidad del agua potable (parámetros químicos y microbianos) | Enfermedad por agua contaminada | 2 | 4 | **8** | 🟡 Medio | Semanal | • Kit de análisis de agua<br>• Sensores en línea del sistema de agua | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-027-water.pdf) |
| EN-07 | Entorno | Contaminantes tóxicos (combustión, fugas) (ppm) | Intoxicación | 2 | 4 | **8** | 🟡 Medio | Continua | • Analizador de productos de combustión<br>• Monitor de calidad del aire | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-015-spaceflight-toxicology.pdf) |
| IN-02 | Inmune | Síntomas de infección o reactivación viral (herpes, fatiga) (lista de síntomas) | Alteración inmune, reactivación viral latente | 4 | 2 | **8** | 🟡 Medio | Diaria | • Cuestionario de síntomas en la app<br>• Muestra de saliva para carga viral (en tierra) | [ver](https://www.nasa.gov/humans-in-space/twins-study/) |
| MU-02 | Muscular | Masa corporal (kg) | Pérdida muscular, desnutrición | 4 | 2 | **8** | 🟡 Medio | Semanal | • Medidor de masa por aceleración (en microgravedad no hay báscula de peso)<br>• Entrada manual en la app | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-013-food-and-nutrition.pdf) |
| SU-03 | Sueño | Uso de medicamentos para dormir (dosis/semana) | Dependencia, efectos sobre el rendimiento | 4 | 2 | **8** | 🟡 Medio | Por uso | • Registro de medicación en la app | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-006-pharmaceuticals.pdf) |
| EN-08 | Entorno | Iluminación (intensidad y espectro) (lux, K) | Desincronización circadiana | 3 | 2 | **6** | 🟡 Medio | Continua | • Sensor de luz del hábitat<br>• Sensor de luz del actígrafo | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-026-lighting-design.pdf) |
| IN-03 | Inmune | Erupciones / hipersensibilidad de piel (sí/no + foto) | Alteración inmune, dermatitis | 3 | 2 | **6** | 🟡 Medio | Ante síntomas | • Foto con la tableta + clasificador (visión artificial)<br>• Autorreporte | [ver](https://www.nasa.gov/hrp/risks/) |
| EN-02 | Entorno | O2 y presión de cabina (kPa) | Hipoxia | 1 | 5 | **5** | 🟡 Medio | Continua | • Sensores del soporte vital (ECLSS) | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-003-habitable-atmosphere.pdf) |
| RA-03 | Radiación | Síntomas prodrómicos (náusea, vómito, fatiga) tras un evento (escala) | Síndrome agudo por radiación | 1 | 5 | **5** | 🟡 Medio | Tras eventos SEP | • Cuestionario guiado en la app | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-020-radiation-protection.pdf) |
| EN-04 | Entorno | Temperatura y humedad de cabina (°C, %HR) | Estrés térmico, confort | 2 | 2 | **4** | 🟢 Bajo | Continua | • Sensores ambientales del hábitat | [ver](https://www.nasa.gov/reference/nasa-std-3001v2/) |

## 9.4 Resumen por sistema

| Sistema | Nº de indicadores | Puntaje máximo |
|---|---|---|
| Radiación | 3 | 🔴 Crítico (20) |
| Cardiovascular | 7 | 🟠 Alto (15) |
| Óseo | 2 | 🟠 Alto (15) |
| Sensoriomotor | 2 | 🟠 Alto (15) |
| Sueño | 3 | 🟠 Alto (15) |
| Renal | 1 | 🟠 Alto (12) |
| Muscular | 4 | 🟠 Alto (12) |
| Visión (SANS) | 3 | 🟠 Alto (12) |
| Cognitivo | 3 | 🟠 Alto (12) |
| Salud mental | 3 | 🟠 Alto (12) |
| Nutrición | 2 | 🟠 Alto (12) |
| Entorno | 8 | 🟠 Alto (12) |
| Musculoesquelético | 1 | 🟠 Alto (10) |
| Inmune | 3 | 🟡 Medio (9) |
| Inmune / Hematológico | 1 | 🟡 Medio (9) |

## 9.5 Formas de recolección (resumen)

| Tipo | Ejemplos | Ventaja | Limitación |
|---|---|---|---|
| **Wearable continuo** | Bio-Monitor/Astroskin, banda de pecho, anillo, actígrafo | Pasivo, sin tiempo de tripulación | Batería, artefactos de movimiento |
| **Dispositivo médico puntual** | Tensiómetro, oxímetro, termómetro, dinamómetro, tonómetro, OCT, ultrasonido | Preciso y validado | Requiere tiempo y, a veces, entrenamiento |
| **Muestras biológicas** | Sangre, orina, saliva | Marcadores objetivos (hueso, inmune) | Analizadores a bordo limitados; muchas se analizan en tierra |
| **Cuestionarios y tests en la app** | Ánimo, síntomas, dolor, NASA-TLX, PVT, Amsler | Barato, rápido, cubre lo subjetivo | Depende de la honestidad; fatiga de cuestionarios |
| **Sensores del hábitat** | CO2, O2, ruido, luz, temperatura, agua | Continuo, sin intervención | No es individual (salvo monitores personales) |
| **Datos de equipos** | Equipo de ejercicio, dispensador de agua, códigos de barras de comida | Automático | Requiere integración con cada equipo |
| **Visión artificial (opcional)** | Pose en ejercicio, fotos de piel o comida, rPPG | Sin contacto | Privacidad, cómputo, validez clínica (ver [guía 08](08-computo-ia-y-limitaciones.md)) |
| **Fuentes externas** | API DONKI, control de misión | Contexto (clima espacial) | Depende del enlace de comunicaciones |

## 9.6 Cómo usar la matriz en el software

1. **Priorizar el MVP:** implementar primero los indicadores 🔴 y 🟠.
2. **Frecuencia de recordatorios:** la columna *Frecuencia de medición* define cuándo la app pide cada dato.
3. **Peso en el panel:** un indicador fuera de rango con puntaje alto sube de nivel la alerta de su sistema.
4. **Métodos alternativos:** si falla un sensor, la app propone la siguiente forma de recolección de la lista.
