package nasa.space.app.ec.laikapolizon.data.simulator

import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementSource
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.repository.MeasurementRepository
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.util.Random

/** Escenarios de telemetría simulada para el demo (sin hardware real). */
enum class Scenario {
    NOMINAL, POOR_SLEEP, RADIATION_SPIKE, SANS, LOW_MOOD,
    /** 8 semanas de historial en las que se duerme menos el mismo día de la semana que hoy (memoria episódica). */
    WEEKLY_PATTERN,
}

/**
 * Genera 10 días de historial nominal (línea base) + lecturas recientes según el escenario.
 * Todo es determinista (semilla fija) para que el demo y los tests sean reproducibles.
 * Los registros se marcan como [MeasurementSource.SIMULATED].
 */
class ScenarioSimulator(private val clock: Clock, private val seed: Long = 42L) {

    private data class Profile(val mean: Double, val sd: Double, val min: Double = 0.0, val max: Double = Double.MAX_VALUE)

    private val profiles = mapOf(
        MeasurementType.HEART_RATE to Profile(65.0, 3.0),
        MeasurementType.HRV to Profile(55.0, 5.0),
        MeasurementType.BLOOD_PRESSURE to Profile(118.0, 4.0),
        MeasurementType.GLUCOSE to Profile(95.0, 6.0),
        MeasurementType.BODY_TEMPERATURE to Profile(36.7, 0.15),
        MeasurementType.SLEEP_DURATION to Profile(7.2, 0.4),
        MeasurementType.ACTIVITY_MINUTES to Profile(110.0, 10.0),
        MeasurementType.CORTISOL to Profile(12.0, 2.0),
        MeasurementType.VISION_CLARITY to Profile(9.4, 0.3, max = 10.0),
        MeasurementType.NEUTRON_DOSE_RATE to Profile(6.0, 0.3),
    )
    private val diastolic = Profile(76.0, 3.0)

    /** Valores de las últimas 4 lecturas diarias (días −3, −2, −1 y hoy) que reemplazan a las nominales. */
    private fun overrides(scenario: Scenario): Map<MeasurementType, List<Double>> = when (scenario) {
        Scenario.NOMINAL, Scenario.RADIATION_SPIKE, Scenario.WEEKLY_PATTERN -> emptyMap()
        Scenario.POOR_SLEEP -> mapOf(
            MeasurementType.SLEEP_DURATION to listOf(6.5, 5.8, 5.2, 4.5),
            MeasurementType.HRV to listOf(52.0, 49.0, 46.0, 43.0),
        )
        Scenario.SANS -> mapOf(
            MeasurementType.VISION_CLARITY to listOf(9.0, 8.4, 7.6, 6.5),
        )
        Scenario.LOW_MOOD -> mapOf(
            MeasurementType.HRV to listOf(50.0, 45.0, 40.0, 35.0),
            MeasurementType.CORTISOL to listOf(14.0, 17.0, 20.0, 24.0),
            MeasurementType.ACTIVITY_MINUTES to listOf(100.0, 80.0, 60.0, 40.0),
        )
    }

    fun generate(scenario: Scenario): List<MeasurementRecord> {
        val random = Random(seed)
        val now = clock.instant()
        val records = mutableListOf<MeasurementRecord>()
        val scenarioOverrides = overrides(scenario)

        // Lecturas diarias: 10 días de historial (56 en el patrón semanal) + 1 lectura de hoy (hace 30 min).
        val historyDays = if (scenario == Scenario.WEEKLY_PATTERN) 56L else 10L
        val today = now.atZone(clock.zone).toLocalDate().dayOfWeek
        val dailyTimes = (historyDays downTo 1).map { now.minus(Duration.ofDays(it)) } + now.minus(Duration.ofMinutes(30))
        // Patrón fijo para las lecturas recientes nominales: cerca de la media y sin tendencia monótona,
        // para no disparar falsos positivos de 1.5σ o de tendencia.
        val calmPattern = listOf(0.2, -0.1, 0.1, 0.0)

        for ((type, profile) in profiles) {
            if (type == MeasurementType.NEUTRON_DOSE_RATE) continue
            val custom = scenarioOverrides[type]
            dailyTimes.forEachIndexed { index, time ->
                val recentIndex = index - (dailyTimes.size - 4) // 0..3 para las últimas 4 lecturas
                val value = when {
                    recentIndex >= 0 && custom != null -> custom[recentIndex]
                    recentIndex >= 0 -> profile.mean + calmPattern[recentIndex] * profile.sd
                    scenario == Scenario.WEEKLY_PATTERN && type == MeasurementType.SLEEP_DURATION &&
                        time.atZone(clock.zone).toLocalDate().dayOfWeek == today -> profile.mean - 1.4 + random.nextGaussian() * 0.2
                    else -> profile.mean + random.nextGaussian() * profile.sd
                }.coerceIn(profile.min, profile.max)
                val secondary = if (type == MeasurementType.BLOOD_PRESSURE) {
                    if (recentIndex >= 0) diastolic.mean + calmPattern[recentIndex] * diastolic.sd
                    else diastolic.mean + random.nextGaussian() * diastolic.sd
                } else null
                records += record(time, type, round(value, type), secondary?.let { round(it, type) })
            }
        }

        // Radiación CANS: una lectura cada 6 h durante 10 días.
        val neutron = profiles.getValue(MeasurementType.NEUTRON_DOSE_RATE)
        val radiationTimes = (40 downTo 1).map { now.minus(Duration.ofHours(6L * it)) } +
            listOf(now.minus(Duration.ofMinutes(90)), now.minus(Duration.ofMinutes(30)))
        radiationTimes.forEachIndexed { index, time ->
            val isLastTwo = index >= radiationTimes.size - 2
            val value = when {
                scenario == Scenario.RADIATION_SPIKE && isLastTwo -> if (index == radiationTimes.size - 1) 9.6 else 9.0
                isLastTwo -> neutron.mean
                else -> neutron.mean + random.nextGaussian() * neutron.sd
            }
            records += record(time, MeasurementType.NEUTRON_DOSE_RATE, round(value, MeasurementType.NEUTRON_DOSE_RATE))
        }

        return records.sortedBy { it.timestamp }
    }

    /**
     * Fin de un evento de radiación (Flujo 2, paso 4): agrega dos lecturas CANS normales y recientes,
     * así el espectrómetro "confirma la caída" y la alerta puede cerrarse.
     */
    suspend fun endRadiationEvent(repository: MeasurementRepository) {
        val now = clock.instant()
        val mean = profiles.getValue(MeasurementType.NEUTRON_DOSE_RATE).mean
        repository.addAll(
            listOf(
                record(now.minus(Duration.ofSeconds(30)), MeasurementType.NEUTRON_DOSE_RATE, mean),
                record(now, MeasurementType.NEUTRON_DOSE_RATE, mean),
            )
        )
    }

    /** Reemplaza los datos simulados previos por los del escenario. Los registros manuales se conservan. */
    suspend fun load(scenario: Scenario, repository: MeasurementRepository) {
        repository.deleteBySource(MeasurementSource.SIMULATED)
        repository.addAll(generate(scenario))
    }

    private fun record(time: Instant, type: MeasurementType, value: Double, secondary: Double? = null) =
        MeasurementRecord(timestamp = time, type = type, value = value, secondaryValue = secondary, source = MeasurementSource.SIMULATED)

    private fun round(value: Double, type: MeasurementType): Double {
        val factor = when (type) {
            MeasurementType.HEART_RATE, MeasurementType.BLOOD_PRESSURE, MeasurementType.GLUCOSE,
            MeasurementType.ACTIVITY_MINUTES -> 1.0
            else -> 10.0
        }
        return Math.round(value * factor) / factor
    }
}
