package nasa.space.app.ec.laikapolizon.domain

import nasa.space.app.ec.laikapolizon.domain.baseline.MetricBaseline
import nasa.space.app.ec.laikapolizon.domain.model.Emotion
import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.domain.statemachine.LaikaBehavior
import nasa.space.app.ec.laikapolizon.domain.vitality.VitalityCalculator
import nasa.space.app.ec.laikapolizon.domain.vitality.VitalityInputs
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class VitalityAndBaselineTest {

    private val calculator = VitalityCalculator()

    @Test fun `ideal inputs give full vitality`() =
        assertEquals(100.0, calculator.calculate(VitalityInputs(8.0, 100.0, 120.0, 5.0)), 1e-9)

    @Test fun `worst inputs give zero vitality`() =
        assertEquals(0.0, calculator.calculate(VitalityInputs(0.0, 20.0, 0.0, 25.0)), 1e-9)

    @Test fun `no data gives neutral vitality`() =
        assertEquals(VitalityCalculator.NEUTRAL, calculator.calculate(VitalityInputs()), 1e-9)

    @Test fun `missing terms are renormalized`() {
        // Solo sueño: 4 h → 0.5 → 50, independientemente del peso.
        assertEquals(50.0, calculator.calculate(VitalityInputs(sleepHours = 4.0)), 1e-9)
    }

    @Test fun `high cortisol lowers vitality`() {
        val calm = calculator.calculate(VitalityInputs(7.0, 60.0, 90.0, cortisolNmolL = 8.0))
        val stressed = calculator.calculate(VitalityInputs(7.0, 60.0, 90.0, cortisolNmolL = 22.0))
        assertTrue(stressed < calm)
    }

    @Test fun `baseline mean and standard deviation`() {
        val b = MetricBaseline.of(listOf(2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0))
        assertEquals(5.0, b.mean, 1e-9)
        assertEquals(2.138, b.standardDeviation, 1e-3) // desviación muestral (n − 1)
        assertEquals(1.0, b.zScore(5.0 + b.standardDeviation)!!, 1e-9)
    }

    @Test fun `zScore is null without variance`() =
        assertNull(MetricBaseline.of(listOf(3.0, 3.0, 3.0)).zScore(4.0))

    @Test fun `emotion follows state and vitality`() {
        assertEquals(Emotion.PROTECTIVE, LaikaBehavior.emotionFor(SystemState.CRITICAL_ALERT, 90.0))
        assertEquals(Emotion.JOYFUL, LaikaBehavior.emotionFor(SystemState.PERIPHERAL_PASSIVE, 80.0))
        assertEquals(Emotion.CALM, LaikaBehavior.emotionFor(SystemState.PERIPHERAL_PASSIVE, 50.0))
        assertEquals(Emotion.TIRED, LaikaBehavior.emotionFor(SystemState.PERIPHERAL_PASSIVE, 30.0))
        assertEquals(Emotion.CURIOUS, LaikaBehavior.emotionFor(SystemState.MICRO_INTERACTION, 70.0))
        assertEquals(Emotion.CONCERNED, LaikaBehavior.emotionFor(SystemState.THERAPEUTIC_INTERVENTION, 50.0))
    }
}
