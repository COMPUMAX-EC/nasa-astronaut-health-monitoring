package nasa.space.app.ec.laikapolizon.domain.baseline

import kotlin.math.sqrt

/**
 * Línea base individual de una métrica: media y desviación estándar muestral.
 * Se calcula con el algoritmo de Welford (estable numéricamente e incremental).
 */
data class MetricBaseline(val count: Int, val mean: Double, private val m2: Double) {

    val standardDeviation: Double
        get() = if (count < 2) 0.0 else sqrt(m2 / (count - 1))

    fun add(value: Double): MetricBaseline {
        val newCount = count + 1
        val delta = value - mean
        val newMean = mean + delta / newCount
        return MetricBaseline(newCount, newMean, m2 + delta * (value - newMean))
    }

    /** Número de desviaciones estándar de [value] respecto a la media, o null si σ = 0. */
    fun zScore(value: Double): Double? {
        val sd = standardDeviation
        return if (sd <= 0.0) null else (value - mean) / sd
    }

    companion object {
        val EMPTY = MetricBaseline(0, 0.0, 0.0)

        fun of(values: Iterable<Double>): MetricBaseline = values.fold(EMPTY) { acc, v -> acc.add(v) }
    }
}
