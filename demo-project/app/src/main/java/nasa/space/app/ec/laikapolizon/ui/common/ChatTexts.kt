package nasa.space.app.ec.laikapolizon.ui.common

import android.content.Context
import androidx.annotation.StringRes
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.knowledge.ChatLine
import nasa.space.app.ec.laikapolizon.domain.knowledge.DaySummary
import nasa.space.app.ec.laikapolizon.domain.knowledge.KnowledgeNote
import nasa.space.app.ec.laikapolizon.domain.knowledge.Mood
import nasa.space.app.ec.laikapolizon.domain.knowledge.NoteKind
import nasa.space.app.ec.laikapolizon.domain.knowledge.QuickReply
import nasa.space.app.ec.laikapolizon.domain.knowledge.Topic
import java.util.Locale

/** Textos de la conversación de contexto social (globo del screen pet, voz y tarjeta de la app). */
object ChatTexts {

    private val spanish = Locale("es")

    fun text(context: Context, line: ChatLine): String = with(context) {
        when (line) {
            is ChatLine.AfterSocial -> getString(R.string.chat_after_social, line.app, line.minutes)
            is ChatLine.AfterVideo -> getString(R.string.chat_after_video, line.app)
            ChatLine.AfterCamera -> getString(R.string.chat_after_camera)
            is ChatLine.LongSession -> getString(R.string.chat_long_session, line.app, line.minutes)
            is ChatLine.Shared -> when {
                line.topic != null -> getString(R.string.chat_shared_topic, getString(line.topic.nameRes()))
                line.kind == NoteKind.SHARED_VIDEO -> getString(R.string.chat_shared_video)
                line.kind == NoteKind.SHARED_IMAGE -> getString(R.string.chat_shared_image)
                else -> getString(R.string.chat_shared_text)
            }
            is ChatLine.Recall -> {
                val whenText = when (line.daysAgo) {
                    0 -> getString(R.string.chat_when_today)
                    1 -> getString(R.string.chat_when_yesterday)
                    else -> getString(R.string.chat_when_days, line.daysAgo)
                }
                when {
                    line.topic != null -> getString(R.string.chat_recall_topic, whenText, getString(line.topic.nameRes()))
                    line.title != null -> getString(R.string.chat_recall_title, whenText, line.title.take(60))
                    else -> getString(R.string.chat_open_question)
                }
            }
            ChatLine.OpenQuestion -> getString(R.string.chat_open_question)
            is ChatLine.Felt -> getString(
                when (line.mood) {
                    Mood.GOOD -> R.string.chat_felt_good
                    Mood.NEUTRAL -> R.string.chat_felt_ok
                    Mood.BAD -> R.string.chat_felt_bad
                }
            )
            is ChatLine.Learned -> getString(R.string.chat_learned, getString(line.topic.nameRes()).capitalized())
            ChatLine.Stretch -> getString(R.string.chat_stretch)
            ChatLine.NotNow -> getString(R.string.chat_not_now)
        }
    }

    /** "Hoy: 35 min en redes, 20 min de videos y usaste la cámara 1 vez. Hablamos de la Tierra." */
    fun day(context: Context, summary: DaySummary): String = with(context) {
        if (summary.isEmpty) return getString(R.string.voice_day_none)
        val parts = buildList {
            if (summary.socialMinutes > 0) add(getString(R.string.day_social, summary.socialMinutes))
            if (summary.videoMinutes > 0) add(getString(R.string.day_video, summary.videoMinutes))
            if (summary.cameraSessions > 0) add(resources.getQuantityString(R.plurals.day_camera, summary.cameraSessions, summary.cameraSessions))
            if (summary.shared > 0) add(resources.getQuantityString(R.plurals.day_shared, summary.shared, summary.shared))
        }
        buildString {
            if (parts.isNotEmpty()) append(getString(R.string.voice_day_intro)).append(": ").append(joinSpanish(context, parts)).append('.')
            if (summary.topics.isNotEmpty()) {
                if (isNotEmpty()) append(' ')
                append(getString(R.string.day_topics, joinSpanish(context, summary.topics.take(3).map { getString(it.nameRes()) })))
            }
        }
    }

    /** Una línea de la tarjeta "Lo que Laika sabe". */
    fun note(context: Context, note: KnowledgeNote): String = with(context) {
        when (note.kind) {
            NoteKind.APP_SESSION -> {
                val label = note.appLabel ?: ""
                val minutes = ((note.durationSec ?: 0) / 60).toInt()
                val icon = when (note.category) {
                    nasa.space.app.ec.laikapolizon.domain.presence.AppCategory.CAMERA -> "📷 "
                    nasa.space.app.ec.laikapolizon.domain.presence.AppCategory.VIDEO -> "🎬 "
                    else -> "📱 "
                }
                icon + if (minutes > 0) getString(R.string.knowledge_session, label, minutes) else getString(R.string.knowledge_session_short, label)
            }
            NoteKind.SHARED_TEXT -> "💬 " + (note.text ?: "")
            NoteKind.SHARED_LINK -> "🔗 " + (note.text ?: note.appLabel ?: "")
            NoteKind.SHARED_VIDEO -> "🎬 " + (note.text ?: getString(R.string.chat_shared_video))
            NoteKind.SHARED_IMAGE -> "🖼 " + (note.text ?: "")
            NoteKind.ANSWER -> {
                val base = when {
                    note.mood != null -> getString(R.string.knowledge_felt, getString(note.mood.labelRes()))
                    note.topics.isNotEmpty() -> getString(R.string.knowledge_about, joinSpanish(context, note.topics.map { getString(it.nameRes()) }))
                    else -> ""
                }
                val after = note.appLabel?.takeIf { note.mood != null }?.let { " " + getString(R.string.knowledge_after, it) } ?: ""
                "💭 $base$after"
            }
        }
    }

    private fun joinSpanish(context: Context, items: List<String>): String = when (items.size) {
        0 -> ""
        1 -> items[0]
        else -> items.dropLast(1).joinToString(", ") + " " + context.getString(R.string.list_and) + " " + items.last()
    }

    private fun String.capitalized() = replaceFirstChar { it.titlecase(spanish) }
}

@StringRes
fun Topic.nameRes(): Int = when (this) {
    Topic.EARTH -> R.string.topic_earth
    Topic.CREW -> R.string.topic_crew
    Topic.FAMILY -> R.string.topic_family
    Topic.FUN -> R.string.topic_fun
    Topic.SPACE -> R.string.topic_space
    Topic.SCIENCE -> R.string.topic_science
    Topic.NATURE -> R.string.topic_nature
    Topic.PETS -> R.string.topic_pets
    Topic.FOOD -> R.string.topic_food
    Topic.MUSIC -> R.string.topic_music
    Topic.SPORTS -> R.string.topic_sports
}

@StringRes
fun Mood.labelRes(): Int = when (this) {
    Mood.GOOD -> R.string.mood_good
    Mood.NEUTRAL -> R.string.mood_ok
    Mood.BAD -> R.string.mood_bad
}

@StringRes
fun QuickReply.labelRes(): Int = when (this) {
    QuickReply.FELT_GOOD -> R.string.reply_felt_good
    QuickReply.FELT_OK -> R.string.reply_felt_ok
    QuickReply.FELT_BAD -> R.string.reply_felt_bad
    QuickReply.ABOUT_EARTH -> R.string.reply_about_earth
    QuickReply.ABOUT_CREW -> R.string.reply_about_crew
    QuickReply.ABOUT_HOME -> R.string.reply_about_home
    QuickReply.ABOUT_FUN -> R.string.reply_about_fun
    QuickReply.ABOUT_SCIENCE -> R.string.reply_about_science
    QuickReply.ABOUT_SPACE -> R.string.reply_about_space
    QuickReply.ABOUT_MUSIC -> R.string.reply_about_music
    QuickReply.STRETCH -> R.string.reply_stretch
    QuickReply.NOT_NOW -> R.string.reply_not_now
}
