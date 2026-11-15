package nasa.space.app.ec.laikapolizon.data.local

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementSource
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.repository.MeasurementRepository
import java.time.Clock
import java.time.Instant

class RoomMeasurementRepository(
    private val dao: MeasurementDao,
    private val clock: Clock,
) : MeasurementRepository {

    override fun observeAll(): Flow<List<MeasurementRecord>> =
        dao.observeAll().map { list -> list.map { it.toDomain() } }

    override suspend fun add(record: MeasurementRecord): Long = dao.insert(record.toEntity())

    override suspend fun addAll(records: List<MeasurementRecord>) = dao.insertAll(records.map { it.toEntity() })

    override suspend fun correct(original: MeasurementRecord, newValue: Double, newSecondaryValue: Double?): Long =
        dao.insert(
            original.copy(
                id = 0,
                timestamp = clock.instant(),
                value = newValue,
                secondaryValue = newSecondaryValue,
                supersedesId = original.id,
            ).toEntity()
        )

    override suspend fun deleteBySource(source: MeasurementSource) = dao.deleteBySource(source.name)
}

private fun MeasurementEntity.toDomain() = MeasurementRecord(
    id = id,
    timestamp = Instant.ofEpochMilli(timestampMillis),
    type = MeasurementType.valueOf(type),
    value = value,
    secondaryValue = secondaryValue,
    unit = unit,
    source = MeasurementSource.valueOf(source),
    rawTranscript = rawTranscript,
    supersedesId = supersedesId,
)

private fun MeasurementRecord.toEntity() = MeasurementEntity(
    id = id,
    timestampMillis = timestamp.toEpochMilli(),
    type = type.name,
    value = value,
    secondaryValue = secondaryValue,
    unit = unit,
    source = source.name,
    rawTranscript = rawTranscript,
    supersedesId = supersedesId,
)
