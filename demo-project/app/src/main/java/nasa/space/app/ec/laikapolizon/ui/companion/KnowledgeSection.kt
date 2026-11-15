package nasa.space.app.ec.laikapolizon.ui.companion

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.knowledge.DaySummary
import nasa.space.app.ec.laikapolizon.domain.knowledge.KnowledgeNote
import nasa.space.app.ec.laikapolizon.ui.common.ChatTexts
import java.time.ZoneId
import java.time.format.DateTimeFormatter

private val timeFormat = DateTimeFormatter.ofPattern("dd/MM HH:mm").withZone(ZoneId.systemDefault())

/**
 * Lo que Laika aprendió del contexto social. Transparente y borrable: el astronauta ve cada nota
 * y puede olvidarla. No se exporta al Flight Surgeon.
 */
@Composable
fun KnowledgeSection(
    notes: List<KnowledgeNote>,
    today: DaySummary,
    onForget: (KnowledgeNote) -> Unit,
    onForgetAll: () -> Unit,
) {
    val context = LocalContext.current
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(stringResource(R.string.knowledge_title), style = MaterialTheme.typography.titleMedium)
            if (notes.isEmpty()) {
                Text(stringResource(R.string.knowledge_empty), style = MaterialTheme.typography.bodyMedium)
            } else {
                if (!today.isEmpty) Text(ChatTexts.day(context, today), style = MaterialTheme.typography.bodyMedium)
                notes.take(MAX_SHOWN).forEach { note ->
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(ChatTexts.note(context, note), style = MaterialTheme.typography.bodySmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
                            Text(timeFormat.format(note.timestamp), style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        TextButton(onClick = { onForget(note) }) { Text(stringResource(R.string.knowledge_forget)) }
                    }
                }
                TextButton(onClick = onForgetAll) { Text(stringResource(R.string.knowledge_forget_all)) }
            }
            Text(stringResource(R.string.knowledge_privacy), style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

private const val MAX_SHOWN = 8
