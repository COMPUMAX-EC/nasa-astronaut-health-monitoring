package nasa.space.app.ec.laikapolizon.domain.engine

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import nasa.space.app.ec.laikapolizon.domain.analysis.Finding
import nasa.space.app.ec.laikapolizon.domain.analysis.HealthAnalyzer
import nasa.space.app.ec.laikapolizon.domain.care.CareEvent
import nasa.space.app.ec.laikapolizon.domain.care.CareKind
import nasa.space.app.ec.laikapolizon.domain.care.CareRepository
import nasa.space.app.ec.laikapolizon.domain.model.Hazard
import nasa.space.app.ec.laikapolizon.domain.model.LaikaStateEvent
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.domain.repository.MeasurementRepository
import nasa.space.app.ec.laikapolizon.domain.statemachine.LaikaBehavior
import nasa.space.app.ec.laikapolizon.domain.statemachine.StateInput
import nasa.space.app.ec.laikapolizon.domain.statemachine.StateMachine
import nasa.space.app.ec.laikapolizon.domain.vitality.VitalityCalculator
import java.time.Clock
import java.time.Duration
import java.time.Instant

/** Estado observable de Laika: el evento del schema + los hallazgos que lo explican. */
data class LaikaStatus(
    val event: LaikaStateEvent,
    val findings: List<Finding>,
    /** Momento oportuno efectivo: el astronauta está libre y no hay una app de concentración abierta. */
    val opportuneMoment: Boolean,
    /** Lo que indicó el astronauta con "Estoy libre". */
    val userAvailable: Boolean = opportuneMoment,
    /** Hay una app de procedimientos/concentración en primer plano (detectada por el screen pet). */
    val focusedAppActive: Boolean = false,
)

/**
 * Núcleo de Laika: combina el registro de mediciones, el analizador y la máquina de estados.
 * Es la única pieza que decide el estado; la UI, el overlay y la voz solo lo observan.
 */
class LaikaEngine(
    private val repository: MeasurementRepository,
    /** Si no es null, el motor registra las acciones de cuidado completadas (puntos + historial). */
    private val careRepository: CareRepository? = null,
    private val analyzer: HealthAnalyzer = HealthAnalyzer(),
    private val clock: Clock = Clock.systemDefaultZone(),
    /** Tras completar una intervención, ese peligro no vuelve a disparar otra durante este tiempo. */
    private val snoozeDuration: Duration = Duration.ofHours(6),
    private val tickInterval: Duration = Duration.ofMinutes(1),
) {
    private val mutex = Mutex()
    private val userAvailable = MutableStateFlow(true)
    private val focusedApp = MutableStateFlow(false)
    private val snoozes = mutableMapOf<Hazard, Instant>()
    private var lastRecords: List<MeasurementRecord> = emptyList()
    /** Null hasta la primera evaluación: así un reinicio de la app no vuelve a otorgar puntos. */
    private var checkInDoneBefore: Boolean? = null

    private val _status = MutableStateFlow(
        LaikaStatus(
            event = LaikaStateEvent(
                timestamp = clock.instant(),
                currentSystemState = SystemState.PERIPHERAL_PASSIVE,
                laikaVitalityScore = VitalityCalculator.NEUTRAL,
                activeEmotionDisplay = LaikaBehavior.emotionFor(SystemState.PERIPHERAL_PASSIVE, VitalityCalculator.NEUTRAL),
            ),
            findings = emptyList(),
            opportuneMoment = true,
        )
    )
    val status: StateFlow<LaikaStatus> = _status.asStateFlow()

    /** Empieza a observar el registro. El tic periódico re-evalúa cuando expiran los silencios. */
    fun start(scope: CoroutineScope): Job = scope.launch {
        val ticker = flow { while (true) { emit(Unit); delay(tickInterval.toMillis()) } }
        combine(repository.observeAll(), userAvailable, focusedApp, ticker) { records, _, _, _ -> records }
            .collect { records ->
                mutex.withLock {
                    lastRecords = records
                    evaluate(actionCompleted = false)
                }
            }
    }

    /** Interruptor "Estoy libre" (decisión D3). */
    fun setUserAvailable(value: Boolean) {
        userAvailable.value = value
    }

    /** Lo llama el screen pet según la app en primer plano (categoría FOCUSED). */
    fun setFocusedAppActive(value: Boolean) {
        focusedApp.value = value
    }

    /** El astronauta confirma que completó la acción propuesta en el estado actual. */
    suspend fun completeCurrentAction() = mutex.withLock {
        val now = clock.instant()
        val current = _status.value
        when (current.event.currentSystemState) {
            SystemState.MICRO_INTERACTION -> snoozes[Hazard.ROUTINE] = now + snoozeDuration
            SystemState.THERAPEUTIC_INTERVENTION ->
                current.findings.filterNot { it.isCritical }.forEach { snoozes[it.hazard] = now + snoozeDuration }
            SystemState.CRITICAL_ALERT, SystemState.PERIPHERAL_PASSIVE -> Unit // lo crítico nunca se silencia
        }
        evaluate(actionCompleted = true)
    }

    /** Debe llamarse con [mutex] tomado. */
    private suspend fun evaluate(actionCompleted: Boolean) {
        val now = clock.instant()
        val available = userAvailable.value
        val focused = focusedApp.value
        val isOpportune = available && !focused
        snoozes.entries.removeAll { it.value <= now }

        val assessment = analyzer.assess(lastRecords, now, clock.zone, snoozes.keys)
        val previous = _status.value.event.currentSystemState
        val next = StateMachine.next(
            previous,
            StateInput(
                criticalActive = assessment.criticalFindings.isNotEmpty(),
                deviationsActive = assessment.deviations.isNotEmpty(),
                routineDue = assessment.routineDue,
                opportuneMoment = isOpportune,
                actionCompleted = actionCompleted,
            ),
        )

        recordCare(now, previous, next, actionCompleted, assessment.checkInDoneToday)

        _status.value = LaikaStatus(
            event = LaikaStateEvent(
                timestamp = now,
                currentSystemState = next,
                laikaVitalityScore = assessment.vitality,
                activeEmotionDisplay = LaikaBehavior.emotionFor(next, assessment.vitality),
                prescribedActions = LaikaBehavior.actionsFor(
                    next, assessment.criticalFindings, assessment.deviations, assessment.routineDue,
                ),
            ),
            findings = assessment.criticalFindings + assessment.deviations,
            opportuneMoment = isOpportune,
            userAvailable = available,
            focusedAppActive = focused,
        )
    }

    /**
     * Puntos de cuidado e historial (decisión D5). Se decide aquí para que valga igual
     * si la acción se completó desde la pantalla, por voz o desde el screen pet.
     */
    private suspend fun recordCare(
        now: Instant,
        previous: SystemState,
        next: SystemState,
        actionCompleted: Boolean,
        checkInDoneToday: Boolean,
    ) {
        val care = careRepository ?: return
        val previousActions = _status.value.event.prescribedActions.map { it.actionId }

        // Chequeo matutino: cuando hoy pasa de "pendiente" a "hecho" con una medición real.
        if (checkInDoneBefore == false && checkInDoneToday) {
            care.add(CareEvent(timestamp = now, kind = CareKind.MORNING_CHECKIN, actionIds = listOf("MORNING_CHECKIN")))
        }
        checkInDoneBefore = checkInDoneToday

        if (!actionCompleted || next != SystemState.PERIPHERAL_PASSIVE) return
        val kind = when (previous) {
            SystemState.THERAPEUTIC_INTERVENTION -> CareKind.MISSION_COMPLETED
            SystemState.CRITICAL_ALERT -> CareKind.CRITICAL_PROTOCOL
            else -> return // posponer una micro-interacción no suma puntos
        }
        care.add(CareEvent(timestamp = now, kind = kind, actionIds = previousActions))
    }
}
