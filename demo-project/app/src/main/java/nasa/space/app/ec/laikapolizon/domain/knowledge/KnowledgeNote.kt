package nasa.space.app.ec.laikapolizon.domain.knowledge

import kotlinx.coroutines.flow.Flow
import nasa.space.app.ec.laikapolizon.domain.presence.AppCategory
import nasa.space.app.ec.laikapolizon.domain.voice.SpanishText
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/**
 * Conocimiento de Laika sobre el día del astronauta (docs/10, "Contexto social").
 * Solo hay tres fuentes: el tiempo en apps de redes, video y cámara (nunca su contenido),
 * lo que el astronauta comparte a propósito con "Mostrar a Laika" y sus respuestas a Laika.
 */
enum class NoteKind {
    /** Tiempo en una app de redes, video o cámara. Solo nombre de la app y duración. */
    APP_SESSION,
    SHARED_TEXT,
    SHARED_LINK,
    SHARED_VIDEO,
    SHARED_IMAGE,
    /** Respuesta a una pregunta de Laika (cómo se sintió, de qué trataba). */
    ANSWER;

    val isShared: Boolean get() = this == SHARED_TEXT || this == SHARED_LINK || this == SHARED_VIDEO || this == SHARED_IMAGE
}

enum class Mood { GOOD, NEUTRAL, BAD }

/** Temas que Laika reconoce por palabras clave (español e inglés, sin tildes). */
enum class Topic(val keywords: List<String>) {
    EARTH(listOf("tierra", "planeta", "earth", "amanecer", "atardecer", "aurora", "oceano", "cupula", "nubes", "planet")),
    CREW(listOf("tripulacion", "tripulante", "comandante", "companero", "companera", "crew")),
    FAMILY(listOf("familia", "mama", "papa", "hijo", "hija", "hermano", "hermana", "abuela", "abuelo", "esposa", "esposo", "hogar", "family", "mom", "dad")),
    FUN(listOf("meme", "chiste", "risa", "gracioso", "graciosa", "divertido", "divertida", "lol", "humor", "funny")),
    SPACE(listOf("estrella", "galaxia", "luna", "marte", "nebulosa", "nasa", "cohete", "space", "mars", "moon", "astronauta", "orbita", "satelite")),
    SCIENCE(listOf("experimento", "ciencia", "laboratorio", "science", "investigacion", "biologia", "fisica")),
    NATURE(listOf("naturaleza", "bosque", "mar", "playa", "montana", "flor", "nature", "arbol", "lluvia", "rio")),
    PETS(listOf("perro", "perrita", "perrito", "gato", "gatito", "mascota", "dog", "cat", "cachorro", "puppy")),
    FOOD(listOf("comida", "cena", "almuerzo", "desayuno", "receta", "food", "pizza", "postre", "cocina")),
    MUSIC(listOf("musica", "cancion", "music", "song", "guitarra", "concierto", "baile")),
    SPORTS(listOf("futbol", "partido", "gol", "deporte", "football", "soccer", "basket", "mundial")),
}

data class KnowledgeNote(
    val id: Long = 0,
    val timestamp: Instant,
    val kind: NoteKind,
    /** Nombre visible de la app (sesiones y respuestas) o de la app desde la que se compartió. */
    val appLabel: String? = null,
    val category: AppCategory? = null,
    /** Texto, título o nombre de archivo que el astronauta compartió a propósito. */
    val text: String? = null,
    val durationSec: Long? = null,
    val topics: Set<Topic> = emptySet(),
    val mood: Mood? = null,
)

interface KnowledgeRepository {
    /** Más recientes primero. */
    fun observeAll(): Flow<List<KnowledgeNote>>
    suspend fun add(note: KnowledgeNote): Long
    suspend fun delete(id: Long)
    suspend fun clear()
}

/** Temas por palabras clave. Determinista y local: no hay modelo de lenguaje (D17). */
object TopicExtractor {
    private val camelCase = Regex("(?<=[a-záéíóúñ])(?=[A-ZÁÉÍÓÚÑ])")
    private val separators = Regex("[_\\-/.#@:?=&]+")
    private val laugh = Regex("^(ja|je|ha){2,}$")

    fun topics(vararg texts: String?): Set<Topic> {
        val tokens = texts.filterNotNull()
            .flatMap { SpanishText.tokens(it.replace(camelCase, " ").replace(separators, " ")) }
            .toSet()
        val found = Topic.entries.filter { topic ->
            topic.keywords.any { k -> k in tokens || "${k}s" in tokens || "${k}es" in tokens }
        }.toMutableSet()
        if (tokens.any { laugh.matches(it) }) found += Topic.FUN
        return found
    }
}

/** Sitios conocidos de un enlace compartido. El enlace nunca se abre: la app no tiene internet. */
object LinkInfo {
    private val url = Regex("https?://([^/\\s]+)\\S*", RegexOption.IGNORE_CASE)

    fun host(text: String?): String? =
        text?.let { url.find(it)?.groupValues?.get(1)?.lowercase()?.removePrefix("www.")?.removePrefix("m.") }

    fun category(host: String?): AppCategory? = when {
        host == null -> null
        listOf("youtube.", "youtu.be", "vimeo.", "twitch.", "netflix.").any { it in host } -> AppCategory.VIDEO
        listOf("instagram.", "tiktok.", "twitter.", "x.com", "facebook.", "fb.", "reddit.", "threads.", "bsky.")
            .any { host.startsWith(it) || it in host } -> AppCategory.SOCIAL
        else -> null
    }
}

/** Lo que el astronauta comparte con "Mostrar a Laika", convertido en nota. */
object SharedContent {
    private const val MAX_TEXT = 500

    fun toNote(
        mimeType: String?,
        text: String?,
        subject: String?,
        fileName: String?,
        durationSec: Long?,
        sourceApp: String?,
        now: Instant,
    ): KnowledgeNote? {
        val mime = mimeType.orEmpty()
        val host = LinkInfo.host(text)
        val kind = when {
            mime.startsWith("video/") -> NoteKind.SHARED_VIDEO
            mime.startsWith("image/") -> NoteKind.SHARED_IMAGE
            host != null -> NoteKind.SHARED_LINK
            !text.isNullOrBlank() || !subject.isNullOrBlank() -> NoteKind.SHARED_TEXT
            else -> return null
        }
        // Título legible: el asunto, el texto sin el enlace o el nombre del archivo.
        val readable = listOfNotNull(subject, text?.replace(Regex("https?://\\S+"), "")?.trim(), fileName)
            .firstOrNull { it.isNotBlank() }
            ?.take(MAX_TEXT)
        return KnowledgeNote(
            timestamp = now,
            kind = kind,
            appLabel = sourceApp ?: host,
            category = LinkInfo.category(host) ?: if (kind == NoteKind.SHARED_VIDEO) AppCategory.VIDEO else null,
            text = readable,
            durationSec = durationSec,
            topics = TopicExtractor.topics(subject, text, fileName),
        )
    }
}

/** Resumen de un día para la voz ("Laika, ¿qué hice hoy?") y la tarjeta de la app. */
data class DaySummary(
    val socialMinutes: Int,
    val videoMinutes: Int,
    val cameraSessions: Int,
    val shared: Int,
    val topics: List<Topic>,
    val moods: Map<Mood, Int>,
) {
    val isEmpty: Boolean get() = socialMinutes == 0 && videoMinutes == 0 && cameraSessions == 0 && shared == 0 && topics.isEmpty() && moods.isEmpty()
}

object KnowledgeSummary {
    fun day(notes: List<KnowledgeNote>, date: LocalDate, zone: ZoneId): DaySummary {
        val today = notes.filter { it.timestamp.atZone(zone).toLocalDate() == date }
        val sessions = today.filter { it.kind == NoteKind.APP_SESSION }
        fun minutes(category: AppCategory) =
            (sessions.filter { it.category == category }.sumOf { it.durationSec ?: 0 } / 60).toInt()
        return DaySummary(
            socialMinutes = minutes(AppCategory.SOCIAL),
            videoMinutes = minutes(AppCategory.VIDEO),
            cameraSessions = sessions.count { it.category == AppCategory.CAMERA },
            shared = today.count { it.kind.isShared },
            // Temas por frecuencia; empate: el orden de la enumeración.
            topics = today.flatMap { it.topics }.groupingBy { it }.eachCount().entries
                .sortedWith(compareByDescending<Map.Entry<Topic, Int>> { it.value }.thenBy { it.key.ordinal })
                .map { it.key },
            moods = today.mapNotNull { it.mood }.groupingBy { it }.eachCount(),
        )
    }
}
