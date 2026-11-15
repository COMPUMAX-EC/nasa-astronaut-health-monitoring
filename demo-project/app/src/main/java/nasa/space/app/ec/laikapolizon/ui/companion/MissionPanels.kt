package nasa.space.app.ec.laikapolizon.ui.companion

import android.content.pm.ApplicationInfo
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.data.local.MissionTimer
import nasa.space.app.ec.laikapolizon.domain.model.Emotion
import nasa.space.app.ec.laikapolizon.domain.model.PrescribedAction
import nasa.space.app.ec.laikapolizon.ui.avatar.LaikaAvatar
import java.time.Instant

/** Acciones con sesión guiada propia. */
const val TIMED_ACTION = "THIGH_CUFFS"
const val AFFECTIVE_ACTION = "AFFECTIVE_CONTACT"
private const val ONE_TAP_ACTION = "VITAMIN_B"

/**
 * Lista de acciones de la intervención terapéutica: las que tienen sesión guiada se inician
 * aquí; las demás se marcan y se cierran con "Misión completada".
 */
@Composable
fun MissionActions(
    actions: List<PrescribedAction>,
    onStartTimer: (PrescribedAction) -> Unit,
    onStartAffective: () -> Unit,
    onComplete: () -> Unit,
) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(stringResource(R.string.mission_title), style = MaterialTheme.typography.titleMedium)
            actions.forEach { action ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(action.description, style = MaterialTheme.typography.bodyMedium)
                        Text(stringResource(R.string.action_minutes, action.estimatedDurationMin), style = MaterialTheme.typography.labelSmall)
                    }
                    Spacer(Modifier.width(8.dp))
                    when (action.actionId) {
                        TIMED_ACTION -> OutlinedButton(onClick = { onStartTimer(action) }) { Text(stringResource(R.string.mission_start_timer)) }
                        AFFECTIVE_ACTION -> OutlinedButton(onClick = onStartAffective) { Text(stringResource(R.string.mission_start_session)) }
                        ONE_TAP_ACTION -> {
                            var taken by rememberSaveable { mutableStateOf(false) }
                            Checkbox(checked = taken, onCheckedChange = { taken = it })
                        }
                    }
                }
            }
            Button(onClick = onComplete, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.mission_complete)) }
        }
    }
}

/**
 * Flujo 3 — sesión cronometrada (45 min de manguitos). El tiempo restante se calcula desde
 * la hora de inicio guardada, así que sobrevive a rotaciones y a cerrar la app.
 */
@Composable
fun MissionTimerSession(
    timer: MissionTimer,
    description: String,
    now: () -> Instant,
    onFinish: () -> Unit,
    onCancel: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var current by rememberSaveable { mutableStateOf(now().toEpochMilli()) }
    LaunchedEffect(timer) {
        while (true) { current = now().toEpochMilli(); delay(1_000) }
    }
    val instant = Instant.ofEpochMilli(current)
    val remaining = timer.remaining(instant)
    val finished = timer.isFinished(instant)
    val progress = 1f - remaining.toMillis().toFloat() / timer.duration.toMillis().coerceAtLeast(1)

    // Laika "hace estiramientos" mientras dura la sesión.
    val transition = rememberInfiniteTransition(label = "stretch")
    val sway by transition.animateFloat(-10f, 10f, infiniteRepeatable(tween(1_800), RepeatMode.Reverse), label = "sway")
    val stretch by transition.animateFloat(0.94f, 1.06f, infiniteRepeatable(tween(1_800), RepeatMode.Reverse), label = "stretchY")

    Column(
        modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(stringResource(R.string.timer_title), style = MaterialTheme.typography.titleLarge)
        Text(description, style = MaterialTheme.typography.bodyMedium)

        Box(contentAlignment = Alignment.Center) {
            // Pista de fondo: el anillo se ve completo aunque el progreso esté en 0 %.
            CircularProgressIndicator(
                progress = 1f, modifier = Modifier.size(220.dp), strokeWidth = 10.dp,
                color = MaterialTheme.colorScheme.surfaceVariant,
            )
            CircularProgressIndicator(progress = progress, modifier = Modifier.size(220.dp), strokeWidth = 10.dp)
            LaikaAvatar(
                emotion = if (finished) Emotion.JOYFUL else Emotion.CALM,
                size = 150.dp,
                modifier = Modifier.graphicsLayer {
                    if (!finished) { rotationZ = sway; scaleY = stretch }
                },
            )
        }

        if (finished) {
            BloomCelebration(points = 10)
            Text(stringResource(R.string.timer_done), style = MaterialTheme.typography.bodyLarge)
            Button(onClick = onFinish, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.timer_register)) }
        } else {
            val minutes = remaining.toMinutes()
            val seconds = remaining.seconds % 60
            Text("%02d:%02d".format(minutes, seconds), style = MaterialTheme.typography.displayMedium)
            Text(stringResource(R.string.timer_relax), style = MaterialTheme.typography.bodyMedium)
            BreathingGuide(size = 120.dp)
            TextButton(onClick = onCancel) { Text(stringResource(R.string.timer_cancel)) }
            // Atajo solo en builds de depuración, para presentar el demo sin esperar 45 min.
            val debuggable = (LocalContext.current.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
            if (debuggable) {
                TextButton(onClick = onFinish) { Text(stringResource(R.string.timer_demo_finish)) }
            }
        }
    }
}
