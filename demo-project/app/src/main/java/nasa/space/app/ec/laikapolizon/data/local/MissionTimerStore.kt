package nasa.space.app.ec.laikapolizon.data.local

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.time.Duration
import java.time.Instant

/** Sesión cronometrada de una misión (p. ej. 45 min de thigh cuffs, Flujo 3). */
data class MissionTimer(val actionId: String, val startedAt: Instant, val duration: Duration) {
    val endsAt: Instant get() = startedAt + duration
    fun remaining(now: Instant): Duration = Duration.between(now, endsAt).coerceAtLeast(Duration.ZERO)
    fun isFinished(now: Instant) = !now.isBefore(endsAt)
}

/**
 * Persiste la hora de inicio del temporizador: el tiempo restante se calcula siempre desde ella,
 * así que sobrevive a rotaciones, a cerrar la app y a que Android mate el proceso.
 */
class MissionTimerStore(context: Context) {
    private val prefs = context.getSharedPreferences("mission_timer", Context.MODE_PRIVATE)
    private val _timer = MutableStateFlow(read())
    val timer: StateFlow<MissionTimer?> = _timer.asStateFlow()

    fun start(actionId: String, duration: Duration, now: Instant) {
        prefs.edit()
            .putString(KEY_ACTION, actionId)
            .putLong(KEY_START, now.toEpochMilli())
            .putLong(KEY_DURATION, duration.toMillis())
            .apply()
        _timer.value = read()
    }

    fun clear() {
        prefs.edit().clear().apply()
        _timer.value = null
    }

    private fun read(): MissionTimer? {
        val action = prefs.getString(KEY_ACTION, null) ?: return null
        return MissionTimer(
            actionId = action,
            startedAt = Instant.ofEpochMilli(prefs.getLong(KEY_START, 0)),
            duration = Duration.ofMillis(prefs.getLong(KEY_DURATION, 0)),
        )
    }

    private companion object {
        const val KEY_ACTION = "action"
        const val KEY_START = "start"
        const val KEY_DURATION = "duration"
    }
}
