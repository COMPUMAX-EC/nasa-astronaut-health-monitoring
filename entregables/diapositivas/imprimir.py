# Arma una versión para imprimir del pitch (7 páginas, cada una en su estado final, sin
# animaciones) en español o en inglés, y la convierte a PDF con Chrome o Edge sin interfaz.
# Uso: python imprimir.py es|en  → ../Presentacion_ES.pdf o ../Presentation_EN.pdf
import json, os, re, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
leer = lambda n: open(os.path.join(AQUI, n), encoding="utf-8").read()
idioma = (sys.argv[1] if len(sys.argv) > 1 else "es").lower()

# Reutiliza los íconos de construir.py (sin ejecutar su parte que escribe index.html).
fuente = leer("construir.py")
exec(fuente[fuente.index("ICONOS = {"):fuente.index("secciones = []")])

EN = [
    ("Una compañera que cuida la salud del astronauta cuando la Tierra está demasiado lejos para contestar.",
     "A companion who looks after the astronaut’s health when Earth is too far away to answer."),
    ("Reto: <b>", "Challenge: <b>"),
    ("Equipo <b>Compumax Evolution</b> · Ecuador", "Team <b>Compumax Evolution</b> · Ecuador"),
    ("Misión Laica</h1>", "Laica Mission</h1>"),
    ("EL PROBLEMA", "THE PROBLEM"),
    ("Lejos de la Tierra, el astronauta es su propio médico de guardia", "Far from Earth, the astronaut is their own on-call doctor"),
    ("Radiación</h3>", "Radiation</h3>"), ("Tormentas solares y dosis acumulada", "Solar storms and cumulative dose"),
    ("Aislamiento</h3>", "Isolation</h3>"), ("Estrés, ánimo y sueño", "Stress, mood and sleep"),
    ("Distancia</h3>", "Distance</h3>"), ("Hasta 22 min de retraso con tierra", "Up to a 22-min delay with Earth"),
    ("Gravedad</h3>", "Gravity</h3>"), ("Hueso, músculo, corazón y ojos", "Bone, muscle, heart and eyes"),
    ("Hábitat</h3>", "Habitat</h3>"), ("Entorno cerrado y hostil", "Closed, hostile environment"),
    ("Los 5 peligros del vuelo espacial humano (NASA Human Research Program). El reto pide software para que el tripulante <b>recopile sus indicadores, entienda su estado y actúe</b>. Usuarios: tripulaciones de Artemis y Marte, análogos como HERA y CHAPEA, y en la Tierra, personal aislado como el de la estación antártica ecuatoriana.",
     "NASA’s 5 hazards of human spaceflight (Human Research Program). The challenge asks for software so the crew member can <b>collect their indicators, understand their status and act</b>. Users: Artemis and Mars crews, analogs such as HERA and CHAPEA, and on Earth, isolated personnel such as Ecuador’s Antarctic station."),
    ("Fuentes: NASA HRP, “5 Hazards” (nasa.gov/hrp/hazards) y “HRP Risks” (nasa.gov/hrp/risks) · NASA OCHMO, TB‑044 y TB‑016",
     "Sources: NASA HRP, “5 Hazards” (nasa.gov/hrp/hazards) and “HRP Risks” (nasa.gov/hrp/risks) · NASA OCHMO, TB‑044 and TB‑016"),
    ("LA SOLUCIÓN", "THE SOLUTION"),
    ("Un monitor de salud offline que te acompaña", "An offline health monitor that keeps you company"),
    ("Por voz, teclado o clics", "By voice, keyboard or clicks"),
    ("Alertas</h3>", "Alerts</h3>"), ("4 niveles y qué hacer", "4 levels and what to do"),
    ("Cuerpo</h3>", "Body</h3>"), ("7 zonas que se colorean", "7 color-coded zones"),
    ("Te explica y te acompaña", "Explains and keeps you company"),
    ("Comparación con CMO‑DA, Astroskin, AMOS y otras: docs/10 del repositorio", "Comparison with CMO‑DA, Astroskin, AMOS and others: docs/10 in the repository"),
    ("DATOS DE LA NASA Y SUSTENTO CIENTÍFICO", "NASA DATA AND SCIENTIFIC BASIS"),
    ("Cada umbral y cada alerta tienen una fuente oficial", "Every threshold and every alert has an official source"),
    ("Fuente oficial</th>", "Official source</th>"), ("Qué tomamos</th>", "What we use</th>"), ("Dónde actúa en la app</th>", "Where it acts in the app</th>"),
    ("NASA‑STD‑3001 Vol. 1 y 2</td>", "NASA‑STD‑3001 Vol. 1 and 2</td>"),
    ("Límites médicos y de hábitat (p. ej. 600 mSv de carrera)", "Medical and habitat limits (e.g. 600 mSv career limit)"),
    ("Umbrales del motor de alertas", "Alert engine thresholds"),
    ("Riesgos y evidencia por sistema", "Risks and evidence by body system"),
    ("Matriz de 47 indicadores</td>", "47-indicator matrix</td>"),
    ("DONKI API (eventos SEP y FLR)", "DONKI API (SEP and FLR events)"),
    ("Partículas solares y fulguraciones", "Solar particles and flares"),
    ("Alerta de radiación: refugio (script hoy, en vivo en fase 6)", "Radiation alert: go to the shelter (script today, live in phase 6)"),
    ("Estudios de fisiología espacial", "Space physiology studies"),
    ("Explicaciones de cada zona", "Explanation of each body zone"),
    (">Fuentes</p>", ">Sources</p>"), (">Matriz de riesgo</p>", ">Risk matrix</p>"),
    (">Reglas con umbrales</p>", ">Threshold rules</p>"), (">Nivel y acción</p>", ">Level and action</p>"),
    ("Enlaces en docs/02 y docs/04 · Datos del tripulante: 30 días simulados con semilla fija", "Links in docs/02 and docs/04 · Crew data: 30 simulated days with a fixed seed"),
    ("ARQUITECTURA Y DEMO (MVP)", "ARCHITECTURE AND DEMO (MVP)"),
    ("Funciona hoy, sin conexión", "It works today, offline"),
    ("Interfaz</h3>", "Interface</h3>"), ("React 18 + Vite, PWA con service worker", "React 18 + Vite, PWA with a service worker"),
    ("Datos y motor</h3>", "Data and engine</h3>"), ("IndexedDB local y motor de reglas", "Local IndexedDB and rule engine"),
    ("Voz</h3>", "Voice</h3>"), ("Web Speech API en español, sin nube", "Web Speech API in Spanish, no cloud"),
    ("Componente web propio + Electron", "Our own web component + Electron"),
    ("Laica saluda y pide el check‑in del día", "Laica greets you and asks for today’s check‑in"),
    ("Digo “mi presión es 165 sobre 105”: alerta roja", "I say “my blood pressure is 165 over 105”: red alert"),
    ("El corazón se pone rojo y Laica explica qué hacer", "The heart turns red and Laica explains what to do"),
    ("Día 17: tormenta solar, Laica guía al refugio", "Day 17: solar storm, Laica guides you to the shelter"),
    ("Todo en verde: Laica sale del navegador y camina por la pantalla", "All green: Laica leaves the browser and walks across the screen"),
    ("Código abierto (MIT) · 40 pruebas automáticas pasan", "Open source (MIT) · 40 automated tests pass"),
    ("IMPACTO, USABILIDAD Y ESCALABILIDAD", "IMPACT, USABILITY AND SCALABILITY"),
    ("De la órbita a la Antártida ecuatoriana", "From orbit to Ecuador’s Antarctic station"),
    ("En el espacio</h3>", "In space</h3>"),
    ("Autonomía médica para Artemis y Marte, y para análogos como HERA y CHAPEA.", "Medical autonomy for Artemis and Mars, and for analogs such as HERA and CHAPEA."),
    ("En Ecuador</h3>", "In Ecuador</h3>"),
    ("Personal aislado: estación antártica, Galápagos, zonas rurales sin médico cerca.", "Isolated personnel: Antarctic station, Galápagos, rural areas far from a doctor."),
    ("Para todos</h3>", "For everyone</h3>"),
    ("Voz, teclado o ratón; lenguaje simple; respeta “reducir movimiento”.", "Voice, keyboard or mouse; plain language; respects “reduce motion”."),
    ("Hoja de ruta</th>", "Roadmap</th>"), ("Qué sigue</th>", "What comes next</th>"),
    ("Fase 4–5</td>", "Phase 4–5</td>"), ("Banco de 150 frases, memoria local, rachas e insignias", "150-phrase bank, local memory, streaks and badges"),
    ("Fase 6</td>", "Phase 6</td>"), ("DONKI en vivo, perfiles de misión, frecuencia cardiaca por cámara", "Live DONKI, mission profiles, camera-based heart rate"),
    ("Después</td>", "Later</td>"), ("Sensores reales y validación de umbrales con médicos", "Real sensors and threshold validation with physicians"),
    ("Aviso: herramienta educativa, no es un dispositivo médico", "Disclaimer: educational tool, not a medical device"),
    ("EVIDENCIA CIENTÍFICA Y TRANSPARENCIA", "SCIENTIFIC EVIDENCE AND TRANSPARENCY"),
    ("Los artículos que sostienen el proyecto", "The papers behind the project"),
    ("Artículo o documento</th>", "Paper or document</th>"), ("Qué respalda</th>", "What it supports</th>"),
    ("Un año en órbita cambia cuerpo y mente", "A year in orbit changes body and mind"),
    ("Autonomía médica de la tripulación", "Crew medical autonomy"),
    ("<i>IA para el riesgo médico</i>", "<i>AI for exploration medical risk</i>"),
    ("Asistentes que apoyan decisiones sin tierra", "Assistants that support decisions without ground"),
    ("<i>AMOS en la ISS</i>", "<i>AMOS on the ISS</i>"),
    ("Guiar paso a paso ya funciona en órbita", "Step-by-step guidance already works in orbit"),
    ("<i>TB‑020 Radiación</i> y <i>TB‑016 Salud conductual</i>", "<i>TB‑020 Radiation</i> and <i>TB‑016 Behavioral Health</i>"),
    ("Límite de 600 mSv y riesgo del aislamiento", "600 mSv limit and the risk of isolation"),
    ("NASA‑STD‑3001 Vol. 1 y 2; Human Research Roadmap", "NASA‑STD‑3001 Vol. 1 and 2; Human Research Roadmap"),
    ("Umbrales y matriz de 47 indicadores", "Thresholds and the 47-indicator matrix"),
    ("<b style=\"color:var(--crema);\">Transparencia:</b> usamos Claude (Anthropic) como asistente de código y redacción, y el equipo revisó todo. Logo de Space Apps solo para identificar el evento. Las imágenes de Laica se generaron con IA y llevan marca de agua. Sonidos CC0. Código MIT.",
     "<b style=\"color:var(--crema);\">Transparency:</b> we used Claude (Anthropic) as a coding and writing assistant, and the team reviewed everything. Space Apps logo only to identify the event. Laica’s images were generated with AI and carry a watermark. CC0 sounds. MIT code."),
]

orden = json.loads(leer("deck.json"))["order"]
css = leer("deck.css")
secciones = []
for id_ in orden:
    s = leer(f"slides/{id_}.html")
    s = re.sub(r"<x-icon([^>]*)></x-icon>", icono, s)
    s = re.sub(r"<aside>.*?</aside>", "", s, flags=re.S)
    secciones.append(f"<div class=\"pag\">{s}</div>")
html_secciones = "\n".join(secciones)
if idioma == "en":
    for a, b in EN:
        if a not in html_secciones:
            raise SystemExit(f"Falta traducir (no se encontró): {a[:60]}")
        html_secciones = html_secciones.replace(a, b)
    css = css.replace("Imágenes de Laica generadas con IA · SI-generated images", "AI-generated images of Laica · SI-generated")

pagina = f"""<!doctype html><html lang="{idioma}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400..700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>{css}
* {{ margin: 0; box-sizing: border-box; }}
img, video, .icono, svg.icono {{ display: block; }}
@page {{ size: 1920px 1080px; margin: 0; }}
html, body {{ margin: 0; padding: 0; background: #07173F; }}
* {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
.pag {{ position: relative; width: 1920px; height: 1080px; overflow: hidden; break-after: page; page-break-after: always; }}
section {{ position: absolute; inset: 0; width: 1920px; height: 1080px; overflow: hidden; }}
/* Cada página en su estado final: las animaciones terminan al instante. */
*, *::before, *::after {{ animation-delay: -60s !important; animation-iteration-count: 1 !important; transition: none !important; }}
.laica-vuelo {{ display: none !important; }}
</style></head><body>
{html_secciones}
</body></html>"""
salida_html = os.path.join(AQUI, f"imprimir-{idioma}.html")
open(salida_html, "w", encoding="utf-8").write(pagina)

nombre = "Presentacion_ES.pdf" if idioma == "es" else "Presentation_EN.pdf"
pdf = os.path.abspath(os.path.join(AQUI, "..", nombre))
navegadores = [r"C:\Program Files\Google\Chrome\Application\chrome.exe", r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"]
nav = next(n for n in navegadores if os.path.exists(n))
subprocess.run([nav, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=8000",
                f"--print-to-pdf={pdf}", "file:///" + salida_html.replace("\\", "/")], check=True, timeout=120)
os.remove(salida_html)
print("PDF listo:", pdf)
