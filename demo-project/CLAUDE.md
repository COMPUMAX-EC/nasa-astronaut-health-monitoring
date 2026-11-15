# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Laika Polizón** — NASA Space Apps demo. Android app where "Laika", a companion character, mirrors an astronaut's health (sleep, HRV, activity, cortisol, radiation) and guides interventions using Calm Technology principles. The full product spec lives in `docs/` (Spanish); start with `docs/README.md`. The original source spec is `../laika-interaction-flow-docs.md`.

Roadmap Phase 1 (core) is done; progress and open decisions are tracked in `docs/09-roadmap-y-decisiones-abiertas.md`. Update that table when deciding something.

## Commands

Windows: use `gradlew.bat` (or `./gradlew` from Git Bash).

```bash
./gradlew assembleDebug                      # build debug APK
./gradlew installDebug                       # install on connected device/emulator
./gradlew test                               # JVM unit tests (app/src/test)
./gradlew connectedAndroidTest               # instrumented tests (needs device)
./gradlew lint                               # Android lint
./gradlew :app:testDebugUnitTest --tests "nasa.space.app.ec.laikapolizon.domain.StateMachineTest"   # single class
./gradlew :app:testDebugUnitTest --tests "*StateMachineTest.critical*"                               # tests matching a pattern
```

Test names use backticks with spaces, so filter with wildcards rather than exact method names. `ScenarioSimulatorTest` checks that each demo scenario triggers exactly what it promises; if you touch analyzer thresholds or simulator values, run it.

`minSdk` is 26 and the emulator is API 34, so API-level crashes don't show up there: run `./gradlew lintDebug` (NewApi). Use `instant.atZone(zone).toLocalDate()`, not `LocalDate.ofInstant` (API 34).

Room needs KSP; Room 2.6.x fails under KSP2 with "unexpected jvm signature V", so keep Room ≥ 2.7.

`preBuild` depends on `:app:downloadVoskModel`, which downloads the ~40 MB Spanish Vosk model into `app/src/main/assets/vosk-model-es/` (git-ignored) only if it's missing. The first build on a fresh checkout needs internet. Inside `build.gradle.kts`, `java.*` resolves to Gradle's `java` extension, so use imports (`import java.net.URI`) instead of fully qualified names.

Emulator testing of presence modules: grant the special permissions with `adb shell appops set nasa.space.app.ec.laikapolizon SYSTEM_ALERT_WINDOW allow` (and `GET_USAGE_STATS allow`, `pm grant ... android.permission.RECORD_AUDIO`), then toggle the services from the "Módulos" tab. `adb logcat -s LaikaPet LaikaVoice` shows foreground-app categorization and voice errors. Real speech can't be tested on the emulator.

## Stack

Single module `:app`, package `nasa.space.app.ec.laikapolizon`. Kotlin 2.2.10, AGP 9.5.0, Jetpack Compose + Material 3 (BOM 2023.08.00), `minSdk 26` / `targetSdk 34`, JVM target 1.8. All dependency and plugin versions go through `gradle/libs.versions.toml`. `gradle.properties` sets `android.builtInKotlin=false` and `android.newDsl=false` (legacy DSL with the explicit Kotlin Android plugin) — keep that in mind if AGP 9 build errors appear.

## Architecture

The whole app is driven by a **deterministic 4-state machine** (`docs/02-maquina-de-estados.md`):
`PERIPHERAL_PASSIVE` → `MICRO_INTERACTION` → `THERAPEUTIC_INTERVENTION` → `CRITICAL_ALERT` (priority in reverse order). Laika's emotion and prescribed actions are derived from the state in `domain/statemachine/LaikaBehavior.kt`, never decided in UI code.

Data flow (all wired in `LaikaApplication.AppContainer`, manual DI):
`MeasurementRepository` (Room, every input source writes here) → `LaikaEngine` → `StateFlow<LaikaStatus>` → ViewModels (`ui/ViewModels.kt`) → Compose tabs.
Inside `LaikaEngine.evaluate()`: `HealthAnalyzer.assess()` (critical thresholds, T2 deviations via `MetricBaseline`, routine due, vitality) → `StateMachine.next()` (pure) → `LaikaBehavior`. The engine is the only place state changes. It also holds per-hazard snoozes after a completed intervention (alarm-fatigue control; critical findings are never snoozed). `domain/` must stay pure Kotlin (no Android imports) so all of this is JVM-testable; `FakeMeasurementRepository` in `LaikaEngineTest.kt` is the in-memory repo for tests.

Measurements live as `MeasurementRecord` (one row per reading, BP uses `value`=systolic/`secondaryValue`=diastolic). Always read through `List<MeasurementRecord>.effective()`, which drops records replaced by a correction (`supersedesId`). `HealthTelemetryEvent` (the doc 06 schema) is only an export view built by `TelemetryAggregator`. Analyzer thresholds are demo values in `AnalyzerConfig`, not clinically validated.

No hardware: `data/simulator/ScenarioSimulator` generates deterministic (seeded) 10-day histories for 5 scenarios and replaces only `SIMULATED` records. Its recent "nominal" values use a fixed non-monotonic pattern on purpose, so they don't trip the 1.5σ or trend rules. `endRadiationEvent()` appends normal CANS readings to demo the end of Flow 2.

Care points / Flight Surgeon log (Phase 3): `LaikaEngine.recordCare()` writes a `CareEvent` to `CareRepository` based on state transitions (check-in done today flips false→true, THERAPEUTIC/CRITICAL → PASSIVE via `completeCurrentAction`). Never award points from UI code, so screen, voice and overlay completions count the same. Room is at schema **v3** (`measurements` + `care_events` + `knowledge_notes`) with `MIGRATION_1_2` and `MIGRATION_2_3`; any schema change needs a new version and migration, not destructive fallback. `FakeCareRepository` lives in `CareAndBodyMapTest.kt`.

Phase 4 (long-term engagement): `MissionProfileStore` (SharedPreferences) holds the astronaut UUID, the mission start (first launch by default; the Simulator can move it) and the seen disclosures. `Disclosure` (domain/mission) unlocks stories by mission day, with text in `strings.xml`. `EpisodicMemory` (domain/memory) is **derived from records and care events on every read, never persisted**, so it can't remember something the log no longer supports. `FlightSurgeonReport` exports all measurements, including superseded ones, using the doc 06 snake_case names. It's written with the in-house `domain/export/Json` because `org.json` doesn't work in JVM unit tests. The export goes through SAF (`CreateDocument`), local only. The local LLM and the voice/face affect analysis were deliberately postponed: see `docs/12-investigacion-futura.md` before starting either (key rule: an LLM must never emit `VoiceEffect`s).

The Laika tab (`ui/companion/CompanionScreen.kt`) picks the flow panel from the engine state: check-in (Flow 1), radiation (Flow 2), mission actions + body map + timed session (Flow 3), affective-touch session (Flow 4). CRITICAL always wins over an open session. The 45-min timer persists its start time in `MissionTimerStore` (SharedPreferences) so it survives process death. The avatar (`ui/avatar/LaikaAvatar.kt`) is an original Canvas drawing; reuse it rather than adding image assets.

Three functional modules sit on that core (`docs/10-modulos-de-la-app.md`), all implemented (Phases 1–3). Still a single `:app` module organized by packages; the planned Gradle split is `:core:{domain,data,ui}` + `:feature:{healthlog,petoverlay,voice}` (`docs/07-arquitectura-android.md`):
- **Screen pet** (`feature/petoverlay/`) — desktop-assistant style: full-body sprite `res/drawable-nodpi/laika_sprite.png` (the team's reference art, cropped), full body but head-sized (64 dp), with emotion shown via animated comic glyphs and a state-color halo rather than by changing the art. The window uses `Gravity.BOTTOM|END`, so `params.x/y` are offsets from the bottom-right and `moveBy` subtracts the finger delta; the balloon grows upward and auto-collapses to a "!" badge after 10 s unless the state is critical. Keep the footprint small. Inside the app the overlay is hidden (the in-app avatar is the head-only `LaikaAvatar`); hiding (in-app or FOCUSED app) is done by the service setting the `ComposeView` to `View.GONE`, never by emitting an empty composition: a 0×0 window keeps showing its last frame stuck to the screen edge. `PetOverlayService` is a `LifecycleService` + `SavedStateRegistryOwner` hosting a `ComposeView` as `TYPE_APPLICATION_OVERLAY`; it must call `LaikaPolizonTheme(applyToWindow = false)` because there's no Activity. Dragging uses raw `MotionEvent` coordinates via `pointerInteropFilter`, because Compose drag deltas break when the window moves under the finger. `ForegroundAppMonitor` polls `UsageStatsManager` and calls `engine.setFocusedAppActive()`. A FOCUSED app hides Laika and blocks non-critical interruptions.
- **Voice assistant** (`feature/voice/` + pure logic in `domain/voice/`) — one continuous Vosk recognizer; the wake word is detected in the transcript (`IntentParser.afterWakeWord`), not by a separate engine. `VoiceDialogue` (pure) owns the wake/conversation window and confirmation flow and returns `VoiceReply` + `VoiceEffect`s; `VoiceService` applies effects and maps replies to `strings.xml` via `VoiceResponses`. Recognition is paused while TTS speaks. "Laika, silencio" stops the service entirely.
- **Central health log** — Room-backed single source of truth for measurements entered by form, voice (`source = VOICE`, `rawTranscript` kept), sensors or simulator. Voice-dictated values must be read back and confirmed before saving; corrections create new records (`supersedesId`), never overwrite.
Social context (D20, `domain/knowledge/`): Laika learns from time spent in SOCIAL/VIDEO/CAMERA apps (app name + duration only), from what the astronaut explicitly shares via the "Mostrar a Laika" share target (`feature/share/ShareToLaikaActivity`, `taskAffinity=""` so finishing returns to the sharing app; links are never opened, files never copied), and from one-tap answers in the overlay balloon. `ConversationPlanner` (pure) decides when Laika asks: only in `PERIPHERAL_PASSIVE`, at most once per 15 min, questions expire after 30 s. `ConversationCoordinator` (in `AppContainer`) tracks sessions and publishes `PresenceState.conversation` / `chatMessage`; texts come from `ui/common/ChatTexts.kt`. Never read other apps' screen content (no `AccessibilityService`). Knowledge notes are user-deletable and excluded from the Flight Surgeon export. Voice adds "¿qué hice hoy?" (day summary) and "platiquemos" (recall). `FakeKnowledgeRepository` and `MutableClock` live in `KnowledgeTest.kt`.

Services share state with the UI through `PresenceState` (in `AppContainer`). Overlay and voice only observe `LaikaEngine.status` and call its public methods; they never decide state themselves. One astronaut per device, Spanish only.

Key rules that span multiple docs:
- Transition to intervention: 3 consecutive worsening readings **or** deviation > 1.5σ from the individual baseline (only in the metric's "bad" direction, see `Polarity`). How the ambiguous spec rules were interpreted is listed in `docs/02-maquina-de-estados.md`.
- Vitality weights are provisional (`VitalityCalculator`, `docs/04`); missing inputs are dropped and weights renormalized.
- Data models must match the JSON schemas in `docs/06-modelos-de-datos.md` (snake_case on the wire, camelCase Kotlin).
- **Closed network, no internet at runtime** (`docs/11-red-cerrada.md`). Development and builds may use internet freely (Gradle downloads, fetching models to bundle); the restriction is on the installed APK: never add the `INTERNET` permission, Firebase, Play Services, analytics, or any SDK that phones home (Picovoice Porcupine and Google `SpeechRecognizer` are explicitly rejected). Bundle models (Vosk Spanish) in `assets/`; select only TTS voices with `isNetworkConnectionRequired() == false`; sensors via direct BLE. Cloud backup must be disabled.

## UI constraints

- Status colors (Calm Palette): optimal `#2D8A56`, attention `#D98A2B`, intervention `#1D5C96`, critical `#C84B31`. Coral/red is reserved for `CRITICAL_ALERT` only (it is also `colorScheme.error`, so don't use `error` for minor validation). Access via `LaikaTheme.status.*` — never hardcode hex in composables.
- The theme never uses dynamic color (Material You); the app owns its light/dark schemes in `ui/theme/Color.kt`. Don't reintroduce `dynamicLightColorScheme`/`dynamicDarkColorScheme`. Keep `res/values{,-night}/colors.xml` window background in sync with `LightBackground`/`DarkBackground`.
- Routine interactions must complete in < 4 seconds (one tap / one swipe).
- Haptics: 40–60 Hz-style soft pulses; affective-touch flow uses a 60 bpm heartbeat pattern.
- A string with a literal `%` and no format args needs `formatted="false"`; otherwise `stringResource()` without args shows `%%` verbatim.
- Identifiers in English; user-facing text in Spanish via `res/values/strings.xml`. Laika speaks in first person, feminine grammatical gender, never alarmist.
