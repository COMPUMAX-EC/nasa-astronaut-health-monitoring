# 05 · Sistema de diseño

## Paleta calma (*Calm Palette*)

Alto contraste para la iluminación espacial. **El coral/rojo solo se usa en alertas críticas.**

| Token | Nombre | Hex | Uso | Estado asociado |
|---|---|---|---|---|
| `StatusOptimal` | Verde Mente | `#2D8A56` | Indicadores nominales; Laika relajada | `PERIPHERAL_PASSIVE` |
| `StatusAttention` | Ámbar Calmo | `#D98A2B` | Ligera desviación; Laika curiosa | `MICRO_INTERACTION` |
| `StatusIntervention` | Azul Cobalto | `#1D5C96` | Acción terapéutica requerida | `THERAPEUTIC_INTERVENTION` |
| `StatusCritical` | Coral Espacial | `#C84B31` | Riesgo inmediato o pico ambiental | `CRITICAL_ALERT` |

### Implementación (`ui/theme/`)

- **Sin dynamic color (Material You):** la app usa siempre su propia paleta, no los colores derivados del fondo de pantalla del teléfono. Así los colores de estado nunca chocan con un tema del sistema.
- `Color.kt` define los 4 colores de estado (+ su color de texto `OnStatus*`) y un esquema Material 3 claro y oscuro propio de Laika:
  - `primary` = Azul Cobalto, `secondary` = Verde Mente, `tertiary` = índigo neutro (no es color de estado).
  - `error` = Coral Espacial, coherente con "coral solo para alertas críticas": no usar `colorScheme.error` para validaciones menores.
- Acceso desde composables: `LaikaTheme.status.attention`, `LaikaTheme.status.onAttention`, etc.
- Sobre el ámbar se usa texto oscuro (`OnStatusAttention`), porque el blanco no tiene contraste suficiente.
- Modo claro/oscuro: por ahora sigue la configuración del sistema (`isSystemInDarkTheme()`); el parámetro `darkTheme` de `LaikaPolizonTheme` permite forzarlo.
- `res/values/colors.xml` y `res/values-night/colors.xml` definen el fondo de la ventana antes de que cargue Compose; deben coincidir con `LightBackground` / `DarkBackground`.

> Nota: el Flujo 3 menciona zonas "resaltadas en amarillo" en el mapa corporal; usar `StatusAttention` para mantener la paleta consistente.

## Micro-interacciones (< 4 segundos)

Basado en Ashbrook y Dingler:

- Todo registro rutinario se completa en **< 4 s**: un toque para confirmar, un deslizamiento para el ánimo.
- Evitar formularios multi-campo en rutinas; usar steppers, sliders o confirmaciones de un toque.

## Hápticos

| Contexto | Patrón |
|---|---|
| Interacción táctil directa | Baja frecuencia 40–60 Hz simulando pulsaciones biológicas |
| Contacto afectivo (Flujo 4) | Latido/ronroneo rítmico a **60 bpm** |
| Alerta de radiación (Flujo 2) | Pulsación rítmica suave |

En Android: `VibratorManager` + `VibrationEffect.createWaveform(...)` (API 26+, coincide con `minSdk = 26`). La frecuencia exacta en Hz depende del hardware; aproximar con amplitudes y tiempos.

## Mapa corporal interactivo (2D/3D)

Basado en Gestalt y el modelo de Donald Norman (percepción → cognición → acción).

- **Proximidad:** indicadores agrupados por región (presión arterial y FC cerca del tórax).
- **Interacción directa:** cada región es tocable. Al seleccionar una zona se muestra:
  1. Estado actual y tendencia (24 h / 7 d).
  2. Riesgo asociado según la NASA (ej. ojos → SANS).
  3. Acciones preventivas / tratamientos disponibles en la nave.

Implementado (`domain/bodymap/BodyMap.kt` + `ui/companion/BodyMapView.kt`) con 5 regiones:

| Región | Métricas | Riesgos que la resaltan |
|---|---|---|
| Cabeza y ojos | Nitidez visual, sueño, cortisol | SANS, sueño, psicosocial |
| Tórax | FC, VFC, presión | Cardiovascular, psicosocial |
| Abdomen | Glucosa, temperatura | Metabólico, inmunitario |
| Piernas | Actividad física | Físico, SANS (desplazamiento de fluidos) |
| Entorno de la nave | Neutrones (CANS), CO₂ | Radiación, entorno |

La tendencia compara la última lectura con la media de 7 días (±5 %).

## Avatar de Laika

`ui/avatar/LaikaAvatar.kt`: perrita de diseño original dibujada con Canvas (decisión D9), usada en la app y en el screen pet. Cada emoción cambia orejas, ojos, cejas y boca; en `CURIOUS` inclina la cabeza y en `PROTECTIVE` lleva casco espacial (Flujo 2). Parpadea cada 3–6 s.

## Tono de voz de Laika

- Primera persona del plural cuando comparte estado ("**nos** sentimos genial").
- Primera persona singular para necesidades ("**me** siento deshidratada").
- Nunca alarmista; en crisis, instrucciones directas y cortas.
- Laika usa género gramatical femenino.
