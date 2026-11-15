package nasa.space.app.ec.laikapolizon.ui.simulator

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.data.simulator.Scenario
import nasa.space.app.ec.laikapolizon.ui.SimulatorViewModel
import nasa.space.app.ec.laikapolizon.ui.common.labelRes

@Composable
fun SimulatorScreen(viewModel: SimulatorViewModel, modifier: Modifier = Modifier) {
    val lastLoaded by viewModel.lastLoaded.collectAsStateWithLifecycle()

    Column(
        modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(stringResource(R.string.simulator_title), style = MaterialTheme.typography.titleLarge)
        Text(stringResource(R.string.simulator_hint), style = MaterialTheme.typography.bodySmall)

        Scenario.entries.forEach { scenario ->
            OutlinedButton(onClick = { viewModel.load(scenario) }, modifier = Modifier.fillMaxWidth()) {
                Text(stringResource(scenario.labelRes()))
            }
        }
        OutlinedButton(onClick = viewModel::endRadiationEvent, modifier = Modifier.fillMaxWidth()) {
            Text(stringResource(R.string.simulator_end_radiation))
        }
        TextButton(onClick = viewModel::clear, modifier = Modifier.fillMaxWidth()) {
            Text(stringResource(R.string.simulator_clear))
        }

        lastLoaded?.let {
            Text(stringResource(R.string.scenario_loaded, stringResource(it.labelRes())), style = MaterialTheme.typography.bodyMedium)
        }

        // Fase 4: revelación progresiva. Saltar en el tiempo de la misión sin esperar meses.
        val profile by viewModel.profile.collectAsStateWithLifecycle()
        Text(stringResource(R.string.simulator_mission_title), style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 12.dp))
        Text(stringResource(R.string.mission_day, viewModel.missionDay(profile)), style = MaterialTheme.typography.bodyMedium)
        Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(
                1 to R.string.mission_preset_day1, 14 to R.string.mission_preset_2w, 90 to R.string.mission_preset_3m,
                365 to R.string.mission_preset_1y, 730 to R.string.mission_preset_2y, 900 to R.string.mission_preset_900,
            ).forEach { (day, label) ->
                OutlinedButton(onClick = { viewModel.setMissionDay(day) }) { Text(stringResource(label)) }
            }
        }
    }
}
