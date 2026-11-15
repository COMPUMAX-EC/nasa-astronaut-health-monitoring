# Modelos locales

`face_landmarker.task` es el modelo de **MediaPipe Face Landmarker** de Google (licencia Apache 2.0). Laica lo usa para ver gestos con la cámara: sonrisa, risa, tristeza, sorpresa, boca abierta y giro de la cabeza.

- Corre dentro del navegador con WebAssembly. La imagen no sale del equipo, no se graba y no se guarda ningún dato.
- La cámara solo se prende si la persona acepta cuando Laica pide permiso, y se apaga sola al cambiar de pestaña.
- `vite.config.js` sirve este archivo y el motor WebAssembly del paquete `@mediapipe/tasks-vision` desde `mediapipe/`, sin CDN, así funciona sin internet.

Para descargarlo (una sola vez): `npm run modelo-cara`.
