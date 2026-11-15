package nasa.space.app.ec.laikapolizon.data.local

import androidx.room.Dao
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import nasa.space.app.ec.laikapolizon.domain.knowledge.KnowledgeNote
import nasa.space.app.ec.laikapolizon.domain.knowledge.KnowledgeRepository
import nasa.space.app.ec.laikapolizon.domain.knowledge.Mood
import nasa.space.app.ec.laikapolizon.domain.knowledge.NoteKind
import nasa.space.app.ec.laikapolizon.domain.knowledge.Topic
import nasa.space.app.ec.laikapolizon.domain.presence.AppCategory
import java.time.Instant

/** Conocimiento de Laika (contexto social). No entra en el reporte del Flight Surgeon. */
@Entity(tableName = "knowledge_notes")
data class KnowledgeNoteEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val timestampMillis: Long,
    val kind: String,
    val appLabel: String?,
    val category: String?,
    val text: String?,
    val durationSec: Long?,
    /** Nombres de [Topic] separados por comas. */
    val topics: String,
    val mood: String?,
)

@Dao
interface KnowledgeNoteDao {
    @Query("SELECT * FROM knowledge_notes ORDER BY timestampMillis DESC, id DESC")
    fun observeAll(): Flow<List<KnowledgeNoteEntity>>

    @Insert
    suspend fun insert(entity: KnowledgeNoteEntity): Long

    @Query("DELETE FROM knowledge_notes WHERE id = :id")
    suspend fun delete(id: Long)

    @Query("DELETE FROM knowledge_notes")
    suspend fun clear()
}

class RoomKnowledgeRepository(private val dao: KnowledgeNoteDao) : KnowledgeRepository {

    override fun observeAll(): Flow<List<KnowledgeNote>> = dao.observeAll().map { list ->
        list.map {
            KnowledgeNote(
                id = it.id,
                timestamp = Instant.ofEpochMilli(it.timestampMillis),
                kind = NoteKind.valueOf(it.kind),
                appLabel = it.appLabel,
                category = it.category?.let { name -> runCatching { AppCategory.valueOf(name) }.getOrNull() },
                text = it.text,
                durationSec = it.durationSec,
                topics = it.topics.split(',').filter(String::isNotBlank)
                    .mapNotNull { name -> runCatching { Topic.valueOf(name) }.getOrNull() }.toSet(),
                mood = it.mood?.let { name -> Mood.valueOf(name) },
            )
        }
    }

    override suspend fun add(note: KnowledgeNote): Long = dao.insert(
        KnowledgeNoteEntity(
            timestampMillis = note.timestamp.toEpochMilli(),
            kind = note.kind.name,
            appLabel = note.appLabel,
            category = note.category?.name,
            text = note.text,
            durationSec = note.durationSec,
            topics = note.topics.joinToString(",") { it.name },
            mood = note.mood?.name,
        )
    )

    override suspend fun delete(id: Long) = dao.delete(id)

    override suspend fun clear() = dao.clear()
}
