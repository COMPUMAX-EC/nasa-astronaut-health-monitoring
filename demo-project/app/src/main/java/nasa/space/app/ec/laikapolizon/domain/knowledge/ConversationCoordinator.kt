package nasa.space.app.ec.laikapolizon.domain.knowledge

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import nasa.space.app.ec.laikapolizon.domain.engine.LaikaStatus
import nasa.space.app.ec.laikapolizon.domain.presence.AppCategory
import nasa.space.app.ec.laikapolizon.domain.presence.PresenceState
import java.time.Clock
import java.time.Duration
import java.time.Instant

/**
 * Une el contexto (apps en primer plano, lo compartido, las respuestas) con el globo del screen pet.
 * Las decisiones las toma [ConversationPlanner]; aquí solo se guarda estado y se publican las
 * preguntas en [PresenceState]. Nunca toca el estado de salud: eso es del LaikaEngine.
 */
class ConversationCoordinator(
    private val repository: KnowledgeRepository,
    private val presence: PresenceState,
    private val status: StateFlow<LaikaStatus>,
    private val scope: CoroutineScope,
    private val clock: Clock,
    private val planner: ConversationPlanner = ConversationPlanner(),
    /** Tiempo que una pregunta queda abierta antes de retirarse sola (no insiste). */
    private val openFor: Duration = Duration.ofSeconds(30),
) {
    val notes: StateFlow<List<KnowledgeNote>> = repository.observeAll().stateIn(scope, SharingStarted.Eagerly, emptyList())

    private val tracker = AppSessionTracker()
    private var lastPromptAt: Instant? = null
    private var lastRecalledId: Long? = null
    private var nudgedSession: Instant? = null
    private var nextId = 1L
    private var expiry: Job? = null

    private val state get() = status.value.event.currentSystemState

    fun onForegroundApp(packageName: String?, label: String?, category: AppCategory) {
        val now = clock.instant()
        val ended = tracker.onForeground(packageName, label, category, now) ?: return
        planner.sessionNote(ended)?.let { note -> scope.launch { repository.add(note) } }
        offer(planner.afterSession(ended, state, now, lastPromptAt))
    }

    /** Llamar periódicamente: propone una pausa tras mucho rato seguido en redes o videos. */
    fun onTick() {
        val now = clock.instant()
        val ongoing = tracker.ongoing(now) ?: return
        if (nudgedSession == ongoing.start) return
        planner.longSession(ongoing, state, now, lastPromptAt)?.let {
            nudgedSession = ongoing.start
            offer(it)
        }
    }

    /** Guarda lo compartido y, si Laika flotante está activa, reacciona en su globo. */
    suspend fun onShared(note: KnowledgeNote) {
        val id = repository.add(note)
        planner.shared(note.copy(id = id), state)?.let { offer(it, initiatedByUser = true) }
    }

    /** El astronauta tocó a Laika sin nada pendiente. */
    fun startChat() {
        val conversation = planner.startChat(notes.value, clock.instant(), clock.zone, lastRecalledId)
        conversation.recalledNoteId?.let { lastRecalledId = it }
        offer(conversation, initiatedByUser = true)
    }

    fun answer(reply: QuickReply) {
        val conversation = presence.conversation.value ?: return
        presence.conversation.value = null
        val result = planner.answer(conversation, reply, clock.instant())
        result.note?.let { note -> scope.launch { repository.add(note) } }
        presence.chatMessage.value = ChatMessage(nextId++, result.line)
    }

    fun dismiss() {
        presence.conversation.value = null
    }

    fun forget(id: Long) = scope.launch { repository.delete(id) }

    fun forgetAll() = scope.launch { repository.clear() }

    private fun offer(conversation: Conversation?, initiatedByUser: Boolean = false) {
        if (conversation == null) return
        // Sin globo que lo muestre (Laika flotante apagada o el astronauta ya está en la app) no se pregunta.
        if (!presence.petRunning.value || presence.appVisible.value) return
        val published = conversation.copy(id = nextId++)
        presence.conversation.value = published
        if (!initiatedByUser) lastPromptAt = clock.instant()
        expiry?.cancel()
        expiry = scope.launch {
            delay(openFor.toMillis())
            if (presence.conversation.value?.id == published.id) presence.conversation.value = null
        }
    }
}
