# 07 · Arquitectura Android

## Stack actual

| Elemento | Valor |
|---|---|
| Proyecto Gradle | `LaikaPolizon` (módulo único `:app`) |
| Paquete / applicationId | `nasa.space.app.ec.laikapolizon` |
| Lenguaje | Kotlin 2.2.10 |
| UI | Jetpack Compose + Material 3 (BOM `2023.08.00`) |
| AGP | 9.5.0 |
| SDK | `minSdk 26`, `targetSdk 34`, `compileSdk 34` |
| JVM target | 1.8 |
| Catálogo de versiones | `gradle/libs.versions.toml` |

Estado (Fase 1 completa): módulo único `:app` organizado por paquetes, sin multi-módulo Gradle todavía.

```
nasa.space.app.ec.laikapolizon/
├── LaikaApplication.kt   # AppContainer: DI manual, arranca el LaikaEngine
├── MainActivity.kt
├── domain/               # Kotlin puro, sin imports de Android
│   ├── model/            # Schemas (doc 06) + MeasurementRecord
│   ├── baseline/         # Media y σ (Welford)
│   ├── vitality/         # Métrica espejo
│   ├── analysis/         # HealthAnalyzer: críticos, desviaciones T2, rutina
│   ├── statemachine/     # StateMachine (puro) + LaikaBehavior (emoción, acciones)
│   ├── validation/       # Rangos posibles / habituales
│   ├── repository/       # Interfaz MeasurementRepository
│   ├── telemetry/        # Agregación a HealthTelemetryEvent
│   └── engine/           # LaikaEngine: StateFlow<LaikaStatus>
│   ├── voice/            # Números en español, intenciones, diálogo (Fase 2)
│   ├── presence/         # Categorías de apps, estado compartido de presencia (Fase 2)
│   ├── care/             # Eventos de cuidado y puntos (Fase 3)
│   ├── bodymap/          # Regiones del mapa corporal y resúmenes por región (Fase 3)
│   ├── mission/          # Día de misión y revelación progresiva (Fase 4)
│   ├── memory/           # Memoria episódica derivada de los datos (Fase 4)
│   ├── knowledge/        # Contexto social: notas, temas, ConversationPlanner/Coordinator (D20)
│   └── export/           # JSON propio + reporte para el Flight Surgeon (Fase 4)
├── data/
│   ├── local/            # Room: entidad, DAO, base de datos, repositorio
│   └── simulator/        # ScenarioSimulator (5 escenarios deterministas)
├── feature/              # Código Android de los módulos de presencia (Fase 2)
│   ├── common/           # Notificaciones, hápticos, permisos
│   ├── petoverlay/       # Módulo A: overlay + detección de app en primer plano
│   ├── share/            # «Mostrar a Laika»: destino del menú Compartir (D20)
│   └── voice/            # Módulo B: Vosk, TTS, servicio de micrófono
└── ui/                   # Pestañas Laika / Registrar / Historial / Simulador / Módulos
    ├── avatar/           # LaikaAvatar: perrita dibujada con Canvas, 6 emociones (Fase 3)
    └── companion/        # Paneles de los flujos 1–4, mapa corporal, sesiones (Fase 3)
```

Base de datos Room **v3**: tablas `measurements`, `care_events` y `knowledge_notes`. `MIGRATION_1_2` y `MIGRATION_2_3` crean las tablas nuevas sin perder datos; toda versión futura necesita su propia migración. El temporizador de misión se guarda en `SharedPreferences` (`MissionTimerStore`) como hora de inicio, así sobrevive a cerrar la app.

## Módulos Gradle propuestos

La app tiene tres módulos funcionales (screen pet, voz, registro de datos; ver [10-modulos-de-la-app](10-modulos-de-la-app.md)) sobre un núcleo compartido:

```
:app                    # Application, DI, navegación, onboarding de permisos, pantallas de flujos 1–4
:core:domain            # Kotlin puro: modelos (doc 06), máquina de estados, vitalidad, línea base, parser de intenciones
:core:data              # Room, MeasurementRepository, fuentes de telemetría (mock/simulador, wearable)
:core:ui                # Tema (Calm Palette), avatar de Laika y emociones, mapa corporal reutilizable
:feature:healthlog      # Módulo C: registro central (formularios, historial, revisión de dictados)
:feature:petoverlay     # Módulo A: overlay flotante + detección de app en primer plano
:feature:voice          # Módulo B: wake word, STT offline, TTS, servicio de micrófono
```

Dependencias: `feature:*` → `core:ui`, `core:data`, `core:domain`; `core:data` → `core:domain`. Los módulos `feature` **no** dependen entre sí; se comunican a través del `LaikaEngine` y el repositorio. `:core:domain` es un módulo JVM (`kotlin("jvm")`), sin Android.

> Mientras el proyecto siga siendo un único módulo `:app`, replicar esta separación como paquetes (`domain/`, `data/`, `feature/petoverlay/`…) y migrar a módulos Gradle cuando crezca.

### Paquetes de UI dentro de `:app`

```
ui/
├── checkin/        # Flujo 1: chequeo matutino
├── radiation/      # Flujo 2: evento CANS
├── sans/           # Flujo 3: mapa corporal + temporizador thigh cuffs
├── support/        # Flujo 4: contacto afectivo
└── onboarding/     # Permisos: overlay, uso de apps, micrófono, notificaciones
```

## Capas y flujo de datos

```
[Formulario] [Voz] [Sensores/Simulador]
       └───────┼────────┘
               ▼
   MeasurementRepository (Room) ──Flow<HealthTelemetryEvent>──► [LaikaEngine]
                                                                   │ StateMachine + Vitality + Baseline
                                                                   ▼
                                                     StateFlow<LaikaStateEvent>
                                         ┌─────────────────────┼─────────────────────┐
                                         ▼                     ▼                     ▼
                                PetOverlayService        VoiceService         ViewModels + Composables
```

## Servicios y permisos

| Componente | Tipo | Permisos |
|---|---|---|
| `PetOverlayService` | Foreground service `specialUse` | `SYSTEM_ALERT_WINDOW`, `PACKAGE_USAGE_STATS`, `FOREGROUND_SERVICE_SPECIAL_USE` |
| `VoiceService` | Foreground service `microphone` | `RECORD_AUDIO`, `FOREGROUND_SERVICE_MICROPHONE` |
| Ambos | Notificación persistente | `POST_NOTIFICATIONS` (API 33+), `FOREGROUND_SERVICE` |

`SYSTEM_ALERT_WINDOW` y `PACKAGE_USAGE_STATS` son permisos especiales: se conceden desde Ajustes, no con el diálogo normal.

- **Unidireccional:** la UI observa `StateFlow` y emite eventos (`onMeasurementConfirmed`, `onTouchGesture`, `onActionCompleted`).
- **Dominio sin Android:** `domain/` en Kotlin puro → tests rápidos en `app/src/test`.
- **Red cerrada:** nada depende de internet; la app no declara el permiso `INTERNET`. Restricciones y dependencias descartadas en [11-red-cerrada](11-red-cerrada.md).

## Convenciones

- Código e identificadores en **inglés**; textos de UI en **español** dentro de `res/values/strings.xml`.
- Colores de estado siempre vía tokens del tema, nunca hex sueltos en composables.
- Cada transición de estado debe tener un test unitario.
- Dependencias nuevas: agregarlas en `gradle/libs.versions.toml`, no inline.

## Dependencias que probablemente se necesiten

| Necesidad | Librería |
|---|---|
| ViewModel en Compose | `androidx.lifecycle:lifecycle-viewmodel-compose` |
| Navegación entre flujos | `androidx.navigation:navigation-compose` |
| Serialización JSON | `org.jetbrains.kotlinx:kotlinx-serialization-json` |
| Persistencia local | Room o DataStore |
| Corrutinas en tests | `kotlinx-coroutines-test` |
| Lifecycle para overlay | `androidx.lifecycle:lifecycle-service` |
| Voz offline | Vosk (`com.alphacephei:vosk-android`), modelo en `assets/`; wake word según D10 |
| Sensores BLE | APIs `android.bluetooth.le` del sistema (sin SDKs de fabricantes) |

## Comandos

```bash
./gradlew assembleDebug        # compilar
./gradlew test                 # tests unitarios (dominio)
./gradlew connectedAndroidTest # tests instrumentados
```
