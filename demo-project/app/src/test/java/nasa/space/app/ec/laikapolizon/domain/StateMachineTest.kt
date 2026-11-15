package nasa.space.app.ec.laikapolizon.domain

import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.domain.model.SystemState.CRITICAL_ALERT
import nasa.space.app.ec.laikapolizon.domain.model.SystemState.MICRO_INTERACTION
import nasa.space.app.ec.laikapolizon.domain.model.SystemState.PERIPHERAL_PASSIVE
import nasa.space.app.ec.laikapolizon.domain.model.SystemState.THERAPEUTIC_INTERVENTION
import nasa.space.app.ec.laikapolizon.domain.statemachine.StateInput
import nasa.space.app.ec.laikapolizon.domain.statemachine.StateMachine
import org.junit.Assert.assertEquals
import org.junit.Test

class StateMachineTest {

    private fun input(
        critical: Boolean = false,
        deviations: Boolean = false,
        routine: Boolean = false,
        opportune: Boolean = true,
        completed: Boolean = false,
    ) = StateInput(critical, deviations, routine, opportune, completed)

    private fun assertNext(from: SystemState, input: StateInput, expected: SystemState) =
        assertEquals(expected, StateMachine.next(from, input))

    // T1
    @Test fun `passive goes to micro when routine is due at an opportune moment`() =
        assertNext(PERIPHERAL_PASSIVE, input(routine = true), MICRO_INTERACTION)

    @Test fun `passive stays passive when routine is due but moment is not opportune`() =
        assertNext(PERIPHERAL_PASSIVE, input(routine = true, opportune = false), PERIPHERAL_PASSIVE)

    @Test fun `passive stays passive when nothing is pending`() =
        assertNext(PERIPHERAL_PASSIVE, input(), PERIPHERAL_PASSIVE)

    // T2
    @Test fun `micro goes to intervention on deviation`() =
        assertNext(MICRO_INTERACTION, input(deviations = true, routine = true), THERAPEUTIC_INTERVENTION)

    @Test fun `passive goes to intervention on deviation at an opportune moment`() =
        assertNext(PERIPHERAL_PASSIVE, input(deviations = true), THERAPEUTIC_INTERVENTION)

    @Test fun `deviation does not interrupt when moment is not opportune`() =
        assertNext(PERIPHERAL_PASSIVE, input(deviations = true, opportune = false), PERIPHERAL_PASSIVE)

    // T3
    @Test fun `micro returns to passive when routine gets done`() =
        assertNext(MICRO_INTERACTION, input(routine = false), PERIPHERAL_PASSIVE)

    @Test fun `micro returns to passive when action is completed`() =
        assertNext(MICRO_INTERACTION, input(routine = true, completed = true), PERIPHERAL_PASSIVE)

    @Test fun `micro stays while routine is pending`() =
        assertNext(MICRO_INTERACTION, input(routine = true), MICRO_INTERACTION)

    @Test fun `intervention returns to passive when action is completed`() =
        assertNext(THERAPEUTIC_INTERVENTION, input(deviations = true, completed = true), PERIPHERAL_PASSIVE)

    @Test fun `intervention returns to passive when deviation disappears`() =
        assertNext(THERAPEUTIC_INTERVENTION, input(deviations = false), PERIPHERAL_PASSIVE)

    @Test fun `intervention stays while deviation persists`() =
        assertNext(THERAPEUTIC_INTERVENTION, input(deviations = true, opportune = false), THERAPEUTIC_INTERVENTION)

    // T4
    @Test fun `critical wins from every state even when not opportune`() {
        SystemState.entries.forEach { from ->
            assertNext(from, input(critical = true, opportune = false), CRITICAL_ALERT)
        }
    }

    @Test fun `critical cannot be dismissed while the anomaly persists`() =
        assertNext(CRITICAL_ALERT, input(critical = true, completed = true), CRITICAL_ALERT)

    // D8
    @Test fun `critical waits for user confirmation after the anomaly clears`() =
        assertNext(CRITICAL_ALERT, input(critical = false), CRITICAL_ALERT)

    @Test fun `critical returns to passive when cleared and confirmed`() =
        assertNext(CRITICAL_ALERT, input(critical = false, completed = true), PERIPHERAL_PASSIVE)
}
