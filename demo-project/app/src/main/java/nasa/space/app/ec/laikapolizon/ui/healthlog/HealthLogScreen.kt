package nasa.space.app.ec.laikapolizon.ui.healthlog

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.care.CareEvent
import nasa.space.app.ec.laikapolizon.domain.care.CareKind
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.validation.ValidationIssue
import nasa.space.app.ec.laikapolizon.ui.HealthLogViewModel
import nasa.space.app.ec.laikapolizon.ui.LogFeedback
import nasa.space.app.ec.laikapolizon.ui.common.formatNumber
import nasa.space.app.ec.laikapolizon.ui.common.formattedValue
import nasa.space.app.ec.laikapolizon.ui.common.labelRes
import nasa.space.app.ec.laikapolizon.ui.theme.LaikaTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.ZoneId
import java.time.format.DateTimeFormatter

/** Tipos que el astronauta registra a mano (la radiación y el CO₂ vienen de sensores). */
private val manualTypes = listOf(
    MeasurementType.GLUCOSE,
    MeasurementType.BLOOD_PRESSURE,
    MeasurementType.HEART_RATE,
    MeasurementType.BODY_TEMPERATURE,
    MeasurementType.SLEEP_DURATION,
    MeasurementType.HRV,
    MeasurementType.ACTIVITY_MINUTES,
    MeasurementType.CORTISOL,
    MeasurementType.VISION_CLARITY,
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HealthLogScreen(viewModel: HealthLogViewModel, modifier: Modifier = Modifier) {
    val feedback by viewModel.feedback.collectAsStateWithLifecycle()
    var type by rememberSaveable { mutableStateOf(MeasurementType.GLUCOSE) }
    var value by rememberSaveable { mutableStateOf("") }
    var secondary by rememberSaveable { mutableStateOf("") }

    LaunchedEffect(feedback) {
        if (feedback == LogFeedback.Saved) { value = ""; secondary = "" }
    }

    Column(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(stringResource(R.string.log_title), style = MaterialTheme.typography.titleLarge)

        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(manualTypes) { t ->
                FilterChip(
                    selected = t == type,
                    onClick = { type = t; viewModel.dismissFeedback() },
                    label = { Text(stringResource(t.labelRes())) },
                )
            }
        }

        val isBloodPressure = type == MeasurementType.BLOOD_PRESSURE
        val numberKeyboard = KeyboardOptions(keyboardType = KeyboardType.Decimal)
        OutlinedTextField(
            value = value,
            onValueChange = { value = it },
            label = { Text(if (isBloodPressure) stringResource(R.string.log_systolic) else stringResource(R.string.log_value, type.unit)) },
            keyboardOptions = numberKeyboard,
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
        if (isBloodPressure) {
            OutlinedTextField(
                value = secondary,
                onValueChange = { secondary = it },
                label = { Text(stringResource(R.string.log_diastolic)) },
                keyboardOptions = numberKeyboard,
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
        }

        Button(onClick = { viewModel.submit(type, value, secondary) }, modifier = Modifier.fillMaxWidth()) {
            Text(stringResource(R.string.log_save))
        }

        when (val f = feedback) {
            LogFeedback.Saved -> Text(stringResource(R.string.log_saved), color = LaikaTheme.status.optimal)
            LogFeedback.NotANumber -> Text(stringResource(R.string.log_not_a_number), color = MaterialTheme.colorScheme.onSurfaceVariant)
            is LogFeedback.Rejected -> Text(
                stringResource(
                    when (f.issue) {
                        ValidationIssue.MISSING_SECONDARY -> R.string.log_missing_diastolic
                        ValidationIssue.SYSTOLIC_NOT_ABOVE_DIASTOLIC -> R.string.log_systolic_not_above
                        else -> R.string.log_impossible
                    }
                ),
                // Ámbar, no coral: el coral se reserva para alertas críticas.
                color = LaikaTheme.status.attention,
            )
            is LogFeedback.NeedsConfirmation -> {
                val shown = if (f.secondary != null) "${formatNumber(f.value)}/${formatNumber(f.secondary)} ${f.type.unit}"
                else "${formatNumber(f.value)} ${f.type.unit}"
                AlertDialog(
                    onDismissRequest = viewModel::dismissFeedback,
                    title = { Text(stringResource(R.string.log_confirm_title)) },
                    text = { Text(stringResource(R.string.log_confirm_text, shown)) },
                    confirmButton = { TextButton(onClick = viewModel::confirmPending) { Text(stringResource(R.string.log_confirm_yes)) } },
                    dismissButton = { TextButton(onClick = viewModel::dismissFeedback) { Text(stringResource(R.string.log_confirm_no)) } },
                )
            }
            LogFeedback.None -> Unit
        }
    }
}

private val timeFormat = DateTimeFormatter.ofPattern("dd/MM HH:mm").withZone(ZoneId.systemDefault())

@Composable
fun HistoryScreen(viewModel: HealthLogViewModel, modifier: Modifier = Modifier) {
    val records by viewModel.history.collectAsStateWithLifecycle()
    val careEvents by viewModel.careEvents.collectAsStateWithLifecycle()
    if (records.isEmpty() && careEvents.isEmpty()) {
        Text(stringResource(R.string.history_empty), modifier.padding(16.dp))
        return
    }

    // Exportación para el Flight Surgeon: el astronauta elige dónde guardar el archivo.
    // Es local (almacenamiento del dispositivo o un medio externo): nada sale por la red.
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var exportMessage by remember { mutableStateOf<Int?>(null) }
    val exportLauncher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        scope.launch {
            exportMessage = try {
                val json = viewModel.buildReport()
                withContext(Dispatchers.IO) {
                    context.contentResolver.openOutputStream(uri)?.use { it.write(json.toByteArray(Charsets.UTF_8)) }
                }
                R.string.export_done
            } catch (e: Exception) {
                R.string.export_failed
            }
        }
    }

    LazyColumn(modifier.fillMaxSize(), contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp)) {
        item {
            Column(Modifier.fillMaxWidth().padding(bottom = 16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                OutlinedButton(onClick = { exportLauncher.launch(viewModel.reportFileName()) }, modifier = Modifier.fillMaxWidth()) {
                    Text(stringResource(R.string.export_button))
                }
                Text(stringResource(R.string.export_hint), style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                exportMessage?.let { Text(stringResource(it), style = MaterialTheme.typography.bodySmall) }
            }
        }
        if (careEvents.isNotEmpty()) {
            item { Text(stringResource(R.string.history_missions), style = MaterialTheme.typography.titleMedium) }
            items(careEvents, key = { "care-${it.id}" }) { event ->
                CareRow(event)
                Divider()
            }
            item { Text(stringResource(R.string.history_measurements), style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 16.dp)) }
        }
        items(records, key = { it.id }) { record ->
            HistoryRow(record)
            Divider()
        }
    }
}

@Composable
private fun CareRow(event: CareEvent) {
    Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Column(Modifier.weight(1f)) {
            Text(stringResource(event.kind.labelRes()), style = MaterialTheme.typography.bodyLarge)
            Text(
                timeFormat.format(event.timestamp) + " · " + event.actionIds.joinToString(", "),
                style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Text("+${event.points}", style = MaterialTheme.typography.titleMedium, color = LaikaTheme.status.optimal)
    }
}

private fun CareKind.labelRes(): Int = when (this) {
    CareKind.MORNING_CHECKIN -> R.string.care_checkin
    CareKind.MISSION_COMPLETED -> R.string.care_mission
    CareKind.CRITICAL_PROTOCOL -> R.string.care_protocol
}

@Composable
private fun HistoryRow(record: MeasurementRecord) {
    Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Column(Modifier.weight(1f)) {
            Text(stringResource(record.type.labelRes()), style = MaterialTheme.typography.bodyLarge)
            val meta = timeFormat.format(record.timestamp) + " · " + stringResource(record.source.labelRes()) +
                if (record.supersedesId != null) " · " + stringResource(R.string.history_corrected) else ""
            Text(meta, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Text(record.formattedValue(), style = MaterialTheme.typography.titleMedium)
    }
}
