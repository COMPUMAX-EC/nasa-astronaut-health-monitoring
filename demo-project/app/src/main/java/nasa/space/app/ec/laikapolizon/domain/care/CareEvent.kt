package nasa.space.app.ec.laikapolizon.domain.care

import kotlinx.coroutines.flow.Flow
import java.time.Instant

/** Tipo de acción de cuidado completada (docs/04, puntos de cuidado; decisión D5). */
enum class CareKind(val points: Int) {
    /** Chequeo matutino completado (Flujo 1: "+10 PTS Cuidado"). */
    MORNING_CHECKIN(10),
    /** Intervención terapéutica completada (manguitos, contacto afectivo, ejercicio…). */
    MISSION_COMPLETED(10),
    /** Protocolo de alerta crítica seguido hasta el final (p. ej. resguardo por radiación). */
    CRITICAL_PROTOCOL(10),
}

/**
 * Registro de una acción de cuidado. Además de sumar puntos, es el historial local
 * que se entrega al Flight Surgeon (Flujo 3, "Actualización de historial").
 */
data class CareEvent(
    val id: Long = 0,
    val timestamp: Instant,
    val kind: CareKind,
    val actionIds: List<String>,
    val points: Int = kind.points,
)

interface CareRepository {
    fun observeAll(): Flow<List<CareEvent>>
    suspend fun add(event: CareEvent)
}
