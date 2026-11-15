package nasa.space.app.ec.laikapolizon.domain

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import nasa.space.app.ec.laikapolizon.data.simulator.Scenario
import nasa.space.app.ec.laikapolizon.data.simulator.ScenarioSimulator
import nasa.space.app.ec.laikapolizon.domain.analysis.HealthAnalyzer
import nasa.space.app.ec.laikapolizon.domain.bodymap.BodyMap
import nasa.space.app.ec.laikapolizon.domain.bodymap.BodyRegion
import nasa.space.app.ec.laikapolizon.domain.bodymap.Trend
import nasa.space.app.ec.laikapolizon.domain.care.CareEvent
import nasa.space.app.ec.laikapolizon.domain.care.CareKind
import nasa.space.app.ec.laikapolizon.domain.care.CareRepository
import nasa.space.app.ec.laikapolizon.domain.engine.LaikaEngine
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementSource
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset

class FakeCareRepository : CareRepository {
    val events = MutableStateFlow<List<CareEvent>>(emptyList())
    override fun observeAll(): Flow<List<CareEvent>> = events
    override suspend fun add(event: CareEvent) { events.value = events.value + event }
}

class CareEventsTest {

    private val clock = Clock.fixed(Instant.parse("2026-11-14T12:00:00Z"), ZoneOffset.UTC)
    private val repository = FakeMeasurementRepository()
    private val care = FakeCareRepository()
    private val engine = LaikaEngine(repository, care, clock = clock)

    private fun TestScope.start() { engine.start(backgroundScope); runCurrent() }
    private val kinds get() = care.events.value.map { it.kind }

    private suspend fun logGlucose() = repository.add(
        MeasurementRecord(timestamp = clock.instant(), type = MeasurementType.GLUCOSE, value = 95.0, source = MeasurementSource.MANUAL)
    )

    @Test fun `morning check-in earns 10 points once`() = runTest {
        start()
        logGlucose(); runCurrent()
        logGlucose(); runCurrent() // un segundo registro el mismo día no suma otra vez
        assertEquals(listOf(CareKind.MORNING_CHECKIN), kinds)
        assertEquals(10, care.events.value.single().points)
    }

    @Test fun `check-in already done at startup earns nothing`() = runTest {
        logGlucose()
        start()
        assertTrue(kinds.isEmpty())
    }

    @Test fun `postponing a micro-interaction earns nothing`() = runTest {
        start()
        assertEquals(SystemState.MICRO_INTERACTION, engine.status.value.event.currentSystemState)
        engine.completeCurrentAction(); runCurrent()
        assertTrue(kinds.isEmpty())
    }

    @Test fun `completed intervention is logged with its actions`() = runTest {
        ScenarioSimulator(clock).load(Scenario.SANS, repository)
        logGlucose()
        start()
        engine.completeCurrentAction(); runCurrent()
        val event = care.events.value.single()
        assertEquals(CareKind.MISSION_COMPLETED, event.kind)
        assertTrue("THIGH_CUFFS" in event.actionIds)
    }

    @Test fun `critical protocol is logged when confirmed after normalizing`() = runTest {
        ScenarioSimulator(clock).load(Scenario.RADIATION_SPIKE, repository)
        logGlucose()
        start()
        ScenarioSimulator(clock).load(Scenario.NOMINAL, repository); runCurrent()
        engine.completeCurrentAction(); runCurrent()
        assertEquals(listOf(CareKind.CRITICAL_PROTOCOL), kinds)
    }
}

class BodyMapTest {

    private val clock = Clock.fixed(Instant.parse("2026-11-14T12:00:00Z"), ZoneOffset.UTC)

    @Test fun `SANS highlights head and legs`() {
        val records = ScenarioSimulator(clock).generate(Scenario.SANS)
        val findings = HealthAnalyzer().assess(records, clock.instant(), clock.zone).deviations
        assertEquals(setOf(BodyRegion.HEAD, BodyRegion.LEGS), BodyMap.flaggedRegions(findings))
    }

    @Test fun `region summary has latest value, trend and actions`() {
        val records = ScenarioSimulator(clock).generate(Scenario.SANS)
        val findings = HealthAnalyzer().assess(records, clock.instant(), clock.zone).deviations
        val head = BodyMap.summarize(BodyRegion.HEAD, records, findings, clock.instant())

        assertTrue(head.flagged)
        val vision = head.metrics.first { it.type == MeasurementType.VISION_CLARITY }
        assertEquals(6.5, vision.latest!!.value, 1e-9)
        assertEquals(Trend.DOWN, vision.trend)
        assertTrue(head.actions.any { it.actionId == "THIGH_CUFFS" })
    }

    @Test fun `nominal body has no flagged regions`() {
        val records = ScenarioSimulator(clock).generate(Scenario.NOMINAL)
        val findings = HealthAnalyzer().assess(records, clock.instant(), clock.zone).deviations
        assertTrue(BodyMap.flaggedRegions(findings).isEmpty())
    }
}
