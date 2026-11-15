package nasa.space.app.ec.laikapolizon.domain.bodymap

import nasa.space.app.ec.laikapolizon.domain.analysis.Finding
import nasa.space.app.ec.laikapolizon.domain.model.Hazard
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.model.PrescribedAction
import nasa.space.app.ec.laikapolizon.domain.model.effective
import nasa.space.app.ec.laikapolizon.domain.statemachine.ActionCatalog
import java.time.Duration
import java.time.Instant

/**
 * Regiones del mapa corporal (docs/05-sistema-de-diseno.md §5.1). Los indicadores se agrupan
 * por proximidad (Gestalt): p. ej. presión y frecuencia cardíaca en el tórax.
 */
enum class BodyRegion(val metrics: List<MeasurementType>, val hazards: List<Hazard>) {
    HEAD(
        listOf(MeasurementType.VISION_CLARITY, MeasurementType.SLEEP_DURATION, MeasurementType.CORTISOL),
        listOf(Hazard.SANS, Hazard.SLEEP, Hazard.PSYCHOSOCIAL),
    ),
    CHEST(
        listOf(MeasurementType.HEART_RATE, MeasurementType.HRV, MeasurementType.BLOOD_PRESSURE),
        listOf(Hazard.CARDIOVASCULAR, Hazard.PSYCHOSOCIAL),
    ),
    ABDOMEN(
        listOf(MeasurementType.GLUCOSE, MeasurementType.BODY_TEMPERATURE),
        listOf(Hazard.METABOLIC, Hazard.IMMUNE),
    ),
    /** Las piernas aparecen en el protocolo SANS: los manguitos retienen fluidos en ellas. */
    LEGS(
        listOf(MeasurementType.ACTIVITY_MINUTES),
        listOf(Hazard.PHYSICAL, Hazard.SANS),
    ),
    /** Entorno de la nave (no es parte del cuerpo, pero afecta a todo él). */
    ENVIRONMENT(
        listOf(MeasurementType.NEUTRON_DOSE_RATE, MeasurementType.CO2),
        listOf(Hazard.RADIATION, Hazard.ENVIRONMENT),
    ),
}

enum class Trend { UP, DOWN, STABLE, UNKNOWN }

data class MetricSummary(
    val type: MeasurementType,
    val latest: MeasurementRecord?,
    /** Media de los últimos 7 días (sin la última lectura). */
    val mean7d: Double?,
    /** Media de las últimas 24 h. */
    val mean24h: Double?,
    val trend: Trend,
)

data class RegionSummary(
    val region: BodyRegion,
    val flagged: Boolean,
    val metrics: List<MetricSummary>,
    val actions: List<PrescribedAction>,
)

object BodyMap {

    /** Regiones resaltadas por los hallazgos actuales. */
    fun flaggedRegions(findings: List<Finding>): Set<BodyRegion> {
        val hazards = findings.map { it.hazard }.toSet()
        return BodyRegion.entries.filter { region -> region.hazards.any { it in hazards } }.toSet()
    }

    fun summarize(region: BodyRegion, records: List<MeasurementRecord>, findings: List<Finding>, now: Instant): RegionSummary {
        val effective = records.effective().filter { !it.timestamp.isAfter(now) }
        val metrics = region.metrics.map { type ->
            val series = effective.filter { it.type == type }.sortedBy { it.timestamp }
            val latest = series.lastOrNull()
            val week = series.dropLast(1).filter { Duration.between(it.timestamp, now) <= Duration.ofDays(7) }.map { it.value }
            val day = series.filter { Duration.between(it.timestamp, now) <= Duration.ofHours(24) }.map { it.value }
            val mean7d = week.takeIf { it.isNotEmpty() }?.average()
            MetricSummary(
                type = type,
                latest = latest,
                mean7d = mean7d,
                mean24h = day.takeIf { it.isNotEmpty() }?.average(),
                trend = trend(latest?.value, mean7d),
            )
        }
        val regionHazards = findings.map { it.hazard }.filter { it in region.hazards }.distinct()
        return RegionSummary(
            region = region,
            flagged = regionHazards.isNotEmpty(),
            metrics = metrics,
            actions = regionHazards.flatMap(ActionCatalog::forHazard).distinctBy { it.actionId },
        )
    }

    /** Variación de más del 5 % respecto a la media semanal cuenta como subida o bajada. */
    private fun trend(latest: Double?, mean: Double?): Trend {
        if (latest == null || mean == null || mean == 0.0) return Trend.UNKNOWN
        val change = (latest - mean) / mean
        return when {
            change > 0.05 -> Trend.UP
            change < -0.05 -> Trend.DOWN
            else -> Trend.STABLE
        }
    }
}
