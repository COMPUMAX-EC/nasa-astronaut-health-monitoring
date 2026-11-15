# Formulario de envío Space Apps · Submission form (ready to paste)

Texto listo para copiar campo por campo en el formulario de la plataforma global. Está en inglés porque esa plataforma está en inglés.
Reemplaza lo que está entre `[corchetes]` antes de enviar. **Plazo: domingo 09:00.**

---

## Project Summary

**Project Name**

```
Misión Laica: an offline health companion for astronauts
```

**Summary** (aprox. 190 palabras · menos de 1500 caracteres)

```
Misión Laica is an offline health-monitoring app for astronauts on long missions, where a message to Earth can take up to 22 minutes each way. The crew member logs a daily check-in (voice, keyboard or clicks: "my blood pressure is 120 over 80"). A rule engine compares each value with thresholds taken from NASA-STD-3001 and the Human Research Program evidence, and returns one of four alert levels (green, yellow, orange, red), the action to take and when to escalate to the flight surgeon. A clickable body map colors 7 zones by their worst indicator and explains the risk in plain language. Space-weather events (solar particle events from NASA DONKI) trigger a radiation-shelter alert.

Laica, an animated astronaut dog, is the guide. She explains alerts, changes her tone when things are serious, and keeps the crew company, because isolation is one of NASA's 5 hazards of human spaceflight. She can even leave the app and walk across the desktop.

Everything runs locally as a PWA and an Electron desktop app: no internet, no cloud, and the data never leaves the device. The same tool also serves isolated people on Earth, such as Ecuador's Antarctic station, Galápagos and rural areas.
```

---

## Project Links

**Project Demonstration** (slides, máximo 7, enlace público)

```
[enlace público a las diapositivas: exportar el deck a PDF o PPTX, subirlo a Google Drive o GitHub con "cualquiera con el enlace"]
```

**Project** (enlace público)

```
https://github.com/COMPUMAX-EC/nasa-astronaut-health-monitoring
```

(Si la demo en Vercel ya está pública, puedes poner esa URL aquí y el repositorio en "Project Details".)

---

## Project Information

**Project Details**

```
WHAT IT DOES
Misión Laica helps an astronaut collect their own health indicators, understand their state and act, without waiting for Earth.
1. Daily check-in by voice (Spanish Web Speech API, on-device), keyboard or clicks. Laica repeats what she understood before saving.
2. Rule engine with 4 alert levels. Each rule has a threshold from an official source, an action, and an escalation criterion ("tell the flight surgeon if...").
3. Clickable human body with 7 zones (mind and sleep, eyes, lungs and air, heart, metabolism, muscles and bones, whole body: radiation and infections) colored by the worst indicator, with a plain-language explanation.
4. 30-day timeline with a reproducible simulated crew member (fixed seed). On day 17 a solar storm, modeled on NASA DONKI solar particle events, triggers the radiation-shelter protocol.
5. Laica, the companion: a web component with a real 2D mesh skeleton (WebGL) that moves her tail, ears, paws, mouth and head. She talks, barks, sniffs, celebrates, and can leave the browser in the desktop app to walk on the taskbar.

HOW IT WORKS / TOOLS
React 18 + Vite, installable PWA with a service worker (works offline). IndexedDB for local storage only. Electron for the desktop companion. A custom WebGL rig for the mascot. Python scripts to download DONKI events. 33 automated tests. MIT license.

NASA DATA AND SCIENCE
Thresholds from NASA-STD-3001 Vol. 1 and 2 (e.g. 600 mSv career radiation limit). Risks from the Human Research Roadmap, turned into a matrix of 47 indicators (probability x severity, measurement frequency, collection method). Space weather from DONKI. Supporting literature: NASA Twins Study (Garrett-Bakelman et al., Science 2019), EIMO Concept of Operations, AMOS on the ISS, OCHMO technical briefs TB-020 (radiation) and TB-016 (behavioral health).

BENEFITS AND IMPACT
- Medical autonomy for Artemis and Mars crews, and for analogs such as HERA and CHAPEA.
- Fights isolation with a companion that adapts its tone: jokes when all is green, clear instructions in a red alert.
- Privacy by design: no account, no cloud, no internet.
- Accessible: voice, keyboard or mouse, simple language, respects "reduce motion".
- Useful on Earth: personnel at Ecuador's Pedro Vicente Maldonado Antarctic station, Galápagos and rural communities far from a doctor.

CREATIVITY
Existing tools measure; Misión Laica also accompanies. The mascot is not decoration: she is the interface that explains the data and the alert.

FACTORS WE CONSIDERED
Communication delay, offline operation, data privacy, alert fatigue (4 levels with clear escalation), accessibility, and honesty: crew data is simulated because we have no real sensors, while thresholds and events come from official NASA sources. It is an educational tool, not a medical device.

ROADMAP
Phrase bank and local memory, live DONKI feed, mission profiles, camera-based heart rate, then real sensors and threshold validation with physicians.
```

**Use of Super Intelligence (SI)** (marcar las opciones que aplican)

- ✅ Código (code): Claude (Anthropic) se usó como asistente de programación.
- ✅ Texto (text/writing): Claude ayudó a redactar documentación y el guion del pitch; el equipo revisó todo.
- ❓ Imágenes (images): **solo si** las imágenes de Laica en Canva se generaron con IA. En ese caso deben llevar marca de agua visible "SI-generated" (ver `declaracion-ia.md`).
- ❌ Audio: los sonidos son CC0 de OpenGameArt, no son generados por IA.

Texto para el campo, si hay uno:

```
We used Claude (Anthropic) as a coding and writing assistant: application code, the mascot's animation rig, documentation and the pitch script. Every output was reviewed and tested by the team (33 automated tests). [If applicable: Laica's images were created in Canva with AI image tools and carry a visible "SI-generated" watermark.] No SI was used for audio (CC0 sound effects) or for the data: thresholds and events come from official NASA sources, and no user data is sent to any AI service. The official NASA Space Apps Challenge logo appears on the slides only to identify the event; no NASA insignia (meatball or worm), flags or mission identifiers were used or generated. Full declaration: entregables/declaracion-ia.md in the repository.
```

---

## NASA Data (Link Text → Link Url)

| Link Text | Link Url |
|---|---|
| NASA-STD-3001 Volume 1 (Crew Health) | https://www.nasa.gov/reference/nasa-std-3001v1/ |
| NASA-STD-3001 Volume 2 (Human Factors, Habitability and Environmental Health) | https://www.nasa.gov/reference/nasa-std-3001v2/ |
| Human Research Roadmap: Risks | https://humanresearchroadmap.nasa.gov/risks/ |
| Human Research Roadmap: Evidence | https://humanresearchroadmap.nasa.gov/evidence/ |
| NASA HRP: 5 Hazards of Human Spaceflight | https://www.nasa.gov/hrp/hazards/ |
| DONKI Space Weather Database (CCMC) | https://ccmc.gsfc.nasa.gov/tools/DONKI/ |
| NASA Open APIs (DONKI API) | https://api.nasa.gov/ |
| NASA Open Science Data Repository (OSDR) | https://osdr.nasa.gov/bio/repo/ |
| NASA Twins Study | https://www.nasa.gov/humans-in-space/twins-study/ |
| OCHMO Technical Brief TB-020: Radiation Protection | https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-020-radiation-protection.pdf |
| OCHMO Technical Brief TB-016: Behavioral Health | https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-016-behavioral-health.pdf |
| NTRS: EIMO Concept of Operations (20240001402) | https://ntrs.nasa.gov/citations/20240001402 |
| NTRS: AMOS on the ISS (20240012964) | https://ntrs.nasa.gov/citations/20240012964 |
| NTRS: HRP AI for medical risk (20260001797) | https://ntrs.nasa.gov/citations/20260001797 |
| HERA analog | https://www.nasa.gov/mission/hera/ |
| CHAPEA analog | https://www.nasa.gov/humans-in-space/chapea/ |

## Space Agency Partner & Other Data

| Link Text | Link Url |
|---|---|
| Garrett-Bakelman et al. (2019), The NASA Twins Study, Science | https://doi.org/10.1126/science.aau8650 |
| Dog sound effects (CC0, OpenGameArt) | https://opengameart.org/content/dog-sounds |
| Dog barking mono (CC0, OpenGameArt) | https://opengameart.org/content/dog-barking-mono |
| Dog growl (CC0, OpenGameArt) | https://opengameart.org/content/dog-growl |
| Dog grunt (CC0, OpenGameArt) | https://opengameart.org/content/dog-grunt |
| React (MIT) | https://react.dev/ |
| Vite (MIT) | https://vite.dev/ |
| Electron (MIT) | https://www.electronjs.org/ |
| Web Speech API (browser, on-device) | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API |
| Canva (Laica mascot images) | https://www.canva.com/ |
| Claude by Anthropic (coding and writing assistant) | https://www.anthropic.com/claude |
| Project repository (MIT code, CC BY 4.0 texts) | https://github.com/COMPUMAX-EC/nasa-astronaut-health-monitoring |

---

## Project Submission Verification

Marcar las dos casillas (términos y obra original) **solo después** de comprobar que:

- [ ] Todos los enlaces abren sin iniciar sesión, en una ventana privada.
- [ ] Las diapositivas son 7 como máximo y el enlace es público.
- [ ] La pregunta de las imágenes de Canva está resuelta (marca de agua si se hicieron con IA).
- [ ] Solo aparece el logo oficial de Space Apps (identifica el evento); ninguna insignia, bandera ni identificador de misión de la NASA.
