# 11. Laica, la mascota de la app

<img src="../assets/laica/laica.svg" alt="Laica" width="200">

**Laica** es una perra corgi astronauta que acompaña a la tripulación en la app. Su nombre recuerda a Laika, la primera perra en orbitar la Tierra (1957).

Laica no es solo decoración: **cambia de estado según la salud del astronauta**. Así una alerta se entiende de un vistazo y la app se siente menos fría, algo útil para la salud mental en aislamiento.

## 11.1 Archivos

| Archivo | Qué es |
|---|---|
| [`assets/laica/laica.js`](../assets/laica/laica.js) | Componente web `<laica-mascota>` con todas las acciones (fuente principal; sin dependencias) |
| [`assets/laica/laica.svg`](../assets/laica/laica.svg) | SVG estático con la animación de reposo, generado desde `laica.js` |
| [`assets/laica/demo.html`](../assets/laica/demo.html) | Página de demostración con un botón por acción |
| [`assets/laica/laica-original.png`](../assets/laica/laica-original.png) | Imagen de referencia original del personaje |

El SVG está dibujado **por capas** (orejas, ojos, boca, brazos, piernas, cola, casco, luz del pecho, halo), así que cada parte se anima por separado.

## 11.2 Acciones y cuándo usarlas

| Estado | Animación | Evento de la app | Color de la luz del pecho |
|---|---|---|---|
| `reposo` | Flota, parpadea, mueve la cola y las orejas | Sin novedades | Azul |
| `saludar` | Saluda con la pata e inclina la cabeza | Abrir la app, buenos días | Azul |
| `hablar` | Abre y cierra la boca, gesticula | Explicar una alerta o dar un consejo | Azul |
| `celebrar` | Salta y da una vuelta, con estrellas | Meta cumplida, racha de check‑ins | Verde |
| `ejercicio` | Rebota y "levanta pesas" | Sesión de ejercicio en curso | Verde |
| `respirar` | Se expande y contrae (respiración en caja 4‑4‑4‑4), ojos cerrados | Estrés alto: respiración guiada (ver [data/salud](../data/salud/)) | Celeste |
| `dormir` | Ojos cerrados, Zzz, flota lento | Hora de dormir, modo nocturno | Azul oscuro |
| `alerta` | Cara preocupada, halo ámbar pulsante, señala | Alerta amarilla 🟡 | Ámbar |
| `urgente` | Tiembla, suda, brazos arriba, halo rojo rápido | Alerta roja 🔴 | Rojo |
| `radiacion` | Se encoge, símbolo de radiación girando, halo violeta | Evento de partículas solares (DONKI): ir al refugio | Violeta |

Relación con la [matriz de riesgo](09-matriz-riesgo-indicadores.md): el nivel más alto activo en el panel decide el estado de Laica (🔴 → `urgente`, 🟠/🟡 → `alerta`, RA‑02 activo → `radiacion`).

## 11.3 Uso

```html
<script src="assets/laica/laica.js"></script>

<laica-mascota estado="saludar" tamano="240"></laica-mascota>

<script>
  const laica = document.querySelector("laica-mascota");
  laica.estado = "alerta";          // cambia de estado
  laica.accion("celebrar", 3000);   // celebra 3 s y vuelve a reposo
  laica.addEventListener("laica-estado", e => console.log(e.detail.estado));
</script>
```

En React funciona igual: `<laica-mascota estado={estado} tamano="200" />`.

**Ver la demo en local:**

```bash
python -m http.server 8765 --directory assets/laica
```

Luego abre `http://localhost:8765/demo.html`.

## 11.4 Accesibilidad

- Tiene `aria-label` para lectores de pantalla.
- Respeta `prefers-reduced-motion`: si el usuario pide menos movimiento, Laica se queda quieta y el estado se ve solo por color y expresión.
- Los colores de alerta siempre van acompañados de texto en la burbuja; el color nunca es la única señal.

## 11.5 Derechos de la imagen original

`laica-original.png` es la imagen de referencia aportada por el equipo. Si proviene de un banco de imágenes (por ejemplo Freepik), revisen su licencia: las licencias gratuitas suelen exigir **atribución** y no permiten redistribuir el archivo tal cual en un repositorio público. En ese caso, añadan el crédito aquí o retiren el PNG del repo. La versión SVG animada (`laica.svg` / `laica.js`) es un dibujo propio del proyecto.
