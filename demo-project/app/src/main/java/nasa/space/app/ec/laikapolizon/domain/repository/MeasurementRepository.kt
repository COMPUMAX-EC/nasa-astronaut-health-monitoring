package nasa.space.app.ec.laikapolizon.domain.repository

import kotlinx.coroutines.flow.Flow
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementSource

/** Registro central de mediciones: fuente única de verdad (módulo C). */
interface MeasurementRepository {
    /** Todos los registros, incluidos los corregidos, ordenados por fecha ascendente. */
    fun observeAll(): Flow<List<MeasurementRecord>>

    suspend fun add(record: MeasurementRecord): Long

    suspend fun addAll(records: List<MeasurementRecord>)

    /** Las correcciones crean un registro nuevo con `supersedesId`; nunca sobrescriben. */
    suspend fun correct(original: MeasurementRecord, newValue: Double, newSecondaryValue: Double? = null): Long

    suspend fun deleteBySource(source: MeasurementSource)
}
