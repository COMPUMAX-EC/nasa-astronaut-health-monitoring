package nasa.space.app.ec.laikapolizon.domain.validation

import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType

enum class ValidationIssue {
    /** Valor fisiológicamente imposible: se rechaza. */
    IMPOSSIBLE,
    /** Falta el segundo valor (diastólica). */
    MISSING_SECONDARY,
    /** Sistólica menor o igual que diastólica. */
    SYSTOLIC_NOT_ABOVE_DIASTOLIC,
    /** Fuera de lo habitual: se pide confirmación adicional. */
    UNUSUAL,
}

sealed interface ValidationResult {
    data object Valid : ValidationResult
    data class NeedsConfirmation(val issue: ValidationIssue) : ValidationResult
    data class Invalid(val issue: ValidationIssue) : ValidationResult
}

/** Reglas de validación del registro central (docs/10-modulos-de-la-app.md, módulo C, regla 2). */
object MeasurementValidator {

    private data class Ranges(
        val possible: ClosedFloatingPointRange<Double>,
        val usual: ClosedFloatingPointRange<Double>,
    )

    private val ranges = mapOf(
        MeasurementType.HEART_RATE to Ranges(20.0..250.0, 45.0..120.0),
        MeasurementType.HRV to Ranges(1.0..300.0, 15.0..150.0),
        MeasurementType.BLOOD_PRESSURE to Ranges(50.0..260.0, 90.0..140.0),
        MeasurementType.GLUCOSE to Ranges(10.0..700.0, 70.0..180.0),
        MeasurementType.BODY_TEMPERATURE to Ranges(30.0..44.0, 35.5..37.8),
        MeasurementType.SLEEP_DURATION to Ranges(0.0..24.0, 4.0..10.0),
        MeasurementType.ACTIVITY_MINUTES to Ranges(0.0..600.0, 0.0..240.0),
        MeasurementType.CORTISOL to Ranges(0.0..200.0, 2.0..30.0),
        MeasurementType.VISION_CLARITY to Ranges(0.0..10.0, 7.0..10.0),
        MeasurementType.NEUTRON_DOSE_RATE to Ranges(0.0..10_000.0, 0.0..50.0),
        MeasurementType.CO2 to Ranges(0.0..10.0, 0.0..0.7),
    )

    private val diastolic = Ranges(30.0..160.0, 55.0..90.0)

    fun validate(type: MeasurementType, value: Double, secondaryValue: Double? = null): ValidationResult {
        val r = ranges.getValue(type)
        if (value.isNaN() || value !in r.possible) return ValidationResult.Invalid(ValidationIssue.IMPOSSIBLE)

        if (type == MeasurementType.BLOOD_PRESSURE) {
            val dia = secondaryValue ?: return ValidationResult.Invalid(ValidationIssue.MISSING_SECONDARY)
            if (dia.isNaN() || dia !in diastolic.possible) return ValidationResult.Invalid(ValidationIssue.IMPOSSIBLE)
            if (value <= dia) return ValidationResult.Invalid(ValidationIssue.SYSTOLIC_NOT_ABOVE_DIASTOLIC)
            if (dia !in diastolic.usual) return ValidationResult.NeedsConfirmation(ValidationIssue.UNUSUAL)
        }

        return if (value in r.usual) ValidationResult.Valid else ValidationResult.NeedsConfirmation(ValidationIssue.UNUSUAL)
    }
}
