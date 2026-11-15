package nasa.space.app.ec.laikapolizon.domain

import nasa.space.app.ec.laikapolizon.domain.analysis.FindingKind
import nasa.space.app.ec.laikapolizon.domain.analysis.HealthAnalyzer
import nasa.space.app.ec.laikapolizon.domain.model.Hazard
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementSource
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Duration
import java.time.Instant
import java.time.ZoneOffset

class HealthAnalyzerTest {

    private val now = Instant.parse("2026-11-14T12:00:00Z")
    private val zone = ZoneOffset.UTC
    private val analyzer = HealthAnalyzer()
    private var nextId = 1L

    /** Una lectura diaria por valor; la última es de hace 1 h. */
    private fun daily(type: MeasurementType, vararg values: Double, source: MeasurementSource = MeasurementSource.SIMULATED) =
        values.mapIndexed { i, v ->
            val ago = Duration.ofDays((values.size - 1 - i).toLong()).plusHours(1)
            MeasurementRecord(id = nextId++, timestamp = now - ago, type = type, value = v, source = source)
        }

    private val stableHrv = doubleArrayOf(55.0, 57.0, 53.0, 56.0, 54.0, 55.0, 56.0, 54.0)

    @Test fun `stable series produces no findings`() {
        val a = analyzer.assess(daily(MeasurementType.HRV, *stableHrv, 55.0, 56.0, 55.0), now, zone)
        assertTrue(a.deviations.isEmpty())
        assertTrue(a.criticalFindings.isEmpty())
    }

    @Test fun `drop beyond 1_5 sigma is a deviation`() {
        val a = analyzer.assess(daily(MeasurementType.HRV, *stableHrv, 55.0, 54.0, 40.0), now, zone)
        assertEquals(FindingKind.SIGMA_DEVIATION, a.deviations.single().kind)
        assertEquals(Hazard.PSYCHOSOCIAL, a.deviations.single().hazard)
    }

    @Test fun `deviation in the harmless direction is ignored`() {
        val a = analyzer.assess(daily(MeasurementType.HRV, *stableHrv, 55.0, 56.0, 75.0), now, zone)
        assertTrue(a.deviations.isEmpty())
    }

    @Test fun `three consecutive worsenings are a negative trend`() {
        // Sin historial suficiente para la línea base: solo puede dispararse la regla de tendencia.
        val a = analyzer.assess(daily(MeasurementType.SLEEP_DURATION, 7.5, 7.0, 6.8, 6.6), now, zone)
        assertEquals(FindingKind.NEGATIVE_TREND, a.deviations.single().kind)
    }

    @Test fun `two worsenings are not a trend`() {
        val a = analyzer.assess(daily(MeasurementType.SLEEP_DURATION, 7.5, 7.6, 7.0, 6.8), now, zone)
        assertTrue(a.deviations.isEmpty())
    }

    @Test fun `snoozed hazards do not produce deviations`() {
        val records = daily(MeasurementType.HRV, *stableHrv, 55.0, 54.0, 40.0)
        val a = analyzer.assess(records, now, zone, snoozedHazards = setOf(Hazard.PSYCHOSOCIAL))
        assertTrue(a.deviations.isEmpty())
    }

    @Test fun `out of range heart rate is critical`() {
        val a = analyzer.assess(daily(MeasurementType.HEART_RATE, 65.0, 170.0), now, zone)
        assertEquals(FindingKind.CRITICAL_THRESHOLD, a.criticalFindings.single().kind)
    }

    @Test fun `stale critical reading is ignored`() {
        val old = MeasurementRecord(id = 99, timestamp = now - Duration.ofDays(2), type = MeasurementType.HEART_RATE,
            value = 170.0, source = MeasurementSource.SENSOR)
        assertTrue(analyzer.assess(listOf(old), now, zone).criticalFindings.isEmpty())
    }

    @Test fun `sustained neutron increase over 30 percent is critical`() {
        val background = DoubleArray(10) { 6.0 }
        val a = analyzer.assess(daily(MeasurementType.NEUTRON_DOSE_RATE, *background, 8.0, 8.2), now, zone)
        assertEquals(FindingKind.RADIATION_SPIKE, a.criticalFindings.single().kind)
    }

    @Test fun `single neutron spike is not sustained`() {
        val background = DoubleArray(10) { 6.0 }
        val a = analyzer.assess(daily(MeasurementType.NEUTRON_DOSE_RATE, *background, 6.0, 9.0), now, zone)
        assertTrue(a.criticalFindings.isEmpty())
    }

    @Test fun `routine is due until a manual glucose or pressure reading today`() {
        assertTrue(analyzer.assess(emptyList(), now, zone).routineDue)
        val simulatedOnly = daily(MeasurementType.GLUCOSE, 95.0)
        assertTrue(analyzer.assess(simulatedOnly, now, zone).routineDue)
        val manual = daily(MeasurementType.GLUCOSE, 95.0, source = MeasurementSource.MANUAL)
        assertFalse(analyzer.assess(manual, now, zone).routineDue)
    }

    @Test fun `corrected records are replaced by their correction`() {
        val wrong = MeasurementRecord(id = 1, timestamp = now - Duration.ofMinutes(10), type = MeasurementType.HEART_RATE,
            value = 170.0, source = MeasurementSource.VOICE)
        val fixed = wrong.copy(id = 2, timestamp = now - Duration.ofMinutes(5), value = 70.0, supersedesId = 1)
        assertTrue(analyzer.assess(listOf(wrong, fixed), now, zone).criticalFindings.isEmpty())
    }
}
