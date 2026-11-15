package nasa.space.app.ec.laikapolizon.ui

import androidx.annotation.StringRes
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.viewmodel.compose.viewModel
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.ui.companion.CompanionScreen
import nasa.space.app.ec.laikapolizon.ui.healthlog.HealthLogScreen
import nasa.space.app.ec.laikapolizon.ui.healthlog.HistoryScreen
import nasa.space.app.ec.laikapolizon.ui.simulator.SimulatorScreen
import nasa.space.app.ec.laikapolizon.ui.modules.ModulesScreen

private enum class Tab(@StringRes val label: Int, val icon: ImageVector) {
    LAIKA(R.string.tab_laika, Icons.Filled.Favorite),
    LOG(R.string.tab_log, Icons.Filled.Add),
    HISTORY(R.string.tab_history, Icons.Filled.List),
    SIMULATOR(R.string.tab_simulator, Icons.Filled.Build),
    MODULES(R.string.tab_modules, Icons.Filled.Settings),
}

@Composable
fun LaikaApp() {
    var tab by rememberSaveable { mutableStateOf(Tab.LAIKA) }
    val companionVm: CompanionViewModel = viewModel(factory = LaikaViewModelFactory)
    val healthLogVm: HealthLogViewModel = viewModel(factory = LaikaViewModelFactory)
    val simulatorVm: SimulatorViewModel = viewModel(factory = LaikaViewModelFactory)

    Scaffold(
        bottomBar = {
            NavigationBar {
                Tab.entries.forEach { t ->
                    NavigationBarItem(
                        selected = t == tab,
                        onClick = { tab = t },
                        icon = { Icon(t.icon, contentDescription = null) },
                        label = { Text(stringResource(t.label)) },
                    )
                }
            }
        },
    ) { padding ->
        val modifier = Modifier.padding(padding)
        when (tab) {
            Tab.LAIKA -> CompanionScreen(companionVm, modifier)
            Tab.LOG -> HealthLogScreen(healthLogVm, modifier)
            Tab.HISTORY -> HistoryScreen(healthLogVm, modifier)
            Tab.SIMULATOR -> SimulatorScreen(simulatorVm, modifier)
            Tab.MODULES -> ModulesScreen(modifier)
        }
    }
}
