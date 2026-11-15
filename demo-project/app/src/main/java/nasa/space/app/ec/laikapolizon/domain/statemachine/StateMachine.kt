package nasa.space.app.ec.laikapolizon.domain.statemachine

import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.domain.model.SystemState.CRITICAL_ALERT
import nasa.space.app.ec.laikapolizon.domain.model.SystemState.MICRO_INTERACTION
import nasa.space.app.ec.laikapolizon.domain.model.SystemState.PERIPHERAL_PASSIVE
import nasa.space.app.ec.laikapolizon.domain.model.SystemState.THERAPEUTIC_INTERVENTION

/** Entradas ya interpretadas para decidir la transición (docs/02-maquina-de-estados.md). */
data class StateInput(
    val criticalActive: Boolean,
    /** Desviaciones (T2) no silenciadas. */
    val deviationsActive: Boolean,
    val routineDue: Boolean,
    /** Momento de baja carga cognitiva (T1). En el demo lo indica el astronauta ("Estoy libre"). */
    val opportuneMoment: Boolean,
    /** El astronauta acaba de confirmar que completó la acción del estado actual. */
    val actionCompleted: Boolean = false,
)

/** Máquina de estados determinista y pura. */
object StateMachine {

    fun next(current: SystemState, input: StateInput): SystemState {
        // T4: una anomalía severa entra a alerta crítica desde cualquier estado, sin esperar momento oportuno.
        if (input.criticalActive) return CRITICAL_ALERT

        return when (current) {
            // D8: se sale de la alerta solo cuando la lectura se normalizó Y el astronauta lo confirma.
            CRITICAL_ALERT -> if (input.actionCompleted) PERIPHERAL_PASSIVE else CRITICAL_ALERT

            // T3: retorno a periferia al completar la acción correctiva o si la desviación desaparece.
            THERAPEUTIC_INTERVENTION ->
                if (input.actionCompleted || !input.deviationsActive) PERIPHERAL_PASSIVE else THERAPEUTIC_INTERVENTION

            MICRO_INTERACTION -> when {
                input.deviationsActive -> THERAPEUTIC_INTERVENTION // T2
                input.actionCompleted || !input.routineDue -> PERIPHERAL_PASSIVE // T3
                else -> MICRO_INTERACTION
            }

            PERIPHERAL_PASSIVE -> when {
                !input.opportuneMoment -> PERIPHERAL_PASSIVE // T1 solo en momentos oportunos
                input.deviationsActive -> THERAPEUTIC_INTERVENTION
                input.routineDue -> MICRO_INTERACTION // T1
                else -> PERIPHERAL_PASSIVE
            }
        }
    }
}
