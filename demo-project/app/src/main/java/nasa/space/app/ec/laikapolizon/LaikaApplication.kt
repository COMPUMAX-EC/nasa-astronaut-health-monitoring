package nasa.space.app.ec.laikapolizon

import android.app.Application
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import nasa.space.app.ec.laikapolizon.data.local.LaikaDatabase
import nasa.space.app.ec.laikapolizon.data.local.RoomCareRepository
import nasa.space.app.ec.laikapolizon.data.local.RoomKnowledgeRepository
import nasa.space.app.ec.laikapolizon.domain.knowledge.ConversationCoordinator
import nasa.space.app.ec.laikapolizon.domain.knowledge.KnowledgeRepository
import nasa.space.app.ec.laikapolizon.data.local.RoomMeasurementRepository
import nasa.space.app.ec.laikapolizon.data.local.MissionProfileStore
import nasa.space.app.ec.laikapolizon.data.local.MissionTimerStore
import nasa.space.app.ec.laikapolizon.domain.care.CareRepository
import nasa.space.app.ec.laikapolizon.data.simulator.ScenarioSimulator
import nasa.space.app.ec.laikapolizon.domain.engine.LaikaEngine
import nasa.space.app.ec.laikapolizon.domain.presence.PresenceState
import nasa.space.app.ec.laikapolizon.domain.repository.MeasurementRepository
import nasa.space.app.ec.laikapolizon.feature.common.Notifications
import java.time.Clock

/** Inyección de dependencias manual: instancias únicas compartidas por todos los módulos. */
class AppContainer(application: Application) {
    val clock: Clock = Clock.systemDefaultZone()
    val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    private val database = LaikaDatabase.create(application)
    val measurementRepository: MeasurementRepository = RoomMeasurementRepository(database.measurementDao(), clock)
    val careRepository: CareRepository = RoomCareRepository(database.careEventDao())
    val engine = LaikaEngine(measurementRepository, careRepository, clock = clock)
    val missionTimer = MissionTimerStore(application)
    val missionProfile = MissionProfileStore(application, clock)
    val simulator = ScenarioSimulator(clock)
    val presence = PresenceState()
    val knowledgeRepository: KnowledgeRepository = RoomKnowledgeRepository(database.knowledgeNoteDao())
    /** Contexto social: preguntas del screen pet a partir de las apps usadas y lo compartido. */
    val conversations = ConversationCoordinator(knowledgeRepository, presence, engine.status, applicationScope, clock)
}

class LaikaApplication : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
        container.engine.start(container.applicationScope)
        Notifications.createChannel(this)
    }
}
