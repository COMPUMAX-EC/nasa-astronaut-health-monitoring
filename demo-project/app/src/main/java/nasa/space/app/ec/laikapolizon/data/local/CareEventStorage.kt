package nasa.space.app.ec.laikapolizon.data.local

import androidx.room.Dao
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import nasa.space.app.ec.laikapolizon.domain.care.CareEvent
import nasa.space.app.ec.laikapolizon.domain.care.CareKind
import nasa.space.app.ec.laikapolizon.domain.care.CareRepository
import java.time.Instant

@Entity(tableName = "care_events")
data class CareEventEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val timestampMillis: Long,
    val kind: String,
    /** Ids de acción separados por comas. */
    val actionIds: String,
    val points: Int,
)

@Dao
interface CareEventDao {
    @Query("SELECT * FROM care_events ORDER BY timestampMillis DESC, id DESC")
    fun observeAll(): Flow<List<CareEventEntity>>

    @Insert
    suspend fun insert(entity: CareEventEntity): Long
}

class RoomCareRepository(private val dao: CareEventDao) : CareRepository {

    override fun observeAll(): Flow<List<CareEvent>> = dao.observeAll().map { list ->
        list.map {
            CareEvent(
                id = it.id,
                timestamp = Instant.ofEpochMilli(it.timestampMillis),
                kind = CareKind.valueOf(it.kind),
                actionIds = it.actionIds.split(',').filter(String::isNotBlank),
                points = it.points,
            )
        }
    }

    override suspend fun add(event: CareEvent) {
        dao.insert(
            CareEventEntity(
                timestampMillis = event.timestamp.toEpochMilli(),
                kind = event.kind.name,
                actionIds = event.actionIds.joinToString(","),
                points = event.points,
            )
        )
    }
}
