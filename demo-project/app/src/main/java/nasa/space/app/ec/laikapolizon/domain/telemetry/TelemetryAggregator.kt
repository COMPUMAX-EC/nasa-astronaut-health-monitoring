package nasa.space.app.ec.laikapolizon.domain.telemetry

import nasa.space.app.ec.laikapolizon.domain.model.BloodPressure
import nasa.space.app.ec.laikapolizon.domain.model.EnvironmentalHazards
import nasa.space.app.ec.laikapolizon.domain.model.HealthTelemetryEvent
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.model.VitalSigns
import nasa.space.app.ec.laikapolizon.domain.model.effective
import java.time.Instant

/** Agrega los registros vigentes en un [HealthTelemetryEvent] con el último valor de cada métrica. */
object TelemetryAggregator {

    fun latestSnapshot(records: List<MeasurementRecord>, astronautId: String, now: Instant): HealthTelemetryEvent {
        val latest = records.effective()
            .filter { !it.timestamp.isAfter(now) }
            .groupBy { it.type }
            .mapValues { (_, list) -> list.maxBy { it.timestamp } }

        fun value(type: MeasurementType) = latest[type]?.value
        val bp = latest[MeasurementType.BLOOD_PRESSURE]?.let { r -> r.secondaryValue?.let { BloodPressure(r.value, it) } }

        return HealthTelemetryEvent(
            timestamp = now,
            astronautId = astronautId,
            vitalSigns = VitalSigns(
                heartRateBpm = value(MeasurementType.HEART_RATE),
                hrvMs = value(MeasurementType.HRV),
                bloodPressure = bp,
                bloodGlucoseMgDl = value(MeasurementType.GLUCOSE),
                bodyTempCelsius = value(MeasurementType.BODY_TEMPERATURE),
                sleepDurationHours = value(MeasurementType.SLEEP_DURATION),
            ),
            environmentalHazards = EnvironmentalHazards(
                cansNeutronDoseUSvH = value(MeasurementType.NEUTRON_DOSE_RATE),
                ambientCo2Percentage = value(MeasurementType.CO2),
            ),
        )
    }
}
