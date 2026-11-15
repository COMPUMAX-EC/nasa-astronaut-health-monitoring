# 10 · Módulos de la app

La app se compone de **tres módulos funcionales** que comparten un mismo núcleo (máquina de estados + datos). Laika no vive solo dentro de una pantalla: está presente sobre el resto del sistema, escucha cuando se la llama y centraliza las mediciones.

| Módulo | Qué es | Rol en Calm Technology |
|---|---|---|
| **A. Screen Pet** | Laika flotando sobre cualquier app | Presencia **periférica** permanente |
| **B. Asistente de voz** | Laika escucha su nombre y conversa, como un tripulante más | Transición periferia → centro sin tocar la pantalla |
| **C. Registro central de datos** | Fuente única de mediciones; entrada escrita o por voz | Atención **focal** cuando hay que registrar o revisar |

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Screen pet | Flota sobre otras apps **y** reacciona a la app en primer plano. **No** lee contenido de otras apps (sin `AccessibilityService`) ni notificaciones. |
| Contexto social (D20) | Laika aprende del **tiempo** en redes, videos y cámara (nunca del contenido), de lo que el astronauta le **comparte a propósito** con «Mostrar a Laika» y de sus **respuestas de un toque**. Con eso conversa: pregunta al salir de esas apps, recuerda temas días después y resume el día por voz. |
| Procesamiento de voz | **100 % local / offline** (coherente con la premisa *edge*). Sin servicios en la nube. |
| Modo de escucha | **Wake word + conversación** ("Laika, …"). No hay escucha ambiental continua de conversaciones. |
| Usuarios | **Un astronauta por dispositivo**; interfaz y voz en **español**. `astronaut_id` fijo por instalación. |

---

## A. Screen Pet (mascota flotante)

### Comportamiento

- Laika aparece como un avatar pequeño que **camina, duerme o respira** sobre el borde de la pantalla mientras el astronauta usa otras apps.
- Su animación refleja el estado y la emoción actuales (ver [02](02-maquina-de-estados.md)):

| Estado | Overlay |
|---|---|
| `PERIPHERAL_PASSIVE` | Avatar pequeño, semitransparente, animaciones lentas. Arrastrable. |
| `MICRO_INTERACTION` | Se acerca al centro del borde y muestra un globo corto ("¿Medimos glucosa?"). Un toque para aceptar, deslizar para posponer. |
| `THERAPEUTIC_INTERVENTION` | Globo con propuesta de misión; al tocar abre la pantalla del flujo correspondiente en la app. |
| `CRITICAL_ALERT` | Overlay expandido con color `StatusCritical`, instrucciones directas y botón al protocolo. |

- **Interacciones táctiles** sobre el avatar: toque (saludo), arrastrar (moverla), caricia/long-press (contacto afectivo del Flujo 4, háptico 60 bpm), doble toque (abrir app).

### Reacción a la app en primer plano

Laika sabe qué app está abierta (no su contenido) y adapta su comportamiento:

| Categoría de app | Reacción de ejemplo |
|---|---|
| Ejercicio / ergómetro | Se pone a "correr" junto al astronauta; felicita al terminar. |
| Diario / notas | Se sienta tranquila; puede sugerir escribir cómo se siente. |
| Redes sociales | Al salir (≥ 2 min) pregunta "¿Cómo te dejó?" con respuestas de un toque. Tras 45 min seguidos propone estirar. |
| Videos | Al salir pregunta de qué trataba (divertido, ciencia, música, casa). |
| Cámara | Al salir (≥ 15 s) pregunta qué grabó (la Tierra, la tripulación, casa, ciencia). |
| Procedimientos / tareas críticas | **Se oculta o se minimiza** (modo "no molestar"): no es un *opportune moment*. |
| Otro ocio (juegos, música, galería) | Momento oportuno para micro-interacciones pendientes. |

El mapeo `packageName → categoría` es una tabla configurable. Esta señal alimenta la regla T1 (detección de *opportune moments*).

### Contexto social: conversaciones a partir de lo que usa el astronauta

Lo que más usará la tripulación en sus ratos libres son redes sociales y grabar videos. Laika aprovecha esos momentos para conversar, sin leer la pantalla:

| Fuente | Qué guarda Laika | Qué **no** guarda |
|---|---|---|
| Tiempo en redes, videos y cámara | Nombre de la app y minutos (`APP_SESSION`) | Qué se vio, mensajes, notificaciones |
| «Mostrar a Laika» (menú Compartir de Android) | Texto o título compartido, nombre y duración del video, sitio del enlace, temas por palabras clave | El archivo (no se copia). Los enlaces **no se abren**: la app no tiene internet |
| Respuestas de un toque | Cómo se sintió (bien / normal / mal) o de qué trataba (tema) | Texto libre |

- **Cuándo pregunta** (`ConversationPlanner`, puro y con tests): solo en `PERIPHERAL_PASSIVE`, como mucho una vez cada 15 min y nunca en una app de concentración. La pregunta se retira sola a los 30 s: Laika no insiste. Lo que inicia el astronauta (tocar a Laika, compartir) no tiene esa pausa, salvo en alerta crítica.
- **Recordar:** al tocar a Laika en reposo, trae algo de hace al menos 6 h ("Hace 3 días me contaste de la Tierra. ¿Cómo te sientes hoy?"). No repite el mismo recuerdo seguido ni trae de vuelta un mal rato. Sin recuerdos, pregunta "¿Qué fue lo mejor que viste hoy?".
- **Voz:** "Laika, ¿qué hice hoy?" resume el día ("Hoy: 35 min en redes y usaste la cámara 1 vez. Hablamos de la Tierra.") y "Laika, platiquemos" / "¿qué recuerdas?" trae un recuerdo.
- **Transparencia:** la tarjeta «Lo que Laika sabe de tu día» (pestaña Laika) muestra cada nota con "Olvidar" y "Olvidar todo". Estas notas **no** entran en el reporte del Flight Surgeon.
- Sin LLM (D17): los temas salen de palabras clave (`TopicExtractor`) y las frases de `strings.xml`. Si más adelante se agrega un LLM local, estas notas son su contexto natural (doc 12).

### Implementación Android

- **Overlay:** `WindowManager` con `TYPE_APPLICATION_OVERLAY` dentro de un **foreground service**. Requiere el permiso especial `SYSTEM_ALERT_WINDOW` (el usuario lo concede en `Settings.ACTION_MANAGE_OVERLAY_PERMISSION`).
- **Compose en el overlay:** un `ComposeView` fuera de una Activity necesita que se le asignen manualmente `LifecycleOwner` y `SavedStateRegistryOwner` (usar `LifecycleService` + `setViewTreeLifecycleOwner` / `setViewTreeSavedStateRegistryOwner`).
- **App en primer plano:** `UsageStatsManager.queryEvents(...)` con el permiso especial `PACKAGE_USAGE_STATS` (`Settings.ACTION_USAGE_ACCESS_SETTINGS`). Consultar cada ~2 s solo mientras la pantalla esté encendida.
- **Foreground service (targetSdk 34):** declarar `android:foregroundServiceType` (`specialUse` para el overlay) y el permiso `FOREGROUND_SERVICE_SPECIAL_USE`.
- Onboarding: una pantalla que explique y pida cada permiso especial, con Laika como guía.

---

## B. Asistente de voz (Laika como tripulante)

### Comportamiento

1. **Escucha del wake word** "Laika" de forma continua y local (bajo consumo).
2. Tras detectarlo: señal sutil (háptico + animación de orejas en el overlay) y escucha de la orden.
3. **Reconocimiento de voz offline** → texto.
4. **Intérprete de intenciones** → acción.
5. **Respuesta hablada** (TTS en español) + reflejo visual en el overlay.
6. Mantiene el **contexto de la conversación** durante unos segundos para preguntas de seguimiento sin repetir "Laika".

### Intenciones mínimas

| Intención | Ejemplo | Acción |
|---|---|---|
| `LOG_MEASUREMENT` | "Laika, glucosa ciento diez" | Crear registro en el módulo C (con confirmación) |
| `QUERY_STATUS` | "Laika, ¿cómo estamos hoy?" | Resumen empático de vitalidad |
| `QUERY_METRIC` | "¿Cuánto dormí anoche?" | Leer del módulo C |
| `START_PROTOCOL` | "Empecemos los manguitos" | Abrir Flujo 3 e iniciar temporizador |
| `RADIATION_STATUS` | "¿Cómo está la radiación?" | Lectura CANS actual |
| `SMALL_TALK` | "Buenos días, Laika" | Respuesta de personalidad (revelación progresiva, doc 04) |
| `QUERY_DAY` | "Laika, ¿qué hice hoy?" | Resumen del contexto del día (redes, videos, cámara, temas) |
| `CHAT` | "Laika, platiquemos" | Trae un recuerdo de lo que el astronauta le contó |
| `MUTE` | "Laika, silencio" | Desactiva la escucha hasta reactivarla manualmente |

### Implementación (todo en el dispositivo)

| Etapa | Opciones offline | Notas |
|---|---|---|
| Wake word | Vosk con gramática restringida u openWakeWord (ONNX) | Porcupine descartado: valida su clave por internet (ver [11-red-cerrada](11-red-cerrada.md)). **Decisión abierta D10.** |
| Voz → texto | **Vosk** (modelo español pequeño empaquetado en `assets/`) | Funciona desde API 26. `SpeechRecognizer` de Google descartado por depender de sus servidores. |
| Intención | Reglas + expresiones regulares + parser de números en español ("ciento veinte sobre ochenta" → 120/80) | Determinista y testeable en JVM. Un LLM local queda como mejora futura. |
| Texto → voz | `android.speech.tts.TextToSpeech` con locale `es`, solo voces con `isNetworkConnectionRequired() == false` | La voz española offline debe instalarse antes de entrar a la red cerrada (D14). |

- Corre en un **foreground service** con `foregroundServiceType="microphone"` y permiso `FOREGROUND_SERVICE_MICROPHONE` + `RECORD_AUDIO`. Android exige iniciar este servicio **mientras la app está en primer plano**.
- **Privacidad:** el audio nunca se guarda; solo se procesa en memoria. Indicador visible de micrófono activo en el overlay y botón de silencio.
- En `CRITICAL_ALERT` el asistente sigue escuchando para comandos como "Laika, ya estoy en el módulo blindado".

---

## C. Registro central de datos

### Concepto

**Fuente única de verdad** de todas las mediciones del astronauta. Todos los demás módulos (máquina de estados, vitalidad, overlay, voz) leen de aquí.

### Canales de entrada

| Canal | Ejemplo | Tipo (doc 03) |
|---|---|---|
| Formulario escrito | Teclado numérico de glucosa, presión, temperatura | Activa |
| Voz (módulo B) | "Laika, presión ciento veinte sobre ochenta" | Activa |
| Wearable / sensores | FC, VFC, temperatura, sueño | Pasiva |
| Simulador | Escenarios del demo | — |

### Reglas

1. **Confirmación de dictados por voz:** antes de guardar, Laika repite el valor ("Registré presión 120 sobre 80, ¿correcto?"). El astronauta confirma con voz o con un toque (< 4 s). Un dato clínico mal transcrito no se guarda en silencio.
2. **Validación de rango:** valores fisiológicamente imposibles se rechazan y valores fuera de lo habitual piden confirmación adicional.
3. **Trazabilidad:** cada registro guarda `source` (`MANUAL`, `VOICE`, `SENSOR`, `SIMULATED`), hora y si fue corregido. Las correcciones crean una nueva versión, no sobrescriben.
4. **Exportación:** historial exportable como `HealthTelemetryEvent` (JSON, doc 06) para el *Flight Surgeon*.
5. **Offline:** almacenamiento local (Room). Sin sincronización remota en el demo.

### Modelo adicional (propuesta)

```kotlin
enum class MeasurementSource { MANUAL, VOICE, SENSOR, SIMULATED }

data class MeasurementRecord(
    val id: Long,
    val timestamp: Instant,
    val type: MeasurementType,      // GLUCOSE, BLOOD_PRESSURE, HEART_RATE, HRV, TEMPERATURE, SLEEP, CORTISOL...
    val value: Double,
    val secondaryValue: Double? = null, // diastólica en presión arterial
    val unit: String,
    val source: MeasurementSource,
    val rawTranscript: String? = null,  // texto reconocido si vino por voz
    val supersedesId: Long? = null,     // corrección de un registro previo
)
```

Los `MeasurementRecord` se agregan en `HealthTelemetryEvent` para alimentar el `LaikaEngine`.

### Pantallas

- **Registro rápido:** una tarjeta por tipo de medición, entrada en un toque.
- **Historial:** lista y tendencia 24 h / 7 d por métrica (reutilizable desde el mapa corporal, doc 05).
- **Revisión de dictados:** registros por voz con su transcripción original.

---

## Implementación (Fase 2)

| Pieza | Archivo |
|---|---|
| Overlay (servicio + Compose) | `feature/petoverlay/PetOverlayService.kt`, `PetOverlay.kt` |
| App en primer plano | `feature/petoverlay/ForegroundAppMonitor.kt` + `domain/presence/AppCategorizer.kt` |
| Servicio de voz (Vosk + TTS) | `feature/voice/VoiceService.kt`, `LaikaTts.kt`, `VoskModelInstaller.kt` |
| Números en español, intenciones, diálogo | `domain/voice/` (Kotlin puro, con tests) |
| Textos de respuesta | `feature/voice/VoiceResponses.kt` → `strings.xml` |
| Permisos y activación | pestaña **Módulos** (`ui/modules/ModulesScreen.kt`) |
| Contexto social | `domain/knowledge/` (notas, temas, `ConversationPlanner`, `ConversationCoordinator`), `data/local/KnowledgeStorage.kt`, `feature/share/ShareToLaikaActivity.kt`, `ui/common/ChatTexts.kt`, `ui/companion/KnowledgeSection.kt` |

### Apariencia del screen pet (rediseño)

Inspirado en los ayudantes animados de escritorio: personaje de cuerpo entero, sin marco, que "vive" sobre la pantalla.

- **Sprite:** `res/drawable-nodpi/laika_sprite.png`, recortado del arte de referencia del equipo (`../laika.png`: border collie con traje y casco espacial). Cuerpo entero pero **del tamaño de una cabeza** (64 dp de alto), para tapar lo menos posible.
- **Dentro de la app** Laika flotante se oculta: ahí está el avatar de la cara (`LaikaAvatar`). El servicio oculta la vista entera (`View.GONE`); si el contenido de Compose quedara en 0×0, Android seguiría mostrando el último cuadro pegado al borde.
- **Anclado abajo a la derecha** (`Gravity.BOTTOM|END`), por encima del dock. El globo crece hacia arriba sin mover al personaje. Arrastrable, y no puede salir de la pantalla.
- **Poco espacio:** el globo de estado se abre al cambiar de estado y **se pliega solo a los 10 s**, dejando un "!" del color de estado sobre la cabeza (tocar a Laika lo vuelve a abrir). En alerta crítica el globo no se pliega y tiene borde coral.
- **Animaciones de reposo:** respiración, mirar a los lados cada 5–10 s, sombra en el "suelo", entrada con rebote. Cuando hay algo pendiente salta dos veces y repite cada 12 s; en alerta crítica además tiembla. Durante el ejercicio, corre.
- **Emoción sin cambiar el arte:** efectos de historieta junto a la cabeza (♥ alegre, ? curiosa, zZ cansada, ! preocupada o protectora) y un halo del color de estado.
- **Voz:** las luces azules del casco laten mientras Laika escucha y brillan más cuando espera una orden.
- **Globo:** amarillo pálido con colita que apunta a Laika. Muestra el mensaje y la primera acción, con los enlaces "Abrir" y "Después". Para conversar muestra la pregunta con respuestas de un toque y una ✕. Prioridad: alerta crítica > frase de Laika > pregunta de contexto > aviso de estado.

Detalles de comportamiento:

- **Gestos del avatar:** toque = conversar (en reposo), abrir el globo o la app (si hay algo pendiente), o cerrar la pregunta abierta; doble toque = abrir app; mantener presionado = contacto afectivo (latido háptico a 60 bpm); arrastrar = moverla. El globo tiene "Después" para posponer, excepto en alerta crítica.
- **App de concentración (FOCUSED):** Laika se oculta y el motor deja de considerar el momento como oportuno (`LaikaEngine.setFocusedAppActive`). La alerta crítica se muestra igual.
- **Wake word:** sin "Laika" y fuera de la ventana de conversación (10 s), lo que se escucha se ignora. La ventana se renueva tras cada respuesta.
- **Dictado:** Laika repite el valor y espera "sí"/"no" (o un nuevo dictado). Los valores imposibles se rechazan sin preguntar; los inusuales se avisan en la confirmación.
- **Mientras Laika habla** se pausa el reconocimiento, para no transcribirse a sí misma.
- **"Laika, silencio"** apaga el servicio de voz; se reactiva solo desde la pestaña Módulos.
- **Modelo Vosk:** `vosk-model-small-es-0.42`, descargado al compilar por la tarea Gradle `:app:downloadVoskModel` a `app/src/main/assets/vosk-model-es/` (ignorado por git) y copiado al almacenamiento interno en el primer arranque. El APK de debug pesa ~86 MB.

## Cómo se conectan

```
            ┌───────────────────────────── :app (Application, DI, navegación, onboarding de permisos)
            │
 [B] VoiceService ──intenciones──►┐
 [A] PetOverlayService ◄──estado──┤
            │  toques/gestos ────►│        ┌──────────────────────┐
 [C] Pantallas de registro ──────►├──────► │ LaikaEngine (domain) │──► StateFlow<LaikaStateEvent>
                                  │        └──────────┬───────────┘
                                  ▼                   │
                     MeasurementRepository (Room) ◄───┘
```

- Los tres módulos corren en el **mismo proceso**; `LaikaEngine` y `MeasurementRepository` son instancias únicas a nivel de `Application`.
- El overlay y el servicio de voz **observan** `StateFlow<LaikaStateEvent>`; nunca deciden el estado por su cuenta.
- La estructura de módulos Gradle está en [07-arquitectura-android](07-arquitectura-android.md).
