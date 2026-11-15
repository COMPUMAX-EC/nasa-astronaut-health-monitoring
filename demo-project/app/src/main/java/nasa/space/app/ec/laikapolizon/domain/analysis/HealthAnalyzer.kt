package nasa.space.app.ec.laikapolizon.domain.analysis

import nasa.space.app.ec.laikapolizon.domain.baseline.MetricBaseline
import nasa.space.app.ec.laikapolizon.domain.model.Hazard
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementSource
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.model.Polarity
import nasa.space.app.ec.laikapolizon.domain.model.effective
import nasa.space.app.ec.laikapolizon.domain.vitality.VitalityCalculator
import nasa.space.app.ec.laikapolizon.domain.vitality.VitalityInputs
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import kotlin.math.abs

enum class FindingKind {
    /** Valor fuera de un umbral absoluto de seguridad → alerta crítica. */
    CRITICAL_THRESHOLD,
    /** Flujo de neutrones sostenido > 30 % sobre el fondo (Flujo 2). */
    RADIATION_SPIKE,
    /** Desviación > 1.5σ de la línea base individual (regla T2). */
    SIGMA_DEVIATION,
    /** Tendencia negativa en mediciones consecutivas (regla T2). */
    NEGATIVE_TREND,
}

data class Finding(
    val type: MeasurementType,
    val kind: FindingKind,
    val value: Double,
    val zScore: Double? = null,
) {
    val hazard: Hazard get() = type.hazard
    val isCritical: Boolean get() = kind == FindingKind.CRITICAL_THRESHOLD || kind == FindingKind.RADIATION_SPIKE
}

data class HealthAssessment(
    val criticalFindings: List<Finding>,
    val deviations: List<Finding>,
    val routineDue: Boolean,
    val vitality: Double,
    /** Hoy ya hubo registro manual/por voz de glucosa o presión (sin contar silencios). */
    val checkInDoneToday: Boolean = !routineDue,
)

/**
 * Umbrales de análisis. Los umbrales críticos son ORIENTATIVOS para el demo y no están
 * validados clínicamente (decisión abierta D4 en docs/09-roadmap-y-decisiones-abiertas.md).
 */
data class AnalyzerConfig(
    val sigmaThreshold: Double = 1.5,
    /** Número de empeoramientos consecutivos que cuentan como tendencia negativa. */
    val trendSteps: Int = 3,
    /** Lecturas recientes que se excluyen al calcular la línea base. */
    val baselineExcludeLatest: Int = 3,
    val baselineMinSamples: Int = 5,
    val baselineWindow: Duration = Duration.ofDays(14),
    /** Una lectura más antigua que esto no genera hallazgos. */
    val recencyWindow: Duration = Duration.ofHours(12),
    val vitalityRecencyWindow: Duration = Duration.ofHours(48),
    /** Factor sobre el fondo de neutrones que dispara la alerta de radiación. */
    val radiationSpikeFactor: Double = 1.3,
    /** Lecturas recientes consecutivas sobre el umbral para considerar el aumento "continuo". */
    val radiationSustainedReadings: Int = 2,
    val heartRateRange: ClosedFloatingPointRange<Double> = 40.0..150.0,
    val systolicCritical: Double = 180.0,
    val diastolicCritical: Double = 120.0,
    val glucoseRange: ClosedFloatingPointRange<Double> = 54.0..300.0,
    val temperatureRange: ClosedFloatingPointRange<Double> = 35.0..39.5,
)

class HealthAnalyzer(
    private val config: AnalyzerConfig = AnalyzerConfig(),
    private val vitalityCalculator: VitalityCalculator = VitalityCalculator(),
) {

    /**
     * @param snoozedHazards peligros cuya intervención ya se completó recientemente; sus desviaciones
     *   se ignoran para evitar fatiga por alarmas. Nunca silencia hallazgos críticos.
     */
    fun assess(
        records: List<MeasurementRecord>,
        now: Instant,
        zone: ZoneId,
        snoozedHazards: Set<Hazard> = emptySet(),
    ): HealthAssessment {
        val byType = records.effective()
            .filter { !it.timestamp.isAfter(now) }
            .groupBy { it.type }
            .mapValues { (_, list) -> list.sortedBy { it.timestamp } }

        val critical = mutableListOf<Finding>()
        val deviations = mutableListOf<Finding>()

        for ((type, series) in byType) {
            val latest = series.last()
            if (Duration.between(latest.timestamp, now) > config.recencyWindow) continue

            critical += criticalFindings(type, series, latest)

            if (type == MeasurementType.NEUTRON_DOSE_RATE) continue // la radiación solo se evalúa como crítica
            if (type.hazard in snoozedHazards) continue
            deviations += deviationFindings(type, series, now)
        }

        val checkInPending = isRoutineDue(byType, now, zone)
        return HealthAssessment(
            criticalFindings = critical,
            deviations = deviations,
            routineDue = Hazard.ROUTINE !in snoozedHazards && checkInPending,
            vitality = vitalityCalculator.calculate(vitalityInputs(byType, now)),
            checkInDoneToday = !checkInPending,
        )
    }

    private fun criticalFindings(
        type: MeasurementType,
        series: List<MeasurementRecord>,
        latest: MeasurementRecord,
    ): List<Finding> {
        val v = latest.value
        val outOfRange = when (type) {
            MeasurementType.HEART_RATE -> v !in config.heartRateRange
            MeasurementType.BLOOD_PRESSURE ->
                v >= config.systolicCritical || (latest.secondaryValue ?: 0.0) >= config.diastolicCritical
            MeasurementType.GLUCOSE -> v !in config.glucoseRange
            MeasurementType.BODY_TEMPERATURE -> v !in config.temperatureRange
            MeasurementType.NEUTRON_DOSE_RATE -> return radiationSpike(series)
            else -> false
        }
        return if (outOfRange) listOf(Finding(type, FindingKind.CRITICAL_THRESHOLD, v)) else emptyList()
    }

    private fun radiationSpike(series: List<MeasurementRecord>): List<Finding> {
        val n = config.radiationSustainedReadings
        val background = series.dropLast(n).map { it.value }
        if (background.size < config.baselineMinSamples) return emptyList()
        val threshold = MetricBaseline.of(background).mean * config.radiationSpikeFactor
        val recent = series.takeLast(n)
        return if (recent.size == n && recent.all { it.value > threshold }) {
            listOf(Finding(MeasurementType.NEUTRON_DOSE_RATE, FindingKind.RADIATION_SPIKE, recent.last().value))
        } else {
            emptyList()
        }
    }

    private fun deviationFindings(
        type: MeasurementType,
        series: List<MeasurementRecord>,
        now: Instant,
    ): List<Finding> {
        val values = series.map { it.value }
        val latest = values.last()

        // Regla T2a: desviación > 1.5σ en la dirección "mala" de la métrica.
        val windowStart = now.minus(config.baselineWindow)
        val baselineValues = series.dropLast(config.baselineExcludeLatest)
            .filter { !it.timestamp.isBefore(windowStart) }
            .map { it.value }
        if (baselineValues.size >= config.baselineMinSamples) {
            val z = MetricBaseline.of(baselineValues).zScore(latest)
            if (z != null && isWorse(type.polarity, z) && abs(z) > config.sigmaThreshold) {
                return listOf(Finding(type, FindingKind.SIGMA_DEVIATION, latest, z))
            }
        }

        // Regla T2b: N empeoramientos consecutivos (no aplica a métricas sin dirección "mala" única).
        if (type.polarity != Polarity.BOTH_WAYS && values.size > config.trendSteps) {
            val tail = values.takeLast(config.trendSteps + 1)
            val worsening = tail.zipWithNext().all { (prev, next) ->
                if (type.polarity == Polarity.LOWER_IS_WORSE) next < prev else next > prev
            }
            if (worsening) return listOf(Finding(type, FindingKind.NEGATIVE_TREND, latest))
        }
        return emptyList()
    }

    private fun isWorse(polarity: Polarity, z: Double) = when (polarity) {
        Polarity.HIGHER_IS_WORSE -> z > 0
        Polarity.LOWER_IS_WORSE -> z < 0
        Polarity.BOTH_WAYS -> true
    }

    /** El chequeo matutino está pendiente si hoy no hubo registro manual/por voz de glucosa o presión. */
    private fun isRoutineDue(
        byType: Map<MeasurementType, List<MeasurementRecord>>,
        now: Instant,
        zone: ZoneId,
    ): Boolean {
        val today = now.atZone(zone).toLocalDate()
        val checkInTypes = listOf(MeasurementType.GLUCOSE, MeasurementType.BLOOD_PRESSURE)
        val doneToday = checkInTypes.any { type ->
            byType[type].orEmpty().any {
                (it.source == MeasurementSource.MANUAL || it.source == MeasurementSource.VOICE) &&
                    it.timestamp.atZone(zone).toLocalDate() == today
            }
        }
        return !doneToday
    }

    private fun vitalityInputs(
        byType: Map<MeasurementType, List<MeasurementRecord>>,
        now: Instant,
    ): VitalityInputs {
        fun latest(type: MeasurementType): Double? = byType[type]?.lastOrNull()
            ?.takeIf { Duration.between(it.timestamp, now) <= config.vitalityRecencyWindow }
            ?.value
        return VitalityInputs(
            sleepHours = latest(MeasurementType.SLEEP_DURATION),
            hrvMs = latest(MeasurementType.HRV),
            activityMinutes = latest(MeasurementType.ACTIVITY_MINUTES),
            cortisolNmolL = latest(MeasurementType.CORTISOL),
        )
    }
}
