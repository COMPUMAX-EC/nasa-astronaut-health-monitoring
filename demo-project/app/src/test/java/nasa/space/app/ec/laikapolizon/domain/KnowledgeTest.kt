package nasa.space.app.ec.laikapolizon.domain

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import nasa.space.app.ec.laikapolizon.domain.engine.LaikaStatus
import nasa.space.app.ec.laikapolizon.domain.knowledge.AppSession
import nasa.space.app.ec.laikapolizon.domain.knowledge.AppSessionTracker
import nasa.space.app.ec.laikapolizon.domain.knowledge.ChatLine
import nasa.space.app.ec.laikapolizon.domain.knowledge.ConversationCoordinator
import nasa.space.app.ec.laikapolizon.domain.knowledge.ConversationPlanner
import nasa.space.app.ec.laikapolizon.domain.knowledge.KnowledgeNote
import nasa.space.app.ec.laikapolizon.domain.knowledge.KnowledgeRepository
import nasa.space.app.ec.laikapolizon.domain.knowledge.KnowledgeSummary
import nasa.space.app.ec.laikapolizon.domain.knowledge.LinkInfo
import nasa.space.app.ec.laikapolizon.domain.knowledge.Mood
import nasa.space.app.ec.laikapolizon.domain.knowledge.NoteKind
import nasa.space.app.ec.laikapolizon.domain.knowledge.QuickReply
import nasa.space.app.ec.laikapolizon.domain.knowledge.SharedContent
import nasa.space.app.ec.laikapolizon.domain.knowledge.Topic
import nasa.space.app.ec.laikapolizon.domain.knowledge.TopicExtractor
import nasa.space.app.ec.laikapolizon.domain.model.Emotion
import nasa.space.app.ec.laikapolizon.domain.model.LaikaStateEvent
import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.domain.presence.AppCategorizer
import nasa.space.app.ec.laikapolizon.domain.presence.AppCategory
import nasa.space.app.ec.laikapolizon.domain.presence.PresenceState
import nasa.space.app.ec.laikapolizon.domain.presence.SystemAppCategory
import nasa.space.app.ec.laikapolizon.domain.voice.IntentParser
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceContext
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceDialogue
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceIntent
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceReply
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.time.ZoneId
import java.time.ZoneOffset

class FakeKnowledgeRepository : KnowledgeRepository {
    val notes = MutableStateFlow<List<KnowledgeNote>>(emptyList())
    private var nextId = 1L
    override fun observeAll(): Flow<List<KnowledgeNote>> = notes
    override suspend fun add(note: KnowledgeNote): Long {
        val id = nextId++
        notes.value = (listOf(note.copy(id = id)) + notes.value).sortedByDescending { it.timestamp }
        return id
    }
    override suspend fun delete(id: Long) { notes.value = notes.value.filterNot { it.id == id } }
    override suspend fun clear() { notes.value = emptyList() }
}

class KnowledgeTest {

    private val t0 = Instant.parse("2026-11-15T10:00:00Z")
    private val zone: ZoneId = ZoneOffset.UTC
    private val planner = ConversationPlanner()

    private fun session(category: AppCategory, minutes: Long, label: String = "Instagram", end: Instant = t0) =
        AppSession("com.instagram.android", label, category, end.minus(Duration.ofMinutes(minutes)), end)

    // --- Categorías ---

    @Test fun `social video and camera apps are recognized`() {
        assertEquals(AppCategory.SOCIAL, AppCategorizer.categorize("com.instagram.android"))
        assertEquals(AppCategory.SOCIAL, AppCategorizer.categorize("com.zhiliaoapp.musically")) // TikTok
        assertEquals(AppCategory.VIDEO, AppCategorizer.categorize("com.google.android.youtube"))
        assertEquals(AppCategory.CAMERA, AppCategorizer.categorize("com.android.camera2"))
        assertEquals(AppCategory.SOCIAL, AppCategorizer.categorize("com.example.chat", SystemAppCategory.SOCIAL))
        assertTrue(AppCategory.SOCIAL.feedsKnowledge)
        assertFalse(AppCategory.LEISURE.feedsKnowledge)
    }

    // --- Temas y contenido compartido ---

    @Test fun `topics come from keywords hashtags and plurals`() {
        assertEquals(setOf(Topic.EARTH), TopicExtractor.topics("Amanecer sobre el #PlanetaTierra"))
        assertEquals(setOf(Topic.PETS, Topic.FUN), TopicExtractor.topics("mi perrita haciendo travesuras jajaja"))
        assertEquals(setOf(Topic.SPACE), TopicExtractor.topics("Fotos de Marte"))
        assertTrue(TopicExtractor.topics("reunión de presupuesto").isEmpty())
    }

    @Test fun `shared link keeps text without url and is never opened`() {
        val note = SharedContent.toNote("text/plain", "Mira este amanecer https://www.youtube.com/watch?v=abc", null, null, null, null, t0)!!
        assertEquals(NoteKind.SHARED_LINK, note.kind)
        assertEquals("Mira este amanecer", note.text)
        assertEquals(AppCategory.VIDEO, note.category)
        assertEquals("youtube.com", note.appLabel)
        assertEquals(setOf(Topic.EARTH), note.topics)
        assertEquals("instagram.com", LinkInfo.host("https://m.instagram.com/p/1"))
    }

    @Test fun `shared video uses file name and duration`() {
        val note = SharedContent.toNote("video/mp4", null, null, "aurora_desde_la_cupula", 42, "Galería", t0)!!
        assertEquals(NoteKind.SHARED_VIDEO, note.kind)
        assertEquals(42L, note.durationSec)
        assertEquals(setOf(Topic.EARTH), note.topics)
        assertNull(SharedContent.toNote("application/pdf", null, null, null, null, null, t0))
    }

    // --- Sesiones ---

    @Test fun `tracker closes a session when the app changes or the screen turns off`() {
        val tracker = AppSessionTracker()
        assertNull(tracker.onForeground("com.instagram.android", "Instagram", AppCategory.SOCIAL, t0))
        assertNull(tracker.onForeground("com.instagram.android", "Instagram", AppCategory.SOCIAL, t0.plusSeconds(60)))
        val ended = tracker.onForeground(null, null, AppCategory.NEUTRAL, t0.plusSeconds(300))!!
        assertEquals(Duration.ofMinutes(5), ended.duration)
        // Apps que no aportan contexto no abren sesión.
        assertNull(tracker.onForeground("com.android.settings", "Ajustes", AppCategory.NEUTRAL, t0.plusSeconds(400)))
        assertNull(tracker.onForeground("com.instagram.android", "Instagram", AppCategory.SOCIAL, t0.plusSeconds(500)))
        assertEquals(Duration.ofSeconds(100), tracker.ongoing(t0.plusSeconds(600))!!.duration)
    }

    @Test fun `only meaningful sessions become notes and they never carry content`() {
        assertNull(planner.sessionNote(session(AppCategory.SOCIAL, 0)))
        val note = planner.sessionNote(session(AppCategory.SOCIAL, 12))!!
        assertEquals(NoteKind.APP_SESSION, note.kind)
        assertEquals(720L, note.durationSec)
        assertNull(note.text)
        assertNull(planner.sessionNote(session(AppCategory.NEUTRAL, 30)))
    }

    // --- Cuándo pregunta Laika ---

    @Test fun `asks how social media felt after a session`() {
        val c = planner.afterSession(session(AppCategory.SOCIAL, 12), SystemState.PERIPHERAL_PASSIVE, t0, null)!!
        assertEquals(ChatLine.AfterSocial("Instagram", 12), c.opener)
        assertEquals(QuickReply.FEELINGS, c.replies)
        assertEquals(ChatLine.AfterCamera, planner.afterSession(session(AppCategory.CAMERA, 1), SystemState.PERIPHERAL_PASSIVE, t0, null)!!.opener)
    }

    @Test fun `calm technology - no prompts for short sessions, pending care or within cooldown`() {
        assertNull(planner.afterSession(session(AppCategory.SOCIAL, 1), SystemState.PERIPHERAL_PASSIVE, t0, null))
        assertNull(planner.afterSession(session(AppCategory.SOCIAL, 12), SystemState.THERAPEUTIC_INTERVENTION, t0, null))
        assertNull(planner.afterSession(session(AppCategory.SOCIAL, 12), SystemState.PERIPHERAL_PASSIVE, t0, t0.minusSeconds(60)))
        assertNotNull(planner.afterSession(session(AppCategory.SOCIAL, 12), SystemState.PERIPHERAL_PASSIVE, t0, t0.minus(Duration.ofMinutes(20))))
    }

    @Test fun `suggests a break after a long scroll`() {
        assertNull(planner.longSession(session(AppCategory.SOCIAL, 30), SystemState.PERIPHERAL_PASSIVE, t0, null))
        val c = planner.longSession(session(AppCategory.SOCIAL, 50), SystemState.PERIPHERAL_PASSIVE, t0, null)!!
        assertEquals(ChatLine.LongSession("Instagram", 50), c.opener)
        assertNull(planner.longSession(session(AppCategory.CAMERA, 50), SystemState.PERIPHERAL_PASSIVE, t0, null))
    }

    @Test fun `shared content gets a reaction except during a critical alert`() {
        val video = SharedContent.toNote("video/mp4", null, null, "clip", 10, null, t0)!!
        val c = planner.shared(video, SystemState.MICRO_INTERACTION)!!
        assertEquals(ChatLine.Shared(NoteKind.SHARED_VIDEO, null), c.opener)
        assertEquals(QuickReply.VIDEO_TOPICS, c.replies)
        val earth = video.copy(topics = setOf(Topic.EARTH))
        assertEquals(QuickReply.FEELINGS, planner.shared(earth, SystemState.PERIPHERAL_PASSIVE)!!.replies)
        assertNull(planner.shared(video, SystemState.CRITICAL_ALERT))
    }

    @Test fun `answers are saved as notes with the context of the question`() {
        val c = planner.afterSession(session(AppCategory.SOCIAL, 12), SystemState.PERIPHERAL_PASSIVE, t0, null)!!
        val felt = planner.answer(c, QuickReply.FELT_GOOD, t0)
        assertEquals(ChatLine.Felt(Mood.GOOD), felt.line)
        assertEquals(Mood.GOOD, felt.note!!.mood)
        assertEquals("Instagram", felt.note!!.appLabel)

        val learned = planner.answer(c, QuickReply.ABOUT_EARTH, t0)
        assertEquals(setOf(Topic.EARTH), learned.note!!.topics)
        assertNull(planner.answer(c, QuickReply.NOT_NOW, t0).note)
    }

    // --- Recordar ---

    @Test fun `recalls an older note, skips bad moods and the last recalled one`() {
        val old = KnowledgeNote(1, t0.minus(Duration.ofDays(3)), NoteKind.ANSWER, topics = setOf(Topic.EARTH))
        val bad = KnowledgeNote(2, t0.minus(Duration.ofDays(1)), NoteKind.ANSWER, topics = setOf(Topic.FAMILY), mood = Mood.BAD)
        val fresh = KnowledgeNote(3, t0.minusSeconds(60), NoteKind.ANSWER, topics = setOf(Topic.FUN))
        val notes = listOf(fresh, bad, old)

        val c = planner.startChat(notes, t0, zone, lastRecalledId = null)
        assertEquals(ChatLine.Recall(3, NoteKind.ANSWER, Topic.EARTH, null), c.opener)
        assertEquals(1L, c.recalledNoteId)
        assertEquals(ChatLine.OpenQuestion, planner.startChat(notes, t0, zone, lastRecalledId = 1).opener)
        assertEquals(ChatLine.OpenQuestion, planner.startChat(emptyList(), t0, zone, null).opener)
    }

    @Test fun `day summary adds minutes, camera uses, shares and topics`() {
        val notes = listOf(
            KnowledgeNote(1, t0, NoteKind.APP_SESSION, "Instagram", AppCategory.SOCIAL, durationSec = 600),
            KnowledgeNote(2, t0, NoteKind.APP_SESSION, "TikTok", AppCategory.SOCIAL, durationSec = 300),
            KnowledgeNote(3, t0, NoteKind.APP_SESSION, "YouTube", AppCategory.VIDEO, durationSec = 1200),
            KnowledgeNote(4, t0, NoteKind.APP_SESSION, "Cámara", AppCategory.CAMERA, durationSec = 40),
            KnowledgeNote(5, t0, NoteKind.SHARED_VIDEO, topics = setOf(Topic.EARTH)),
            KnowledgeNote(6, t0, NoteKind.ANSWER, topics = setOf(Topic.EARTH, Topic.CREW), mood = Mood.GOOD),
            KnowledgeNote(7, t0.minus(Duration.ofDays(1)), NoteKind.APP_SESSION, "Instagram", AppCategory.SOCIAL, durationSec = 6000),
        )
        val day = KnowledgeSummary.day(notes, t0.atZone(zone).toLocalDate(), zone)
        assertEquals(15, day.socialMinutes)
        assertEquals(20, day.videoMinutes)
        assertEquals(1, day.cameraSessions)
        assertEquals(1, day.shared)
        assertEquals(listOf(Topic.EARTH, Topic.CREW), day.topics)
        assertEquals(mapOf(Mood.GOOD to 1), day.moods)
    }

    // --- Voz ---

    @Test fun `voice understands day and chat requests`() {
        assertEquals(VoiceIntent.QueryDay, IntentParser.parse("qué hice hoy"))
        assertEquals(VoiceIntent.Chat, IntentParser.parse("platiquemos un rato"))
        assertEquals(VoiceIntent.Chat, IntentParser.parse("qué recuerdas"))

        val notes = listOf(KnowledgeNote(1, t0.minus(Duration.ofDays(2)), NoteKind.ANSWER, topics = setOf(Topic.EARTH)))
        val ctx = VoiceContext(SystemState.PERIPHERAL_PASSIVE, 70.0, Emotion.CALM, emptyList(), emptyMap(), false, notes, zone)
        val chat = VoiceDialogue().onUtterance("Laika platiquemos", t0, ctx).reply
        assertEquals(VoiceReply.Chat(ChatLine.Recall(2, NoteKind.ANSWER, Topic.EARTH, null)), chat)
        assertTrue(VoiceDialogue().onUtterance("Laika qué hice hoy", t0, ctx).reply is VoiceReply.Day)
    }

    // --- Coordinador ---

    private fun status(state: SystemState) = MutableStateFlow(
        LaikaStatus(LaikaStateEvent(t0, state, 70.0, Emotion.CALM), emptyList(), opportuneMoment = false)
    )

    private fun TestScope.coordinator(repo: FakeKnowledgeRepository, presence: PresenceState, clock: MutableClock) =
        ConversationCoordinator(repo, presence, status(SystemState.PERIPHERAL_PASSIVE), backgroundScope, clock)

    @Test fun `coordinator asks after a session, saves the answer and respects the cooldown`() = runTest {
        val repo = FakeKnowledgeRepository()
        val presence = PresenceState().apply { petRunning.value = true }
        val clock = MutableClock(t0)
        val coordinator = coordinator(repo, presence, clock)

        coordinator.onForegroundApp("com.instagram.android", "Instagram", AppCategory.SOCIAL)
        clock.now = t0.plus(Duration.ofMinutes(10))
        coordinator.onForegroundApp("com.android.launcher", "Inicio", AppCategory.NEUTRAL)
        runCurrent()
        val asked = presence.conversation.value!!
        assertEquals(ChatLine.AfterSocial("Instagram", 10), asked.opener)
        assertEquals(NoteKind.APP_SESSION, repo.notes.value.single().kind)

        coordinator.answer(QuickReply.FELT_BAD)
        runCurrent()
        assertNull(presence.conversation.value)
        assertEquals(ChatLine.Felt(Mood.BAD), presence.chatMessage.value!!.line)
        assertEquals(Mood.BAD, repo.notes.value.first { it.kind == NoteKind.ANSWER }.mood)

        // Otra sesión al rato: no vuelve a preguntar (pausa entre preguntas).
        coordinator.onForegroundApp("com.instagram.android", "Instagram", AppCategory.SOCIAL)
        clock.now = clock.now.plus(Duration.ofMinutes(5))
        coordinator.onForegroundApp(null, null, AppCategory.NEUTRAL)
        assertNull(presence.conversation.value)
    }

    @Test fun `coordinator stays quiet without the floating pet or inside the app, and questions expire`() = runTest {
        val repo = FakeKnowledgeRepository()
        val presence = PresenceState()
        val clock = MutableClock(t0)
        val coordinator = coordinator(repo, presence, clock)

        coordinator.startChat()
        assertNull(presence.conversation.value) // Laika flotante apagada

        presence.petRunning.value = true
        presence.appVisible.value = true
        coordinator.startChat()
        assertNull(presence.conversation.value) // el astronauta ya está en la app

        presence.appVisible.value = false
        coordinator.startChat()
        assertNotNull(presence.conversation.value)
        advanceTimeBy(31_000)
        assertNull(presence.conversation.value)
    }

    @Test fun `sharing stores the note and reacts`() = runTest {
        val repo = FakeKnowledgeRepository()
        val presence = PresenceState().apply { petRunning.value = true }
        val coordinator = coordinator(repo, presence, MutableClock(t0))
        coordinator.onShared(SharedContent.toNote("text/plain", "Foto de mi familia", null, null, null, null, t0)!!)
        assertEquals(NoteKind.SHARED_TEXT, repo.notes.value.single().kind)
        assertEquals(ChatLine.Shared(NoteKind.SHARED_TEXT, Topic.FAMILY), presence.conversation.value!!.opener)
    }
}

class MutableClock(var now: Instant, private val zone: ZoneId = ZoneOffset.UTC) : Clock() {
    override fun getZone(): ZoneId = zone
    override fun withZone(zone: ZoneId): Clock = MutableClock(now, zone)
    override fun instant(): Instant = now
}
