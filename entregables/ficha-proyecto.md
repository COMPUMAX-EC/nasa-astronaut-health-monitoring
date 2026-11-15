# Ficha del proyecto · Project Sheet

Texto listo para copiar en la plataforma global de NASA Space Apps y en el formulario de la sede. Todos los campos están completos.

| Campo | Valor |
|---|---|
| **Equipo / Team** | Compumax Evolution |
| **Integrantes y roles / Members** | Melany Irua · Diego Paz · Geovanny Basantes |
| **Sede / Local event** | NASA Space Apps Challenge Sangolquí 2026, Universidad de las Fuerzas Armadas ESPE, Ecuador |
| **Reto / Challenge** | Create Health Monitoring Software for Astronauts on Space Missions |
| **Repositorio / Repository** | https://github.com/COMPUMAX-EC/nasa-astronaut-health-monitoring |
| **Licencia / License** | Código MIT; textos CC BY 4.0 ([LICENSE](../LICENSE)) |
| **Demo pública / Live demo** | https://mision-laica.vercel.app |
| **Presentación / Slides** | https://mision-laica.vercel.app/presentacion/ (7 diapositivas animadas, sin iniciar sesión) |
| **Video (opcional) / Video** | No se presenta (opcional) |
| **Datos NASA / NASA data** | [datos-nasa.md](datos-nasa.md) |
| **Declaración de IA / AI declaration** | [declaracion-ia.md](declaracion-ia.md) |

---

## Español

### Misión Laica

**Resumen (1 línea):** Monitor de salud offline para astronautas, con una compañera, Laica, que acompaña, explica y avisa a tiempo.

**Descripción:**
En una misión a Marte, un mensaje a la Tierra tarda hasta 22 minutos en llegar. El astronauta tiene que darse cuenta solo de que su salud cambia, mientras enfrenta los 5 peligros que define la NASA: radiación, aislamiento, distancia, gravedad alterada y un entorno cerrado y hostil.

**Misión Laica** es una aplicación web progresiva (PWA) que funciona **sin internet** y guarda los datos **solo en el dispositivo**:

- **Check‑in diario** por voz ("mi presión es 120 sobre 80"), teclado o clics.
- **Motor de alertas** en verde, amarillo, naranja y rojo, con umbrales de **NASA‑STD‑3001**. Dice qué hacer y cuándo avisar al médico de vuelo, y cita la fuente de cada alerta.
- **Cuerpo humano clicable** con 7 zonas que se colorean según su peor indicador y explican por qué importan en el espacio.
- **Matriz de 47 indicadores** basada en el Human Research Program, con probabilidad × gravedad.
- **Alerta de radiación** según los eventos de partículas solares de **DONKI** (NASA).
- **Laica**, una perrita astronauta que combate el aislamiento. Cambia de tono según la alerta, ladra, habla y escucha, y hasta puede salir del navegador y caminar por el escritorio (app de escritorio en Electron).
- **Charla con preguntas de salud:** Laica mezcla conversación casual con preguntas de un toque sobre la mente (ánimo, soledad, estrés) y el cuerpo (agua, ejercicio, vista y SANS, espalda, mareo). El ánimo se guarda como indicador.
- **Cámara con permiso:** Laica pide permiso antes de prender la cámara; con MediaPipe, dentro del dispositivo y sin grabar nada, imita los gestos de la cabeza, se ríe cuando la persona se ríe y, si nota tristeza, propone una respiración guiada.

**Por qué importa:** las herramientas existentes miden; Misión Laica además acompaña. Sirve a tripulaciones de Artemis y Marte y a análogos como HERA y CHAPEA. En Ecuador sirve a personal aislado (la estación antártica Pedro Vicente Maldonado, Galápagos, zonas rurales), porque funciona sin conexión y en español.

**Tecnología:** React 18 + Vite (PWA con service worker), IndexedDB, Web Speech API, MediaPipe Face Landmarker (en el dispositivo), Web Component propio con animación WebGL, Electron y Python (scripts para las APIs de NASA). Tiene 40 pruebas automáticas.

**Próximos pasos:** respuestas por voz a las preguntas, memoria local, DONKI en vivo, frecuencia cardiaca por cámara, sensores reales y validación de los umbrales con médicos.

**Aviso:** herramienta educativa; no es un dispositivo médico ni reemplaza al médico de vuelo. No está afiliado ni respaldado por la NASA.

---

## English

### Laica Mission

**One‑line summary:** An offline health monitor for astronauts, with a companion, Laica, who keeps them company, explains their data and warns them in time.

**Description:**
On a mission to Mars, a message to Earth takes up to 22 minutes to arrive. Astronauts must notice changes in their own health by themselves while facing NASA's 5 hazards of human spaceflight: radiation, isolation, distance, altered gravity and a closed, hostile environment.

**Laica Mission** is a progressive web app (PWA) that works **without internet** and keeps all data **on the device**:

- **Daily check‑in** by voice ("my pressure is 120 over 80"), keyboard or clicks.
- **Alert engine** in green, yellow, orange and red, with thresholds from **NASA‑STD‑3001**. It says what to do and when to contact the flight surgeon, and cites the source of every alert.
- **Clickable human body** with 7 zones colored by their worst indicator, each explaining why it matters in space.
- **47‑indicator risk matrix** based on NASA's Human Research Program (likelihood × severity).
- **Radiation alert** based on solar particle events from NASA's **DONKI**.
- **Laica**, an astronaut dog who fights isolation. She changes tone with the alert level, barks, talks and listens, and can even leave the browser and walk across the desktop (Electron desktop app).
- **Small talk with health questions:** Laica mixes casual conversation with one‑tap questions about the mind (mood, loneliness, stress) and the body (hydration, exercise, vision and SANS, back pain, nausea). Mood is saved as an indicator.
- **Camera with consent:** Laica asks before turning on the camera; with MediaPipe, on the device and recording nothing, she mirrors head gestures, laughs when the person laughs and, if she notices sadness, offers a guided breathing exercise.

**Why it matters:** existing tools measure; Laica Mission also keeps you company. It serves Artemis and Mars crews and analogs such as HERA and CHAPEA. In Ecuador it serves isolated personnel (Pedro Vicente Maldonado Antarctic station, Galápagos, rural areas), because it works offline and in Spanish.

**Technology:** React 18 + Vite (PWA with service worker), IndexedDB, Web Speech API, MediaPipe Face Landmarker (on‑device), our own Web Component with WebGL animation, Electron and Python (scripts for NASA APIs). 40 automated tests.

**Next steps:** voice answers to the health questions, local memory, live DONKI, camera‑based heart rate, real sensors and clinical validation of thresholds.

**Disclaimer:** educational tool; not a medical device and not a replacement for a flight surgeon. Not affiliated with or endorsed by NASA.
