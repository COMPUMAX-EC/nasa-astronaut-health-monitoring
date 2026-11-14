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
    ("PS-01", "Salud mental", "Estado de ánimo y estrés", "escala", "Condiciones conductuales adversas", 3, 4, "Diaria", ["Cuestionario breve en la app", "Diario personal", "Análisis de voz en el dispositivo (opcional)"], BH),
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
                    "puntaje", "nivel", "frecuencia_medicion", "metodos_recoleccion", "fuente"])
        for (i, s, ind, u, r, p, g, fr, m, src) in filas:
            w.writerow([i, s, ind, u, r, p, g, p * g, nivel(p * g).split(" ", 1)[1], fr, " | ".join(m), src])


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
    a("| ID | Sistema | Indicador (unidad) | Riesgo asociado | P | G | P×G | Nivel | Frecuencia de medición | Formas de recolectarlo | Fuente |")
    a("|---|---|---|---|---|---|---|---|---|---|---|")
    for (i, s, ind, u, r, p, g, fr, m, src) in orden:
        metodos = "<br>".join(f"• {x}" for x in m)
        a(f"| {i} | {s} | {ind} ({u}) | {r} | {p} | {g} | **{p * g}** | {nivel(p * g)} | {fr} | {metodos} | [ver]({src}) |")

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

    a("\n## 9.6 Cómo usar la matriz en el software\n")
    a("1. **Priorizar el MVP:** implementar primero los indicadores 🔴 y 🟠.")
    a("2. **Frecuencia de recordatorios:** la columna *Frecuencia de medición* define cuándo la app pide cada dato.")
    a("3. **Peso en el panel:** un indicador fuera de rango con puntaje alto sube de nivel la alerta de su sistema.")
    a("4. **Métodos alternativos:** si falla un sensor, la app propone la siguiente forma de recolección de la lista.")
    (RAIZ / "docs" / "09-matriz-riesgo-indicadores.md").write_text("\n".join(out) + "\n", encoding="utf-8")


if __name__ == "__main__":
    escribir_csv(INDICADORES)
    escribir_md(INDICADORES)
    print(f"{len(INDICADORES)} indicadores -> data/indicadores.csv y docs/09-matriz-riesgo-indicadores.md")
