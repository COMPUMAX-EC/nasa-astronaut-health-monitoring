package nasa.space.app.ec.laikapolizon.domain.model

import java.time.Instant

// Equivalente Kotlin del JSON Schema `HealthTelemetryEvent` (docs/06-modelos-de-datos.md).
// Todos los campos medidos son opcionales: un sensor puede no reportar.

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
