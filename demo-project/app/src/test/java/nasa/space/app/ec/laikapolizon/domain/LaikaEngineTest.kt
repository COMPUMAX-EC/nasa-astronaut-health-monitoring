package nasa.space.app.ec.laikapolizon.domain

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import nasa.space.app.ec.laikapolizon.data.simulator.Scenario
import nasa.space.app.ec.laikapolizon.data.simulator.ScenarioSimulator
import nasa.space.app.ec.laikapolizon.domain.engine.LaikaEngine
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementSource
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.domain.repository.MeasurementRepository
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset

class FakeMeasurementRepository : MeasurementRepository {
    val records = MutableStateFlow<List<MeasurementRecord>>(emptyList())
    private var nextId = 1L

    override fun observeAll(): Flow<List<MeasurementRecord>> = records

    override suspend fun add(record: MeasurementRecord): Long {
        val id = nextId++
        records.value = records.value + record.copy(id = id)
        return id
    }

    override suspend fun addAll(records: List<MeasurementRecord>) = records.forEach { add(it) }

    override suspend fun correct(original: MeasurementRecord, newValue: Double, newSecondaryValue: Double?): Long =
        add(original.copy(id = 0, value = newValue, secondaryValue = newSecondaryValue, supersedesId = original.id))

    override suspend fun deleteBySource(source: MeasurementSource) {
        records.value = records.value.filterNot { it.source == source }
    }
}

class LaikaEngineTest {

    private val clock = Clock.fixed(Instant.parse("2026-11-14T12:00:00Z"), ZoneOffset.UTC)
    private val repository = FakeMeasurementRepository()
    private val engine = LaikaEngine(repository, clock = clock)

    private fun TestScope.startEngine() {
        engine.start(backgroundScope)
        runCurrent()
    }

    private val state get() = engine.status.value.event.currentSystemState

    @Test fun `pending morning check-in triggers a micro-interaction`() = runTest {
        startEngine()
        assertEquals(SystemState.MICRO_INTERACTION, state)
        assertEquals("MORNING_CHECKIN", engine.status.value.event.prescribedActions.single().actionId)
    }

    @Test fun `logging glucose closes the micro-interaction`() = runTest {
        startEngine()
        repository.add(MeasurementRecord(timestamp = clock.instant(), type = MeasurementType.GLUCOSE, value = 95.0,
            source = MeasurementSource.MANUAL))
        runCurrent()
        assertEquals(SystemState.PERIPHERAL_PASSIVE, state)
    }

    @Test fun `focused app in the foreground blocks interruptions`() = runTest {
        engine.setFocusedAppActive(true)
        startEngine()
        assertEquals(SystemState.PERIPHERAL_PASSIVE, state)
        assertEquals(false, engine.status.value.opportuneMoment)
        assertEquals(true, engine.status.value.userAvailable)

        engine.setFocusedAppActive(false)
        runCurrent()
        assertEquals(SystemState.MICRO_INTERACTION, state)
    }

    @Test fun `no interruption when the astronaut is busy`() = runTest {
        engine.setUserAvailable(false)
        startEngine()
        assertEquals(SystemState.PERIPHERAL_PASSIVE, state)
    }

    @Test fun `completed intervention returns to periphery and stays there`() = runTest {
        ScenarioSimulator(clock).load(Scenario.SANS, repository)
        logCheckIn()
        startEngine()
        assertEquals(SystemState.THERAPEUTIC_INTERVENTION, state)
        assertTrue(engine.status.value.event.prescribedActions.any { it.actionId == "THIGH_CUFFS" })

        engine.completeCurrentAction()
        runCurrent()
        assertEquals(SystemState.PERIPHERAL_PASSIVE, state)

        // Nueva evaluación (p. ej. llega otro dato): el peligro silenciado no vuelve a interrumpir.
        engine.setUserAvailable(false); runCurrent()
        engine.setUserAvailable(true); runCurrent()
        assertEquals(SystemState.PERIPHERAL_PASSIVE, state)
    }

    @Test fun `radiation spike is critical even when busy and cannot be dismissed`() = runTest {
        engine.setUserAvailable(false)
        ScenarioSimulator(clock).load(Scenario.RADIATION_SPIKE, repository)
        startEngine()
        assertEquals(SystemState.CRITICAL_ALERT, state)

        engine.completeCurrentAction()
        runCurrent()
        assertEquals(SystemState.CRITICAL_ALERT, state)

        // D8: al normalizarse la lectura sigue en alerta, pero pide confirmación explícita.
        ScenarioSimulator(clock).load(Scenario.NOMINAL, repository)
        runCurrent()
        assertEquals(SystemState.CRITICAL_ALERT, state)
        assertEquals("CONFIRM_ALL_CLEAR", engine.status.value.event.prescribedActions.single().actionId)
        engine.completeCurrentAction()
        runCurrent()
        assertEquals(SystemState.PERIPHERAL_PASSIVE, state)
    }

    private suspend fun logCheckIn() = repository.add(
        MeasurementRecord(timestamp = clock.instant(), type = MeasurementType.GLUCOSE, value = 95.0, source = MeasurementSource.MANUAL)
    )
}
