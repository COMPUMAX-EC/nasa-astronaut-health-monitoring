package nasa.space.app.ec.laikapolizon.domain.memory

import nasa.space.app.ec.laikapolizon.domain.baseline.MetricBaseline
import nasa.space.app.ec.laikapolizon.domain.care.CareEvent
import nasa.space.app.ec.laikapolizon.domain.care.CareKind
import nasa.space.app.ec.laikapolizon.domain.model.Hazard
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.model.Polarity
import nasa.space.app.ec.laikapolizon.domain.model.PrescribedAction
import nasa.space.app.ec.laikapolizon.domain.model.effective
import nasa.space.app.ec.laikapolizon.domain.statemachine.ActionCatalog
import java.time.DayOfWeek
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/** Algo que Laika "recuerda" de la historia compartida (docs/04 §4.2, memoria episódica). */
sealed interface Memory {
    /** "Sé que los martes sueles dormir menos." */
    data class WeekdayPattern(
        val type: MeasurementType,
        val dayOfWeek: DayOfWeek,
        val weekdayMean: Double,
        val overallMean: Double,
        val occurrences: Int,
        val suggestion: PrescribedAction?,
    ) : Memory

    /** "La última vez que hicimos los manguitos, tu nitidez visual mejoró." */
    data class HelpfulMission(
        val actionId: String,
        val description: String,
        val type: MeasurementType,
        val before: Double,
        val after: Double,
        val completedAt: Instant,
    ) : Memory
}

data class MemoryConfig(
    /** Historial que se revisa para buscar patrones semanales. */
    val window: Duration = Duration.ofDays(8 * 7),
    /** Veces mínimas que debe repetirse un día para considerarlo patrón. */
    val minOccurrences: Int = 3,
    /** Diferencia mínima (en σ del total) para que el patrón sea notable. */
    val minSigma: Double = 1.0,
    /** Ventana para buscar una lectura posterior a la misión. */
    val afterWindow: Duration = Duration.ofHours(72),
)

/**
 * Memoria episódica derivada de los datos (se recalcula, no se guarda aparte):
 * así nunca "recuerda" algo que el registro central ya no respalda.
 */
class EpisodicMemory(private val config: MemoryConfig = MemoryConfig()) {

    fun weekdayPatterns(records: List<MeasurementRecord>, now: Instant, zone: ZoneId): List<Memory.WeekdayPattern> {
        val since = now.minus(config.window)
        val byType = records.effective()
            .filter { !it.timestamp.isBefore(since) && !it.timestamp.isAfter(now) }
            .groupBy { it.type }

        return byType.mapNotNull { (type, series) ->
            if (type.polarity == Polarity.BOTH_WAYS || type == MeasurementType.NEUTRON_DOSE_RATE) return@mapNotNull null
            val overall = MetricBaseline.of(series.map { it.value })
            val sd = overall.standardDeviation.takeIf { it > 0 } ?: return@mapNotNull null

            series.groupBy { it.timestamp.atZone(zone).toLocalDate().dayOfWeek }
                .filterValues { it.size >= config.minOccurrences }
                .map { (day, values) -> day to values.map { it.value }.average() }
                .filter { (_, mean) ->
                    val z = (mean - overall.mean) / sd
                    if (type.polarity == Polarity.LOWER_IS_WORSE) z <= -config.minSigma else z >= config.minSigma
                }
                // Si varios días destacan, se queda con el peor.
                .maxByOrNull { (_, mean) -> kotlin.math.abs(mean - overall.mean) }
                ?.let { (day, mean) ->
                    Memory.WeekdayPattern(
                        type = type,
                        dayOfWeek = day,
                        weekdayMean = mean,
                        overallMean = overall.mean,
                        occurrences = series.count { it.timestamp.atZone(zone).toLocalDate().dayOfWeek == day },
                        suggestion = ActionCatalog.forHazard(type.hazard).firstOrNull(),
                    )
                }
        }
    }

    /** Misiones completadas tras las cuales una métrica relacionada mejoró. La más reciente primero. */
    fun helpfulMissions(records: List<MeasurementRecord>, careEvents: List<CareEvent>): List<Memory.HelpfulMission> {
        val effective = records.effective().sortedBy { it.timestamp }
        return careEvents
            .filter { it.kind == CareKind.MISSION_COMPLETED }
            .sortedByDescending { it.timestamp }
            .flatMap { event ->
                event.actionIds.mapNotNull { actionId ->
                    val action = actionById(actionId) ?: return@mapNotNull null
                    val hazard = Hazard.valueOf(action.targetHazard)
                    MeasurementType.entries.filter { it.hazard == hazard && it.polarity != Polarity.BOTH_WAYS }
                        .firstNotNullOfOrNull { type -> improvement(effective, type, event.timestamp) }
                        ?.let { (type, before, after) ->
                            Memory.HelpfulMission(actionId, action.description, type, before, after, event.timestamp)
                        }
                }
            }
            .distinctBy { it.actionId }
    }

    private fun improvement(records: List<MeasurementRecord>, type: MeasurementType, at: Instant): Triple<MeasurementType, Double, Double>? {
        val series = records.filter { it.type == type }
        val before = series.lastOrNull { !it.timestamp.isAfter(at) } ?: return null
        val after = series.firstOrNull { it.timestamp.isAfter(at) && Duration.between(at, it.timestamp) <= config.afterWindow } ?: return null
        val better = if (type.polarity == Polarity.LOWER_IS_WORSE) after.value > before.value else after.value < before.value
        return if (better) Triple(type, before.value, after.value) else null
    }

    private fun actionById(id: String): PrescribedAction? =
        Hazard.entries.asSequence().flatMap { ActionCatalog.forHazard(it).asSequence() }.firstOrNull { it.actionId == id }
}
