package nasa.space.app.ec.laikapolizon.domain.export

import nasa.space.app.ec.laikapolizon.domain.care.CareEvent
import nasa.space.app.ec.laikapolizon.domain.model.HealthTelemetryEvent
import nasa.space.app.ec.laikapolizon.domain.model.LaikaStateEvent
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.telemetry.TelemetryAggregator
import java.time.Instant

/**
 * Reporte local para el Flight Surgeon. Usa los nombres en snake_case de los JSON Schemas
 * (docs/06-modelos-de-datos.md) para `latest_telemetry` y `current_state`, y agrega el historial
 * completo de mediciones (incluidas las corregidas, para trazabilidad) y de misiones.
 * No se envía a ningún lado: el astronauta elige dónde guardar el archivo (red cerrada).
 */
object FlightSurgeonReport {
    const val VERSION = 1

    fun build(
        astronautId: String,
        missionDay: Int,
        now: Instant,
        state: LaikaStateEvent,
        records: List<MeasurementRecord>,
        careEvents: List<CareEvent>,
    ): String {
        val supersededIds = records.mapNotNull { it.supersedesId }.toSet()
        val report = linkedMapOf<String, Any?>(
            "report_version" to VERSION,
            "generated_at" to now,
            "astronaut_id" to astronautId,
            "mission_day" to missionDay,
            "current_state" to stateJson(state),
            "latest_telemetry" to telemetryJson(TelemetryAggregator.latestSnapshot(records, astronautId, now)),
            "measurements" to records.sortedBy { it.timestamp }.map { r ->
                linkedMapOf(
                    "id" to r.id,
                    "timestamp" to r.timestamp,
                    "type" to r.type,
                    "value" to r.value,
                    "secondary_value" to r.secondaryValue,
                    "unit" to r.unit,
                    "source" to r.source,
                    "raw_transcript" to r.rawTranscript,
                    "supersedes_id" to r.supersedesId,
                    "superseded" to (r.id in supersededIds),
                )
            },
            "care_events" to careEvents.sortedBy { it.timestamp }.map { e ->
                linkedMapOf(
                    "timestamp" to e.timestamp,
                    "kind" to e.kind,
                    "action_ids" to e.actionIds,
                    "points" to e.points,
                )
            },
        )
        return Json.encode(report)
    }

    /** `LaikaStateEvent` según su JSON Schema. */
    fun stateJson(state: LaikaStateEvent) = linkedMapOf(
        "timestamp" to state.timestamp,
        "current_system_state" to state.currentSystemState,
        "laika_vitality_score" to state.laikaVitalityScore,
        "active_emotion_display" to state.activeEmotionDisplay,
        "prescribed_actions" to state.prescribedActions.map {
            linkedMapOf(
                "action_id" to it.actionId,
                "target_hazard" to it.targetHazard,
                "description" to it.description,
                "estimated_duration_min" to it.estimatedDurationMin,
            )
        },
    )

    /** `HealthTelemetryEvent` según su JSON Schema (los campos sin dato se omiten). */
    fun telemetryJson(t: HealthTelemetryEvent) = linkedMapOf(
        "timestamp" to t.timestamp,
        "astronaut_id" to t.astronautId,
        "vital_signs" to t.vitalSigns?.let { v ->
            linkedMapOf(
                "heart_rate_bpm" to v.heartRateBpm,
                "hrv_ms" to v.hrvMs,
                "blood_pressure" to v.bloodPressure?.let { linkedMapOf("systolic" to it.systolic, "diastolic" to it.diastolic) },
                "blood_glucose_mg_dl" to v.bloodGlucoseMgDl,
                "body_temp_celsius" to v.bodyTempCelsius,
                "sleep_duration_hours" to v.sleepDurationHours,
            )
        },
        "environmental_hazards" to t.environmentalHazards?.let { e ->
            linkedMapOf(
                "cans_neutron_dose_uSv_h" to e.cansNeutronDoseUSvH,
                "ambient_co2_percentage" to e.ambientCo2Percentage,
            )
        },
    )
}
