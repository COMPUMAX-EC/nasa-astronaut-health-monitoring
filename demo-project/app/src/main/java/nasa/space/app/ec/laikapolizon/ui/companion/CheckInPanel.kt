package nasa.space.app.ec.laikapolizon.ui.companion

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.validation.ValidationIssue
import nasa.space.app.ec.laikapolizon.domain.validation.ValidationResult
import nasa.space.app.ec.laikapolizon.domain.vitality.VitalityCalculator
import nasa.space.app.ec.laikapolizon.ui.common.formatNumber
import nasa.space.app.ec.laikapolizon.ui.common.labelRes
import nasa.space.app.ec.laikapolizon.ui.theme.LaikaTheme

private data class PendingLog(val type: MeasurementType, val value: Double, val secondary: Double?)

/**
 * Flujo 1 — chequeo matutino. Los valores llegan precargados con la última medición:
 * en el caso típico basta UN toque en "Registrar" (< 4 s, docs/05).
 */
@Composable
fun CheckInPanel(
    vitality: Double,
    records: List<MeasurementRecord>,
    onLog: (type: MeasurementType, value: Double, secondary: Double?, force: Boolean) -> ValidationResult,
) {
    val greeting = when {
        vitality >= VitalityCalculator.HIGH_THRESHOLD -> R.string.checkin_greeting_high
        vitality < VitalityCalculator.LOW_THRESHOLD -> R.string.checkin_greeting_low
        else -> R.string.checkin_greeting_mid
    }
    fun last(type: MeasurementType) = records.filter { it.type == type }.maxByOrNull { it.timestamp }

    var pending by remember { mutableStateOf<PendingLog?>(null) }
    var message by remember { mutableStateOf<Int?>(null) }

    fun submit(type: MeasurementType, value: Double, secondary: Double?) {
        message = when (val r = onLog(type, value, secondary, false)) {
            ValidationResult.Valid -> R.string.checkin_saved
            is ValidationResult.NeedsConfirmation -> { pending = PendingLog(type, value, secondary); null }
            is ValidationResult.Invalid -> if (r.issue == ValidationIssue.SYSTOLIC_NOT_ABOVE_DIASTOLIC)
                R.string.log_systolic_not_above else R.string.log_impossible
        }
    }

    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(stringResource(R.string.checkin_title), style = MaterialTheme.typography.titleMedium)
            Text(stringResource(greeting), style = MaterialTheme.typography.bodyLarge)

            // Glucosa
            var glucose by rememberSaveable { mutableDoubleStateOf(last(MeasurementType.GLUCOSE)?.value ?: 95.0) }
            QuickEntry(
                label = stringResource(MeasurementType.GLUCOSE.labelRes()),
                unit = MeasurementType.GLUCOSE.unit,
                steppers = listOf(Stepper(glucose, 1.0) { glucose = it }),
                onConfirm = { submit(MeasurementType.GLUCOSE, glucose, null) },
            )

            // Presión arterial
            val lastBp = last(MeasurementType.BLOOD_PRESSURE)
            var systolic by rememberSaveable { mutableDoubleStateOf(lastBp?.value ?: 120.0) }
            var diastolic by rememberSaveable { mutableDoubleStateOf(lastBp?.secondaryValue ?: 80.0) }
            QuickEntry(
                label = stringResource(MeasurementType.BLOOD_PRESSURE.labelRes()),
                unit = MeasurementType.BLOOD_PRESSURE.unit,
                steppers = listOf(Stepper(systolic, 1.0) { systolic = it }, Stepper(diastolic, 1.0) { diastolic = it }),
                onConfirm = { submit(MeasurementType.BLOOD_PRESSURE, systolic, diastolic) },
            )

            message?.let { Text(stringResource(it), color = LaikaTheme.status.attention, style = MaterialTheme.typography.bodySmall) }
        }
    }

    pending?.let { p ->
        val shown = (if (p.secondary != null) "${formatNumber(p.value)}/${formatNumber(p.secondary)}" else formatNumber(p.value)) + " ${p.type.unit}"
        AlertDialog(
            onDismissRequest = { pending = null },
            title = { Text(stringResource(R.string.log_confirm_title)) },
            text = { Text(stringResource(R.string.log_confirm_text, shown)) },
            confirmButton = {
                TextButton(onClick = { onLog(p.type, p.value, p.secondary, true); pending = null; message = R.string.checkin_saved }) {
                    Text(stringResource(R.string.log_confirm_yes))
                }
            },
            dismissButton = { TextButton(onClick = { pending = null }) { Text(stringResource(R.string.log_confirm_no)) } },
        )
    }
}

private data class Stepper(val value: Double, val step: Double, val onChange: (Double) -> Unit)

@Composable
private fun QuickEntry(label: String, unit: String, steppers: List<Stepper>, onConfirm: () -> Unit) {
    val confirm = @Composable { Button(onClick = onConfirm) { Text(stringResource(R.string.checkin_confirm)) } }
    val stepperRow = @Composable {
        steppers.forEachIndexed { i, s ->
            if (i > 0) Text("/", style = MaterialTheme.typography.titleLarge)
            FilledTonalIconButton(onClick = { s.onChange(s.value - s.step) }, modifier = Modifier.size(36.dp)) { Text("−") }
            Text(
                formatNumber(s.value),
                style = MaterialTheme.typography.titleLarge,
                textAlign = TextAlign.Center,
                modifier = Modifier.widthIn(min = 44.dp),
            )
            FilledTonalIconButton(onClick = { s.onChange(s.value + s.step) }, modifier = Modifier.size(36.dp)) { Text("+") }
        }
    }

    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text("$label ($unit)", style = MaterialTheme.typography.labelLarge)
        if (steppers.size == 1) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                stepperRow()
                Row(Modifier.weight(1f), horizontalArrangement = Arrangement.End) { confirm() }
            }
        } else {
            // Varios valores (presión): el botón va en su propia línea para que todo quepa.
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) { stepperRow() }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) { confirm() }
        }
    }
}
