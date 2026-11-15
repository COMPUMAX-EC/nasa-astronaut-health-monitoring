# 06 · Modelos de datos

Estructuras estándar para interoperar con la aviónica y los sensores médicos.

## `HealthTelemetryEvent` — ingesta de telemetría

```json
{
  "title": "HealthTelemetryEvent",
  "type": "object",
  "properties": {
    "timestamp": { "type": "string", "format": "date-time" },
    "astronaut_id": { "type": "string" },
    "vital_signs": {
      "type": "object",
      "properties": {
        "heart_rate_bpm": { "type": "number" },
        "hrv_ms": { "type": "number" },
        "blood_pressure": {
          "type": "object",
          "properties": {
            "systolic": { "type": "number" },
            "diastolic": { "type": "number" }
          }
        },
        "blood_glucose_mg_dl": { "type": "number" },
        "body_temp_celsius": { "type": "number" },
        "sleep_duration_hours": { "type": "number" }
      }
    },
    "environmental_hazards": {
      "type": "object",
      "properties": {
        "cans_neutron_dose_uSv_h": { "type": "number" },
        "ambient_co2_percentage": { "type": "number" }
      }
    }
  }
}
```

## `LaikaStateEvent` — estado del acompañante

```json
{
  "title": "LaikaStateEvent",
  "type": "object",
  "properties": {
    "timestamp": { "type": "string", "format": "date-time" },
    "current_system_state": {
      "type": "string",
      "enum": ["PERIPHERAL_PASSIVE", "MICRO_INTERACTION", "THERAPEUTIC_INTERVENTION", "CRITICAL_ALERT"]
    },
    "laika_vitality_score": { "type": "number" },
    "active_emotion_display": {
      "type": "string",
      "enum": ["JOYFUL", "CALM", "CURIOUS", "TIRED", "CONCERNED", "PROTECTIVE"]
    },
    "prescribed_actions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "action_id": { "type": "string" },
          "target_hazard": { "type": "string" },
          "description": { "type": "string" },
          "estimated_duration_min": { "type": "integer" }
        }
      }
    }
  }
}
```

## Equivalente en Kotlin

Implementado en `app/src/main/java/nasa/space/app/ec/laikapolizon/domain/model/`.

> **Métricas fuera del schema:** la fórmula de vitalidad y los flujos necesitan datos que `HealthTelemetryEvent` no incluye: actividad física, cortisol, nitidez visual (SANS). Se registran como `MeasurementRecord` (`ACTIVITY_MINUTES`, `CORTISOL`, `VISION_CLARITY`) y no aparecen en la exportación JSON hasta que el schema se amplíe.
Todos los campos son opcionales en el schema → nullable en Kotlin (un sensor puede no reportar).

```kotlin
data class HealthTelemetryEvent(
    val timestamp: Instant,
    val astronautId: String,
    val vitalSigns: VitalSigns? = null,
    val environmentalHazards: EnvironmentalHazards? = null,
)

data class VitalSigns(
    val heartRateBpm: Double? = null,
    val hrvMs: Double? = null,
    val bloodPressure: BloodPressure? = null,
    val bloodGlucoseMgDl: Double? = null,
    val bodyTempCelsius: Double? = null,
    val sleepDurationHours: Double? = null,
)

data class BloodPressure(val systolic: Double, val diastolic: Double)

data class EnvironmentalHazards(
    val cansNeutronDoseUSvH: Double? = null,
    val ambientCo2Percentage: Double? = null,
)

enum class SystemState { PERIPHERAL_PASSIVE, MICRO_INTERACTION, THERAPEUTIC_INTERVENTION, CRITICAL_ALERT }

enum class Emotion { JOYFUL, CALM, CURIOUS, TIRED, CONCERNED, PROTECTIVE }

data class PrescribedAction(
    val actionId: String,
    val targetHazard: String,       // ej. "SANS", "RADIATION", "ISOLATION"
    val description: String,
    val estimatedDurationMin: Int,
)

data class LaikaStateEvent(
    val timestamp: Instant,
    val currentSystemState: SystemState,
    val laikaVitalityScore: Double,
    val activeEmotionDisplay: Emotion,
    val prescribedActions: List<PrescribedAction> = emptyList(),
)
```

> `java.time.Instant` está disponible desde API 26 (`minSdk = 26`), así que no hace falta desugaring.
> Si se serializa a JSON, usar `kotlinx.serialization` con `@SerialName("snake_case")` para respetar los nombres del schema.

## Reporte para el Flight Surgeon (Fase 4)

`domain/export/FlightSurgeonReport.kt` genera un JSON local (pestaña Historial → "Exportar para el Flight Surgeon"; el astronauta elige dónde guardarlo y nada sale por la red):

```json
{
  "report_version": 1,
  "generated_at": "2026-11-15T05:07:00Z",
  "astronaut_id": "uuid generado en el primer arranque",
  "mission_day": 365,
  "current_state": { "...": "LaikaStateEvent según su schema" },
  "latest_telemetry": { "...": "HealthTelemetryEvent según su schema (sin campos vacíos)" },
  "measurements": [
    { "id": 1, "timestamp": "...", "type": "GLUCOSE", "value": 300.0, "unit": "mg/dL",
      "source": "VOICE", "raw_transcript": "glucosa trescientos", "superseded": true },
    { "id": 2, "type": "GLUCOSE", "value": 130.0, "supersedes_id": 1, "superseded": false, "...": "..." }
  ],
  "care_events": [ { "timestamp": "...", "kind": "MISSION_COMPLETED", "action_ids": ["THIGH_CUFFS"], "points": 10 } ]
}
```

Incluye las mediciones corregidas (`superseded: true`) para que la trazabilidad sea completa; la telemetría vigente usa solo las efectivas. El JSON se escribe con un serializador propio (`domain/export/Json.kt`), testeable en la JVM.

## `KnowledgeNote` — contexto social (D20)

Tabla Room `knowledge_notes` (base de datos v3, `MIGRATION_2_3`). Es privada del astronauta: **no** forma parte del reporte del Flight Surgeon y se puede borrar desde la app.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Long | Autogenerado |
| `timestamp` | Instant | |
| `kind` | `APP_SESSION` | `SHARED_TEXT` | `SHARED_LINK` | `SHARED_VIDEO` | `SHARED_IMAGE` | `ANSWER` | |
| `app_label` | String? | Nombre visible de la app (sesión, origen de lo compartido o tema de la pregunta) |
| `category` | `SOCIAL` | `VIDEO` | `CAMERA` | … | Categoría de `AppCategorizer` |
| `text` | String? | Solo lo que el astronauta compartió a propósito (máx. 500 caracteres, sin el enlace) |
| `duration_sec` | Long? | Duración de la sesión o del video compartido |
| `topics` | Set<`Topic`> | `EARTH`, `CREW`, `FAMILY`, `FUN`, `SPACE`, `SCIENCE`, `NATURE`, `PETS`, `FOOD`, `MUSIC`, `SPORTS` |
| `mood` | `GOOD` | `NEUTRAL` | `BAD` | Respuesta a "¿Cómo te dejó?" |

## Valores de referencia (para datos simulados del demo)

Rangos orientativos para generar telemetría mock; **no son umbrales clínicos validados**.

| Campo | Nominal aprox. |
|---|---|
| `heart_rate_bpm` | 60–100 |
| `hrv_ms` | 20–100 (muy individual; usar línea base) |
| `blood_pressure` | ~120/80 |
| `blood_glucose_mg_dl` | 70–140 |
| `body_temp_celsius` | 36.1–37.2 |
| `sleep_duration_hours` | ≥ 6 (umbral de riesgo HRP en la spec) |
| `cans_neutron_dose_uSv_h` | alerta si > 1.3 × línea base |

## Línea base individual

Necesaria para la regla T2 (> 1.5σ). Mantener por astronauta y métrica una media y desviación estándar móviles (p. ej. ventana de 14 días o algoritmo de Welford incremental).
