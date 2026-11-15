package nasa.space.app.ec.laikapolizon.domain.voice

import nasa.space.app.ec.laikapolizon.domain.knowledge.ChatLine
import nasa.space.app.ec.laikapolizon.domain.knowledge.ConversationPlanner
import nasa.space.app.ec.laikapolizon.domain.knowledge.DaySummary
import nasa.space.app.ec.laikapolizon.domain.knowledge.KnowledgeNote
import nasa.space.app.ec.laikapolizon.domain.knowledge.KnowledgeSummary
import nasa.space.app.ec.laikapolizon.domain.model.Emotion
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.model.PrescribedAction
import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.domain.validation.MeasurementValidator
import nasa.space.app.ec.laikapolizon.domain.validation.ValidationIssue
import nasa.space.app.ec.laikapolizon.domain.validation.ValidationResult
import java.time.Duration
import java.time.Instant
import java.time.ZoneId

/** Lo que Laika sabe en el momento de responder. */
data class VoiceContext(
    val state: SystemState,
    val vitality: Double,
    val emotion: Emotion,
    val actions: List<PrescribedAction>,
    /** Último registro vigente de cada tipo. */
    val latest: Map<MeasurementType, MeasurementRecord>,
    val radiationAlert: Boolean,
    /** Contexto social: sesiones de apps, lo compartido y las respuestas (más recientes primero). */
    val knowledge: List<KnowledgeNote> = emptyList(),
    val zone: ZoneId = ZoneId.systemDefault(),
)

/** Respuesta de Laika; la capa Android la convierte en texto (strings.xml) y voz. */
sealed interface VoiceReply {
    data object Listening : VoiceReply
    data class ConfirmMeasurement(val type: MeasurementType, val value: Double, val secondaryValue: Double?, val unusual: Boolean) : VoiceReply
    data class MeasurementSaved(val type: MeasurementType) : VoiceReply
    data object MeasurementCancelled : VoiceReply
    data class MeasurementRejected(val type: MeasurementType, val issue: ValidationIssue) : VoiceReply
    data class MissingNumber(val type: MeasurementType) : VoiceReply
    data class Status(val state: SystemState, val vitality: Double, val emotion: Emotion, val firstAction: PrescribedAction?) : VoiceReply
    data class MetricValue(val type: MeasurementType, val record: MeasurementRecord?) : VoiceReply
    data class Radiation(val record: MeasurementRecord?, val alert: Boolean) : VoiceReply
    data object ActionCompleted : VoiceReply
    data object Greeting : VoiceReply
    data class Day(val summary: DaySummary) : VoiceReply
    data class Chat(val line: ChatLine) : VoiceReply
    data object Muted : VoiceReply
    data object NotUnderstood : VoiceReply
    data object ConfirmYesOrNo : VoiceReply
}

sealed interface VoiceEffect {
    data class SaveMeasurement(val type: MeasurementType, val value: Double, val secondaryValue: Double?, val transcript: String) : VoiceEffect
    data object CompleteAction : VoiceEffect
    data object Mute : VoiceEffect
}

data class DialogueOutput(val reply: VoiceReply? = null, val effects: List<VoiceEffect> = emptyList())

/**
 * Gestor de diálogo: wake word, ventana de conversación y confirmación de dictados.
 * Sin wake word y fuera de la ventana de conversación, lo que se escucha se ignora.
 */
class VoiceDialogue(private val conversationWindow: Duration = Duration.ofSeconds(10)) {

    private sealed interface Mode {
        data object Idle : Mode
        data class Conversation(val until: Instant) : Mode
        data class AwaitingConfirmation(val pending: VoiceEffect.SaveMeasurement, val until: Instant) : Mode
    }

    private var mode: Mode = Mode.Idle
    private val planner = ConversationPlanner()
    private var lastRecalledId: Long? = null

    /** Verdadero si Laika está esperando una orden o una confirmación (para el indicador de "orejas"). */
    fun isAwake(now: Instant): Boolean = when (val m = mode) {
        Mode.Idle -> false
        is Mode.Conversation -> now.isBefore(m.until)
        is Mode.AwaitingConfirmation -> now.isBefore(m.until)
    }

    fun onUtterance(text: String, now: Instant, context: VoiceContext): DialogueOutput {
        val afterWake = IntentParser.afterWakeWord(text)
        val current = mode

        if (current is Mode.AwaitingConfirmation && now.isBefore(current.until)) {
            when (IntentParser.parse(afterWake ?: text)) {
                VoiceIntent.Yes -> {
                    mode = Mode.Conversation(now + conversationWindow)
                    return DialogueOutput(VoiceReply.MeasurementSaved(current.pending.type), listOf(current.pending))
                }
                VoiceIntent.No -> {
                    mode = Mode.Conversation(now + conversationWindow)
                    return DialogueOutput(VoiceReply.MeasurementCancelled)
                }
                is VoiceIntent.LogMeasurement -> Unit // un nuevo dictado reemplaza al pendiente
                else -> {
                    mode = current.copy(until = now + conversationWindow)
                    return DialogueOutput(VoiceReply.ConfirmYesOrNo)
                }
            }
        }

        val command = when {
            afterWake != null -> afterWake
            current is Mode.Conversation && now.isBefore(current.until) -> text
            current is Mode.AwaitingConfirmation && now.isBefore(current.until) -> text
            else -> {
                mode = Mode.Idle
                return DialogueOutput() // sin "Laika": no es para ella
            }
        }

        if (command.isBlank()) {
            mode = Mode.Conversation(now + conversationWindow)
            return DialogueOutput(VoiceReply.Listening)
        }
        return handle(IntentParser.parse(command), text, now, context)
    }

    private fun handle(intent: VoiceIntent, transcript: String, now: Instant, context: VoiceContext): DialogueOutput {
        mode = Mode.Conversation(now + conversationWindow)
        return when (intent) {
            is VoiceIntent.LogMeasurement -> {
                when (val v = MeasurementValidator.validate(intent.type, intent.value, intent.secondaryValue)) {
                    is ValidationResult.Invalid -> DialogueOutput(VoiceReply.MeasurementRejected(intent.type, v.issue))
                    else -> {
                        // Regla del módulo C: todo dictado se repite y se confirma antes de guardarse.
                        val pending = VoiceEffect.SaveMeasurement(intent.type, intent.value, intent.secondaryValue, transcript)
                        mode = Mode.AwaitingConfirmation(pending, now + conversationWindow)
                        DialogueOutput(
                            VoiceReply.ConfirmMeasurement(
                                intent.type, intent.value, intent.secondaryValue,
                                unusual = v is ValidationResult.NeedsConfirmation,
                            )
                        )
                    }
                }
            }
            is VoiceIntent.MissingNumber -> DialogueOutput(VoiceReply.MissingNumber(intent.type))
            is VoiceIntent.QueryMetric -> DialogueOutput(VoiceReply.MetricValue(intent.type, context.latest[intent.type]))
            VoiceIntent.QueryStatus -> DialogueOutput(
                VoiceReply.Status(context.state, context.vitality, context.emotion, context.actions.firstOrNull())
            )
            VoiceIntent.RadiationStatus -> DialogueOutput(
                VoiceReply.Radiation(context.latest[MeasurementType.NEUTRON_DOSE_RATE], context.radiationAlert)
            )
            VoiceIntent.ActionDone -> DialogueOutput(VoiceReply.ActionCompleted, listOf(VoiceEffect.CompleteAction))
            VoiceIntent.Greeting -> DialogueOutput(VoiceReply.Greeting)
            VoiceIntent.QueryDay -> DialogueOutput(
                VoiceReply.Day(KnowledgeSummary.day(context.knowledge, now.atZone(context.zone).toLocalDate(), context.zone))
            )
            VoiceIntent.Chat -> {
                val conversation = planner.startChat(context.knowledge, now, context.zone, lastRecalledId)
                conversation.recalledNoteId?.let { lastRecalledId = it }
                DialogueOutput(VoiceReply.Chat(conversation.opener))
            }
            VoiceIntent.Mute -> {
                mode = Mode.Idle
                DialogueOutput(VoiceReply.Muted, listOf(VoiceEffect.Mute))
            }
            VoiceIntent.Yes, VoiceIntent.No, VoiceIntent.Unknown -> DialogueOutput(VoiceReply.NotUnderstood)
        }
    }
}
