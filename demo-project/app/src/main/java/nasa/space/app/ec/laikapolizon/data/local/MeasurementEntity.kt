package nasa.space.app.ec.laikapolizon.data.local

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "measurements", indices = [Index("type"), Index("timestampMillis")])
data class MeasurementEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val timestampMillis: Long,
    val type: String,
    val value: Double,
    val secondaryValue: Double?,
    val unit: String,
    val source: String,
    val rawTranscript: String?,
    val supersedesId: Long?,
)
