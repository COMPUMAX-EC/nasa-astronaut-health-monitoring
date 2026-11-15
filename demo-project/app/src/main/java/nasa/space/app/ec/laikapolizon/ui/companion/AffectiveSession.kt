package nasa.space.app.ec.laikapolizon.ui.companion

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.input.pointer.positionChange
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.model.Emotion
import nasa.space.app.ec.laikapolizon.feature.common.Haptics
import nasa.space.app.ec.laikapolizon.ui.avatar.LaikaAvatar

/** Gestos afectivos reconocidos (inspirado en Andreasson et al.). */
enum class AffectiveGesture { CARESS, PRESSURE }

/** Contacto acumulado necesario para completar la sesión. */
private const val TARGET_CONTACT_MS = 20_000L

/**
 * Flujo 4 — contacto afectivo. Mientras el dedo está sobre Laika, el teléfono late a 60 bpm.
 * Deslizar despacio = caricia; mantener sin mover = presión / abrazo.
 */
@Composable
fun AffectiveSession(onComplete: () -> Unit, onClose: () -> Unit, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val slopPx = with(LocalDensity.current) { 24.dp.toPx() }

    var contactMs by rememberSaveable { mutableLongStateOf(0L) }
    var lastGesture by rememberSaveable { mutableStateOf<AffectiveGesture?>(null) }
    var touching by remember { mutableStateOf(false) }
    val done = contactMs >= TARGET_CONTACT_MS

    // Nunca dejar el vibrador encendido al salir de la pantalla.
    DisposableEffect(Unit) { onDispose { Haptics.stop(context) } }

    val emotion = when {
        done -> Emotion.JOYFUL
        touching || contactMs > 0 -> Emotion.CALM
        else -> Emotion.TIRED
    }

    Column(
        modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(stringResource(R.string.affective_title), style = MaterialTheme.typography.titleLarge)
        Text(
            stringResource(if (done) R.string.affective_done else R.string.affective_instructions),
            style = MaterialTheme.typography.bodyLarge,
        )

        Box(
            Modifier
                .size(260.dp)
                .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = if (touching) 0.6f else 0.25f), CircleShape)
                .pointerInput(Unit) {
                    awaitEachGesture {
                        val down = awaitFirstDown()
                        val start = down.uptimeMillis
                        var moved = 0f
                        touching = true
                        Haptics.startHeartbeatLoop(context)
                        while (true) {
                            val event = awaitPointerEvent()
                            val change = event.changes.firstOrNull { it.id == down.id } ?: break
                            moved += change.positionChange().getDistance()
                            change.consume()
                            if (!change.pressed) {
                                val duration = change.uptimeMillis - start
                                contactMs += duration
                                lastGesture = if (moved > slopPx) AffectiveGesture.CARESS else AffectiveGesture.PRESSURE
                                break
                            }
                        }
                        touching = false
                        Haptics.stop(context)
                    }
                },
            contentAlignment = Alignment.Center,
        ) {
            LaikaAvatar(emotion = emotion, size = 200.dp)
        }

        lastGesture?.let {
            Text(
                stringResource(if (it == AffectiveGesture.CARESS) R.string.affective_caress else R.string.affective_pressure),
                style = MaterialTheme.typography.bodyMedium,
            )
        }
        LinearProgressIndicator(
            progress = (contactMs.toFloat() / TARGET_CONTACT_MS).coerceIn(0f, 1f),
            modifier = Modifier.fillMaxWidth(),
        )

        if (done) {
            // Sugerencia de conexión biocultural (Flujo 4, paso 4).
            Text(stringResource(R.string.affective_suggestion), style = MaterialTheme.typography.bodyMedium)
            Button(onClick = onComplete, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.affective_complete)) }
        }
        TextButton(onClick = onClose) { Text(stringResource(R.string.affective_back)) }
    }
}
