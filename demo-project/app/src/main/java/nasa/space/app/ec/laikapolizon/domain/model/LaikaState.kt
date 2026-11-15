package nasa.space.app.ec.laikapolizon.domain.model

import java.time.Instant

// Equivalente Kotlin del JSON Schema `LaikaStateEvent` (docs/06-modelos-de-datos.md).

/** Estados de la máquina de estados (docs/02-maquina-de-estados.md), en orden de prioridad creciente. */
enum class SystemState {
    PERIPHERAL_PASSIVE,
    MICRO_INTERACTION,
    THERAPEUTIC_INTERVENTION,
    CRITICAL_ALERT,
}

enum class Emotion { JOYFUL, CALM, CURIOUS, TIRED, CONCERNED, PROTECTIVE }

/** Peligros de salud/entorno a los que apunta una acción o hallazgo. */
enum class Hazard {
    RADIATION,
    SANS,
    CARDIOVASCULAR,
    METABOLIC,
    IMMUNE,
    SLEEP,
    PSYCHOSOCIAL,
    PHYSICAL,
    ENVIRONMENT,
    ROUTINE,
}

data class PrescribedAction(
    val actionId: String,
    /** Nombre de [Hazard] (en el schema es un string libre). */
    val targetHazard: String,
    val description: String,
    val estimatedDurationMin: Int,
)

data class LaikaStateEvent(
    val timestamp: Instant,
    val currentSystemState: SystemState,
    val laikaVitalityScore: Double,
    val activeEmotionDisplay: Emotion,
    val prescribedActions: List<PrescribedAction> = emptyList(),
)
