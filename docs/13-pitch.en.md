# 13. Pitch: Laica Mission (English)

*Versión en español: [13-pitch.md](13-pitch.md).*

The live pitch in Sangolquí is in Spanish; the platform deliverables must be bilingual. This is the English version of the pitch: 7 slides (the maximum allowed), about 5 minutes.

## Project summary (for the project page)

**Laica Mission** is an offline health‑monitoring app for astronauts on long missions, built for the NASA Space Apps Challenge 2026 *Create Health Monitoring Software for Astronauts on Space Missions*. A corgi astronaut companion, Laica, runs the daily check‑in (voice, keyboard or mouse), turns vital signs into green / yellow / orange / red alerts based on NASA‑STD‑3001 thresholds, explains each body zone on a clickable human figure, and keeps the crew company against isolation, one of NASA’s 5 hazards of human spaceflight. It works without internet, keeps all data on the device, and can even leave the browser and walk across the desktop.

- **Repository:** https://github.com/COMPUMAX-EC/nasa-astronaut-health-monitoring (code MIT, texts CC BY 4.0)
- **Live demo:** [public Vercel link]
- **NASA data and sources:** NASA‑STD‑3001 Vol. 1 and 2, Human Research Program (5 Hazards, Human Research Roadmap), DONKI API (solar energetic particle events and flares), OSDR, NTRS, NASA Twins Study.
- **AI use:** Claude (Anthropic) was used as a coding and writing assistant; the team reviewed all output. [State whether the Canva images of Laica were AI‑generated; if so, they carry a watermark.] No NASA logos are used.

## Slides and script

| # | Slide | Time | Script |
|---|---|---|---|
| 1 | Cover: Laica Mission | 0:00–0:30 | On Mars, a message to Earth takes up to 22 minutes to arrive, and 22 more to come back. If an astronaut’s blood pressure spikes at 3 a.m., who tells them whether it is serious? We are team [name] from Ecuador. This is Laica Mission, and this is Laica. |
| 2 | The problem | 0:30–1:15 | NASA groups spaceflight risks into 5 hazards: radiation, isolation, distance, gravity and a hostile, closed environment. With a 20‑minute delay, the crew cannot wait for ground control: they must notice changes themselves. Users: Artemis and Mars crews, analogs like HERA and CHAPEA, and isolated people on Earth, such as Ecuador’s Antarctic station, the Galápagos and remote rural areas. |
| 3 | The solution | 1:15–2:00 | An offline app with four parts: daily check‑in by voice, keyboard or clicks; a four‑level alert engine that says what to do and when to call the flight surgeon; a clickable body that colors each zone by its worst indicator; and Laica, the companion. Existing tools measure; Laica Mission also keeps you company. |
| 4 | NASA data | 2:00–2:50 | Thresholds come from NASA‑STD‑3001 (for example, the 600 mSv career radiation limit). From the Human Research Roadmap we built a 47‑indicator risk matrix (likelihood × severity, measurement frequency, collection method). NASA’s DONKI API provides solar particle events; our script downloads them, and the demo’s solar storm follows that event type and triggers the radiation alert (live connection is phase 6). Pipeline: official sources → risk matrix → threshold rules → level and action. Crew data are simulated (30 days, fixed seed, reproducible). |
| 5 | Architecture and live demo | 2:50–4:00 | React + Vite PWA with an offline service worker, IndexedDB on the device only, Web Speech API in Spanish with no cloud, our own `<laica-mascota>` web component and an Electron desktop app; 33 automated tests. Demo: Laica greets → say “my pressure is 165 over 105” → red alert → click the heart → day 17 solar storm, go to the shelter → all green, Laica leaves the browser and walks on the taskbar. |
| 6 | Impact and roadmap | 4:00–4:40 | Medical autonomy in space; in Ecuador, support for isolated staff without internet, in Spanish; voice, keyboard or mouse, plain language, respects reduced motion. Next: phrase bank and local memory, live DONKI and camera heart rate, then real sensors and clinical validation of thresholds. Educational tool, not a medical device. |
| 7 | Transparency and team | 4:40–5:00 | AI assistance declared, sources credited, CC0 sounds, only the official Space Apps event logo (no NASA insignia), open source. “On Earth we have someone to call. On Mars, Laica answers first.” |
