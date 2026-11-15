package nasa.space.app.ec.laikapolizon.data

import nasa.space.app.ec.laikapolizon.data.simulator.Scenario
import nasa.space.app.ec.laikapolizon.data.simulator.ScenarioSimulator
import nasa.space.app.ec.laikapolizon.domain.analysis.HealthAnalyzer
import nasa.space.app.ec.laikapolizon.domain.model.Hazard
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementSource
import nasa.space.app.ec.laikapolizon.domain.vitality.VitalityCalculator
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset

/** Verifica que cada escenario del demo dispare exactamente lo que promete. */
class ScenarioSimulatorTest {

    private val clock = Clock.fixed(Instant.parse("2026-11-14T12:00:00Z"), ZoneOffset.UTC)
    private val simulator = ScenarioSimulator(clock)
    private val analyzer = HealthAnalyzer()

    private fun assess(scenario: Scenario) =
        analyzer.assess(simulator.generate(scenario), clock.instant(), clock.zone)

    @Test fun `all generated records are simulated and not in the future`() {
        val records = simulator.generate(Scenario.NOMINAL)
        assertTrue(records.all { it.source == MeasurementSource.SIMULATED && !it.timestamp.isAfter(clock.instant()) })
    }

    @Test fun `nominal has no findings and good vitality`() {
        val a = assess(Scenario.NOMINAL)
        assertTrue("desviaciones: ${a.deviations}", a.deviations.isEmpty())
        assertTrue(a.criticalFindings.isEmpty())
        assertTrue(a.vitality >= VitalityCalculator.HIGH_THRESHOLD)
    }

    @Test fun `poor sleep flags sleep and lowers vitality`() {
        val a = assess(Scenario.POOR_SLEEP)
        assertTrue(Hazard.SLEEP in a.deviations.map { it.hazard })
        assertTrue(a.criticalFindings.isEmpty())
        assertTrue(a.vitality < assess(Scenario.NOMINAL).vitality)
    }

    @Test fun `radiation spike is critical`() {
        val a = assess(Scenario.RADIATION_SPIKE)
        assertEquals(Hazard.RADIATION, a.criticalFindings.single().hazard)
    }

    @Test fun `sans flags vision only`() {
        val a = assess(Scenario.SANS)
        assertEquals(setOf(Hazard.SANS), a.deviations.map { it.hazard }.toSet())
    }

    @Test fun `low mood flags psychosocial stress`() {
        val a = assess(Scenario.LOW_MOOD)
        assertTrue(Hazard.PSYCHOSOCIAL in a.deviations.map { it.hazard })
        assertTrue(a.criticalFindings.isEmpty())
    }
}
