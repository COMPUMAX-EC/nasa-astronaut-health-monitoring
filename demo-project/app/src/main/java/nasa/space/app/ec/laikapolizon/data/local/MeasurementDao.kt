package nasa.space.app.ec.laikapolizon.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface MeasurementDao {
    @Query("SELECT * FROM measurements ORDER BY timestampMillis ASC, id ASC")
    fun observeAll(): Flow<List<MeasurementEntity>>

    @Insert
    suspend fun insert(entity: MeasurementEntity): Long

    @Insert
    suspend fun insertAll(entities: List<MeasurementEntity>)

    @Query("DELETE FROM measurements WHERE source = :source")
    suspend fun deleteBySource(source: String)
}
