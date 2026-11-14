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

Columnas nuevas:

- **Instrumentación a bordo:** ✅ Disponible (existe hoy en la ISS) · ⚠️ Limitada (experimental, parcial o solo en campañas) · ⛔ Solo en tierra (casi imposible tener el instrumento adecuado a bordo).
- **¿Por cámara?:** 📷 Sí (la cámara puede ser el método principal) · ◐ Parcial (complementa a otro método) · ○ Baja (experimental o poco fiable) · ✖ No.

| ID | Sistema | Indicador (unidad) | Riesgo asociado | P | G | P×G | Nivel | Frecuencia de medición | Formas de recolectarlo | Instrumentación a bordo | ¿Por cámara? | Fuente |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| RA-01 | Radiación | Dosis efectiva acumulada (mSv (% de 600 mSv)) | Cáncer y efectos degenerativos | 5 | 4 | **20** | 🔴 Crítico | Continua | • Dosímetro personal activo<br>• Dosímetro pasivo<br>• Monitores de radiación del vehículo | ✅ Disponible<br>Dosímetros personales y del vehículo | ✖ No | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-020-radiation-protection.pdf) |
| CV-06 | Cardiovascular | Respuesta ortostática (FC/PA al ponerse de pie) (Δ lpm, Δ mmHg) | Intolerancia ortostática al volver a la gravedad | 5 | 3 | **15** | 🟠 Alto | Antes y después del aterrizaje | • Test activo de bipedestación con tensiómetro + ECG<br>• Simulación con presión negativa en la parte inferior del cuerpo (LBNP) | ⚠️ Limitada<br>Tensiómetro + ECG sí; tras aterrizar en Luna/Marte no hay laboratorio; LBNP es experimental | ◐ Parcial<br>RGB cuerpo completo | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-019-orthostatic-intolerance.pdf) |
| OS-01 | Óseo | Densidad mineral ósea (g/cm² (% cambio)) | Pérdida ósea y fractura | 5 | 3 | **15** | 🟠 Alto | Antes y después de la misión | • DXA / QCT en tierra<br>• Ultrasonido óseo cuantitativo a bordo (experimental) | ⛔ Solo en tierra<br>DXA/QCT son equipos grandes de rayos X: no hay a bordo | ✖ No | [ver](https://www.nasa.gov/wp-content/uploads/2026/02/ochmo-mtb-013-bone-loss.pdf) |
| OS-02 | Óseo | Marcadores de resorción ósea (calcio, NTX en orina) (mg/día) | Pérdida ósea | 5 | 3 | **15** | 🟠 Alto | Mensual | • Muestra de orina + analizador portátil<br>• Muestras congeladas para análisis en tierra | ⚠️ Limitada<br>Se recogen y congelan muestras; casi no hay análisis a bordo | ✖ No | [ver](https://www.nasa.gov/wp-content/uploads/2026/02/ochmo-mtb-013-bone-loss.pdf) |
| SM-02 | Sensoriomotor | Equilibrio y marcha tras aterrizaje (puntaje / s) | Alteración sensoriomotora | 5 | 3 | **15** | 🟠 Alto | Tras cada transición de gravedad | • Test de equilibrio con IMU del wearable<br>• Prueba funcional cronometrada<br>• Pose con cámara (visión artificial) | ⚠️ Limitada<br>IMU del wearable sí; pruebas funcionales completas solo con apoyo en tierra | 📷 Sí<br>RGB o profundidad, cuerpo completo | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-010-sensorimotor.pdf) |
| SU-01 | Sueño | Duración y eficiencia del sueño (h, %) | Pérdida de sueño, fatiga | 5 | 3 | **15** | 🟠 Alto | Diaria | • Actigrafía (muñeca o anillo)<br>• Diario de sueño en la app | ✅ Disponible<br>Actígrafos usados en la ISS | ◐ Parcial<br>IR nocturna en el compartimento de sueño | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-041-sleep-accommodations.pdf) |
| CO-01 | Cognitivo | Vigilancia psicomotora (PVT) (ms, lapsos) | Deterioro del rendimiento por fatiga | 4 | 3 | **12** | 🟠 Alto | Diaria (3 min) | • Test PVT en tableta o PC | ✅ Disponible<br>PVT en tableta o portátil | ◐ Parcial<br>RGB/IR frontal | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-032-cognitive-workload.pdf) |
| CV-01 | Cardiovascular | Frecuencia cardiaca en reposo (lpm) | Desacondicionamiento cardiovascular | 4 | 3 | **12** | 🟠 Alto | Continua (resumen diario) | • Wearable de pecho o muñeca (Bio-Monitor/Astroskin, banda)<br>• Oxímetro de dedo<br>• rPPG con cámara (opcional) | ✅ Disponible<br>Wearables y monitores de FC ya usados en la ISS | ◐ Parcial<br>RGB frontal (tableta) | [ver](https://www.nasa.gov/hrp/risks/) |
| EN-01 | Entorno | CO2 en cabina (mmHg (ppCO2)) | Dolor de cabeza, deterioro cognitivo | 4 | 3 | **12** | 🟠 Alto | Continua | • Monitor de CO2 fijo del hábitat<br>• Monitor portátil personal de CO2 | ✅ Disponible<br>Monitores de CO2 fijos y portátiles | ✖ No | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-003-habitable-atmosphere.pdf) |
| MU-01 | Muscular | Fuerza máxima (prensa, agarre) (kg / N) | Pérdida de fuerza y masa muscular | 4 | 3 | **12** | 🟠 Alto | Semanal | • Dinamómetro de mano<br>• Datos del equipo de ejercicio resistivo<br>• Test de 1RM estimado | ✅ Disponible<br>Dinamómetro y datos del equipo de ejercicio resistivo | ◐ Parcial<br>RGB o profundidad, cuerpo completo | [ver](https://www.nasa.gov/hrp/human-health-countermeasures/) |
| MU-04 | Muscular | Capacidad aeróbica (VO2 máx. estimado) (ml/kg/min) | Desacondicionamiento físico | 4 | 3 | **12** | 🟠 Alto | Mensual | • Prueba submáxima en bicicleta con FC<br>• Estimación por wearable | ⚠️ Limitada<br>Requiere analizador de gases; disponible solo en campañas de investigación | ✖ No | [ver](https://www.nasa.gov/hrp/human-health-countermeasures/) |
| NU-01 | Nutrición | Ingesta calórica y de proteína (kcal/día, g/día) | Desnutrición | 4 | 3 | **12** | 🟠 Alto | Diaria | • Escaneo de código de barras de los paquetes de comida<br>• Foto de la comida (visión artificial)<br>• Registro manual | ✅ Disponible<br>Paquetes de comida con código de barras | 📷 Sí<br>RGB (tableta) | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-013-food-and-nutrition.pdf) |
| PS-01 | Salud mental | Estado de ánimo y estrés (escala) | Condiciones conductuales adversas | 3 | 4 | **12** | 🟠 Alto | Diaria | • Cuestionario breve en la app<br>• Expresión facial en sesión breve, procesada en el dispositivo<br>• Diario personal<br>• Análisis de voz en el dispositivo (opcional) | ✅ Disponible<br>Cuestionario | ◐ Parcial<br>RGB frontal (tableta), sesión breve con consentimiento | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-016-behavioral-health.pdf) |
| PS-02 | Salud mental | Soledad y aislamiento percibido (escala) | Problemas psicosociales por aislamiento | 4 | 3 | **12** | 🟠 Alto | Semanal | • Cuestionario en la app<br>• Registro de contacto con familia | ✅ Disponible<br>Cuestionario | ○ Baja<br>Cámaras del hábitat | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-016-behavioral-health.pdf) |
| PS-03 | Salud mental | Cohesión y conflicto del equipo (escala) | Fallas de cooperación y comunicación del equipo | 3 | 4 | **12** | 🟠 Alto | Semanal | • Encuesta anónima del equipo<br>• Registro de incidentes | ✅ Disponible<br>Encuesta | ○ Baja<br>Cámaras del hábitat | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-016-behavioral-health.pdf) |
| RN-01 | Renal | Riesgo de cálculo renal (calcio urinario, volumen de orina) (mg/día, L/día) | Cálculo renal | 3 | 4 | **12** | 🟠 Alto | Semanal | • Registro de volumen de orina<br>• Tira reactiva / analizador de orina<br>• Ultrasonido renal guiado ante síntomas | ⚠️ Limitada<br>Volumen de orina y ultrasonido sí; química urinaria completa no | ✖ No | [ver](https://www.nasa.gov/hrp/risks/) |
| SU-02 | Sueño | Alineación circadiana (horarios, exposición a luz) (h de desfase, lux) | Desincronización circadiana | 4 | 3 | **12** | 🟠 Alto | Diaria | • Actígrafo con sensor de luz<br>• Registro de horarios de trabajo | ✅ Disponible<br>Actígrafo con sensor de luz | ◐ Parcial<br>Sensor de la cámara | [ver](https://www.nasa.gov/wp-content/uploads/2026/03/ochmo-mtb-009-circadian-desynchrony.pdf) |
| VI-01 | Visión (SANS) | Agudeza visual y rejilla de Amsler (logMAR / sí-no) | SANS | 4 | 3 | **12** | 🟠 Alto | Semanal | • Test de agudeza en tableta<br>• Rejilla de Amsler digital | ✅ Disponible<br>Tests de agudeza y Amsler en tableta | ✖ No | [ver](https://www.nasa.gov/wp-content/uploads/2024/02/ochmo-mtb-001-sans.pdf) |
| VI-02 | Visión (SANS) | Edema de disco óptico / grosor retiniano (µm) | SANS | 4 | 3 | **12** | 🟠 Alto | Mensual | • OCT a bordo<br>• Fondo de ojo con cámara<br>• Ultrasonido ocular | ✅ Disponible<br>OCT y cámara de fondo de ojo en la ISS (no garantizados en naves pequeñas) | ◐ Parcial<br>Cámara especializada de fondo de ojo | [ver](https://www.nasa.gov/wp-content/uploads/2024/02/ochmo-mtb-001-sans.pdf) |
| CV-04 | Cardiovascular | Ritmo cardiaco / arritmias (ECG) (eventos/día) | Arritmia o evento cardiaco | 2 | 5 | **10** | 🟠 Alto | Continua o semanal (Holter 24 h) | • ECG de una derivación en wearable<br>• Holter de 24 h<br>• ECG de 12 derivaciones del kit médico | ✅ Disponible<br>ECG y Holter en el kit médico de la ISS | ✖ No | [ver](https://www.nasa.gov/hrp/risks/) |
| MU-05 | Musculoesquelético | Dolor lumbar / articular y lesiones (hombro) (escala 0-10) | Dolor de espalda, lesión de hombro | 5 | 2 | **10** | 🟠 Alto | Diaria (autorreporte) | • Escala de dolor en la app<br>• Mapa corporal interactivo | ✅ Disponible<br>Autorreporte; ultrasonido para lesiones | ◐ Parcial<br>RGB cuerpo completo | [ver](https://www.nasa.gov/wp-content/uploads/2025/09/ochmo-mtb-006-shoulder-injury.pdf) |
| RA-02 | Radiación | Evento de partículas solares (SEP) en curso (evento sí/no, flujo) | Síndrome agudo por radiación | 2 | 5 | **10** | 🟠 Alto | Continua | • API DONKI de NASA<br>• Detector de partículas a bordo<br>• Aviso del control de misión | ✅ Disponible<br>Detectores a bordo + avisos de tierra/DONKI | ✖ No | [ver](https://ccmc.gsfc.nasa.gov/tools/DONKI/) |
| SM-01 | Sensoriomotor | Mareo espacial (náusea, desorientación) (escala 0-10) | Mareo espacial (SAS) | 5 | 2 | **10** | 🟠 Alto | Diaria (primeros días y tras transiciones de gravedad) | • Escala de síntomas en la app | ✅ Disponible<br>Cuestionario | ○ Baja<br>RGB facial | [ver](https://www.nasa.gov/wp-content/uploads/2025/09/ochmo-mtb-004-space-adaptation-sickness-sas.pdf) |
| CO-02 | Cognitivo | Batería cognitiva (memoria, atención, razonamiento) (puntaje) | Deterioro cognitivo | 3 | 3 | **9** | 🟡 Medio | Semanal | • Batería de tests en la app | ✅ Disponible<br>Batería cognitiva en portátil | ✖ No | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-032-cognitive-workload.pdf) |
| CV-03 | Cardiovascular | Presión arterial (mmHg) | Adaptaciones cardiovasculares | 3 | 3 | **9** | 🟡 Medio | Diaria | • Tensiómetro automático de brazo<br>• Wearable con presión arterial (Astroskin) | ✅ Disponible<br>Tensiómetro automático en el kit médico | ✖ No | [ver](https://www.nasa.gov/reference/nasa-std-3001v1/) |
| EN-06 | Entorno | Carga microbiana de aire y superficies (UFC) | Infecciones, contaminación | 3 | 3 | **9** | 🟡 Medio | Mensual | • Muestreo de superficies y aire<br>• Secuenciación a bordo | ⚠️ Limitada<br>Muestreo y secuenciación experimental; cultivo se analiza en tierra | ◐ Parcial<br>RGB o microscopio | [ver](https://www.nasa.gov/wp-content/uploads/2025/05/ochmo-tb-046-microbiology-rev-a.pdf) |
| IN-01 | Inmune | Temperatura corporal (°C) | Infección | 3 | 3 | **9** | 🟡 Medio | Diaria y ante síntomas | • Termómetro digital<br>• Sensor de temperatura del wearable | ✅ Disponible<br>Termómetro | ◐ Parcial<br>Térmica (IR) | [ver](https://www.nasa.gov/reference/nasa-std-3001v1/) |
| IN-04 | Inmune / Hematológico | Hemograma (leucocitos, linfocitos) (células/µL) | Alteración inmune, efecto de radiación | 3 | 3 | **9** | 🟡 Medio | Mensual | • Analizador de sangre portátil<br>• Muestras para análisis en tierra | ⚠️ Limitada<br>No hay hemograma completo rutinario a bordo; dispositivos en prueba | ✖ No | [ver](https://www.nasa.gov/hrp/risks/) |
| MU-03 | Muscular | Volumen y adherencia al ejercicio (min/día, carga) | Pérdida ósea y muscular | 3 | 3 | **9** | 🟡 Medio | Por sesión | • Registro automático del equipo (cinta, bicicleta, resistivo)<br>• Wearable de actividad<br>• Pose estimada con cámara (visión artificial) | ✅ Disponible<br>Equipos de ejercicio registran carga y tiempo | 📷 Sí<br>RGB fija en la zona de ejercicio | [ver](https://www.nasa.gov/hrp/human-health-countermeasures/) |
| NU-02 | Nutrición | Ingesta de agua / hidratación (L/día) | Deshidratación, cálculo renal | 3 | 3 | **9** | 🟡 Medio | Diaria | • Dispensador de agua conectado<br>• Registro manual | ✅ Disponible<br>Dispensador / registro | ○ Baja<br>RGB | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-013-food-and-nutrition.pdf) |
| VI-03 | Visión (SANS) | Presión intraocular (mmHg) | SANS | 3 | 3 | **9** | 🟡 Medio | Mensual | • Tonómetro portátil | ✅ Disponible<br>Tonómetro portátil | ✖ No | [ver](https://www.nasa.gov/wp-content/uploads/2024/02/ochmo-mtb-001-sans.pdf) |
| CO-03 | Cognitivo | Carga de trabajo percibida (NASA-TLX) (0-100) | Sobrecarga de trabajo | 4 | 2 | **8** | 🟡 Medio | Al final de cada jornada | • Cuestionario NASA-TLX en la app | ✅ Disponible<br>Cuestionario | ✖ No | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-032-cognitive-workload.pdf) |
| CV-02 | Cardiovascular | Variabilidad de la FC (VFC/HRV) (ms (RMSSD)) | Estrés autonómico, fatiga | 4 | 2 | **8** | 🟡 Medio | Diaria (al despertar) | • Banda de pecho con ECG<br>• Wearable de anillo o muñeca | ✅ Disponible<br>Banda de pecho/ECG; algoritmo de VFC en software | ○ Baja<br>RGB frontal | [ver](https://www.nasa.gov/hrp/risks/) |
| CV-05 | Cardiovascular | Saturación de oxígeno (SpO2) (%) | Hipoxia por falla ambiental o enfermedad | 2 | 4 | **8** | 🟡 Medio | Continua (sueño) y ante síntomas | • Oxímetro de pulso<br>• Wearable con SpO2 | ✅ Disponible<br>Oxímetro de pulso | ○ Baja<br>RGB/IR | [ver](https://www.nasa.gov/reference/nasa-std-3001v1/) |
| CV-07 | Cardiovascular | Síntomas de trombosis venosa (cuello, piernas) (sí/no + escala) | Trombosis venosa | 2 | 4 | **8** | 🟡 Medio | Diaria (autorreporte) | • Cuestionario en la app<br>• Ultrasonido guiado de la vena yugular | ✅ Disponible<br>Ultrasonido a bordo, operado por tripulación con guía remota | ○ Baja<br>RGB | [ver](https://www.nasa.gov/wp-content/uploads/2026/01/ochmo-mtb-007-venous-thrombosis-in-spaceflight.pdf) |
| EN-03 | Entorno | Nivel de ruido (dBA) | Pérdida auditiva, mal sueño | 4 | 2 | **8** | 🟡 Medio | Continua | • Dosímetro acústico personal<br>• Sonómetro fijo<br>• Micrófono del dispositivo | ✅ Disponible<br>Dosímetros acústicos | ✖ No | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-035-acoustics.pdf) |
| EN-05 | Entorno | Calidad del agua potable (parámetros químicos y microbianos) | Enfermedad por agua contaminada | 2 | 4 | **8** | 🟡 Medio | Semanal | • Kit de análisis de agua<br>• Sensores en línea del sistema de agua | ✅ Disponible<br>Kits de análisis de agua | ◐ Parcial<br>RGB (tableta) | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-027-water.pdf) |
| EN-07 | Entorno | Contaminantes tóxicos (combustión, fugas) (ppm) | Intoxicación | 2 | 4 | **8** | 🟡 Medio | Continua | • Analizador de productos de combustión<br>• Monitor de calidad del aire | ✅ Disponible<br>Analizadores de calidad del aire | ✖ No | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-015-spaceflight-toxicology.pdf) |
| IN-02 | Inmune | Síntomas de infección o reactivación viral (herpes, fatiga) (lista de síntomas) | Alteración inmune, reactivación viral latente | 4 | 2 | **8** | 🟡 Medio | Diaria | • Cuestionario de síntomas en la app<br>• Muestra de saliva para carga viral (en tierra) | ⚠️ Limitada<br>Síntomas sí; carga viral en saliva se analiza en tierra | ◐ Parcial<br>RGB facial | [ver](https://www.nasa.gov/humans-in-space/twins-study/) |
| MU-02 | Muscular | Masa corporal (kg) | Pérdida muscular, desnutrición | 4 | 2 | **8** | 🟡 Medio | Semanal | • Medidor de masa por aceleración (en microgravedad no hay báscula de peso)<br>• Entrada manual en la app | ✅ Disponible<br>Medidor de masa por aceleración (no existe báscula de peso en microgravedad) | ◐ Parcial<br>Profundidad (3D) o varias RGB, cuerpo completo | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-013-food-and-nutrition.pdf) |
| SU-03 | Sueño | Uso de medicamentos para dormir (dosis/semana) | Dependencia, efectos sobre el rendimiento | 4 | 2 | **8** | 🟡 Medio | Por uso | • Registro de medicación en la app | ✅ Disponible<br>Registro | ✖ No | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-006-pharmaceuticals.pdf) |
| EN-08 | Entorno | Iluminación (intensidad y espectro) (lux, K) | Desincronización circadiana | 3 | 2 | **6** | 🟡 Medio | Continua | • Sensor de luz del hábitat<br>• Sensor de luz del actígrafo | ✅ Disponible<br>Sensores de luz | ◐ Parcial<br>Sensor de la cámara | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-026-lighting-design.pdf) |
| IN-03 | Inmune | Erupciones / hipersensibilidad de piel (sí/no + foto) | Alteración inmune, dermatitis | 3 | 2 | **6** | 🟡 Medio | Ante síntomas | • Foto con la tableta + clasificador (visión artificial)<br>• Autorreporte | ✅ Disponible<br>Cámara de la tableta | 📷 Sí<br>RGB (tableta) | [ver](https://www.nasa.gov/hrp/risks/) |
| EN-02 | Entorno | O2 y presión de cabina (kPa) | Hipoxia | 1 | 5 | **5** | 🟡 Medio | Continua | • Sensores del soporte vital (ECLSS) | ✅ Disponible<br>Sensores del soporte vital | ✖ No | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-003-habitable-atmosphere.pdf) |
| RA-03 | Radiación | Síntomas prodrómicos (náusea, vómito, fatiga) tras un evento (escala) | Síndrome agudo por radiación | 1 | 5 | **5** | 🟡 Medio | Tras eventos SEP | • Cuestionario guiado en la app | ✅ Disponible<br>Cuestionario | ○ Baja<br>RGB | [ver](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-020-radiation-protection.pdf) |
| EN-04 | Entorno | Temperatura y humedad de cabina (°C, %HR) | Estrés térmico, confort | 2 | 2 | **4** | 🟢 Bajo | Continua | • Sensores ambientales del hábitat | ✅ Disponible<br>Sensores del hábitat | ✖ No | [ver](https://www.nasa.gov/reference/nasa-std-3001v2/) |

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

## 9.6 Instrumentación disponible en el espacio

| Estado | Nº | Indicadores |
|---|---|---|
| ✅ Disponible | 37 | CV-01, CV-02, CV-03, CV-04, CV-05, CV-07, MU-01, MU-02, MU-03, MU-05, VI-01, VI-02, VI-03, IN-01, IN-03, RA-01, RA-02, RA-03, SM-01, SU-01, SU-02, SU-03, CO-01, CO-02, CO-03, PS-01, PS-02, PS-03, NU-01, NU-02, EN-01, EN-02, EN-03, EN-04, EN-05, EN-07, EN-08 |
| ⚠️ Limitada | 8 | CV-06, OS-02, RN-01, MU-04, IN-02, IN-04, SM-02, EN-06 |
| ⛔ Solo en tierra | 1 | OS-01 |

**Brechas importantes** (indicadores de riesgo alto sin instrumento completo a bordo):

- **CV-06 Respuesta ortostática (FC/PA al ponerse de pie)** (🟠 Alto, ⚠️ Limitada): Tensiómetro + ECG sí; tras aterrizar en Luna/Marte no hay laboratorio; LBNP es experimental.
- **OS-01 Densidad mineral ósea** (🟠 Alto, ⛔ Solo en tierra): DXA/QCT son equipos grandes de rayos X: no hay a bordo.
- **OS-02 Marcadores de resorción ósea (calcio, NTX en orina)** (🟠 Alto, ⚠️ Limitada): Se recogen y congelan muestras; casi no hay análisis a bordo.
- **SM-02 Equilibrio y marcha tras aterrizaje** (🟠 Alto, ⚠️ Limitada): IMU del wearable sí; pruebas funcionales completas solo con apoyo en tierra.
- **RN-01 Riesgo de cálculo renal (calcio urinario, volumen de orina)** (🟠 Alto, ⚠️ Limitada): Volumen de orina y ultrasonido sí; química urinaria completa no.
- **MU-04 Capacidad aeróbica (VO2 máx. estimado)** (🟠 Alto, ⚠️ Limitada): Requiere analizador de gases; disponible solo en campañas de investigación.
- **IN-04 Hemograma (leucocitos, linfocitos)** (🟡 Medio, ⚠️ Limitada): No hay hemograma completo rutinario a bordo; dispositivos en prueba.
- **EN-06 Carga microbiana de aire y superficies** (🟡 Medio, ⚠️ Limitada): Muestreo y secuenciación experimental; cultivo se analiza en tierra.

> La disponibilidad se refiere a la ISS. En una nave de tránsito a Marte o un módulo lunar el espacio y la masa son menores: parte de lo marcado como ✅ podría no viajar. Por eso el software debe aceptar **métodos alternativos** para cada indicador.

## 9.7 Análisis: indicadores que se pueden obtener con cámaras e imágenes de cuerpo completo

| Viabilidad | Nº | Indicadores |
|---|---|---|
| 📷 Sí | 4 | MU-03, IN-03, SM-02, NU-01 |
| ◐ Parcial | 15 | CV-01, CV-06, MU-01, MU-02, MU-05, VI-02, IN-01, IN-02, SU-01, SU-02, CO-01, PS-01, EN-05, EN-06, EN-08 |
| ○ Baja | 8 | CV-02, CV-05, CV-07, RA-03, SM-01, PS-02, PS-03, NU-02 |
| ✖ No | 19 | CV-03, CV-04, OS-01, OS-02, RN-01, MU-04, VI-01, VI-03, IN-04, RA-01, RA-02, SU-03, CO-02, CO-03, EN-01, EN-02, EN-03, EN-04, EN-07 |

**Conclusión rápida:** 19 de 46 indicadores se pueden obtener o complementar con cámara (4 como método principal). La cámara **no sustituye** a los wearables, dosímetros, muestras biológicas ni sensores ambientales, pero sí cubre bien el sistema musculoesquelético, la piel, la nutrición, la somnolencia y, con privacidad desde el diseño, el estado de ánimo.

### 9.7.1 Detalle de los indicadores viables (📷 Sí y ◐ Parcial)

| ID | Indicador | P×G | Viabilidad | Cámara necesaria | Técnica | Rol frente a la instrumentación |
|---|---|---|---|---|---|---|
| SM-02 | Equilibrio y marcha tras aterrizaje | 15 | 📷 Sí | RGB o profundidad, cuerpo completo | Análisis de marcha y balanceo con pose (solo con gravedad: Luna, Marte, Tierra) | **Aporta valor**: cubre un hueco de la instrumentación limitada |
| NU-01 | Ingesta calórica y de proteína | 12 | 📷 Sí | RGB (tableta) | Foto del paquete o la bandeja: reconocimiento de alimento y porción | Complemento sin contacto del instrumento existente |
| MU-03 | Volumen y adherencia al ejercicio | 9 | 📷 Sí | RGB fija en la zona de ejercicio | Estimación de pose: conteo de repeticiones, técnica, rango de movimiento | Complemento sin contacto del instrumento existente |
| IN-03 | Erupciones / hipersensibilidad de piel | 6 | 📷 Sí | RGB (tableta) | Foto de la lesión + clasificador; seguimiento de tamaño y color | Complemento sin contacto del instrumento existente |
| CV-06 | Respuesta ortostática (FC/PA al ponerse de pie) | 15 | ◐ Parcial | RGB cuerpo completo | FC por rPPG + detección de balanceo, palidez o caída al ponerse de pie (en gravedad) | **Aporta valor**: cubre un hueco de la instrumentación limitada |
| SU-01 | Duración y eficiencia del sueño | 15 | ◐ Parcial | IR nocturna en el compartimento de sueño | Movimiento durante el sueño; invade privacidad, el actígrafo es mejor | Complemento sin contacto del instrumento existente |
| CV-01 | Frecuencia cardiaca en reposo | 12 | ◐ Parcial | RGB frontal (tableta) | rPPG: cambios sutiles de color de la piel con cada latido; requiere quietud y buena luz | Complemento sin contacto del instrumento existente |
| MU-01 | Fuerza máxima (prensa, agarre) | 12 | ◐ Parcial | RGB o profundidad, cuerpo completo | Pose: velocidad de la barra/movimiento y repeticiones; la fuerza se infiere, no se mide | Complemento sin contacto del instrumento existente |
| VI-02 | Edema de disco óptico / grosor retiniano | 12 | ◐ Parcial | Cámara especializada de fondo de ojo | Clasificación de edema de disco en imágenes de fondo de ojo; no sirve una cámara normal | Complemento sin contacto del instrumento existente |
| SU-02 | Alineación circadiana (horarios, exposición a luz) | 12 | ◐ Parcial | Sensor de la cámara | Luminancia ambiental aproximada | Complemento sin contacto del instrumento existente |
| CO-01 | Vigilancia psicomotora (PVT) | 12 | ◐ Parcial | RGB/IR frontal | PERCLOS (cierre de párpados) y parpadeo para somnolencia; complementa al PVT | Complemento sin contacto del instrumento existente |
| PS-01 | Estado de ánimo y estrés | 12 | ◐ Parcial | RGB frontal (tableta), sesión breve con consentimiento | Unidades de acción facial (AU), valencia y activación comparadas con la línea base personal; solo se guardan puntajes agregados, nunca imágenes (ver 9.7.5) | Complemento sin contacto del instrumento existente |
| MU-05 | Dolor lumbar / articular y lesiones (hombro) | 10 | ◐ Parcial | RGB cuerpo completo | Postura, rango de movimiento del hombro y asimetrías con estimación de pose | Complemento sin contacto del instrumento existente |
| IN-01 | Temperatura corporal | 9 | ◐ Parcial | Térmica (IR) | Temperatura de la piel/frente; una cámara RGB no sirve | Complemento sin contacto del instrumento existente |
| EN-06 | Carga microbiana de aire y superficies | 9 | ◐ Parcial | RGB o microscopio | Conteo automático de colonias en placas de cultivo | **Aporta valor**: cubre un hueco de la instrumentación limitada |
| MU-02 | Masa corporal | 8 | ◐ Parcial | Profundidad (3D) o varias RGB, cuerpo completo | Fotogrametría: circunferencias y volumen de muslo/pantorrilla, cambio de forma corporal | Complemento sin contacto del instrumento existente |
| IN-02 | Síntomas de infección o reactivación viral (herpes, fatiga) | 8 | ◐ Parcial | RGB facial | Lesiones visibles (herpes labial), aspecto de fatiga; la carga viral no es visible | **Aporta valor**: cubre un hueco de la instrumentación limitada |
| EN-05 | Calidad del agua potable | 8 | ◐ Parcial | RGB (tableta) | Lectura automática de tiras reactivas colorimétricas | Complemento sin contacto del instrumento existente |
| EN-08 | Iluminación (intensidad y espectro) | 6 | ◐ Parcial | Sensor de la cámara | Luminancia y temperatura de color aproximadas | Complemento sin contacto del instrumento existente |

### 9.7.2 Configuraciones de cámara

| Configuración | Indicadores que cubre | Modelos / técnicas | Cómputo |
|---|---|---|---|
| **Cámara frontal de la tableta o portátil** | CV-01 (FC), CO-01 (somnolencia), IN-02, IN-03 (piel), NU-01 (comida), EN-05 (tiras de agua) | rPPG, PERCLOS con puntos faciales (MediaPipe Face Mesh), clasificador de imágenes | CPU, bajo |
| **Cámara fija de cuerpo completo en la zona de ejercicio** | MU-03, MU-01, MU-05, CV-06 | Estimación de pose 2D/3D (MediaPipe Pose, MoveNet, RTMPose) | CPU, tiempo real a baja resolución |
| **Cámara de profundidad (3D)** | MU-02 (forma y volumen corporal) | Nube de puntos / fotogrametría; circunferencias de muslo y pantorrilla | Medio, análisis semanal |
| **Cámara térmica (IR)** | IN-01 (temperatura), apoyo a CV-01 | Temperatura de la región facial | Bajo |
| **Cámaras especializadas** | VI-02 (fondo de ojo), EN-06 (placas de cultivo) | Clasificación/segmentación de imágenes médicas | Medio, ocasional |
| **Cámara con gravedad (Luna, Marte, Tierra)** | SM-02 (marcha y equilibrio), CV-06 | Análisis de marcha con pose | CPU |

### 9.7.3 Limitaciones específicas de las cámaras en el espacio

| Limitación | Efecto | Mitigación |
|---|---|---|
| **Microgravedad** | El cuerpo flota y gira; no hay "arriba"; los modelos de pose se entrenaron en 1 g | Usar pose sobre ejercicios con anclaje (cinta, equipo resistivo); ajustar con datos propios |
| **Sin marcha en órbita** | El análisis de marcha solo tiene sentido con gravedad | Usar SM-02 tras el aterrizaje o en superficie lunar/marciana |
| **Espacio reducido** | Oclusiones; la cámara queda muy cerca y necesita gran angular (distorsión) | Calibrar la lente; ubicar la cámara en el eje del equipo de ejercicio |
| **Iluminación variable** | Afecta mucho al rPPG y al color de la piel | Iluminación fija durante la medición; normalización de color |
| **Cara hinchada por desplazamiento de fluidos** | Cambia la apariencia facial y confunde modelos de expresión | Comparar contra la línea base en vuelo de la misma persona |
| **Varias personas en cuadro** | Hay que atribuir el dato al astronauta correcto | Sesión iniciada por el usuario o identificación en el dispositivo |
| **Privacidad** | Cámaras permanentes en un hábitat cerrado afectan la confianza | Procesar en el dispositivo; guardar solo métricas o puntos clave, nunca video; cámara solo durante la sesión; indicador de cámara activa |
| **Cómputo y radiación** | Límites de energía y fallos por radiación | Modelos cuantizados en CPU, verificación de integridad (ver [guía 08](08-computo-ia-y-limitaciones.md)) |
| **Validación** | Precisión menor que el instrumento de contacto | Validar contra wearable/instrumento y mostrar el nivel de confianza |

### 9.7.4 Recomendación para el módulo de cámara del reto

1. **Pose en ejercicio (MU-03, MU-01, MU-05):** cuenta repeticiones, evalúa técnica y rango de movimiento. Es la aplicación más madura y útil.
2. **Marcha y equilibrio tras el aterrizaje (SM-02, CV-06):** fácil de demostrar en la Tierra ante el jurado; simula la llegada a Marte.
3. **FC por rPPG (CV-01)** validada contra un wearable o un oxímetro en la demo, mostrando el margen de error.
4. **Fotos de piel y comida (IN-03, NU-01):** clasificador ligero en la tableta.
5. **Somnolencia por PERCLOS (CO-01)** como complemento del test PVT.
6. **Estado de ánimo por expresión facial (PS-01)**, con privacidad desde el diseño (ver 9.7.5): una sesión breve y voluntaria, junto al check-in diario, que mide cambios respecto a la línea base de la persona y se contrasta con el cuestionario.

PS-02 y PS-03 (soledad y cohesión del equipo) siguen sin recomendarse por cámara: exigirían cámaras permanentes en las áreas comunes, y eso sí es incompatible con extraer solo lo necesario.

### 9.7.5 Expresión facial para salud mental: privacidad desde el diseño

El objetivo es que el sistema **solo extraiga lo necesario para monitorear la salud** y que el astronauta mantenga el control de sus datos.

**Qué se extrae y qué no**

| Se procesa (en memoria, durante segundos) | Se guarda | Nunca se guarda ni se transmite |
|---|---|---|
| Fotogramas de la cámara frontal durante la sesión (≈30–60 s) | Puntaje diario de valencia (positivo/negativo) y activación (calma/tensión) | Imágenes o video |
| Puntos faciales y unidades de acción (AU), por ejemplo AU4 (ceño) o AU12 (sonrisa) | Desviación respecto a la línea base personal (z-score) | Vectores faciales que permitan reconstruir o identificar el rostro |
| — | Confianza de la medición (luz, encuadre) | Emociones "etiquetadas" de un solo fotograma |

**Garantías técnicas**

1. **Procesamiento 100 % en el dispositivo** (MediaPipe Face Mesh + clasificador ligero); los fotogramas se descartan de inmediato tras extraer los puntajes.
2. **Minimización de datos:** solo se persisten 2–3 números por sesión; al dashboard llegan agregados diarios o semanales.
3. **Consentimiento y control:** la sesión la inicia el astronauta; puede omitirla, pausar el módulo o borrar su historial en cualquier momento.
4. **Transparencia:** indicador visible de cámara activa y pantalla que muestra exactamente qué valores se guardaron.
5. **Acceso limitado:** los puntajes faciales los ve el propio astronauta; se comparten con el médico de vuelo solo si él lo autoriza o si hay una alerta acordada previamente.
6. **Propósito único:** los datos se usan solo para el bienestar del astronauta, nunca para evaluar su desempeño ni para decisiones de selección o asignación.
7. **Cifrado en reposo** de los puntajes y borrado automático según la política de la misión.

**Cómo mejorar la validez**

- Medir **cambios dentro de la misma persona** (tendencia frente a su línea base), no clasificar emociones absolutas.
- Construir la línea base **en vuelo** (las primeras semanas), porque la cara cambia por el desplazamiento de fluidos.
- **Triangular** con el cuestionario de ánimo, el sueño, la VFC y el PVT: una alerta solo se activa si coinciden varias señales.
- Controlar condiciones: misma hora, misma luz, misma posición; descartar sesiones de baja confianza.
- Revisar sesgos del modelo (tono de piel, género, edad) y reportar la incertidumbre en la interfaz.
- Validar en análogos (HERA, CHAPEA) o con voluntarios antes de usarlo como indicador fiable.

## 9.8 Cómo usar la matriz en el software

1. **Priorizar el MVP:** implementar primero los indicadores 🔴 y 🟠.
2. **Frecuencia de recordatorios:** la columna *Frecuencia de medición* define cuándo la app pide cada dato.
3. **Peso en el panel:** un indicador fuera de rango con puntaje alto sube de nivel la alerta de su sistema.
4. **Métodos alternativos:** si falla un sensor o el instrumento no viaja en la misión, la app propone la siguiente forma de recolección (incluida la cámara cuando sea viable).
