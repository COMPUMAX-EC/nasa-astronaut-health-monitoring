package nasa.space.app.ec.laikapolizon.domain.vitality

/**
 * Métrica espejo (docs/04-vitalidad-y-gamificacion.md):
 *
 *   Vitalidad = w1·Sueño + w2·VFC + w3·Actividad − w4·Cortisol
 *
 * Cada término se normaliza a [0, 1]. Para que el resultado quede en 0–100 se usa la forma
 * equivalente `w4·(1 − Cortisol)` y se divide por la suma de pesos de los términos disponibles.
 * Si falta un dato, su término se omite y los pesos restantes se re-normalizan.
 */
data class VitalityInputs(
    val sleepHours: Double? = null,
    val hrvMs: Double? = null,
    val activityMinutes: Double? = null,
    val cortisolNmolL: Double? = null,
)

data class VitalityWeights(
    val sleep: Double = 0.30,
    val hrv: Double = 0.30,
    val activity: Double = 0.25,
    val cortisol: Double = 0.15,
)

class VitalityCalculator(private val weights: VitalityWeights = VitalityWeights()) {

    /** Devuelve la vitalidad 0–100, o [NEUTRAL] si no hay ningún dato. */
    fun calculate(inputs: VitalityInputs): Double {
        var weighted = 0.0
        var totalWeight = 0.0

        inputs.sleepHours?.let { weighted += weights.sleep * sleepScore(it); totalWeight += weights.sleep }
        inputs.hrvMs?.let { weighted += weights.hrv * hrvScore(it); totalWeight += weights.hrv }
        inputs.activityMinutes?.let { weighted += weights.activity * activityScore(it); totalWeight += weights.activity }
        inputs.cortisolNmolL?.let { weighted += weights.cortisol * (1.0 - cortisolLoad(it)); totalWeight += weights.cortisol }

        if (totalWeight == 0.0) return NEUTRAL
        return (weighted / totalWeight * 100.0).coerceIn(0.0, 100.0)
    }

    companion object {
        const val NEUTRAL = 50.0
        const val HIGH_THRESHOLD = 60.0
        const val LOW_THRESHOLD = 40.0

        /** 8 h de sueño = 1.0 */
        fun sleepScore(hours: Double) = (hours / 8.0).coerceIn(0.0, 1.0)

        /** 20 ms → 0, 100 ms → 1 (rango orientativo; la VFC es muy individual). */
        fun hrvScore(ms: Double) = ((ms - 20.0) / 80.0).coerceIn(0.0, 1.0)

        /** Objetivo diario 120 min (en la ISS se entrenan ~2 h al día). */
        fun activityScore(minutes: Double) = (minutes / 120.0).coerceIn(0.0, 1.0)

        /** Carga de cortisol salival: 5 nmol/L → 0, 25 nmol/L → 1 (orientativo, no clínico). */
        fun cortisolLoad(nmolL: Double) = ((nmolL - 5.0) / 20.0).coerceIn(0.0, 1.0)
    }
}
