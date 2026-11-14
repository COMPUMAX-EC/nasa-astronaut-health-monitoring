"""Genera la matriz de riesgo de indicadores de salud.

Salidas:
  data/indicadores.csv                    -> para importar en la app
  docs/09-matriz-riesgo-indicadores.md    -> documentación legible

Uso: python scripts/generar_matriz.py
Edita la lista INDICADORES y vuelve a ejecutar para regenerar ambos archivos.
"""
import csv
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent

# Enlaces de referencia (verificados)
HRP = "https://www.nasa.gov/hrp/risks/"
STD1 = "https://www.nasa.gov/reference/nasa-std-3001v1/"
STD2 = "https://www.nasa.gov/reference/nasa-std-3001v2/"
TB = "https://www.nasa.gov/wp-content/uploads/"
BONE = TB + "2026/02/ochmo-mtb-013-bone-loss.pdf"
SANS = TB + "2024/02/ochmo-mtb-001-sans.pdf"
VTE = TB + "2026/01/ochmo-mtb-007-venous-thrombosis-in-spaceflight.pdf"
CIRC = TB + "2026/03/ochmo-mtb-009-circadian-desynchrony.pdf"
SAS = TB + "2025/09/ochmo-mtb-004-space-adaptation-sickness-sas.pdf"
SHOULDER = TB + "2025/09/ochmo-mtb-006-shoulder-injury.pdf"
BH = TB + "2023/12/ochmo-tb-016-behavioral-health.pdf"
COG = TB + "2023/12/ochmo-tb-032-cognitive-workload.pdf"
SENS = TB + "2023/12/ochmo-tb-010-sensorimotor.pdf"
ORTHO = TB + "2023/12/ochmo-tb-019-orthostatic-intolerance.pdf"
RAD = TB + "2023/12/ochmo-tb-020-radiation-protection.pdf"
FOOD = TB + "2023/12/ochmo-tb-013-food-and-nutrition.pdf"
SLEEP = TB + "2023/12/ochmo-tb-041-sleep-accommodations.pdf"
ATM = TB + "2023/12/ochmo-tb-003-habitable-atmosphere.pdf"
NOISE = TB + "2023/12/ochmo-tb-035-acoustics.pdf"
WATER = TB + "2023/12/ochmo-tb-027-water.pdf"
MICRO = TB + "2025/05/ochmo-tb-046-microbiology-rev-a.pdf"
TOX = TB + "2023/12/ochmo-tb-015-spaceflight-toxicology.pdf"
LIGHT = TB + "2023/12/ochmo-tb-026-lighting-design.pdf"
PHARM = TB + "2023/12/ochmo-tb-006-pharmaceuticals.pdf"
TWINS = "https://www.nasa.gov/humans-in-space/twins-study/"
HHC = "https://www.nasa.gov/hrp/human-health-countermeasures/"
DONKI = "https://ccmc.gsfc.nasa.gov/tools/DONKI/"

# (id, sistema, indicador, unidad, riesgo asociado, P, G, frecuencia de medición, [métodos], fuente)
INDICADORES = [
    # Cardiovascular
    ("CV-01", "Cardiovascular", "Frecuencia cardiaca en reposo", "lpm", "Desacondicionamiento cardiovascular", 4, 3, "Continua (resumen diario)", ["Wearable de pecho o muñeca (Bio-Monitor/Astroskin, banda)", "Oxímetro de dedo", "rPPG con cámara (opcional)"], HRP),
    ("CV-02", "Cardiovascular", "Variabilidad de la FC (VFC/HRV)", "ms (RMSSD)", "Estrés autonómico, fatiga", 4, 2, "Diaria (al despertar)", ["Banda de pecho con ECG", "Wearable de anillo o muñeca"], HRP),
    ("CV-03", "Cardiovascular", "Presión arterial", "mmHg", "Adaptaciones cardiovasculares", 3, 3, "Diaria", ["Tensiómetro automático de brazo", "Wearable con presión arterial (Astroskin)"], STD1),
    ("CV-04", "Cardiovascular", "Ritmo cardiaco / arritmias (ECG)", "eventos/día", "Arritmia o evento cardiaco", 2, 5, "Continua o semanal (Holter 24 h)", ["ECG de una derivación en wearable", "Holter de 24 h", "ECG de 12 derivaciones del kit médico"], HRP),
    ("CV-05", "Cardiovascular", "Saturación de oxígeno (SpO2)", "%", "Hipoxia por falla ambiental o enfermedad", 2, 4, "Continua (sueño) y ante síntomas", ["Oxímetro de pulso", "Wearable con SpO2"], STD1),
    ("CV-06", "Cardiovascular", "Respuesta ortostática (FC/PA al ponerse de pie)", "Δ lpm, Δ mmHg", "Intolerancia ortostática al volver a la gravedad", 5, 3, "Antes y después del aterrizaje", ["Test activo de bipedestación con tensiómetro + ECG", "Simulación con presión negativa en la parte inferior del cuerpo (LBNP)"], ORTHO),
    ("CV-07", "Cardiovascular", "Síntomas de trombosis venosa (cuello, piernas)", "sí/no + escala", "Trombosis venosa", 2, 4, "Diaria (autorreporte)", ["Cuestionario en la app", "Ultrasonido guiado de la vena yugular"], VTE),
    # Óseo y renal
    ("OS-01", "Óseo", "Densidad mineral ósea", "g/cm² (% cambio)", "Pérdida ósea y fractura", 5, 3, "Antes y después de la misión", ["DXA / QCT en tierra", "Ultrasonido óseo cuantitativo a bordo (experimental)"], BONE),
    ("OS-02", "Óseo", "Marcadores de resorción ósea (calcio, NTX en orina)", "mg/día", "Pérdida ósea", 5, 3, "Mensual", ["Muestra de orina + analizador portátil", "Muestras congeladas para análisis en tierra"], BONE),
    ("RN-01", "Renal", "Riesgo de cálculo renal (calcio urinario, volumen de orina)", "mg/día, L/día", "Cálculo renal", 3, 4, "Semanal", ["Registro de volumen de orina", "Tira reactiva / analizador de orina", "Ultrasonido renal guiado ante síntomas"], HRP),
    # Muscular
    ("MU-01", "Muscular", "Fuerza máxima (prensa, agarre)", "kg / N", "Pérdida de fuerza y masa muscular", 4, 3, "Semanal", ["Dinamómetro de mano", "Datos del equipo de ejercicio resistivo", "Test de 1RM estimado"], HHC),
    ("MU-02", "Muscular", "Masa corporal", "kg", "Pérdida muscular, desnutrición", 4, 2, "Semanal", ["Medidor de masa por aceleración (en microgravedad no hay báscula de peso)", "Entrada manual en la app"], FOOD),
    ("MU-03", "Muscular", "Volumen y adherencia al ejercicio", "min/día, carga", "Pérdida ósea y muscular", 3, 3, "Por sesión", ["Registro automático del equipo (cinta, bicicleta, resistivo)", "Wearable de actividad", "Pose estimada con cámara (visión artificial)"], HHC),
    ("MU-04", "Muscular", "Capacidad aeróbica (VO2 máx. estimado)", "ml/kg/min", "Desacondicionamiento físico", 4, 3, "Mensual", ["Prueba submáxima en bicicleta con FC", "Estimación por wearable"], HHC),
    ("MU-05", "Musculoesquelético", "Dolor lumbar / articular y lesiones (hombro)", "escala 0-10", "Dolor de espalda, lesión de hombro", 5, 2, "Diaria (autorreporte)", ["Escala de dolor en la app", "Mapa corporal interactivo"], SHOULDER),
    # Visión
    ("VI-01", "Visión (SANS)", "Agudeza visual y rejilla de Amsler", "logMAR / sí-no", "SANS", 4, 3, "Semanal", ["Test de agudeza en tableta", "Rejilla de Amsler digital"], SANS),
    ("VI-02", "Visión (SANS)", "Edema de disco óptico / grosor retiniano", "µm", "SANS", 4, 3, "Mensual", ["OCT a bordo", "Fondo de ojo con cámara", "Ultrasonido ocular"], SANS),
    ("VI-03", "Visión (SANS)", "Presión intraocular", "mmHg", "SANS", 3, 3, "Mensual", ["Tonómetro portátil"], SANS),
    # Inmune
    ("IN-01", "Inmune", "Temperatura corporal", "°C", "Infección", 3, 3, "Diaria y ante síntomas", ["Termómetro digital", "Sensor de temperatura del wearable"], STD1),
    ("IN-02", "Inmune", "Síntomas de infección o reactivación viral (herpes, fatiga)", "lista de síntomas", "Alteración inmune, reactivación viral latente", 4, 2, "Diaria", ["Cuestionario de síntomas en la app", "Muestra de saliva para carga viral (en tierra)"], TWINS),
    ("IN-03", "Inmune", "Erupciones / hipersensibilidad de piel", "sí/no + foto", "Alteración inmune, dermatitis", 3, 2, "Ante síntomas", ["Foto con la tableta + clasificador (visión artificial)", "Autorreporte"], HRP),
    ("IN-04", "Inmune / Hematológico", "Hemograma (leucocitos, linfocitos)", "células/µL", "Alteración inmune, efecto de radiación", 3, 3, "Mensual", ["Analizador de sangre portátil", "Muestras para análisis en tierra"], HRP),
    # Radiación
    ("RA-01", "Radiación", "Dosis efectiva acumulada", "mSv (% de 600 mSv)", "Cáncer y efectos degenerativos", 5, 4, "Continua", ["Dosímetro personal activo", "Dosímetro pasivo", "Monitores de radiación del vehículo"], RAD),
    ("RA-02", "Radiación", "Evento de partículas solares (SEP) en curso", "evento sí/no, flujo", "Síndrome agudo por radiación", 2, 5, "Continua", ["API DONKI de NASA", "Detector de partículas a bordo", "Aviso del control de misión"], DONKI),
    ("RA-03", "Radiación", "Síntomas prodrómicos (náusea, vómito, fatiga) tras un evento", "escala", "Síndrome agudo por radiación", 1, 5, "Tras eventos SEP", ["Cuestionario guiado en la app"], RAD),
    # Sensoriomotor
    ("SM-01", "Sensoriomotor", "Mareo espacial (náusea, desorientación)", "escala 0-10", "Mareo espacial (SAS)", 5, 2, "Diaria (primeros días y tras transiciones de gravedad)", ["Escala de síntomas en la app"], SAS),
    ("SM-02", "Sensoriomotor", "Equilibrio y marcha tras aterrizaje", "puntaje / s", "Alteración sensoriomotora", 5, 3, "Tras cada transición de gravedad", ["Test de equilibrio con IMU del wearable", "Prueba funcional cronometrada", "Pose con cámara (visión artificial)"], SENS),
    # Sueño y circadiano
    ("SU-01", "Sueño", "Duración y eficiencia del sueño", "h, %", "Pérdida de sueño, fatiga", 5, 3, "Diaria", ["Actigrafía (muñeca o anillo)", "Diario de sueño en la app"], SLEEP),
    ("SU-02", "Sueño", "Alineación circadiana (horarios, exposición a luz)", "h de desfase, lux", "Desincronización circadiana", 4, 3, "Diaria", ["Actígrafo con sensor de luz", "Registro de horarios de trabajo"], CIRC),
    ("SU-03", "Sueño", "Uso de medicamentos para dormir", "dosis/semana", "Dependencia, efectos sobre el rendimiento", 4, 2, "Por uso", ["Registro de medicación en la app"], PHARM),
    # Cognitivo
    ("CO-01", "Cognitivo", "Vigilancia psicomotora (PVT)", "ms, lapsos", "Deterioro del rendimiento por fatiga", 4, 3, "Diaria (3 min)", ["Test PVT en tableta o PC"], COG),
    ("CO-02", "Cognitivo", "Batería cognitiva (memoria, atención, razonamiento)", "puntaje", "Deterioro cognitivo", 3, 3, "Semanal", ["Batería de tests en la app"], COG),
    ("CO-03", "Cognitivo", "Carga de trabajo percibida (NASA-TLX)", "0-100", "Sobrecarga de trabajo", 4, 2, "Al final de cada jornada", ["Cuestionario NASA-TLX en la app"], COG),
    # Salud mental
    ("PS-01", "Salud mental", "Estado de ánimo y estrés", "escala", "Condiciones conductuales adversas", 3, 4, "Diaria", ["Cuestionario breve en la app", "Expresión facial en sesión breve, procesada en el dispositivo", "Diario personal", "Análisis de voz en el dispositivo (opcional)"], BH),
    ("PS-02", "Salud mental", "Soledad y aislamiento percibido", "escala", "Problemas psicosociales por aislamiento", 4, 3, "Semanal", ["Cuestionario en la app", "Registro de contacto con familia"], BH),
    ("PS-03", "Salud mental", "Cohesión y conflicto del equipo", "escala", "Fallas de cooperación y comunicación del equipo", 3, 4, "Semanal", ["Encuesta anónima del equipo", "Registro de incidentes"], BH),
    # Nutrición
    ("NU-01", "Nutrición", "Ingesta calórica y de proteína", "kcal/día, g/día", "Desnutrición", 4, 3, "Diaria", ["Escaneo de código de barras de los paquetes de comida", "Foto de la comida (visión artificial)", "Registro manual"], FOOD),
    ("NU-02", "Nutrición", "Ingesta de agua / hidratación", "L/día", "Deshidratación, cálculo renal", 3, 3, "Diaria", ["Dispensador de agua conectado", "Registro manual"], FOOD),
    # Entorno
    ("EN-01", "Entorno", "CO2 en cabina", "mmHg (ppCO2)", "Dolor de cabeza, deterioro cognitivo", 4, 3, "Continua", ["Monitor de CO2 fijo del hábitat", "Monitor portátil personal de CO2"], ATM),
    ("EN-02", "Entorno", "O2 y presión de cabina", "kPa", "Hipoxia", 1, 5, "Continua", ["Sensores del soporte vital (ECLSS)"], ATM),
    ("EN-03", "Entorno", "Nivel de ruido", "dBA", "Pérdida auditiva, mal sueño", 4, 2, "Continua", ["Dosímetro acústico personal", "Sonómetro fijo", "Micrófono del dispositivo"], NOISE),
    ("EN-04", "Entorno", "Temperatura y humedad de cabina", "°C, %HR", "Estrés térmico, confort", 2, 2, "Continua", ["Sensores ambientales del hábitat"], STD2),
    ("EN-05", "Entorno", "Calidad del agua potable", "parámetros químicos y microbianos", "Enfermedad por agua contaminada", 2, 4, "Semanal", ["Kit de análisis de agua", "Sensores en línea del sistema de agua"], WATER),
    ("EN-06", "Entorno", "Carga microbiana de aire y superficies", "UFC", "Infecciones, contaminación", 3, 3, "Mensual", ["Muestreo de superficies y aire", "Secuenciación a bordo"], MICRO),
    ("EN-07", "Entorno", "Contaminantes tóxicos (combustión, fugas)", "ppm", "Intoxicación", 2, 4, "Continua", ["Analizador de productos de combustión", "Monitor de calidad del aire"], TOX),
    ("EN-08", "Entorno", "Iluminación (intensidad y espectro)", "lux, K", "Desincronización circadiana", 3, 2, "Continua", ["Sensor de luz del hábitat", "Sensor de luz del actígrafo"], LIGHT),
]

P_TXT = {1: "Rara", 2: "Improbable", 3: "Posible", 4: "Probable", 5: "Casi segura"}
G_TXT = {1: "Insignificante", 2: "Menor", 3: "Moderada", 4: "Mayor", 5: "Catastrófica"}

# ---------------------------------------------------------------------------
# Instrumentación a bordo: D = disponible hoy en la ISS, L = limitada/experimental,
# T = solo en tierra (casi imposible tener el instrumento adecuado a bordo)
# ---------------------------------------------------------------------------
INSTR_TXT = {"D": "✅ Disponible", "L": "⚠️ Limitada", "T": "⛔ Solo en tierra"}
INSTR = {
    "CV-01": ("D", "Wearables y monitores de FC ya usados en la ISS"),
    "CV-02": ("D", "Banda de pecho/ECG; algoritmo de VFC en software"),
    "CV-03": ("D", "Tensiómetro automático en el kit médico"),
    "CV-04": ("D", "ECG y Holter en el kit médico de la ISS"),
    "CV-05": ("D", "Oxímetro de pulso"),
    "CV-06": ("L", "Tensiómetro + ECG sí; tras aterrizar en Luna/Marte no hay laboratorio; LBNP es experimental"),
    "CV-07": ("D", "Ultrasonido a bordo, operado por tripulación con guía remota"),
    "OS-01": ("T", "DXA/QCT son equipos grandes de rayos X: no hay a bordo"),
    "OS-02": ("L", "Se recogen y congelan muestras; casi no hay análisis a bordo"),
    "RN-01": ("L", "Volumen de orina y ultrasonido sí; química urinaria completa no"),
    "MU-01": ("D", "Dinamómetro y datos del equipo de ejercicio resistivo"),
    "MU-02": ("D", "Medidor de masa por aceleración (no existe báscula de peso en microgravedad)"),
    "MU-03": ("D", "Equipos de ejercicio registran carga y tiempo"),
    "MU-04": ("L", "Requiere analizador de gases; disponible solo en campañas de investigación"),
    "MU-05": ("D", "Autorreporte; ultrasonido para lesiones"),
    "VI-01": ("D", "Tests de agudeza y Amsler en tableta"),
    "VI-02": ("D", "OCT y cámara de fondo de ojo en la ISS (no garantizados en naves pequeñas)"),
    "VI-03": ("D", "Tonómetro portátil"),
    "IN-01": ("D", "Termómetro"),
    "IN-02": ("L", "Síntomas sí; carga viral en saliva se analiza en tierra"),
    "IN-03": ("D", "Cámara de la tableta"),
    "IN-04": ("L", "No hay hemograma completo rutinario a bordo; dispositivos en prueba"),
    "RA-01": ("D", "Dosímetros personales y del vehículo"),
    "RA-02": ("D", "Detectores a bordo + avisos de tierra/DONKI"),
    "RA-03": ("D", "Cuestionario"),
    "SM-01": ("D", "Cuestionario"),
    "SM-02": ("L", "IMU del wearable sí; pruebas funcionales completas solo con apoyo en tierra"),
    "SU-01": ("D", "Actígrafos usados en la ISS"),
    "SU-02": ("D", "Actígrafo con sensor de luz"),
    "SU-03": ("D", "Registro"),
    "CO-01": ("D", "PVT en tableta o portátil"),
    "CO-02": ("D", "Batería cognitiva en portátil"),
    "CO-03": ("D", "Cuestionario"),
    "PS-01": ("D", "Cuestionario"),
    "PS-02": ("D", "Cuestionario"),
    "PS-03": ("D", "Encuesta"),
    "NU-01": ("D", "Paquetes de comida con código de barras"),
    "NU-02": ("D", "Dispensador / registro"),
    "EN-01": ("D", "Monitores de CO2 fijos y portátiles"),
    "EN-02": ("D", "Sensores del soporte vital"),
    "EN-03": ("D", "Dosímetros acústicos"),
    "EN-04": ("D", "Sensores del hábitat"),
    "EN-05": ("D", "Kits de análisis de agua"),
    "EN-06": ("L", "Muestreo y secuenciación experimental; cultivo se analiza en tierra"),
    "EN-07": ("D", "Analizadores de calidad del aire"),
    "EN-08": ("D", "Sensores de luz"),
}

# ---------------------------------------------------------------------------
# Viabilidad por cámara / imagen de cuerpo completo:
# S = sí (la cámara puede ser el método principal), P = parcial (complementa),
# B = baja/experimental, N = no
# (nivel, tipo de cámara, técnica)
# ---------------------------------------------------------------------------
CAM_TXT = {"S": "📷 Sí", "P": "◐ Parcial", "B": "○ Baja", "N": "✖ No"}
CAM = {
    "CV-01": ("P", "RGB frontal (tableta)", "rPPG: cambios sutiles de color de la piel con cada latido; requiere quietud y buena luz"),
    "CV-02": ("B", "RGB frontal", "rPPG de alta calidad; la VFC por cámara aún es poco precisa"),
    "CV-03": ("N", "—", "Experimental (tiempo de tránsito del pulso por video); no validado"),
    "CV-04": ("N", "—", "Requiere ECG"),
    "CV-05": ("B", "RGB/IR", "SpO2 por cámara es experimental"),
    "CV-06": ("P", "RGB cuerpo completo", "FC por rPPG + detección de balanceo, palidez o caída al ponerse de pie (en gravedad)"),
    "CV-07": ("B", "RGB", "Asimetría o hinchazón visible en cuello/piernas; poco sensible"),
    "OS-01": ("N", "—", "La densidad ósea no es visible en una imagen externa"),
    "OS-02": ("N", "—", "Requiere muestra de orina"),
    "RN-01": ("N", "—", "Requiere orina/ultrasonido"),
    "MU-01": ("P", "RGB o profundidad, cuerpo completo", "Pose: velocidad de la barra/movimiento y repeticiones; la fuerza se infiere, no se mide"),
    "MU-02": ("P", "Profundidad (3D) o varias RGB, cuerpo completo", "Fotogrametría: circunferencias y volumen de muslo/pantorrilla, cambio de forma corporal"),
    "MU-03": ("S", "RGB fija en la zona de ejercicio", "Estimación de pose: conteo de repeticiones, técnica, rango de movimiento"),
    "MU-04": ("N", "—", "Requiere analizador de gases (la FC por rPPG solo ayuda a estimar)"),
    "MU-05": ("P", "RGB cuerpo completo", "Postura, rango de movimiento del hombro y asimetrías con estimación de pose"),
    "VI-01": ("N", "—", "Se mide con la pantalla, no con la cámara"),
    "VI-02": ("P", "Cámara especializada de fondo de ojo", "Clasificación de edema de disco en imágenes de fondo de ojo; no sirve una cámara normal"),
    "VI-03": ("N", "—", "Requiere tonómetro"),
    "IN-01": ("P", "Térmica (IR)", "Temperatura de la piel/frente; una cámara RGB no sirve"),
    "IN-02": ("P", "RGB facial", "Lesiones visibles (herpes labial), aspecto de fatiga; la carga viral no es visible"),
    "IN-03": ("S", "RGB (tableta)", "Foto de la lesión + clasificador; seguimiento de tamaño y color"),
    "IN-04": ("N", "—", "Requiere sangre"),
    "RA-01": ("N", "—", "Requiere dosímetro"),
    "RA-02": ("N", "—", "Fuente externa (DONKI)"),
    "RA-03": ("B", "RGB", "Palidez o vómito visibles; mejor el cuestionario"),
    "SM-01": ("B", "RGB facial", "Palidez y movimientos de cabeza; mejor el cuestionario"),
    "SM-02": ("S", "RGB o profundidad, cuerpo completo", "Análisis de marcha y balanceo con pose (solo con gravedad: Luna, Marte, Tierra)"),
    "SU-01": ("P", "IR nocturna en el compartimento de sueño", "Movimiento durante el sueño; invade privacidad, el actígrafo es mejor"),
    "SU-02": ("P", "Sensor de la cámara", "Luminancia ambiental aproximada"),
    "SU-03": ("N", "—", "Registro"),
    "CO-01": ("P", "RGB/IR frontal", "PERCLOS (cierre de párpados) y parpadeo para somnolencia; complementa al PVT"),
    "CO-02": ("N", "—", "Test en pantalla"),
    "CO-03": ("N", "—", "Cuestionario"),
    "PS-01": ("P", "RGB frontal (tableta), sesión breve con consentimiento", "Unidades de acción facial (AU), valencia y activación comparadas con la línea base personal; solo se guardan puntajes agregados, nunca imágenes (ver 9.7.5)"),
    "PS-02": ("B", "Cámaras del hábitat", "Tiempo en áreas comunes como indicador indirecto; muy invasivo"),
    "PS-03": ("B", "Cámaras del hábitat", "Patrones de interacción; muy invasivo"),
    "NU-01": ("S", "RGB (tableta)", "Foto del paquete o la bandeja: reconocimiento de alimento y porción"),
    "NU-02": ("B", "RGB", "Detección del gesto de beber; impreciso"),
    "EN-01": ("N", "—", "Sensor químico"),
    "EN-02": ("N", "—", "Sensor químico"),
    "EN-03": ("N", "—", "Micrófono, no cámara"),
    "EN-04": ("N", "—", "Sensor"),
    "EN-05": ("P", "RGB (tableta)", "Lectura automática de tiras reactivas colorimétricas"),
    "EN-06": ("P", "RGB o microscopio", "Conteo automático de colonias en placas de cultivo"),
    "EN-07": ("N", "—", "Sensor químico"),
    "EN-08": ("P", "Sensor de la cámara", "Luminancia y temperatura de color aproximadas"),
}


def nivel(score: int) -> str:
    if score >= 16:
        return "🔴 Crítico"
    if score >= 10:
        return "🟠 Alto"
    if score >= 5:
        return "🟡 Medio"
    return "🟢 Bajo"


def escribir_csv(filas) -> None:
    ruta = RAIZ / "data" / "indicadores.csv"
    ruta.parent.mkdir(exist_ok=True)
    with ruta.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "sistema", "indicador", "unidad", "riesgo", "probabilidad", "gravedad",
                    "puntaje", "nivel", "frecuencia_medicion", "metodos_recoleccion",
                    "instrumentacion_a_bordo", "nota_instrumentacion",
                    "viable_por_camara", "tipo_camara", "tecnica_camara", "fuente"])
        for (i, s, ind, u, r, p, g, fr, m, src) in filas:
            ins, ins_nota = INSTR[i]
            cam, cam_tipo, cam_tec = CAM[i]
            w.writerow([i, s, ind, u, r, p, g, p * g, nivel(p * g).split(" ", 1)[1], fr, " | ".join(m),
                        INSTR_TXT[ins].split(" ", 1)[1], ins_nota,
                        CAM_TXT[cam].split(" ", 1)[1], cam_tipo, cam_tec, src])


def escribir_md(filas) -> None:
    orden = sorted(filas, key=lambda x: (-x[5] * x[6], x[0]))
    out = []
    a = out.append
    a("# 9. Matriz de riesgo de indicadores de salud\n")
    a("> Archivo generado por `python scripts/generar_matriz.py`. Para cambiar valores edita el script y vuelve a ejecutarlo. "
      "Los mismos datos están en [`data/indicadores.csv`](../data/indicadores.csv) para usarlos directamente en la app.\n")
    a("La matriz sigue el esquema 5×5 de **probabilidad × gravedad** que NASA usa para gestionar riesgos. "
      "**Las puntuaciones son una estimación del equipo** a partir de la evidencia del [Human Research Program](https://www.nasa.gov/hrp/risks/) "
      "y de los boletines OCHMO, pensando en una misión de larga duración (≥ 6 meses o rumbo a Marte) *con* las contramedidas habituales. "
      "No son valores oficiales de NASA: ajústenlas y justifíquenlas en su presentación.\n")
    a("## 9.1 Escalas\n")
    a("| Valor | Probabilidad (P) — que ocurra durante la misión | Gravedad (G) — consecuencia si ocurre |")
    a("|---|---|---|")
    desc_p = {1: "Muy poco probable incluso en misiones largas", 2: "Ha ocurrido en pocos casos", 3: "Ocurre en una parte de las tripulaciones",
              4: "Ocurre en la mayoría de misiones largas", 5: "Ocurre en prácticamente todos los astronautas"}
    desc_g = {1: "Sin efecto en la salud ni en la misión", 2: "Molestia; se resuelve a bordo sin afectar tareas",
              3: "Afecta el rendimiento o requiere tratamiento a bordo", 4: "Daño de salud serio o duradero; compromete objetivos",
              5: "Riesgo para la vida o pérdida de la misión"}
    for v in range(1, 6):
        a(f"| {v} | **{P_TXT[v]}**: {desc_p[v]} | **{G_TXT[v]}**: {desc_g[v]} |")
    a("\n**Puntaje = P × G** → 🟢 Bajo (1–4) · 🟡 Medio (5–9) · 🟠 Alto (10–15) · 🔴 Crítico (16–25)\n")

    a("## 9.2 Mapa de calor\n")
    a("Cada celda muestra los IDs de los indicadores con esa combinación.\n")
    a("| P \\ G | 1 Insignificante | 2 Menor | 3 Moderada | 4 Mayor | 5 Catastrófica |")
    a("|---|---|---|---|---|---|")
    for p in range(5, 0, -1):
        celdas = []
        for g in range(1, 6):
            ids = [f[0] for f in filas if f[5] == p and f[6] == g]
            celdas.append(f"{nivel(p * g).split()[0]} " + (", ".join(ids) if ids else "—"))
        a(f"| **{p} {P_TXT[p]}** | " + " | ".join(celdas) + " |")

    a("\n## 9.3 Matriz completa (ordenada por puntaje)\n")
    a("Columnas nuevas:\n")
    a("- **Instrumentación a bordo:** ✅ Disponible (existe hoy en la ISS) · ⚠️ Limitada (experimental, parcial o solo en campañas) · "
      "⛔ Solo en tierra (casi imposible tener el instrumento adecuado a bordo).")
    a("- **¿Por cámara?:** 📷 Sí (la cámara puede ser el método principal) · ◐ Parcial (complementa a otro método) · "
      "○ Baja (experimental o poco fiable) · ✖ No.\n")
    a("| ID | Sistema | Indicador (unidad) | Riesgo asociado | P | G | P×G | Nivel | Frecuencia de medición | Formas de recolectarlo | Instrumentación a bordo | ¿Por cámara? | Fuente |")
    a("|---|---|---|---|---|---|---|---|---|---|---|---|---|")
    for (i, s, ind, u, r, p, g, fr, m, src) in orden:
        metodos = "<br>".join(f"• {x}" for x in m)
        ins, ins_nota = INSTR[i]
        cam, cam_tipo, _ = CAM[i]
        cam_celda = CAM_TXT[cam] + (f"<br>{cam_tipo}" if cam_tipo != "—" else "")
        a(f"| {i} | {s} | {ind} ({u}) | {r} | {p} | {g} | **{p * g}** | {nivel(p * g)} | {fr} | {metodos} | "
          f"{INSTR_TXT[ins]}<br>{ins_nota} | {cam_celda} | [ver]({src}) |")

    a("\n## 9.4 Resumen por sistema\n")
    a("| Sistema | Nº de indicadores | Puntaje máximo |")
    a("|---|---|---|")
    sistemas = {}
    for f in filas:
        sistemas.setdefault(f[1], []).append(f[5] * f[6])
    for s, ps in sorted(sistemas.items(), key=lambda kv: -max(kv[1])):
        a(f"| {s} | {len(ps)} | {nivel(max(ps))} ({max(ps)}) |")

    a("\n## 9.5 Formas de recolección (resumen)\n")
    a("| Tipo | Ejemplos | Ventaja | Limitación |")
    a("|---|---|---|---|")
    a("| **Wearable continuo** | Bio-Monitor/Astroskin, banda de pecho, anillo, actígrafo | Pasivo, sin tiempo de tripulación | Batería, artefactos de movimiento |")
    a("| **Dispositivo médico puntual** | Tensiómetro, oxímetro, termómetro, dinamómetro, tonómetro, OCT, ultrasonido | Preciso y validado | Requiere tiempo y, a veces, entrenamiento |")
    a("| **Muestras biológicas** | Sangre, orina, saliva | Marcadores objetivos (hueso, inmune) | Analizadores a bordo limitados; muchas se analizan en tierra |")
    a("| **Cuestionarios y tests en la app** | Ánimo, síntomas, dolor, NASA-TLX, PVT, Amsler | Barato, rápido, cubre lo subjetivo | Depende de la honestidad; fatiga de cuestionarios |")
    a("| **Sensores del hábitat** | CO2, O2, ruido, luz, temperatura, agua | Continuo, sin intervención | No es individual (salvo monitores personales) |")
    a("| **Datos de equipos** | Equipo de ejercicio, dispensador de agua, códigos de barras de comida | Automático | Requiere integración con cada equipo |")
    a("| **Visión artificial (opcional)** | Pose en ejercicio, fotos de piel o comida, rPPG | Sin contacto | Privacidad, cómputo, validez clínica (ver [guía 08](08-computo-ia-y-limitaciones.md)) |")
    a("| **Fuentes externas** | API DONKI, control de misión | Contexto (clima espacial) | Depende del enlace de comunicaciones |")

    # ---------------- 9.6 Instrumentación ----------------
    a("\n## 9.6 Instrumentación disponible en el espacio\n")
    cuenta_i = {k: [f for f in filas if INSTR[f[0]][0] == k] for k in INSTR_TXT}
    a("| Estado | Nº | Indicadores |")
    a("|---|---|---|")
    for k, txt in INSTR_TXT.items():
        a(f"| {txt} | {len(cuenta_i[k])} | {', '.join(f[0] for f in cuenta_i[k])} |")
    a("\n**Brechas importantes** (indicadores de riesgo alto sin instrumento completo a bordo):\n")
    for f in sorted(filas, key=lambda x: -x[5] * x[6]):
        if INSTR[f[0]][0] != "D" and f[5] * f[6] >= 9:
            a(f"- **{f[0]} {f[2]}** ({nivel(f[5] * f[6])}, {INSTR_TXT[INSTR[f[0]][0]]}): {INSTR[f[0]][1]}.")
    a("\n> La disponibilidad se refiere a la ISS. En una nave de tránsito a Marte o un módulo lunar el espacio y la masa son menores: "
      "parte de lo marcado como ✅ podría no viajar. Por eso el software debe aceptar **métodos alternativos** para cada indicador.\n")

    # ---------------- 9.7 Cámaras ----------------
    a("## 9.7 Análisis: indicadores que se pueden obtener con cámaras e imágenes de cuerpo completo\n")
    cuenta_c = {k: [f for f in filas if CAM[f[0]][0] == k] for k in CAM_TXT}
    a("| Viabilidad | Nº | Indicadores |")
    a("|---|---|---|")
    for k, txt in CAM_TXT.items():
        a(f"| {txt} | {len(cuenta_c[k])} | {', '.join(f[0] for f in cuenta_c[k])} |")
    util = len(cuenta_c["S"]) + len(cuenta_c["P"])
    a(f"\n**Conclusión rápida:** {util} de {len(filas)} indicadores se pueden obtener o complementar con cámara "
      f"({len(cuenta_c['S'])} como método principal). La cámara **no sustituye** a los wearables, dosímetros, "
      "muestras biológicas ni sensores ambientales, pero sí cubre bien el sistema musculoesquelético, la piel, la nutrición, "
      "la somnolencia y, con privacidad desde el diseño, el estado de ánimo.\n")

    a("### 9.7.1 Detalle de los indicadores viables (📷 Sí y ◐ Parcial)\n")
    a("| ID | Indicador | P×G | Viabilidad | Cámara necesaria | Técnica | Rol frente a la instrumentación |")
    a("|---|---|---|---|---|---|---|")
    for f in sorted(filas, key=lambda x: (CAM[x[0]][0] != "S", -x[5] * x[6])):
        cam, tipo, tec = CAM[f[0]]
        if cam not in ("S", "P"):
            continue
        ins = INSTR[f[0]][0]
        rol = {"D": "Complemento sin contacto del instrumento existente",
               "L": "**Aporta valor**: cubre un hueco de la instrumentación limitada",
               "T": "**Única opción a bordo**"}[ins]
        a(f"| {f[0]} | {f[2]} | {f[5] * f[6]} | {CAM_TXT[cam]} | {tipo} | {tec} | {rol} |")

    a("\n### 9.7.2 Configuraciones de cámara\n")
    a("| Configuración | Indicadores que cubre | Modelos / técnicas | Cómputo |")
    a("|---|---|---|---|")
    a("| **Cámara frontal de la tableta o portátil** | CV-01 (FC), CO-01 (somnolencia), IN-02, IN-03 (piel), NU-01 (comida), EN-05 (tiras de agua) | rPPG, PERCLOS con puntos faciales (MediaPipe Face Mesh), clasificador de imágenes | CPU, bajo |")
    a("| **Cámara fija de cuerpo completo en la zona de ejercicio** | MU-03, MU-01, MU-05, CV-06 | Estimación de pose 2D/3D (MediaPipe Pose, MoveNet, RTMPose) | CPU, tiempo real a baja resolución |")
    a("| **Cámara de profundidad (3D)** | MU-02 (forma y volumen corporal) | Nube de puntos / fotogrametría; circunferencias de muslo y pantorrilla | Medio, análisis semanal |")
    a("| **Cámara térmica (IR)** | IN-01 (temperatura), apoyo a CV-01 | Temperatura de la región facial | Bajo |")
    a("| **Cámaras especializadas** | VI-02 (fondo de ojo), EN-06 (placas de cultivo) | Clasificación/segmentación de imágenes médicas | Medio, ocasional |")
    a("| **Cámara con gravedad (Luna, Marte, Tierra)** | SM-02 (marcha y equilibrio), CV-06 | Análisis de marcha con pose | CPU |")

    a("\n### 9.7.3 Limitaciones específicas de las cámaras en el espacio\n")
    a("| Limitación | Efecto | Mitigación |")
    a("|---|---|---|")
    a("| **Microgravedad** | El cuerpo flota y gira; no hay \"arriba\"; los modelos de pose se entrenaron en 1 g | Usar pose sobre ejercicios con anclaje (cinta, equipo resistivo); ajustar con datos propios |")
    a("| **Sin marcha en órbita** | El análisis de marcha solo tiene sentido con gravedad | Usar SM-02 tras el aterrizaje o en superficie lunar/marciana |")
    a("| **Espacio reducido** | Oclusiones; la cámara queda muy cerca y necesita gran angular (distorsión) | Calibrar la lente; ubicar la cámara en el eje del equipo de ejercicio |")
    a("| **Iluminación variable** | Afecta mucho al rPPG y al color de la piel | Iluminación fija durante la medición; normalización de color |")
    a("| **Cara hinchada por desplazamiento de fluidos** | Cambia la apariencia facial y confunde modelos de expresión | Comparar contra la línea base en vuelo de la misma persona |")
    a("| **Varias personas en cuadro** | Hay que atribuir el dato al astronauta correcto | Sesión iniciada por el usuario o identificación en el dispositivo |")
    a("| **Privacidad** | Cámaras permanentes en un hábitat cerrado afectan la confianza | Procesar en el dispositivo; guardar solo métricas o puntos clave, nunca video; cámara solo durante la sesión; indicador de cámara activa |")
    a("| **Cómputo y radiación** | Límites de energía y fallos por radiación | Modelos cuantizados en CPU, verificación de integridad (ver [guía 08](08-computo-ia-y-limitaciones.md)) |")
    a("| **Validación** | Precisión menor que el instrumento de contacto | Validar contra wearable/instrumento y mostrar el nivel de confianza |")

    a("\n### 9.7.4 Recomendación para el módulo de cámara del reto\n")
    a("1. **Pose en ejercicio (MU-03, MU-01, MU-05):** cuenta repeticiones, evalúa técnica y rango de movimiento. Es la aplicación más madura y útil.")
    a("2. **Marcha y equilibrio tras el aterrizaje (SM-02, CV-06):** fácil de demostrar en la Tierra ante el jurado; simula la llegada a Marte.")
    a("3. **FC por rPPG (CV-01)** validada contra un wearable o un oxímetro en la demo, mostrando el margen de error.")
    a("4. **Fotos de piel y comida (IN-03, NU-01):** clasificador ligero en la tableta.")
    a("5. **Somnolencia por PERCLOS (CO-01)** como complemento del test PVT.")
    a("6. **Estado de ánimo por expresión facial (PS-01)**, con privacidad desde el diseño (ver 9.7.5): una sesión breve y voluntaria, "
      "junto al check-in diario, que mide cambios respecto a la línea base de la persona y se contrasta con el cuestionario.")
    a("\nPS-02 y PS-03 (soledad y cohesión del equipo) siguen sin recomendarse por cámara: exigirían cámaras permanentes en las áreas comunes, "
      "y eso sí es incompatible con extraer solo lo necesario.\n")

    a("### 9.7.5 Expresión facial para salud mental: privacidad desde el diseño\n")
    a("El objetivo es que el sistema **solo extraiga lo necesario para monitorear la salud** y que el astronauta mantenga el control de sus datos.\n")
    a("**Qué se extrae y qué no**\n")
    a("| Se procesa (en memoria, durante segundos) | Se guarda | Nunca se guarda ni se transmite |")
    a("|---|---|---|")
    a("| Fotogramas de la cámara frontal durante la sesión (≈30–60 s) | Puntaje diario de valencia (positivo/negativo) y activación (calma/tensión) | Imágenes o video |")
    a("| Puntos faciales y unidades de acción (AU), por ejemplo AU4 (ceño) o AU12 (sonrisa) | Desviación respecto a la línea base personal (z-score) | Vectores faciales que permitan reconstruir o identificar el rostro |")
    a("| — | Confianza de la medición (luz, encuadre) | Emociones \"etiquetadas\" de un solo fotograma |")
    a("\n**Garantías técnicas**\n")
    a("1. **Procesamiento 100 % en el dispositivo** (MediaPipe Face Mesh + clasificador ligero); los fotogramas se descartan de inmediato tras extraer los puntajes.")
    a("2. **Minimización de datos:** solo se persisten 2–3 números por sesión; al dashboard llegan agregados diarios o semanales.")
    a("3. **Consentimiento y control:** la sesión la inicia el astronauta; puede omitirla, pausar el módulo o borrar su historial en cualquier momento.")
    a("4. **Transparencia:** indicador visible de cámara activa y pantalla que muestra exactamente qué valores se guardaron.")
    a("5. **Acceso limitado:** los puntajes faciales los ve el propio astronauta; se comparten con el médico de vuelo solo si él lo autoriza o si hay una alerta acordada previamente.")
    a("6. **Propósito único:** los datos se usan solo para el bienestar del astronauta, nunca para evaluar su desempeño ni para decisiones de selección o asignación.")
    a("7. **Cifrado en reposo** de los puntajes y borrado automático según la política de la misión.")
    a("\n**Cómo mejorar la validez**\n")
    a("- Medir **cambios dentro de la misma persona** (tendencia frente a su línea base), no clasificar emociones absolutas.")
    a("- Construir la línea base **en vuelo** (las primeras semanas), porque la cara cambia por el desplazamiento de fluidos.")
    a("- **Triangular** con el cuestionario de ánimo, el sueño, la VFC y el PVT: una alerta solo se activa si coinciden varias señales.")
    a("- Controlar condiciones: misma hora, misma luz, misma posición; descartar sesiones de baja confianza.")
    a("- Revisar sesgos del modelo (tono de piel, género, edad) y reportar la incertidumbre en la interfaz.")
    a("- Validar en análogos (HERA, CHAPEA) o con voluntarios antes de usarlo como indicador fiable.\n")

    a("## 9.8 Cómo usar la matriz en el software\n")
    a("1. **Priorizar el MVP:** implementar primero los indicadores 🔴 y 🟠.")
    a("2. **Frecuencia de recordatorios:** la columna *Frecuencia de medición* define cuándo la app pide cada dato.")
    a("3. **Peso en el panel:** un indicador fuera de rango con puntaje alto sube de nivel la alerta de su sistema.")
    a("4. **Métodos alternativos:** si falla un sensor o el instrumento no viaja en la misión, la app propone la siguiente forma de recolección (incluida la cámara cuando sea viable).")
    (RAIZ / "docs" / "09-matriz-riesgo-indicadores.md").write_text("\n".join(out) + "\n", encoding="utf-8")


if __name__ == "__main__":
    escribir_csv(INDICADORES)
    escribir_md(INDICADORES)
    print(f"{len(INDICADORES)} indicadores -> data/indicadores.csv y docs/09-matriz-riesgo-indicadores.md")
