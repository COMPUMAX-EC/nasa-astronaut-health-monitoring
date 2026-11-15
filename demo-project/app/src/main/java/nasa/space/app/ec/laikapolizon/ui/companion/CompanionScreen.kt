package nasa.space.app.ec.laikapolizon.ui.companion

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import kotlinx.coroutines.delay
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.analysis.Finding
import nasa.space.app.ec.laikapolizon.domain.analysis.FindingKind
import nasa.space.app.ec.laikapolizon.domain.care.CareEvent
import nasa.space.app.ec.laikapolizon.domain.mission.Disclosure
import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.feature.common.Haptics
import nasa.space.app.ec.laikapolizon.ui.CompanionViewModel
import nasa.space.app.ec.laikapolizon.ui.avatar.LaikaAvatar
import nasa.space.app.ec.laikapolizon.ui.common.containerColor
import nasa.space.app.ec.laikapolizon.ui.common.formatNumber
import nasa.space.app.ec.laikapolizon.ui.common.labelRes
import nasa.space.app.ec.laikapolizon.ui.common.messageRes
import java.time.Duration
import kotlin.math.roundToInt

/**
 * Centro de Laika: muestra el panel del flujo que corresponde al estado actual
 * (docs/03-flujos-de-interaccion.md). El estado lo decide siempre el LaikaEngine.
 */
@Composable
fun CompanionScreen(viewModel: CompanionViewModel, modifier: Modifier = Modifier) {
    val status by viewModel.status.collectAsStateWithLifecycle()
    val records by viewModel.records.collectAsStateWithLifecycle()
    val careEvents by viewModel.careEvents.collectAsStateWithLifecycle()
    val timer by viewModel.missionTimer.collectAsStateWithLifecycle()
    val sheltered by viewModel.sheltered.collectAsStateWithLifecycle()
    val profile by viewModel.profile.collectAsStateWithLifecycle()
    val knowledge by viewModel.knowledge.collectAsStateWithLifecycle()
    var affectiveOpen by rememberSaveable { mutableStateOf(false) }
    var openDisclosure by rememberOpenDisclosure()

    // Fase 4: revelación progresiva y memoria episódica.
    val missionDay = remember(profile) { viewModel.missionDay() }
    val unlocked = remember(missionDay) { Disclosure.unlocked(missionDay) }
    val unseen = remember(missionDay, profile) { Disclosure.unseen(missionDay, profile.seenDisclosures) }
    val patterns = remember(records) { viewModel.weekdayPatterns(records) }
    val todayPattern = patterns.firstOrNull { it.dayOfWeek == viewModel.today() }
    val helpfulMissions = remember(records, careEvents) { viewModel.helpfulMissions(records, careEvents) }

    val event = status.event
    val state = event.currentSystemState
    val context = LocalContext.current

    // Limpieza cuando la misión se cerró por otra vía (voz, screen pet).
    LaunchedEffect(state) {
        if (state != SystemState.THERAPEUTIC_INTERVENTION && state != SystemState.CRITICAL_ALERT) {
            if (timer != null) viewModel.cancelTimer()
            affectiveOpen = false
        }
        if (state != SystemState.CRITICAL_ALERT) viewModel.setSheltered(false)
    }

    val radiationEvent = status.findings.any { it.kind == FindingKind.RADIATION_SPIKE } ||
        (state == SystemState.CRITICAL_ALERT && sheltered)
    // Flujo 2, paso 2: pulsación háptica rítmica al empezar el evento.
    LaunchedEffect(radiationEvent && state == SystemState.CRITICAL_ALERT) {
        if (radiationEvent && state == SystemState.CRITICAL_ALERT) Haptics.radiationPulse(context)
    }

    // Las alertas críticas tienen prioridad sobre cualquier sesión abierta (T4).
    val currentTimer = timer
    when {
        state != SystemState.CRITICAL_ALERT && currentTimer != null -> {
            val description = event.prescribedActions.firstOrNull { it.actionId == currentTimer.actionId }?.description.orEmpty()
            MissionTimerSession(
                timer = currentTimer,
                description = description,
                now = viewModel::now,
                onFinish = viewModel::finishTimedMission,
                onCancel = viewModel::cancelTimer,
                modifier = modifier,
            )
            return
        }
        state == SystemState.THERAPEUTIC_INTERVENTION && affectiveOpen -> {
            AffectiveSession(
                onComplete = { affectiveOpen = false; viewModel.completeAction() },
                onClose = { affectiveOpen = false },
                modifier = modifier,
            )
            return
        }
    }

    openDisclosure?.let { name ->
        val disclosure = Disclosure.valueOf(name)
        DisclosureDialog(disclosure) {
            viewModel.markSeen(disclosure)
            openDisclosure = null
        }
    }

    Column(
        modifier = modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        LaikaCard(state, event.activeEmotionDisplay)

        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Points(careEvents)
            Text(stringResource(R.string.mission_day, missionDay), style = MaterialTheme.typography.titleSmall)
        }
        RecentCelebration(careEvents, viewModel::now)

        // Las historias nuevas esperan: en una alerta crítica no se interrumpe con ellas.
        if (state != SystemState.CRITICAL_ALERT) {
            DisclosureNotice(unseen) { openDisclosure = it.name }
        }
        // "La última vez que hicimos esto, ayudó": solo si esa acción está propuesta ahora.
        val relevantHelpful = helpfulMissions.firstOrNull { h -> event.prescribedActions.any { it.actionId == h.actionId } }
        EpisodicRemarks(todayPattern, relevantHelpful)

        val vitality = event.laikaVitalityScore.roundToInt()
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(stringResource(R.string.vitality_label, vitality), style = MaterialTheme.typography.titleMedium)
            LinearProgressIndicator(progress = vitality / 100f, modifier = Modifier.fillMaxWidth())
        }

        if (records.isEmpty()) {
            Text(stringResource(R.string.no_data_hint), style = MaterialTheme.typography.bodySmall)
        }

        if (status.findings.isNotEmpty()) {
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(stringResource(R.string.findings_title), style = MaterialTheme.typography.titleMedium)
                    status.findings.forEach { Text("• " + findingText(it), style = MaterialTheme.typography.bodyMedium) }
                }
            }
        }

        // Panel del flujo correspondiente al estado.
        when (state) {
            SystemState.MICRO_INTERACTION -> {
                if (event.prescribedActions.any { it.actionId == "MORNING_CHECKIN" }) {
                    CheckInPanel(event.laikaVitalityScore, records, viewModel::quickLog)
                }
                CompleteButton(state, R.string.complete_postpone, viewModel::completeAction)
            }
            SystemState.THERAPEUTIC_INTERVENTION -> {
                MissionActions(
                    actions = event.prescribedActions,
                    onStartTimer = { viewModel.startTimer(it.actionId, it.estimatedDurationMin) },
                    onStartAffective = { affectiveOpen = true },
                    onComplete = viewModel::completeAction,
                )
                BodyMapView(records, status.findings, viewModel.now())
            }
            SystemState.CRITICAL_ALERT -> {
                val stillCritical = status.findings.any { it.isCritical }
                if (radiationEvent) {
                    RadiationPanel(
                        records = records,
                        stillCritical = stillCritical,
                        sheltered = sheltered,
                        onSheltered = { viewModel.setSheltered(true) },
                        onAllClear = viewModel::completeAction,
                    )
                } else {
                    GenericCriticalPanel(event.prescribedActions.map { it.description }, stillCritical, viewModel::completeAction)
                }
            }
            SystemState.PERIPHERAL_PASSIVE -> BodyMapView(records, status.findings, viewModel.now())
        }

        MemoriesSection(missionDay, unlocked, profile.seenDisclosures, patterns) { openDisclosure = it.name }
        KnowledgeSection(knowledge, remember(knowledge) { viewModel.todaySummary(knowledge) }, viewModel::forget, viewModel::forgetAll)

        // Momento oportuno (D3)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(stringResource(R.string.opportune_label), style = MaterialTheme.typography.bodyLarge)
                Text(stringResource(R.string.opportune_hint), style = MaterialTheme.typography.bodySmall)
            }
            Switch(checked = status.userAvailable, onCheckedChange = viewModel::setUserAvailable)
        }
    }
}

@Composable
private fun LaikaCard(state: SystemState, emotion: nasa.space.app.ec.laikapolizon.domain.model.Emotion) {
    val (container, onContainer) = state.containerColor()
    Card(
        colors = CardDefaults.cardColors(containerColor = container, contentColor = onContainer),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            LaikaAvatar(emotion = emotion, size = 110.dp, contentDescription = stringResource(emotion.labelRes()))
            Spacer(Modifier.width(12.dp))
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(stringResource(state.labelRes()), style = MaterialTheme.typography.labelLarge)
                Text(stringResource(emotion.messageRes()), style = MaterialTheme.typography.titleMedium)
                Text(stringResource(emotion.labelRes()), style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}

@Composable
private fun Points(events: List<CareEvent>) {
    val total = remember(events) { events.sumOf { it.points } }
    Text(stringResource(R.string.care_points_total, total), style = MaterialTheme.typography.titleSmall)
}

/** Flor de cierre de bucle durante unos segundos tras completar una acción de cuidado. */
@Composable
private fun RecentCelebration(events: List<CareEvent>, now: () -> java.time.Instant) {
    val latest = events.firstOrNull()
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(latest?.id) {
        if (latest != null && Duration.between(latest.timestamp, now()) < Duration.ofSeconds(30)) {
            visible = true
            delay(5_000)
            visible = false
        }
    }
    AnimatedVisibility(visible) {
        BloomCelebration(points = latest?.points ?: 0, modifier = Modifier.fillMaxWidth())
    }
}

@Composable
private fun CompleteButton(state: SystemState, label: Int, onClick: () -> Unit) {
    val (container, onContainer) = state.containerColor()
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(containerColor = container, contentColor = onContainer),
        modifier = Modifier.fillMaxWidth(),
    ) { Text(stringResource(label)) }
}

@Composable
private fun GenericCriticalPanel(actions: List<String>, stillCritical: Boolean, onAllClear: () -> Unit) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(stringResource(R.string.actions_title), style = MaterialTheme.typography.titleMedium)
            actions.forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
            if (!stillCritical) {
                Button(onClick = onAllClear, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.radiation_confirm_safe)) }
            }
        }
    }
}

@Composable
private fun findingText(finding: Finding): String {
    val type = stringResource(finding.type.labelRes())
    return when (finding.kind) {
        FindingKind.CRITICAL_THRESHOLD -> stringResource(R.string.finding_critical, type)
        FindingKind.RADIATION_SPIKE -> stringResource(R.string.finding_radiation)
        FindingKind.SIGMA_DEVIATION -> stringResource(R.string.finding_sigma, formatNumber(finding.zScore ?: 0.0), type)
        FindingKind.NEGATIVE_TREND -> stringResource(R.string.finding_trend, type)
    }
}
