package nasa.space.app.ec.laikapolizon.feature.petoverlay

import android.annotation.SuppressLint
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.ViewConfiguration
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInteropFilter
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.StateFlow
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.engine.LaikaStatus
import nasa.space.app.ec.laikapolizon.domain.knowledge.Conversation
import nasa.space.app.ec.laikapolizon.domain.knowledge.QuickReply
import nasa.space.app.ec.laikapolizon.domain.model.Emotion
import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.domain.presence.AppCategory
import nasa.space.app.ec.laikapolizon.domain.presence.PresenceState
import nasa.space.app.ec.laikapolizon.domain.presence.VoiceStatus
import nasa.space.app.ec.laikapolizon.ui.common.ChatTexts
import nasa.space.app.ec.laikapolizon.ui.common.containerColor
import nasa.space.app.ec.laikapolizon.ui.common.labelRes
import nasa.space.app.ec.laikapolizon.ui.common.messageRes
import nasa.space.app.ec.laikapolizon.ui.theme.LaikaTheme
import kotlin.math.abs
import kotlin.random.Random
import androidx.compose.runtime.collectAsState as collect

/** Alto del personaje: cuerpo entero, pero del tamaño de una cabeza para ocupar poco. El sprite (arte del equipo) mide 225×367 px. */
private val SpriteHeight = 64.dp
private val SpriteWidth = SpriteHeight * (225f / 367f)

/** Globo de texto al estilo de los ayudantes de escritorio clásicos: amarillo pálido con borde fino. */
private val BalloonColor = Color(0xFFFFFDE7)
private val BalloonText = Color(0xFF1F1B16)
private val BalloonBorder = Color(0xFF8C8577)

/** Tiempo que el globo de estado queda abierto antes de plegarse a un "!" sobre la cabeza. */
private const val BALLOON_OPEN_MS = 10_000L

/**
 * Laika flotante (módulo A). Personaje de cuerpo entero sin fondo, con animaciones de reposo y un
 * globo compacto que se pliega solo, para ocupar poco espacio sobre las otras apps.
 * El globo crece hacia arriba: la ventana está anclada abajo a la derecha.
 */
@Composable
fun PetOverlay(
    engineStatus: StateFlow<LaikaStatus>,
    presence: PresenceState,
    onDrag: (dx: Float, dy: Float) -> Unit,
    onOpenApp: () -> Unit,
    onAffectiveTouch: () -> Unit,
    onStartChat: () -> Unit,
    onReply: (QuickReply) -> Unit,
    onDismissChat: () -> Unit,
) {
    val context = LocalContext.current
    val status by engineStatus.collect()
    val category by presence.foregroundCategory.collect()
    val voiceStatus by presence.voiceStatus.collect()
    val voiceAwake by presence.voiceAwake.collect()
    val lastReply by presence.lastReply.collect()
    val conversation by presence.conversation.collect()
    val chatMessage by presence.chatMessage.collect()

    val state = status.event.currentSystemState
    val emotion = status.event.activeEmotionDisplay
    val critical = state == SystemState.CRITICAL_ALERT
    val needsAttention = state != SystemState.PERIPHERAL_PASSIVE

    var transient by remember { mutableStateOf<String?>(null) }
    var stateBalloonOpen by remember { mutableStateOf(false) }

    val exerciseText = stringResource(R.string.pet_exercise)
    val journalText = stringResource(R.string.pet_journal)
    val caressText = stringResource(R.string.pet_caress)

    // Al cambiar de estado, el globo se abre; si no es crítico, se pliega solo.
    LaunchedEffect(state) {
        stateBalloonOpen = needsAttention
        if (needsAttention && !critical) { delay(BALLOON_OPEN_MS); stateBalloonOpen = false }
    }
    LaunchedEffect(category) {
        transient = when (category) {
            AppCategory.EXERCISE -> exerciseText
            AppCategory.JOURNAL -> journalText
            else -> null
        }
    }
    LaunchedEffect(lastReply) { lastReply?.let { transient = it.text } }
    LaunchedEffect(chatMessage) { chatMessage?.let { transient = ChatTexts.text(context, it.line) } }
    LaunchedEffect(transient) { if (transient != null) { delay(6_000); transient = null } }

    // Prioridad del globo: alerta crítica > frase de Laika > pregunta de contexto > aviso de estado.
    val chat = conversation.takeIf { !critical && transient == null }
    val showStateBalloon = needsAttention && (critical || stateBalloonOpen) && transient == null && chat == null

    Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(2.dp)) {
        AnimatedVisibility(
            visible = showStateBalloon || transient != null || chat != null,
            enter = fadeIn() + scaleIn(transformOrigin = TransformOrigin(0.85f, 1f)),
            exit = fadeOut() + scaleOut(transformOrigin = TransformOrigin(0.85f, 1f)),
        ) {
            val text = transient
            when {
                text != null -> Balloon(critical = false, onClick = null) {
                    Text(text, color = BalloonText, style = MaterialTheme.typography.bodyMedium)
                }
                chat != null -> ConversationBalloon(chat, onReply, onDismissChat)
                else -> StateBalloon(status, onOpen = onOpenApp, onDismiss = if (critical) null else { { stateBalloonOpen = false } })
            }
        }

        LaikaSprite(
            state = state,
            emotion = emotion,
            exercising = category == AppCategory.EXERCISE,
            listening = voiceStatus == VoiceStatus.LISTENING,
            awake = voiceAwake,
            pendingBadge = needsAttention && !showStateBalloon && transient == null && chat == null,
            onDrag = onDrag,
            onTap = {
                when {
                    chat != null -> onDismissChat()
                    // Sin nada pendiente, tocarla abre conversación: recuerda algo o pregunta por tu día.
                    !needsAttention -> onStartChat()
                    !showStateBalloon -> stateBalloonOpen = true
                    else -> onOpenApp()
                }
            },
            onDoubleTap = onOpenApp,
            onLongPress = { onAffectiveTouch(); transient = caressText },
        )
    }
}

@SuppressLint("ClickableViewAccessibility")
@OptIn(ExperimentalComposeUiApi::class)
@Composable
private fun LaikaSprite(
    state: SystemState,
    emotion: Emotion,
    exercising: Boolean,
    listening: Boolean,
    awake: Boolean,
    pendingBadge: Boolean,
    onDrag: (Float, Float) -> Unit,
    onTap: () -> Unit,
    onDoubleTap: () -> Unit,
    onLongPress: () -> Unit,
) {
    val critical = state == SystemState.CRITICAL_ALERT
    val (stateColor, _) = state.containerColor()

    // --- Animaciones de reposo continuas ---
    val loop = rememberInfiniteTransition(label = "pet")
    val breath by loop.animateFloat(1f, 1.035f, infiniteRepeatable(tween(1_800, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "breath")
    val run by loop.animateFloat(0f, -7f, infiniteRepeatable(tween(260, easing = LinearEasing), RepeatMode.Reverse), label = "run")
    val glow by loop.animateFloat(0.35f, 0.9f, infiniteRepeatable(tween(900), RepeatMode.Reverse), label = "glow")

    // --- Animaciones puntuales: entrada, saltos de aviso, mirar alrededor, temblor crítico ---
    val hop = remember { Animatable(0f) }
    val tilt = remember { Animatable(0f) }
    val pop = remember { Animatable(0f) }
    LaunchedEffect(Unit) { pop.animateTo(1f, spring(dampingRatio = Spring.DampingRatioMediumBouncy)) }
    LaunchedEffect(state) {
        // Al cambiar de estado salta dos veces para llamar la atención; luego, uno cada 12 s mientras haya algo pendiente.
        while (state != SystemState.PERIPHERAL_PASSIVE) {
            repeat(2) {
                hop.animateTo(-14f, tween(140, easing = FastOutSlowInEasing))
                hop.animateTo(0f, spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium))
            }
            if (critical) repeat(6) { tilt.animateTo(if (it % 2 == 0) 7f else -7f, tween(60)) }
            tilt.animateTo(0f, tween(80))
            delay(12_000)
        }
    }
    LaunchedEffect(Unit) {
        // Mira a un lado y al otro de vez en cuando, como un compañero que está ahí.
        while (true) {
            delay(5_000L + Random.nextLong(5_000L))
            if (hop.value == 0f) {
                val side = if (Random.nextBoolean()) 9f else -9f
                tilt.animateTo(side, tween(350))
                delay(700)
                tilt.animateTo(0f, tween(350))
            }
        }
    }

    // --- Gestos: arrastre con coordenadas absolutas (la ventana se mueve con el dedo) ---
    val context = LocalContext.current
    val currentOnDrag by rememberUpdatedState(onDrag)
    val currentOnTap by rememberUpdatedState(onTap)
    val currentOnDoubleTap by rememberUpdatedState(onDoubleTap)
    val currentOnLongPress by rememberUpdatedState(onLongPress)
    val gestures = remember {
        val touchSlop = ViewConfiguration.get(context).scaledTouchSlop
        object {
            var lastX = 0f
            var lastY = 0f
            var dragging = false
            val detector = GestureDetector(context, object : GestureDetector.SimpleOnGestureListener() {
                override fun onDown(e: MotionEvent) = true
                override fun onSingleTapConfirmed(e: MotionEvent): Boolean { currentOnTap(); return true }
                override fun onDoubleTap(e: MotionEvent): Boolean { currentOnDoubleTap(); return true }
                override fun onLongPress(e: MotionEvent) { if (!dragging) currentOnLongPress() }
            })

            fun onTouch(event: MotionEvent): Boolean {
                when (event.actionMasked) {
                    MotionEvent.ACTION_DOWN -> { lastX = event.rawX; lastY = event.rawY; dragging = false }
                    MotionEvent.ACTION_MOVE -> {
                        val dx = event.rawX - lastX
                        val dy = event.rawY - lastY
                        if (!dragging && (abs(dx) > touchSlop || abs(dy) > touchSlop)) {
                            dragging = true
                            detector.onTouchEvent(MotionEvent.obtain(event).apply { action = MotionEvent.ACTION_CANCEL })
                        }
                        if (dragging) {
                            currentOnDrag(dx, dy)
                            lastX = event.rawX
                            lastY = event.rawY
                            return true
                        }
                    }
                }
                if (!dragging) detector.onTouchEvent(event)
                return true
            }
        }
    }

    Box(
        Modifier
            .width(SpriteWidth + 22.dp)
            .height(SpriteHeight + 20.dp)
            .graphicsLayer { scaleX = pop.value; scaleY = pop.value; transformOrigin = TransformOrigin(0.5f, 1f) }
            .pointerInteropFilter { gestures.onTouch(it) },
        contentAlignment = Alignment.BottomCenter,
    ) {
        // Sombra en el "suelo": da la sensación de que Laika está parada sobre la pantalla.
        Canvas(Modifier.width(SpriteWidth).height(7.dp)) {
            val shrink = 1f + hop.value / 40f
            drawOval(
                Color.Black.copy(alpha = 0.22f * shrink),
                topLeft = Offset(size.width * (1 - shrink) / 2, 0f),
                size = Size(size.width * shrink, size.height),
            )
        }

        // Halo del color de estado (Calm Palette) cuando hay algo pendiente.
        if (state != SystemState.PERIPHERAL_PASSIVE) {
            Canvas(Modifier.size(SpriteWidth + 18.dp, SpriteHeight).offset(y = (-4).dp)) {
                drawOval(
                    Brush.radialGradient(listOf(stateColor.copy(alpha = (if (critical) 0.7f else 0.45f) * glow), Color.Transparent)),
                    size = size,
                )
            }
        }

        Box(
            Modifier
                .padding(bottom = 3.dp)
                .width(SpriteWidth)
                .height(SpriteHeight)
                .graphicsLayer {
                    transformOrigin = TransformOrigin(0.5f, 1f)
                    translationY = (hop.value + if (exercising) run else 0f) * density
                    rotationZ = tilt.value
                    scaleY = breath
                },
        ) {
            Image(painterResource(R.drawable.laika_sprite), contentDescription = stringResource(R.string.pet_content_description), modifier = Modifier.fillMaxSize())
            if (listening) HelmetLights(awake, glow)
        }

        EmotionEffect(emotion, Modifier.align(Alignment.TopEnd))

        if (pendingBadge) {
            Box(
                Modifier
                    .align(Alignment.TopStart)
                    .graphicsLayer { translationY = hop.value * density * 0.5f }
                    .size(18.dp)
                    .border(1.5.dp, Color.White, RoundedCornerShape(9.dp))
                    .padding(1.5.dp),
            ) {
                Surface(color = stateColor, shape = RoundedCornerShape(8.dp), modifier = Modifier.fillMaxSize()) {
                    Box(contentAlignment = Alignment.Center) {
                        Text("!", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                }
            }
        }
    }
}

/** Las luces azules del casco laten mientras Laika escucha; brillan más cuando espera una orden. */
@Composable
private fun HelmetLights(awake: Boolean, glow: Float) {
    val light = Color(0xFF4FC3F7)
    Canvas(Modifier.fillMaxSize()) {
        // Posición de los auriculares del casco en el sprite.
        val points = listOf(Offset(size.width * 0.17f, size.height * 0.27f), Offset(size.width * 0.95f, size.height * 0.27f))
        val radius = size.width * (if (awake) 0.13f else 0.09f)
        points.forEach {
            drawCircle(
                Brush.radialGradient(listOf(light.copy(alpha = if (awake) glow else glow * 0.6f), Color.Transparent), center = it, radius = radius),
                radius, it,
            )
        }
    }
}

/** Efecto de historieta según la emoción: corazones, "?", "zZ" o "!". */
@Composable
private fun EmotionEffect(emotion: Emotion, modifier: Modifier) {
    val glyph = when (emotion) {
        Emotion.JOYFUL -> "♥"
        Emotion.CURIOUS -> "?"
        Emotion.TIRED -> "z"
        Emotion.CONCERNED, Emotion.PROTECTIVE -> "!"
        Emotion.CALM -> return
    }
    val color = when (emotion) {
        Emotion.JOYFUL -> Color(0xFFE8798A)
        Emotion.TIRED -> Color(0xFF7E8AA2)
        Emotion.PROTECTIVE -> LaikaTheme.status.critical
        Emotion.CONCERNED -> LaikaTheme.status.attention
        else -> MaterialTheme.colorScheme.primary
    }
    val loop = rememberInfiniteTransition(label = "effect")
    val t by loop.animateFloat(0f, 1f, infiniteRepeatable(tween(1_800, easing = LinearEasing)), label = "t")

    Box(modifier.size(26.dp)) {
        // Dos glifos desfasados que suben y se desvanecen.
        listOf(0f, 0.5f).forEachIndexed { i, phase ->
            val p = (t + phase) % 1f
            val rising = emotion == Emotion.JOYFUL || emotion == Emotion.TIRED
            Text(
                text = if (emotion == Emotion.TIRED && i == 1) "Z" else glyph,
                color = color.copy(alpha = if (rising) 1f - p else 0.6f + 0.4f * (1 - p)),
                fontWeight = FontWeight.Bold,
                fontSize = (if (i == 0) 14 else 11).sp,
                modifier = Modifier.graphicsLayer {
                    translationX = (if (i == 0) 0f else 10f) * density
                    translationY = (if (rising) 12f - 18f * p else 4f - 3f * kotlin.math.sin(p * 6.28f)) * density
                },
            )
        }
    }
}

/** Globo de estado compacto: mensaje de Laika + primera acción + botones mínimos. */
@Composable
private fun StateBalloon(status: LaikaStatus, onOpen: () -> Unit, onDismiss: (() -> Unit)?) {
    val event = status.event
    val critical = event.currentSystemState == SystemState.CRITICAL_ALERT
    Balloon(critical = critical, onClick = onOpen) {
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            if (critical) {
                Text(stringResource(event.currentSystemState.labelRes()), color = LaikaTheme.status.critical,
                    style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
            }
            Text(stringResource(event.activeEmotionDisplay.messageRes()), color = BalloonText, style = MaterialTheme.typography.bodyMedium)
            event.prescribedActions.firstOrNull()?.let {
                Text("→ " + it.description, color = BalloonText.copy(alpha = 0.75f), style = MaterialTheme.typography.bodySmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                BalloonLink(stringResource(if (critical) R.string.pet_open_protocol else R.string.pet_open), onOpen)
                onDismiss?.let { BalloonLink(stringResource(R.string.pet_later), it) }
            }
        }
    }
}

/** Pregunta de contexto con respuestas de un toque (menos de 4 s, como toda interacción rutinaria). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ConversationBalloon(conversation: Conversation, onReply: (QuickReply) -> Unit, onClose: () -> Unit) {
    val context = LocalContext.current
    Balloon(critical = false, onClick = null, maxWidth = 236.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.Top) {
                Text(
                    ChatTexts.text(context, conversation.opener),
                    color = BalloonText,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.weight(1f, fill = false),
                )
                Text(
                    "✕",
                    color = BalloonText.copy(alpha = 0.6f),
                    style = MaterialTheme.typography.labelLarge,
                    modifier = Modifier
                        .clickable(onClickLabel = stringResource(R.string.chat_close), onClick = onClose)
                        .padding(start = 8.dp, bottom = 4.dp),
                )
            }
            FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                conversation.replies.forEach { reply ->
                    Surface(
                        color = Color.White,
                        shape = RoundedCornerShape(14.dp),
                        border = BorderStroke(1.dp, BalloonBorder),
                        modifier = Modifier.clickable { onReply(reply) },
                    ) {
                        Text(
                            stringResource(reply.labelRes()),
                            color = BalloonText,
                            style = MaterialTheme.typography.labelMedium,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun BalloonLink(text: String, onClick: () -> Unit) {
    Text(
        text,
        color = MaterialTheme.colorScheme.primary,
        style = MaterialTheme.typography.labelLarge,
        modifier = Modifier.clickable(onClick = onClick).padding(vertical = 4.dp),
    )
}

/** Globo con "colita" que apunta a Laika (abajo a la derecha). */
@Composable
private fun Balloon(critical: Boolean, onClick: (() -> Unit)?, maxWidth: Dp = 210.dp, content: @Composable () -> Unit) {
    val borderColor = if (critical) LaikaTheme.status.critical else BalloonBorder
    val borderWidth = if (critical) 2.dp else 1.dp
    Column(horizontalAlignment = Alignment.End) {
        Surface(
            color = BalloonColor,
            shape = RoundedCornerShape(14.dp),
            shadowElevation = 4.dp,
            modifier = Modifier
                .widthIn(max = maxWidth)
                .border(borderWidth, borderColor, RoundedCornerShape(14.dp))
                .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier),
        ) {
            Box(Modifier.padding(horizontal = 12.dp, vertical = 8.dp)) { content() }
        }
        Canvas(Modifier.padding(end = (SpriteWidth / 2)).size(14.dp, 9.dp)) {
            val tail = Path().apply {
                moveTo(0f, 0f); lineTo(size.width, 0f); lineTo(size.width * 0.75f, size.height); close()
            }
            drawPath(tail, BalloonColor)
            drawLine(borderColor, Offset(0f, 0f), Offset(size.width * 0.75f, size.height), strokeWidth = borderWidth.toPx())
            drawLine(borderColor, Offset(size.width, 0f), Offset(size.width * 0.75f, size.height), strokeWidth = borderWidth.toPx())
        }
    }
}
