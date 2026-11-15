package nasa.space.app.ec.laikapolizon.data.local

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import nasa.space.app.ec.laikapolizon.domain.mission.Disclosure
import nasa.space.app.ec.laikapolizon.domain.mission.MissionProfile
import java.time.Clock
import java.time.LocalDate
import java.util.UUID

/**
 * Perfil de misión local. El inicio de la misión es, por defecto, el día del primer arranque;
 * el simulador puede moverlo para presentar la revelación progresiva sin esperar meses.
 */
class MissionProfileStore(context: Context, private val clock: Clock) {
    private val prefs = context.getSharedPreferences("mission_profile", Context.MODE_PRIVATE)
    private val _profile = MutableStateFlow(load())
    val profile: StateFlow<MissionProfile> = _profile.asStateFlow()

    private fun load(): MissionProfile {
        val editor = prefs.edit()
        val id = prefs.getString(KEY_ID, null) ?: UUID.randomUUID().toString().also { editor.putString(KEY_ID, it) }
        val startDay = if (prefs.contains(KEY_START)) prefs.getLong(KEY_START, 0)
        else LocalDate.now(clock).toEpochDay().also { editor.putLong(KEY_START, it) }
        editor.apply()
        val seen = prefs.getStringSet(KEY_SEEN, emptySet()).orEmpty()
            .mapNotNull { name -> Disclosure.entries.firstOrNull { it.name == name } }
            .toSet()
        return MissionProfile(id, LocalDate.ofEpochDay(startDay), seen)
    }

    /** Fija el día de misión actual (demo): mueve la fecha de inicio hacia atrás. */
    fun setMissionDay(day: Int) {
        val start = LocalDate.now(clock).minusDays((day - 1).toLong().coerceAtLeast(0))
        prefs.edit().putLong(KEY_START, start.toEpochDay()).apply()
        _profile.value = load()
    }

    fun markSeen(disclosure: Disclosure) {
        val seen = _profile.value.seenDisclosures + disclosure
        prefs.edit().putStringSet(KEY_SEEN, seen.map { it.name }.toSet()).apply()
        _profile.value = load()
    }

    private companion object {
        const val KEY_ID = "astronaut_id"
        const val KEY_START = "mission_start_epoch_day"
        const val KEY_SEEN = "seen_disclosures"
    }
}
