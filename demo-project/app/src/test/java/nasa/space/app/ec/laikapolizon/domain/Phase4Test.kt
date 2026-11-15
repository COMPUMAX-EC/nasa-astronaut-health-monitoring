package nasa.space.app.ec.laikapolizon.domain

import nasa.space.app.ec.laikapolizon.data.simulator.Scenario
import nasa.space.app.ec.laikapolizon.data.simulator.ScenarioSimulator
import nasa.space.app.ec.laikapolizon.domain.analysis.HealthAnalyzer
import nasa.space.app.ec.laikapolizon.domain.care.CareEvent
import nasa.space.app.ec.laikapolizon.domain.care.CareKind
import nasa.space.app.ec.laikapolizon.domain.export.FlightSurgeonReport
import nasa.space.app.ec.laikapolizon.domain.export.Json
import nasa.space.app.ec.laikapolizon.domain.memory.EpisodicMemory
import nasa.space.app.ec.laikapolizon.domain.mission.Disclosure
import nasa.space.app.ec.laikapolizon.domain.mission.MissionCalendar
import nasa.space.app.ec.laikapolizon.domain.model.Emotion
import nasa.space.app.ec.laikapolizon.domain.model.LaikaStateEvent
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementSource
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset

class DisclosureTest {

    @Test fun `mission day starts at 1`() {
        val now = Instant.parse("2026-11-15T12:00:00Z")
        assertEquals(1, MissionCalendar.missionDay(LocalDate.of(2026, 11, 15), now, ZoneOffset.UTC))
        assertEquals(91, MissionCalendar.missionDay(LocalDate.of(2026, 8, 17), now, ZoneOffset.UTC))
    }

    @Test fun `stories unlock progressively`() {
        assertEquals(listOf(Disclosure.INTRODUCTION), Disclosure.unlocked(1))
        assertEquals(Disclosure.MORNING_LIGHT, Disclosure.next(1))
        assertTrue(Disclosure.EARTH_TRAINING in Disclosure.unlocked(90))
        assertFalse(Disclosure.HALFWAY_TO_MARS in Disclosure.unlocked(364))
        assertTrue(Disclosure.HALFWAY_TO_MARS in Disclosure.unlocked(365))
        assertNull(Disclosure.next(1_000))
    }

    @Test fun `unseen excludes what was already opened`() =
        assertEquals(listOf(Disclosure.MORNING_LIGHT), Disclosure.unseen(7, setOf(Disclosure.INTRODUCTION)))
}

class EpisodicMemoryTest {

    private val clock = Clock.fixed(Instant.parse("2026-11-15T12:00:00Z"), ZoneOffset.UTC)
    private val memory = EpisodicMemory()

    @Test fun `weekly sleep pattern is remembered for today's weekday`() {
        val records = ScenarioSimulator(clock).generate(Scenario.WEEKLY_PATTERN)
        val patterns = memory.weekdayPatterns(records, clock.instant(), clock.zone)
        val sleep = patterns.single()
        assertEquals(MeasurementType.SLEEP_DURATION, sleep.type)
        assertEquals(LocalDate.ofInstant(clock.instant(), clock.zone).dayOfWeek, sleep.dayOfWeek)
        assertTrue(sleep.weekdayMean < sleep.overallMean)
        assertEquals("SLEEP_WIND_DOWN", sleep.suggestion?.actionId)
    }

    @Test fun `weekly pattern scenario does not trigger an intervention`() {
        val records = ScenarioSimulator(clock).generate(Scenario.WEEKLY_PATTERN)
        val a = HealthAnalyzer().assess(records, clock.instant(), clock.zone)
        assertTrue("desviaciones: ${a.deviations}", a.deviations.isEmpty())
        assertTrue(a.criticalFindings.isEmpty())
    }

    @Test fun `short history has no weekly patterns`() {
        val records = ScenarioSimulator(clock).generate(Scenario.NOMINAL)
        assertTrue(memory.weekdayPatterns(records, clock.instant(), clock.zone).isEmpty())
    }

    @Test fun `mission followed by improvement is remembered`() {
        val t = clock.instant()
        fun vision(id: Long, at: Instant, v: Double) =
            MeasurementRecord(id = id, timestamp = at, type = MeasurementType.VISION_CLARITY, value = v, source = MeasurementSource.MANUAL)
        val records = listOf(vision(1, t - Duration.ofHours(2), 6.5), vision(2, t + Duration.ofHours(20), 8.4))
        val care = listOf(CareEvent(timestamp = t, kind = CareKind.MISSION_COMPLETED, actionIds = listOf("THIGH_CUFFS", "VITAMIN_B")))

        val helpful = memory.helpfulMissions(records, care)
        assertEquals(listOf("THIGH_CUFFS", "VITAMIN_B"), helpful.map { it.actionId })
        assertEquals(6.5, helpful.first().before, 1e-9)
        assertEquals(8.4, helpful.first().after, 1e-9)
    }

    @Test fun `mission without improvement is not remembered as helpful`() {
        val t = clock.instant()
        val records = listOf(
            MeasurementRecord(id = 1, timestamp = t - Duration.ofHours(2), type = MeasurementType.VISION_CLARITY, value = 7.0, source = MeasurementSource.MANUAL),
            MeasurementRecord(id = 2, timestamp = t + Duration.ofHours(5), type = MeasurementType.VISION_CLARITY, value = 6.0, source = MeasurementSource.MANUAL),
        )
        val care = listOf(CareEvent(timestamp = t, kind = CareKind.MISSION_COMPLETED, actionIds = listOf("THIGH_CUFFS")))
        assertTrue(memory.helpfulMissions(records, care).isEmpty())
    }
}

class FlightSurgeonReportTest {

    private val now = Instant.parse("2026-11-15T12:00:00Z")

    @Test fun `json escapes text and omits nulls`() {
        val json = Json.encode(mapOf("a" to "di \"sí\"\nok", "b" to null, "c" to listOf(1, 2.5, true)), indent = 0)
        assertEquals("""{"a":"di \"sí\"\nok","c":[1,2.5,true]}""", json)
    }

    @Test fun `report uses schema field names and keeps corrections`() {
        val wrong = MeasurementRecord(id = 1, timestamp = now - Duration.ofMinutes(10), type = MeasurementType.GLUCOSE,
            value = 300.0, source = MeasurementSource.VOICE, rawTranscript = "glucosa trescientos")
        val fixed = wrong.copy(id = 2, timestamp = now - Duration.ofMinutes(5), value = 130.0, supersedesId = 1, source = MeasurementSource.MANUAL)
        val state = LaikaStateEvent(now, SystemState.PERIPHERAL_PASSIVE, 72.0, Emotion.JOYFUL)

        val json = FlightSurgeonReport.build("astro-1", 12, now, state, listOf(wrong, fixed),
            listOf(CareEvent(timestamp = now, kind = CareKind.MORNING_CHECKIN, actionIds = listOf("MORNING_CHECKIN"))))

        listOf(
            "\"astronaut_id\": \"astro-1\"", "\"mission_day\": 12", "\"current_system_state\": \"PERIPHERAL_PASSIVE\"",
            "\"blood_glucose_mg_dl\": 130.0", "\"raw_transcript\": \"glucosa trescientos\"", "\"supersedes_id\": 1",
            "\"superseded\": true", "\"kind\": \"MORNING_CHECKIN\"",
        ).forEach { assertTrue("falta $it", it in json) }
        // La lectura corregida no aparece como valor vigente en la telemetría.
        assertFalse("\"blood_glucose_mg_dl\": 300.0" in json)
    }
}
