package nasa.space.app.ec.laikapolizon.ui.avatar

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import nasa.space.app.ec.laikapolizon.domain.model.Emotion
import kotlin.random.Random

private val Fur = Color(0xFFF2E3C6)
private val FurShade = Color(0xFFE2CDA6)
private val Patch = Color(0xFF8B5A3C)
private val Ink = Color(0xFF2B2522)
private val Tongue = Color(0xFFE8798A)
private val Blush = Color(0x55F08A8A)
private val Visor = Color(0x33A3C9F0)
private val VisorRing = Color(0xFF8FA6BD)

/**
 * Laika: diseño original de perrita dibujado con Canvas (decisión D9). No usa archivos de arte,
 * así que funciona igual en la app y en el overlay del screen pet.
 */
@Composable
fun LaikaAvatar(
    emotion: Emotion,
    modifier: Modifier = Modifier,
    size: Dp = 120.dp,
    contentDescription: String? = null,
) {
    // Parpadeo cada 3–6 s (no aplica a ojos cerrados de alegría).
    val blink = remember { Animatable(1f) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(3_000L + Random.nextLong(3_000L))
            blink.animateTo(0.1f, tween(90))
            blink.animateTo(1f, tween(120))
        }
    }

    Canvas(
        modifier
            .size(size)
            .semantics { if (contentDescription != null) this.contentDescription = contentDescription },
    ) {
        val tilt = if (emotion == Emotion.CURIOUS) -8f else 0f
        rotate(tilt) { drawLaika(emotion, blink.value) }
    }
}

private fun DrawScope.drawLaika(emotion: Emotion, eyeOpen: Float) {
    val s = size.minDimension
    val c = Offset(size.width / 2, size.height * 0.55f)
    val headR = s * 0.30f

    // Orejas caídas: el ángulo expresa la emoción.
    val (leftEar, rightEar) = when (emotion) {
        Emotion.JOYFUL -> 20f to -20f
        Emotion.CALM -> 8f to -8f
        Emotion.CURIOUS -> 35f to -5f
        Emotion.TIRED -> 4f to -4f
        Emotion.CONCERNED -> 0f to 0f
        Emotion.PROTECTIVE -> 28f to -28f
    }
    drawEar(Offset(c.x - headR * 0.82f, c.y - headR * 0.55f), s, leftEar)
    drawEar(Offset(c.x + headR * 0.82f, c.y - headR * 0.55f), s, rightEar)

    // Cabeza y mancha característica sobre el ojo derecho.
    drawCircle(Fur, headR, c)
    drawCircle(Patch, headR * 0.34f, Offset(c.x + headR * 0.36f, c.y - headR * 0.18f))

    // Hocico y nariz.
    drawOval(FurShade, Offset(c.x - headR * 0.42f, c.y + headR * 0.08f), Size(headR * 0.84f, headR * 0.62f))
    drawOval(Ink, Offset(c.x - headR * 0.14f, c.y + headR * 0.10f), Size(headR * 0.28f, headR * 0.18f))

    if (emotion == Emotion.JOYFUL || emotion == Emotion.CALM) {
        drawCircle(Blush, headR * 0.14f, Offset(c.x - headR * 0.58f, c.y + headR * 0.22f))
        drawCircle(Blush, headR * 0.14f, Offset(c.x + headR * 0.58f, c.y + headR * 0.22f))
    }

    drawEyes(emotion, c, headR, eyeOpen)
    drawMouth(emotion, c, headR)

    // Traje de protección (Flujo 2): casco espacial transparente.
    if (emotion == Emotion.PROTECTIVE) {
        drawCircle(Visor, headR * 1.38f, Offset(c.x, c.y - headR * 0.08f))
        drawCircle(VisorRing, headR * 1.38f, Offset(c.x, c.y - headR * 0.08f), style = Stroke(width = s * 0.035f))
        drawLine(Color.White.copy(alpha = 0.7f), Offset(c.x - headR * 0.95f, c.y - headR * 0.75f),
            Offset(c.x - headR * 0.6f, c.y - headR * 1.05f), strokeWidth = s * 0.03f, cap = StrokeCap.Round)
    }
}

private fun DrawScope.drawEar(anchor: Offset, s: Float, degrees: Float) {
    withTransform({ rotate(degrees, anchor) }) {
        drawOval(Patch, Offset(anchor.x - s * 0.09f, anchor.y - s * 0.04f), Size(s * 0.18f, s * 0.34f))
    }
}

private fun DrawScope.drawEyes(emotion: Emotion, c: Offset, r: Float, eyeOpen: Float) {
    val left = Offset(c.x - r * 0.38f, c.y - r * 0.12f)
    val right = Offset(c.x + r * 0.38f, c.y - r * 0.12f)
    val eyeR = r * 0.11f
    val stroke = Stroke(width = r * 0.08f, cap = StrokeCap.Round)

    fun roundEyes(radius: Float, open: Float) {
        for (eye in listOf(left, right)) {
            drawOval(Ink, Offset(eye.x - radius, eye.y - radius * open), Size(radius * 2, radius * 2 * open))
            if (open > 0.5f) drawCircle(Color.White, radius * 0.32f, Offset(eye.x + radius * 0.3f, eye.y - radius * 0.3f))
        }
    }

    when (emotion) {
        Emotion.JOYFUL -> for (eye in listOf(left, right)) { // ojos cerrados de felicidad "^ ^"
            val p = Path().apply {
                moveTo(eye.x - eyeR * 1.3f, eye.y + eyeR * 0.5f)
                quadraticBezierTo(eye.x, eye.y - eyeR * 1.4f, eye.x + eyeR * 1.3f, eye.y + eyeR * 0.5f)
            }
            drawPath(p, Ink, style = stroke)
        }
        Emotion.CALM -> roundEyes(eyeR, 0.75f * eyeOpen)
        Emotion.CURIOUS -> roundEyes(eyeR * 1.35f, eyeOpen)
        Emotion.TIRED -> {
            roundEyes(eyeR, 0.45f * eyeOpen)
            for (eye in listOf(left, right)) { // párpado caído
                drawLine(Ink, Offset(eye.x - eyeR * 1.3f, eye.y - eyeR * 0.3f), Offset(eye.x + eyeR * 1.3f, eye.y - eyeR * 0.1f),
                    strokeWidth = r * 0.06f, cap = StrokeCap.Round)
            }
        }
        Emotion.CONCERNED -> {
            roundEyes(eyeR, eyeOpen)
            // Cejas inclinadas hacia arriba en el centro.
            drawLine(Ink, Offset(left.x - eyeR * 1.4f, left.y - eyeR * 1.8f), Offset(left.x + eyeR * 1.2f, left.y - eyeR * 2.6f),
                strokeWidth = r * 0.06f, cap = StrokeCap.Round)
            drawLine(Ink, Offset(right.x + eyeR * 1.4f, right.y - eyeR * 1.8f), Offset(right.x - eyeR * 1.2f, right.y - eyeR * 2.6f),
                strokeWidth = r * 0.06f, cap = StrokeCap.Round)
        }
        Emotion.PROTECTIVE -> {
            roundEyes(eyeR, eyeOpen)
            // Cejas rectas y firmes.
            for (eye in listOf(left, right)) {
                drawLine(Ink, Offset(eye.x - eyeR * 1.4f, eye.y - eyeR * 2.0f), Offset(eye.x + eyeR * 1.4f, eye.y - eyeR * 2.0f),
                    strokeWidth = r * 0.06f, cap = StrokeCap.Round)
            }
        }
    }
}

private fun DrawScope.drawMouth(emotion: Emotion, c: Offset, r: Float) {
    val y = c.y + r * 0.42f
    val w = r * 0.26f
    val stroke = Stroke(width = r * 0.06f, cap = StrokeCap.Round)
    when (emotion) {
        Emotion.JOYFUL -> {
            drawOval(Tongue, Offset(c.x - w * 0.5f, y - w * 0.1f), Size(w, w * 0.9f))
            drawPath(Path().apply { moveTo(c.x - w, y - w * 0.2f); quadraticBezierTo(c.x, y + w * 0.6f, c.x + w, y - w * 0.2f) }, Ink, style = stroke)
        }
        Emotion.CALM -> drawPath(Path().apply { moveTo(c.x - w * 0.8f, y - w * 0.1f); quadraticBezierTo(c.x, y + w * 0.35f, c.x + w * 0.8f, y - w * 0.1f) }, Ink, style = stroke)
        Emotion.CURIOUS -> drawCircle(Ink, w * 0.28f, Offset(c.x, y + w * 0.05f), style = stroke)
        Emotion.TIRED -> drawLine(Ink, Offset(c.x - w * 0.6f, y + w * 0.1f), Offset(c.x + w * 0.6f, y + w * 0.1f), strokeWidth = r * 0.06f, cap = StrokeCap.Round)
        Emotion.CONCERNED -> drawPath(Path().apply { moveTo(c.x - w * 0.7f, y + w * 0.25f); quadraticBezierTo(c.x, y - w * 0.25f, c.x + w * 0.7f, y + w * 0.25f) }, Ink, style = stroke)
        Emotion.PROTECTIVE -> drawLine(Ink, Offset(c.x - w * 0.7f, y), Offset(c.x + w * 0.7f, y), strokeWidth = r * 0.07f, cap = StrokeCap.Round)
    }
}
