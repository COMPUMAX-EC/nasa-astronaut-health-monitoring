# Diapositivas animadas del pitch (7)

Copia del deck de Misión Laica con las animaciones de Laica (saltos entre diapositivas, caminata hacia el frente y escena de portada).

## Presentar sin internet

1. Abrir una terminal en esta carpeta y ejecutar `python -m http.server 8765`.
2. Abrir `http://localhost:8765` en Chrome o Edge.
3. Controles: `→`, espacio o clic para avanzar; `←` para volver; `F` para pantalla completa; `N` para mostrar u ocultar las notas del orador.

`index.html` también abre con doble clic, pero algunos navegadores bloquean los videos en archivos locales; el servidor evita ese problema.
Sin internet, el texto usa Arial en lugar de Space Grotesk e Inter.

## Archivos

| Archivo | Qué es |
|---|---|
| `slides/*.html` | Una diapositiva por archivo, con sus notas en `<aside>` |
| `deck.css` | Colores (paleta de Space Apps), tipografía y animaciones de Laica |
| `deck.json` | Orden de las diapositivas |
| `media/` | Clips de Laica (WebM con transparencia y PNG de respaldo) y logo de Space Apps |
| `plantilla.html` + `construir.py` | Generan `index.html`; correr `python construir.py` después de cambiar una diapositiva |

Las animaciones son solo CSS y video; un PDF o PPTX exportado no las incluye.
