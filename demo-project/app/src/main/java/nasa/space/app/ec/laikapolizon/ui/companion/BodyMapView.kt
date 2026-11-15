package nasa.space.app.ec.laikapolizon.ui.companion

import androidx.annotation.StringRes
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.analysis.Finding
import nasa.space.app.ec.laikapolizon.domain.bodymap.BodyMap
import nasa.space.app.ec.laikapolizon.domain.bodymap.BodyRegion
import nasa.space.app.ec.laikapolizon.domain.bodymap.Trend
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.ui.common.formatNumber
import nasa.space.app.ec.laikapolizon.ui.common.formattedValue
import nasa.space.app.ec.laikapolizon.ui.common.labelRes
import nasa.space.app.ec.laikapolizon.ui.theme.LaikaTheme
import java.time.Instant

/** Rectángulos de cada región, en proporción al lienzo (mismo cálculo para dibujar y para tocar). */
private fun regionRects(size: Size): Map<BodyRegion, Rect> {
    val w = size.width
    val h = size.height
    val cx = w * 0.42f
    return mapOf(
        BodyRegion.HEAD to Rect(Offset(cx - h * 0.09f, h * 0.02f), Size(h * 0.18f, h * 0.18f)),
        BodyRegion.CHEST to Rect(Offset(cx - h * 0.14f, h * 0.22f), Size(h * 0.28f, h * 0.20f)),
        BodyRegion.ABDOMEN to Rect(Offset(cx - h * 0.13f, h * 0.42f), Size(h * 0.26f, h * 0.15f)),
        BodyRegion.LEGS to Rect(Offset(cx - h * 0.12f, h * 0.58f), Size(h * 0.24f, h * 0.40f)),
        BodyRegion.ENVIRONMENT to Rect(Offset(w * 0.74f, h * 0.06f), Size(w * 0.22f, h * 0.22f)),
    )
}

/**
 * Mapa corporal 2D (docs/05 §5.1, decisión D7). Las regiones con hallazgos se resaltan en ámbar;
 * al tocar una región se muestra su estado, tendencia, riesgo NASA y acciones disponibles.
 */
@Composable
fun BodyMapView(records: List<MeasurementRecord>, findings: List<Finding>, now: Instant) {
    val flagged = BodyMap.flaggedRegions(findings)
    var selected by rememberSaveable { mutableStateOf(flagged.firstOrNull() ?: BodyRegion.CHEST) }

    val base = MaterialTheme.colorScheme.surfaceVariant
    val outline = MaterialTheme.colorScheme.outline
    val highlight = LaikaTheme.status.attention
    val selectedColor = MaterialTheme.colorScheme.primary
    val textMeasurer = rememberTextMeasurer()
    val envLabel = stringResource(R.string.region_environment_short)
    val labelStyle = MaterialTheme.typography.labelLarge.copy(color = MaterialTheme.colorScheme.onSurfaceVariant)

    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(stringResource(R.string.bodymap_title), style = MaterialTheme.typography.titleMedium)
            Text(stringResource(R.string.bodymap_hint), style = MaterialTheme.typography.bodySmall)

            Canvas(
                Modifier
                    .fillMaxWidth()
                    .height(260.dp)
                    .pointerInput(Unit) {
                        detectTapGestures { tap ->
                            regionRects(Size(size.width.toFloat(), size.height.toFloat()))
                                .entries.firstOrNull { it.value.contains(tap) }?.let { selected = it.key }
                        }
                    },
            ) {
                val rects = regionRects(size)
                drawLimbs(rects, base, outline)
                rects.forEach { (region, rect) ->
                    val fill = if (region in flagged) highlight else base
                    if (region == BodyRegion.HEAD || region == BodyRegion.ENVIRONMENT) {
                        drawOval(fill, rect.topLeft, rect.size)
                        drawOval(if (region == selected) selectedColor else outline, rect.topLeft, rect.size,
                            style = Stroke(width = if (region == selected) 6f else 2f))
                    } else {
                        val r = CornerRadius(rect.width * 0.25f)
                        drawRoundRect(fill, rect.topLeft, rect.size, r)
                        drawRoundRect(if (region == selected) selectedColor else outline, rect.topLeft, rect.size, r,
                            style = Stroke(width = if (region == selected) 6f else 2f))
                    }
                }
                // Etiqueta del óvalo de entorno: no es parte del cuerpo y sin texto no se entiende.
                val env = rects.getValue(BodyRegion.ENVIRONMENT)
                val label = textMeasurer.measure(envLabel, labelStyle)
                drawText(label, topLeft = Offset(env.center.x - label.size.width / 2f, env.center.y - label.size.height / 2f))
            }

            RegionDetail(BodyMap.summarize(selected, records, findings, now))
        }
    }
}

private fun DrawScope.drawLimbs(rects: Map<BodyRegion, Rect>, color: Color, outline: Color) {
    val chest = rects.getValue(BodyRegion.CHEST)
    val armW = chest.width * 0.22f
    val armH = chest.height * 1.6f
    val r = CornerRadius(armW / 2)
    for (x in listOf(chest.left - armW - 6f, chest.right + 6f)) {
        drawRoundRect(color, Offset(x, chest.top + 6f), Size(armW, armH), r)
        drawRoundRect(outline, Offset(x, chest.top + 6f), Size(armW, armH), r, style = Stroke(2f))
    }
}

@Composable
private fun RegionDetail(summary: nasa.space.app.ec.laikapolizon.domain.bodymap.RegionSummary) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(stringResource(summary.region.labelRes()), style = MaterialTheme.typography.titleSmall)
        Text(stringResource(R.string.bodymap_risk, stringResource(summary.region.riskRes())), style = MaterialTheme.typography.bodySmall)

        summary.metrics.forEach { m ->
            Row(Modifier.fillMaxWidth()) {
                Text(stringResource(m.type.labelRes()), Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                Text(m.latest?.formattedValue() ?: "—", style = MaterialTheme.typography.bodyMedium)
                Text(" " + m.trend.arrow(), Modifier.width(24.dp), style = MaterialTheme.typography.bodyMedium)
            }
            if (m.mean24h != null || m.mean7d != null) {
                Text(
                    stringResource(R.string.bodymap_means, m.mean24h?.let(::formatNumber) ?: "—", m.mean7d?.let(::formatNumber) ?: "—"),
                    style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        if (summary.actions.isNotEmpty()) {
            Text(stringResource(R.string.bodymap_actions), style = MaterialTheme.typography.labelLarge)
            summary.actions.forEach { Text("• ${it.description} (${it.estimatedDurationMin} min)", style = MaterialTheme.typography.bodySmall) }
        }
    }
}

private fun Trend.arrow() = when (this) {
    Trend.UP -> "↑"
    Trend.DOWN -> "↓"
    Trend.STABLE -> "→"
    Trend.UNKNOWN -> ""
}

@StringRes
private fun BodyRegion.labelRes() = when (this) {
    BodyRegion.HEAD -> R.string.region_head
    BodyRegion.CHEST -> R.string.region_chest
    BodyRegion.ABDOMEN -> R.string.region_abdomen
    BodyRegion.LEGS -> R.string.region_legs
    BodyRegion.ENVIRONMENT -> R.string.region_environment
}

@StringRes
private fun BodyRegion.riskRes() = when (this) {
    BodyRegion.HEAD -> R.string.risk_head
    BodyRegion.CHEST -> R.string.risk_chest
    BodyRegion.ABDOMEN -> R.string.risk_abdomen
    BodyRegion.LEGS -> R.string.risk_legs
    BodyRegion.ENVIRONMENT -> R.string.risk_environment
}
