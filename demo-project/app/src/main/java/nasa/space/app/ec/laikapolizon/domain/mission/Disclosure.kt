package nasa.space.app.ec.laikapolizon.domain.mission

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.ChronoUnit

/** Perfil de la misión de este dispositivo (un astronauta por dispositivo, D6). */
data class MissionProfile(
    val astronautId: String,
    val missionStart: LocalDate,
    /** Revelaciones que el astronauta ya abrió. */
    val seenDisclosures: Set<Disclosure> = emptySet(),
)

object MissionCalendar {
    /** Día de misión, empezando en 1 el día de inicio. */
    fun missionDay(start: LocalDate, now: Instant, zone: ZoneId): Int =
        ChronoUnit.DAYS.between(start, now.atZone(zone).toLocalDate()).toInt().coerceAtLeast(0) + 1
}

enum class DisclosureKind {
    /** Laika cuenta algo de sí misma (self-disclosure). */
    STORY,
    /** Laika muestra un rasgo nuevo de personalidad. */
    TRAIT,
    /** Hito de la misión que Laika celebra. */
    MILESTONE,
}

/**
 * Revelación progresiva (docs/04 §4.2): Laika no muestra todo su repertorio desde el inicio.
 * Cada entrada se desbloquea en un día de misión; el texto vive en strings.xml.
 * Cubre ~1.000 días para sostener el vínculo en un viaje a Marte (contra el efecto novedad).
 */
enum class Disclosure(val unlockDay: Int, val kind: DisclosureKind) {
    INTRODUCTION(1, DisclosureKind.STORY),
    MORNING_LIGHT(7, DisclosureKind.TRAIT),
    BEYOND_NOVELTY(14, DisclosureKind.TRAIT),
    PARABOLIC_FLIGHT(30, DisclosureKind.STORY),
    EARTH_TRAINING(90, DisclosureKind.STORY), // spec: "Mes 3: recuerdos de entrenamiento en la Tierra"
    SHARED_HEARTBEAT(180, DisclosureKind.TRAIT),
    PALE_BLUE_DOT(270, DisclosureKind.STORY),
    HALFWAY_TO_MARS(365, DisclosureKind.MILESTONE), // spec: "Mes 12: mitad de camino a Marte"
    MARS_ARRIVAL(540, DisclosureKind.MILESTONE),
    HOMEWARD(730, DisclosureKind.MILESTONE),
    EARTH_IN_THE_WINDOW(900, DisclosureKind.STORY),
    ;

    companion object {
        fun unlocked(missionDay: Int): List<Disclosure> = entries.filter { it.unlockDay <= missionDay }

        fun next(missionDay: Int): Disclosure? = entries.firstOrNull { it.unlockDay > missionDay }

        /** Desbloqueadas que el astronauta aún no abrió (Laika dice "tengo algo que contarte"). */
        fun unseen(missionDay: Int, seen: Set<Disclosure>): List<Disclosure> = unlocked(missionDay).filterNot { it in seen }
    }
}
