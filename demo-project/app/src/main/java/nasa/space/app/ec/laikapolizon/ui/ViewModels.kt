package nasa.space.app.ec.laikapolizon.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import nasa.space.app.ec.laikapolizon.LaikaApplication
import nasa.space.app.ec.laikapolizon.data.local.MissionTimer
import nasa.space.app.ec.laikapolizon.data.local.MissionTimerStore
import nasa.space.app.ec.laikapolizon.data.local.MissionProfileStore
import nasa.space.app.ec.laikapolizon.domain.export.FlightSurgeonReport
import nasa.space.app.ec.laikapolizon.domain.knowledge.ConversationCoordinator
import nasa.space.app.ec.laikapolizon.domain.knowledge.DaySummary
import nasa.space.app.ec.laikapolizon.domain.knowledge.KnowledgeNote
import nasa.space.app.ec.laikapolizon.domain.knowledge.KnowledgeSummary
import nasa.space.app.ec.laikapolizon.domain.memory.EpisodicMemory
import nasa.space.app.ec.laikapolizon.domain.memory.Memory
import nasa.space.app.ec.laikapolizon.domain.mission.Disclosure
import nasa.space.app.ec.laikapolizon.domain.mission.MissionCalendar
import nasa.space.app.ec.laikapolizon.domain.mission.MissionProfile
import kotlinx.coroutines.flow.first
import nasa.space.app.ec.laikapolizon.data.simulator.Scenario
import nasa.space.app.ec.laikapolizon.data.simulator.ScenarioSimulator
import nasa.space.app.ec.laikapolizon.domain.care.CareEvent
import nasa.space.app.ec.laikapolizon.domain.care.CareRepository
import nasa.space.app.ec.laikapolizon.domain.engine.LaikaEngine
import nasa.space.app.ec.laikapolizon.domain.engine.LaikaStatus
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementSource
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.model.effective
import nasa.space.app.ec.laikapolizon.domain.repository.MeasurementRepository
import nasa.space.app.ec.laikapolizon.domain.validation.MeasurementValidator
import nasa.space.app.ec.laikapolizon.domain.validation.ValidationIssue
import nasa.space.app.ec.laikapolizon.domain.validation.ValidationResult
import java.time.Clock
import java.time.Duration
import java.time.Instant

class CompanionViewModel(
    private val engine: LaikaEngine,
    private val repository: MeasurementRepository,
    careRepository: CareRepository,
    private val timerStore: MissionTimerStore,
    private val profileStore: MissionProfileStore,
    private val clock: Clock,
    private val conversations: ConversationCoordinator,
) : ViewModel() {
    val status: StateFlow<LaikaStatus> = engine.status

    /** Contexto social: lo que Laika sabe (más reciente primero). */
    val knowledge: StateFlow<List<KnowledgeNote>> = conversations.notes

    fun todaySummary(notes: List<KnowledgeNote>): DaySummary = KnowledgeSummary.day(notes, java.time.LocalDate.now(clock), clock.zone)

    fun forget(note: KnowledgeNote) = conversations.forget(note.id)

    fun forgetAll() = conversations.forgetAll()
    val profile: StateFlow<MissionProfile> = profileStore.profile
    private val episodicMemory = EpisodicMemory()

    fun missionDay(): Int = MissionCalendar.missionDay(profile.value.missionStart, clock.instant(), clock.zone)

    fun markSeen(disclosure: Disclosure) = profileStore.markSeen(disclosure)

    /** Memoria episódica: patrones semanales (Laika los menciona el día que corresponde). */
    fun weekdayPatterns(records: List<MeasurementRecord>): List<Memory.WeekdayPattern> =
        episodicMemory.weekdayPatterns(records, clock.instant(), clock.zone)

    fun helpfulMissions(records: List<MeasurementRecord>, care: List<CareEvent>): List<Memory.HelpfulMission> =
        episodicMemory.helpfulMissions(records, care)

    fun today(): java.time.DayOfWeek = java.time.LocalDate.now(clock).dayOfWeek

    /** Registros vigentes (mapa corporal, valores precargados del chequeo, gráfico de radiación). */
    val records: StateFlow<List<MeasurementRecord>> = repository.observeAll()
        .map { it.effective() }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val careEvents: StateFlow<List<CareEvent>> = careRepository.observeAll()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val missionTimer: StateFlow<MissionTimer?> = timerStore.timer

    /** Flujo 2: el astronauta confirmó que llegó al módulo blindado. */
    private val _sheltered = MutableStateFlow(false)
    val sheltered: StateFlow<Boolean> = _sheltered.asStateFlow()

    fun now(): Instant = clock.instant()

    fun setUserAvailable(value: Boolean) = engine.setUserAvailable(value)

    fun completeAction() {
        viewModelScope.launch { engine.completeCurrentAction() }
    }

    fun setSheltered(value: Boolean) {
        _sheltered.value = value
    }

    /** Registro rápido del chequeo matutino (Flujo 1). Devuelve la validación; guarda si es válido o [force]. */
    fun quickLog(type: MeasurementType, value: Double, secondary: Double? = null, force: Boolean = false): ValidationResult {
        val result = MeasurementValidator.validate(type, value, secondary)
        val canSave = result == ValidationResult.Valid || (force && result is ValidationResult.NeedsConfirmation)
        if (canSave) {
            viewModelScope.launch {
                repository.add(
                    MeasurementRecord(timestamp = clock.instant(), type = type, value = value,
                        secondaryValue = secondary, source = MeasurementSource.MANUAL)
                )
            }
        }
        return result
    }

    fun startTimer(actionId: String, minutes: Int) = timerStore.start(actionId, Duration.ofMinutes(minutes.toLong()), clock.instant())

    fun cancelTimer() = timerStore.clear()

    /** Fin de la misión cronometrada: registra la misión y vuelve a la periferia (T3). */
    fun finishTimedMission() {
        timerStore.clear()
        completeAction()
    }
}

/** Resultado del último intento de registro, para que la UI lo muestre. */
sealed interface LogFeedback {
    data object None : LogFeedback
    data object Saved : LogFeedback
    data object NotANumber : LogFeedback
    data class Rejected(val issue: ValidationIssue) : LogFeedback
    data class NeedsConfirmation(val type: MeasurementType, val value: Double, val secondary: Double?) : LogFeedback
}

class HealthLogViewModel(
    private val repository: MeasurementRepository,
    private val clock: Clock,
    private val careRepository: CareRepository,
    private val engine: LaikaEngine,
    private val profileStore: MissionProfileStore,
) : ViewModel() {

    /**
     * Reporte JSON para el Flight Surgeon (Fase 4). Incluye TODAS las mediciones, también las
     * corregidas, para que quede la trazabilidad completa.
     */
    suspend fun buildReport(): String {
        val profile = profileStore.profile.value
        val now = clock.instant()
        return FlightSurgeonReport.build(
            astronautId = profile.astronautId,
            missionDay = MissionCalendar.missionDay(profile.missionStart, now, clock.zone),
            now = now,
            state = engine.status.value.event,
            records = repository.observeAll().first(),
            careEvents = careRepository.observeAll().first(),
        )
    }

    fun reportFileName(): String = "laika_reporte_${java.time.LocalDate.now(clock)}.json"

    /** Misiones completadas: historial local para el Flight Surgeon (Flujo 3). */
    val careEvents: StateFlow<List<CareEvent>> = careRepository.observeAll()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    /** Registros vigentes, del más reciente al más antiguo. */
    val history: StateFlow<List<MeasurementRecord>> = repository.observeAll()
        .map { it.effective().sortedByDescending { r -> r.timestamp } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    private val _feedback = MutableStateFlow<LogFeedback>(LogFeedback.None)
    val feedback: StateFlow<LogFeedback> = _feedback.asStateFlow()

    fun submit(type: MeasurementType, valueText: String, secondaryText: String) {
        val value = parse(valueText)
        val secondary = if (type == MeasurementType.BLOOD_PRESSURE) parse(secondaryText) else null
        if (value == null || (type == MeasurementType.BLOOD_PRESSURE && secondaryText.isNotBlank() && secondary == null)) {
            _feedback.value = LogFeedback.NotANumber
            return
        }
        _feedback.value = when (val result = MeasurementValidator.validate(type, value, secondary)) {
            ValidationResult.Valid -> { save(type, value, secondary); LogFeedback.Saved }
            is ValidationResult.NeedsConfirmation -> LogFeedback.NeedsConfirmation(type, value, secondary)
            is ValidationResult.Invalid -> LogFeedback.Rejected(result.issue)
        }
    }

    fun confirmPending() {
        val pending = _feedback.value as? LogFeedback.NeedsConfirmation ?: return
        save(pending.type, pending.value, pending.secondary)
        _feedback.value = LogFeedback.Saved
    }

    fun dismissFeedback() {
        _feedback.value = LogFeedback.None
    }

    private fun save(type: MeasurementType, value: Double, secondary: Double?) {
        viewModelScope.launch {
            repository.add(
                MeasurementRecord(
                    timestamp = clock.instant(),
                    type = type,
                    value = value,
                    secondaryValue = secondary,
                    source = MeasurementSource.MANUAL,
                )
            )
        }
    }

    private fun parse(text: String): Double? = text.trim().replace(',', '.').toDoubleOrNull()
}

class SimulatorViewModel(
    private val repository: MeasurementRepository,
    private val simulator: ScenarioSimulator,
    private val profileStore: MissionProfileStore,
    private val clock: Clock,
) : ViewModel() {
    val profile: StateFlow<MissionProfile> = profileStore.profile

    fun missionDay(profile: MissionProfile): Int = MissionCalendar.missionDay(profile.missionStart, clock.instant(), clock.zone)

    /** Demo de la revelación progresiva: salta a un día de misión. */
    fun setMissionDay(day: Int) = profileStore.setMissionDay(day)

    private val _lastLoaded = MutableStateFlow<Scenario?>(null)
    val lastLoaded: StateFlow<Scenario?> = _lastLoaded.asStateFlow()

    fun load(scenario: Scenario) {
        viewModelScope.launch {
            simulator.load(scenario, repository)
            _lastLoaded.value = scenario
        }
    }

    fun clear() {
        viewModelScope.launch {
            repository.deleteBySource(MeasurementSource.SIMULATED)
            _lastLoaded.value = null
        }
    }

    fun endRadiationEvent() {
        viewModelScope.launch { simulator.endRadiationEvent(repository) }
    }
}

val LaikaViewModelFactory: ViewModelProvider.Factory = viewModelFactory {
    initializer {
        val c = container()
        CompanionViewModel(c.engine, c.measurementRepository, c.careRepository, c.missionTimer, c.missionProfile, c.clock, c.conversations)
    }
    initializer {
        val c = container()
        HealthLogViewModel(c.measurementRepository, c.clock, c.careRepository, c.engine, c.missionProfile)
    }
    initializer {
        val c = container()
        SimulatorViewModel(c.measurementRepository, c.simulator, c.missionProfile, c.clock)
    }
}

private fun androidx.lifecycle.viewmodel.CreationExtras.container() =
    (this[APPLICATION_KEY] as LaikaApplication).container
