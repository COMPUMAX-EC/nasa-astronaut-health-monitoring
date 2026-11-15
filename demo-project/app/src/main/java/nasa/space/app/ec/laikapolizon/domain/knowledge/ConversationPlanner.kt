package nasa.space.app.ec.laikapolizon.domain.knowledge

import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.domain.presence.AppCategory
import java.time.Duration
import java.time.Instant
import java.time.ZoneId
import java.time.temporal.ChronoUnit

/** Tiempo continuo en una app. */
data class AppSession(
    val packageName: String,
    val appLabel: String,
    val category: AppCategory,
    val start: Instant,
    val end: Instant,
) {
    val duration: Duration get() = Duration.between(start, end)
}

/** Convierte los cambios de app en primer plano en sesiones terminadas. */
class AppSessionTracker {
    private data class Open(val packageName: String, val label: String, val category: AppCategory, val start: Instant)

    private var open: Open? = null

    /** [packageName] null = pantalla apagada o app desconocida. Devuelve la sesión que terminó, si había una. */
    fun onForeground(packageName: String?, label: String?, category: AppCategory, now: Instant): AppSession? {
        val previous = open
        if (previous != null && previous.packageName == packageName) return null
        open = if (packageName != null && category.feedsKnowledge) Open(packageName, label ?: packageName, category, now) else null
        return previous?.let { AppSession(it.packageName, it.label, it.category, it.start, now) }
    }

    /** La sesión en curso hasta [now], si la app actual es de redes, video o cámara. */
    fun ongoing(now: Instant): AppSession? = open?.let { AppSession(it.packageName, it.label, it.category, it.start, now) }
}

/** Respuestas de un toque que Laika ofrece en su globo. */
enum class QuickReply(val mood: Mood? = null, val topic: Topic? = null) {
    FELT_GOOD(mood = Mood.GOOD),
    FELT_OK(mood = Mood.NEUTRAL),
    FELT_BAD(mood = Mood.BAD),
    ABOUT_EARTH(topic = Topic.EARTH),
    ABOUT_CREW(topic = Topic.CREW),
    ABOUT_HOME(topic = Topic.FAMILY),
    ABOUT_FUN(topic = Topic.FUN),
    ABOUT_SCIENCE(topic = Topic.SCIENCE),
    ABOUT_SPACE(topic = Topic.SPACE),
    ABOUT_MUSIC(topic = Topic.MUSIC),
    STRETCH,
    NOT_NOW;

    companion object {
        val FEELINGS = listOf(FELT_GOOD, FELT_OK, FELT_BAD)
        val VIDEO_TOPICS = listOf(ABOUT_FUN, ABOUT_SCIENCE, ABOUT_MUSIC, ABOUT_HOME)
        val CAMERA_TOPICS = listOf(ABOUT_EARTH, ABOUT_CREW, ABOUT_HOME, ABOUT_SCIENCE)
        val OPEN_TOPICS = listOf(ABOUT_EARTH, ABOUT_HOME, ABOUT_FUN, ABOUT_SPACE)
        val BREAK = listOf(STRETCH, NOT_NOW)
    }
}

/** Frase de Laika. La capa Android la convierte en texto (strings.xml), igual que `VoiceReply`. */
sealed interface ChatLine {
    // --- Para abrir conversación ---
    data class AfterSocial(val app: String, val minutes: Int) : ChatLine
    data class AfterVideo(val app: String, val minutes: Int) : ChatLine
    data object AfterCamera : ChatLine
    data class LongSession(val app: String, val minutes: Int) : ChatLine
    data class Shared(val kind: NoteKind, val topic: Topic?) : ChatLine
    data class Recall(val daysAgo: Int, val kind: NoteKind, val topic: Topic?, val title: String?) : ChatLine
    data object OpenQuestion : ChatLine

    // --- Respuestas de Laika ---
    data class Felt(val mood: Mood) : ChatLine
    data class Learned(val topic: Topic) : ChatLine
    data object Stretch : ChatLine
    data object NotNow : ChatLine
}

/** Pregunta abierta en el globo, con sus respuestas y de qué se está hablando (para guardar la respuesta). */
data class Conversation(
    val id: Long,
    val opener: ChatLine,
    val replies: List<QuickReply>,
    val aboutApp: String? = null,
    val aboutCategory: AppCategory? = null,
    val aboutTopics: Set<Topic> = emptySet(),
    /** Nota que se está recordando, para no repetirla la próxima vez. */
    val recalledNoteId: Long? = null,
)

/** Una frase de Laika en el globo; el id distingue dos frases iguales seguidas. */
data class ChatMessage(val id: Long, val line: ChatLine)

data class ConversationConfig(
    /** Minutos en redes o videos para que Laika pregunte al salir. */
    val minSessionMinutes: Long = 2,
    /** Segundos con la cámara abierta para preguntar qué se grabó. */
    val minCameraSeconds: Long = 15,
    /** Minutos seguidos en redes o videos para proponer una pausa (una vez por sesión). */
    val longSessionMinutes: Long = 45,
    /** Separación mínima entre preguntas que Laika inicia por su cuenta (control de fatiga). */
    val cooldown: Duration = Duration.ofMinutes(15),
    /** Las notas más nuevas que esto no se "recuerdan" todavía. */
    val recallMinAge: Duration = Duration.ofHours(6),
)

/** Lo que Laika contesta a una respuesta rápida y la nota que guarda. */
data class ConversationAnswer(val line: ChatLine, val note: KnowledgeNote?)

/**
 * Decide cuándo y qué pregunta Laika a partir del contexto (puro y determinista).
 * Reglas de Calm Technology: solo inicia conversación en periferia pasiva, nunca durante una
 * intervención o alerta, y como mucho una vez cada [ConversationConfig.cooldown].
 */
class ConversationPlanner(private val config: ConversationConfig = ConversationConfig()) {

    /** La sesión se guarda como nota si fue lo bastante larga. Solo app y duración. */
    fun sessionNote(session: AppSession): KnowledgeNote? {
        if (!session.category.feedsKnowledge) return null
        val minimum = if (session.category == AppCategory.CAMERA) Duration.ofSeconds(config.minCameraSeconds) else Duration.ofMinutes(1)
        if (session.duration < minimum) return null
        return KnowledgeNote(
            timestamp = session.end,
            kind = NoteKind.APP_SESSION,
            appLabel = session.appLabel,
            category = session.category,
            durationSec = session.duration.seconds,
        )
    }

    fun afterSession(session: AppSession, state: SystemState, now: Instant, lastPromptAt: Instant?): Conversation? {
        if (!mayInitiate(state, now, lastPromptAt)) return null
        val minutes = session.duration.toMinutes().toInt()
        val long = session.duration >= Duration.ofMinutes(config.minSessionMinutes)
        return when (session.category) {
            AppCategory.SOCIAL -> if (long) about(session, ChatLine.AfterSocial(session.appLabel, minutes), QuickReply.FEELINGS) else null
            AppCategory.VIDEO -> if (long) about(session, ChatLine.AfterVideo(session.appLabel, minutes), QuickReply.VIDEO_TOPICS) else null
            AppCategory.CAMERA -> if (session.duration >= Duration.ofSeconds(config.minCameraSeconds)) {
                about(session, ChatLine.AfterCamera, QuickReply.CAMERA_TOPICS)
            } else null
            else -> null
        }
    }

    /** Pausa amable tras mucho rato seguido en redes o videos. */
    fun longSession(ongoing: AppSession, state: SystemState, now: Instant, lastPromptAt: Instant?): Conversation? {
        if (ongoing.category != AppCategory.SOCIAL && ongoing.category != AppCategory.VIDEO) return null
        if (ongoing.duration < Duration.ofMinutes(config.longSessionMinutes)) return null
        if (!mayInitiate(state, now, lastPromptAt)) return null
        return about(ongoing, ChatLine.LongSession(ongoing.appLabel, ongoing.duration.toMinutes().toInt()), QuickReply.BREAK)
    }

    /** Reacción a algo que el astronauta compartió. Lo inició él: no aplica la pausa entre preguntas. */
    fun shared(note: KnowledgeNote, state: SystemState): Conversation? {
        if (state == SystemState.CRITICAL_ALERT || !note.kind.isShared) return null
        val topic = note.topics.firstOrNull()
        // Si ya sabe de qué trata, pregunta cómo se sintió; si no, pregunta de qué trata.
        val replies = when {
            topic != null -> QuickReply.FEELINGS
            note.kind == NoteKind.SHARED_VIDEO -> QuickReply.VIDEO_TOPICS
            note.kind == NoteKind.SHARED_IMAGE -> QuickReply.CAMERA_TOPICS
            else -> QuickReply.OPEN_TOPICS
        }
        return Conversation(0, ChatLine.Shared(note.kind, topic), replies, note.appLabel, note.category, note.topics)
    }

    /**
     * El astronauta toca a Laika: recuerda algo que le contó (memoria episódica) o, si aún no sabe
     * nada, le hace una pregunta abierta.
     */
    fun startChat(notes: List<KnowledgeNote>, now: Instant, zone: ZoneId, lastRecalledId: Long?): Conversation {
        val note = recallCandidate(notes, now, lastRecalledId)
            ?: return Conversation(0, ChatLine.OpenQuestion, QuickReply.OPEN_TOPICS)
        val daysAgo = ChronoUnit.DAYS.between(note.timestamp.atZone(zone).toLocalDate(), now.atZone(zone).toLocalDate()).toInt()
        return Conversation(
            id = 0,
            opener = ChatLine.Recall(daysAgo, note.kind, note.topics.firstOrNull(), note.text.takeIf { note.kind.isShared }),
            replies = QuickReply.FEELINGS,
            aboutApp = note.appLabel,
            aboutCategory = note.category,
            aboutTopics = note.topics,
            recalledNoteId = note.id,
        )
    }

    fun recallCandidate(notes: List<KnowledgeNote>, now: Instant, lastRecalledId: Long?): KnowledgeNote? =
        notes
            .filter { it.topics.isNotEmpty() || (it.kind.isShared && !it.text.isNullOrBlank()) }
            .filter { Duration.between(it.timestamp, now) >= config.recallMinAge }
            .filter { it.mood != Mood.BAD } // no se trae de vuelta un mal rato
            .filter { it.id != lastRecalledId }
            .maxByOrNull { it.timestamp }

    fun answer(conversation: Conversation, reply: QuickReply, now: Instant): ConversationAnswer {
        fun note(mood: Mood? = null, extraTopic: Topic? = null) = KnowledgeNote(
            timestamp = now,
            kind = NoteKind.ANSWER,
            appLabel = conversation.aboutApp,
            category = conversation.aboutCategory,
            topics = conversation.aboutTopics + listOfNotNull(extraTopic),
            mood = mood,
        )
        return when {
            reply.mood != null -> ConversationAnswer(ChatLine.Felt(reply.mood), note(mood = reply.mood))
            reply.topic != null -> ConversationAnswer(ChatLine.Learned(reply.topic), note(extraTopic = reply.topic))
            reply == QuickReply.STRETCH -> ConversationAnswer(ChatLine.Stretch, null)
            else -> ConversationAnswer(ChatLine.NotNow, null)
        }
    }

    private fun mayInitiate(state: SystemState, now: Instant, lastPromptAt: Instant?): Boolean =
        state == SystemState.PERIPHERAL_PASSIVE &&
            (lastPromptAt == null || Duration.between(lastPromptAt, now) >= config.cooldown)

    private fun about(session: AppSession, line: ChatLine, replies: List<QuickReply>) =
        Conversation(0, line, replies, session.appLabel, session.category)
}
