package nasa.space.app.ec.laikapolizon.ui.companion

import androidx.annotation.StringRes
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.memory.Memory
import nasa.space.app.ec.laikapolizon.domain.mission.Disclosure
import nasa.space.app.ec.laikapolizon.domain.mission.DisclosureKind
import nasa.space.app.ec.laikapolizon.domain.model.Emotion
import nasa.space.app.ec.laikapolizon.ui.avatar.LaikaAvatar
import nasa.space.app.ec.laikapolizon.ui.common.formatNumber
import nasa.space.app.ec.laikapolizon.ui.common.labelRes
import java.time.DayOfWeek
import java.time.format.TextStyle
import java.util.Locale

private val spanish = Locale("es")

/** "domingos", "martes"… (el artículo "los" está en el texto). */
private fun DayOfWeek.pluralSpanish(): String {
    val name = getDisplayName(TextStyle.FULL, spanish)
    return if (name.endsWith("s")) name else name + "s"
}

/** Revelación progresiva: Laika avisa que tiene algo nuevo que contar. */
@Composable
fun DisclosureNotice(unseen: List<Disclosure>, onOpen: (Disclosure) -> Unit) {
    // La más reciente primero: el hito de hoy importa más que una historia atrasada.
    val first = unseen.lastOrNull() ?: return
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            LaikaAvatar(emotion = Emotion.CURIOUS, size = 56.dp)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(stringResource(if (first.kind == DisclosureKind.MILESTONE) R.string.disclosure_new_milestone else R.string.disclosure_new_story),
                    style = MaterialTheme.typography.titleSmall)
                Text(stringResource(first.titleRes()), style = MaterialTheme.typography.bodyMedium)
            }
            Button(onClick = { onOpen(first) }) { Text(stringResource(R.string.disclosure_listen)) }
        }
    }
}

/** Memoria episódica: lo que Laika recuerda y viene al caso hoy. */
@Composable
fun EpisodicRemarks(todayPattern: Memory.WeekdayPattern?, helpful: Memory.HelpfulMission?) {
    if (todayPattern == null && helpful == null) return
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(stringResource(R.string.memory_title), style = MaterialTheme.typography.titleMedium)
            todayPattern?.let { Text(patternText(it), style = MaterialTheme.typography.bodyMedium) }
            helpful?.let { Text(helpfulText(it), style = MaterialTheme.typography.bodyMedium) }
        }
    }
}

@Composable
private fun patternText(p: Memory.WeekdayPattern): String {
    val metric = stringResource(p.type.labelRes()).lowercase(spanish)
    val base = stringResource(
        R.string.memory_weekday, p.dayOfWeek.pluralSpanish(), metric,
        formatNumber(p.weekdayMean), formatNumber(p.overallMean), p.type.unit,
    )
    return p.suggestion?.let { base + " " + stringResource(R.string.memory_weekday_suggestion, it.description) } ?: base
}

@Composable
private fun helpfulText(h: Memory.HelpfulMission): String = stringResource(
    R.string.memory_helpful, h.description, stringResource(h.type.labelRes()).lowercase(spanish),
    formatNumber(h.before), formatNumber(h.after),
)

/** Recuerdos desbloqueados, patrones conocidos y el próximo hito. */
@Composable
fun MemoriesSection(
    missionDay: Int,
    unlocked: List<Disclosure>,
    seen: Set<Disclosure>,
    patterns: List<Memory.WeekdayPattern>,
    onOpen: (Disclosure) -> Unit,
) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(stringResource(R.string.memories_title), style = MaterialTheme.typography.titleMedium)
            unlocked.forEach { d ->
                Row(
                    Modifier.fillMaxWidth().clickable { onOpen(d) }.padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        (if (d in seen) "" else "● ") + stringResource(d.titleRes()),
                        Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium,
                    )
                    Text(stringResource(R.string.disclosure_day, d.unlockDay), style = MaterialTheme.typography.labelSmall)
                }
            }
            Disclosure.next(missionDay)?.let {
                Text(stringResource(R.string.disclosure_next, it.unlockDay - missionDay), style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            if (patterns.isNotEmpty()) {
                Text(stringResource(R.string.memories_patterns), style = MaterialTheme.typography.labelLarge)
                patterns.forEach { Text("• " + patternText(it), style = MaterialTheme.typography.bodySmall) }
            }
        }
    }
}

/** Diálogo con el relato de Laika. */
@Composable
fun DisclosureDialog(disclosure: Disclosure, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = { LaikaAvatar(emotion = if (disclosure.kind == DisclosureKind.MILESTONE) Emotion.JOYFUL else Emotion.CALM, size = 72.dp) },
        title = { Text(stringResource(disclosure.titleRes())) },
        text = { Text(stringResource(disclosure.bodyRes())) },
        confirmButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.disclosure_close)) } },
    )
}

/** Estado del diálogo abierto, guardado por nombre para sobrevivir a la rotación. */
@Composable
fun rememberOpenDisclosure() = rememberSaveable { mutableStateOf<String?>(null) }

@StringRes
private fun Disclosure.titleRes(): Int = when (this) {
    Disclosure.INTRODUCTION -> R.string.disc_intro_title
    Disclosure.MORNING_LIGHT -> R.string.disc_light_title
    Disclosure.BEYOND_NOVELTY -> R.string.disc_novelty_title
    Disclosure.PARABOLIC_FLIGHT -> R.string.disc_parabolic_title
    Disclosure.EARTH_TRAINING -> R.string.disc_training_title
    Disclosure.SHARED_HEARTBEAT -> R.string.disc_heartbeat_title
    Disclosure.PALE_BLUE_DOT -> R.string.disc_dot_title
    Disclosure.HALFWAY_TO_MARS -> R.string.disc_halfway_title
    Disclosure.MARS_ARRIVAL -> R.string.disc_mars_title
    Disclosure.HOMEWARD -> R.string.disc_homeward_title
    Disclosure.EARTH_IN_THE_WINDOW -> R.string.disc_window_title
}

@StringRes
private fun Disclosure.bodyRes(): Int = when (this) {
    Disclosure.INTRODUCTION -> R.string.disc_intro_body
    Disclosure.MORNING_LIGHT -> R.string.disc_light_body
    Disclosure.BEYOND_NOVELTY -> R.string.disc_novelty_body
    Disclosure.PARABOLIC_FLIGHT -> R.string.disc_parabolic_body
    Disclosure.EARTH_TRAINING -> R.string.disc_training_body
    Disclosure.SHARED_HEARTBEAT -> R.string.disc_heartbeat_body
    Disclosure.PALE_BLUE_DOT -> R.string.disc_dot_body
    Disclosure.HALFWAY_TO_MARS -> R.string.disc_halfway_body
    Disclosure.MARS_ARRIVAL -> R.string.disc_mars_body
    Disclosure.HOMEWARD -> R.string.disc_homeward_body
    Disclosure.EARTH_IN_THE_WINDOW -> R.string.disc_window_body
}
