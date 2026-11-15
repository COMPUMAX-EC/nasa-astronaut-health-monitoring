package nasa.space.app.ec.laikapolizon.domain.model

import java.time.Instant

/** Dirección en la que un cambio de la métrica es "malo" para el astronauta. */
enum class Polarity { HIGHER_IS_WORSE, LOWER_IS_WORSE, BOTH_WAYS }

/**
 * Tipos de medición del registro central (docs/10-modulos-de-la-app.md, módulo C).
 * Para BLOOD_PRESSURE, `value` = sistólica y `secondaryValue` = diastólica.
 */
enum class MeasurementType(val unit: String, val polarity: Polarity, val hazard: Hazard) {
    HEART_RATE("bpm", Polarity.BOTH_WAYS, Hazard.CARDIOVASCULAR),
    HRV("ms", Polarity.LOWER_IS_WORSE, Hazard.PSYCHOSOCIAL),
    BLOOD_PRESSURE("mmHg", Polarity.HIGHER_IS_WORSE, Hazard.CARDIOVASCULAR),
    GLUCOSE("mg/dL", Polarity.BOTH_WAYS, Hazard.METABOLIC),
    BODY_TEMPERATURE("°C", Polarity.BOTH_WAYS, Hazard.IMMUNE),
    SLEEP_DURATION("h", Polarity.LOWER_IS_WORSE, Hazard.SLEEP),
    ACTIVITY_MINUTES("min", Polarity.LOWER_IS_WORSE, Hazard.PHYSICAL),
    CORTISOL("nmol/L", Polarity.HIGHER_IS_WORSE, Hazard.PSYCHOSOCIAL),
    /** Autoevaluación de nitidez visual 0–10 (cuestionario SANS, Flujo 3). */
    VISION_CLARITY("/10", Polarity.LOWER_IS_WORSE, Hazard.SANS),
    /** Tasa de dosis de neutrones del espectrómetro CANS. */
    NEUTRON_DOSE_RATE("µSv/h", Polarity.HIGHER_IS_WORSE, Hazard.RADIATION),
    CO2("%", Polarity.HIGHER_IS_WORSE, Hazard.ENVIRONMENT),
}

enum class MeasurementSource { MANUAL, VOICE, SENSOR, SIMULATED }

data class MeasurementRecord(
    val id: Long = 0,
    val timestamp: Instant,
    val type: MeasurementType,
    val value: Double,
    val secondaryValue: Double? = null,
    val unit: String = type.unit,
    val source: MeasurementSource,
    /** Texto reconocido si el dato vino por voz. */
    val rawTranscript: String? = null,
    /** Si no es null, este registro corrige al registro con ese id. */
    val supersedesId: Long? = null,
)

/** Registros vigentes: excluye los que fueron corregidos por un registro posterior. */
fun List<MeasurementRecord>.effective(): List<MeasurementRecord> {
    val superseded = mapNotNullTo(HashSet()) { it.supersedesId }
    return filter { it.id !in superseded }
}
