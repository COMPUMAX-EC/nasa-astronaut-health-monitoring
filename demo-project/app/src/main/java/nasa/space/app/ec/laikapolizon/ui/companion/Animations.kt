package nasa.space.app.ec.laikapolizon.ui.companion

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.ui.theme.LaikaTheme

/** Cierre de bucle del Flujo 1: flor que se abre + "+10 PTS Cuidado". */
@Composable
fun BloomCelebration(points: Int, modifier: Modifier = Modifier) {
    val bloom = remember { Animatable(0f) }
    LaunchedEffect(Unit) { bloom.animateTo(1f, spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow)) }
    val petal = LaikaTheme.status.optimal
    val center = LaikaTheme.status.attention

    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Canvas(Modifier.size(140.dp)) {
            val c = Offset(size.width / 2, size.height / 2)
            val len = size.minDimension * 0.42f * bloom.value
            repeat(8) { i ->
                rotate(i * 45f, c) {
                    drawOval(petal.copy(alpha = 0.85f), Offset(c.x - len * 0.22f, c.y - len), Size(len * 0.44f, len))
                }
            }
            drawCircle(center, size.minDimension * 0.12f * bloom.value, c)
        }
        Text(stringResource(R.string.care_points_earned, points), style = MaterialTheme.typography.titleLarge, color = LaikaTheme.status.optimal)
    }
}

/** Respiración guiada a 6 respiraciones por minuto: 5 s inhalar, 5 s exhalar. */
@Composable
fun BreathingGuide(modifier: Modifier = Modifier, size: Dp = 160.dp) {
    val transition = rememberInfiniteTransition(label = "breathing")
    val phase by transition.animateFloat(
        initialValue = 0f, targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(10_000, easing = LinearEasing), RepeatMode.Restart),
        label = "phase",
    )
    val inhaling = phase < 0.5f
    val progress = if (inhaling) phase * 2 else (1 - phase) * 2
    val color = MaterialTheme.colorScheme.primary

    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Box(Modifier.size(size), contentAlignment = Alignment.Center) {
            Canvas(Modifier.size(size)) {
                val max = this.size.minDimension / 2
                drawCircle(color.copy(alpha = 0.15f), max)
                drawCircle(color.copy(alpha = 0.55f), max * (0.35f + 0.65f * progress))
            }
            Text(
                stringResource(if (inhaling) R.string.breath_in else R.string.breath_out),
                style = MaterialTheme.typography.titleMedium,
                color = Color.White,
            )
        }
    }
}
