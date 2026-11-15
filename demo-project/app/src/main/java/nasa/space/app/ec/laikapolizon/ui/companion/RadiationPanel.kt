package nasa.space.app.ec.laikapolizon.ui.companion

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.ui.common.formatNumber
import nasa.space.app.ec.laikapolizon.ui.theme.LaikaTheme

/**
 * Flujo 2 — evento de radiación (CANS). Guía sin pánico: ir al módulo blindado, verificar
 * que la lectura baja y ofrecer una actividad de bajo estrés mientras pasa el evento.
 */
@Composable
fun RadiationPanel(
    records: List<MeasurementRecord>,
    stillCritical: Boolean,
    sheltered: Boolean,
    onSheltered: () -> Unit,
    onAllClear: () -> Unit,
) {
    val readings = records.filter { it.type == MeasurementType.NEUTRON_DOSE_RATE }.sortedBy { it.timestamp }
    val background = readings.dropLast(2).map { it.value }.takeIf { it.isNotEmpty() }?.average()
    val latest = readings.lastOrNull()

    // "Iluminación ámbar cálida": el panel usa el ámbar calmo, no un rojo de alarma.
    Card(
        colors = CardDefaults.cardColors(
            containerColor = LaikaTheme.status.attention.copy(alpha = 0.18f),
        ),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(stringResource(R.string.radiation_title), style = MaterialTheme.typography.titleMedium)

            if (latest != null && background != null) {
                Text(
                    stringResource(R.string.radiation_reading, formatNumber(latest.value), formatNumber(background)),
                    style = MaterialTheme.typography.bodyMedium,
                )
                RadiationChart(readings.takeLast(16).map { it.value }, threshold = background * 1.3)
            }

            when {
                !stillCritical -> {
                    Text(stringResource(R.string.radiation_cleared), style = MaterialTheme.typography.bodyLarge)
                    Button(onClick = onAllClear, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.radiation_confirm_safe)) }
                }
                !sheltered -> {
                    Text(stringResource(R.string.radiation_go_shelter), style = MaterialTheme.typography.bodyLarge)
                    Button(
                        onClick = onSheltered,
                        colors = ButtonDefaults.buttonColors(containerColor = LaikaTheme.status.critical, contentColor = LaikaTheme.status.onCritical),
                        modifier = Modifier.fillMaxWidth(),
                    ) { Text(stringResource(R.string.radiation_in_shelter)) }
                }
                else -> {
                    Text(stringResource(R.string.radiation_waiting), style = MaterialTheme.typography.bodyLarge)
                    Text(stringResource(R.string.radiation_activity), style = MaterialTheme.typography.bodySmall)
                    BreathingGuide()
                }
            }
        }
    }
}

/** Lecturas recientes del espectrómetro con la línea de umbral (fondo × 1.3). */
@Composable
private fun RadiationChart(values: List<Double>, threshold: Double) {
    if (values.size < 2) return
    val line = MaterialTheme.colorScheme.primary
    val limit = LaikaTheme.status.critical
    Canvas(Modifier.fillMaxWidth().height(90.dp)) {
        val max = (values.max().coerceAtLeast(threshold)) * 1.1
        val min = 0.0
        fun y(v: Double) = size.height - ((v - min) / (max - min) * size.height).toFloat()
        val step = size.width / (values.size - 1)

        drawLine(limit, Offset(0f, y(threshold)), Offset(size.width, y(threshold)), strokeWidth = 3f,
            pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 10f)))
        val path = Path().apply {
            values.forEachIndexed { i, v -> if (i == 0) moveTo(0f, y(v)) else lineTo(i * step, y(v)) }
        }
        drawPath(path, line, style = Stroke(width = 5f))
        drawCircle(line, 8f, Offset((values.size - 1) * step, y(values.last())))
    }
}
