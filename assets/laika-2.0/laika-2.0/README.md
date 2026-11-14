# Laika 2.0

<img src="laika2.svg" alt="Laika 2.0" width="200">

Mascota en caricatura inspirada en Laika, la primera perra en orbitar la Tierra (1957). Es un dibujo propio en SVG, animado con CSS, sin dependencias.

Es un archivo extra: la mascota de la app sigue siendo [Laica](../laica/) (`<laica-mascota>`). Laika 2.0 usa otra etiqueta, `<laika-mascota>`, así que las dos pueden convivir en la misma página.

## Archivos

| Archivo | Qué es |
|---|---|
| [`laika2.js`](laika2.js) | Componente web `<laika-mascota>` con todos los gestos (fuente principal) |
| [`laika2.svg`](laika2.svg) | SVG estático con la animación de reposo, generado desde `laika2.js` |
| [`demo.html`](demo.html) | Página de demostración con un botón por gesto |

## Gestos

| Estado | Animación | Duración | Cuándo usarlo |
|---|---|---|---|
| `reposo` | Respira, parpadea, mueve la cola y sigue al cursor con la mirada | continuo | Sin novedades |
| `saludar` | Levanta la pata y la agita | 2,2 s | Abrir la app, dar la bienvenida |
| `saltar` | Un salto con rebote | 0,9 s | Llamar la atención, acierto rápido |
| `celebrar` | Tres saltos, ojos felices y estrellas | 2,4 s | Meta cumplida, nivel superado |
| `triste` | Baja la cabeza y las orejas, cae una lágrima | 3,6 s | Error, intento fallido |
| `ladrar` | Tres ladridos con el globo "¡Guau!" | 1,2 s | Aviso o notificación |
| `ladear` | Inclina la cabeza con un signo de pregunta | 2 s | Duda, falta un dato |
| `cola` | Mueve la cola rápido y se menea | 2 s | Alegría, caricia |

Al terminar un gesto, Laika vuelve sola a `reposo`.

## Uso

```html
<script src="assets/laika-2.0/laika2.js"></script>

<laika-mascota estado="saludar" tamano="240"></laika-mascota>

<script>
  const laika = document.querySelector("laika-mascota");
  laika.estado = "celebrar";        // lanza el gesto y vuelve a reposo
  laika.accion("triste", 6000);     // lo mantiene 6 s
  laika.accion("cola", 0);          // se queda en ese estado hasta que lo cambies
  laika.addEventListener("laika-estado", e => console.log(e.detail.estado));
</script>
```

En React (como en `app/`):

```jsx
import "../../assets/laika-2.0/laika2.js"; // registra <laika-mascota>

<laika-mascota estado={estado} tamano="200" />
```

`window.LAIKA_ESTADOS` contiene la lista de estados válidos.

## Ver la demo en local

```bash
python -m http.server 8766 --directory assets/laika-2.0
```

Luego abre `http://localhost:8766/demo.html`.

## Accesibilidad

- El SVG tiene `aria-label` para lectores de pantalla.
- Respeta `prefers-reduced-motion`: con esa preferencia activa se detienen las animaciones de reposo.
