package nasa.space.app.ec.laikapolizon.ui.modules

import android.Manifest
import android.content.Context
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import nasa.space.app.ec.laikapolizon.LaikaApplication
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.presence.AppCategory
import nasa.space.app.ec.laikapolizon.domain.presence.VoiceStatus
import nasa.space.app.ec.laikapolizon.feature.common.Permissions
import nasa.space.app.ec.laikapolizon.feature.petoverlay.PetOverlayService
import nasa.space.app.ec.laikapolizon.feature.voice.VoiceService
import nasa.space.app.ec.laikapolizon.ui.theme.LaikaTheme

/** Onboarding de permisos especiales y activación del screen pet y la voz (Fase 2). */
@Composable
fun ModulesScreen(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val presence = remember { (context.applicationContext as LaikaApplication).container.presence }

    // Los permisos especiales se conceden en Ajustes: se vuelven a leer al regresar a la app.
    var refresh by remember { mutableIntStateOf(0) }
    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event -> if (event == Lifecycle.Event.ON_RESUME) refresh++ }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }
    val perms = remember(refresh) { PermissionSnapshot.read(context) }

    val petRunning by presence.petRunning.collectAsStateWithLifecycle()
    val category by presence.foregroundCategory.collectAsStateWithLifecycle()
    val voiceStatus by presence.voiceStatus.collectAsStateWithLifecycle()
    val lastHeard by presence.lastHeard.collectAsStateWithLifecycle()
    val ttsAvailable by presence.ttsAvailable.collectAsStateWithLifecycle()

    val runtimePermissions = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { result ->
        refresh++
        if (result[Manifest.permission.RECORD_AUDIO] == true) VoiceService.start(context)
    }
    val notificationPermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { refresh++ }

    Column(
        modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(stringResource(R.string.modules_title), style = MaterialTheme.typography.titleLarge)

        // --- Módulo A: screen pet ---
        Section(stringResource(R.string.modules_pet_title), stringResource(R.string.modules_pet_desc)) {
            PermissionRow(stringResource(R.string.perm_overlay), perms.overlay) {
                context.startActivity(Permissions.overlaySettingsIntent(context))
            }
            PermissionRow(stringResource(R.string.perm_usage), perms.usage) {
                context.startActivity(Permissions.usageAccessSettingsIntent())
            }
            ToggleRow(
                label = stringResource(R.string.modules_pet_toggle),
                checked = petRunning,
                enabled = perms.overlay,
            ) { on -> if (on) PetOverlayService.start(context) else PetOverlayService.stop(context) }
            if (petRunning && perms.usage) {
                Text(
                    stringResource(R.string.modules_pet_category, stringResource(category.labelRes())),
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }

        // --- Módulo B: voz ---
        Section(stringResource(R.string.modules_voice_title), stringResource(R.string.modules_voice_desc)) {
            PermissionRow(stringResource(R.string.perm_microphone), perms.microphone) {
                runtimePermissions.launch(arrayOf(Manifest.permission.RECORD_AUDIO))
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                PermissionRow(stringResource(R.string.perm_notifications), perms.notifications) {
                    notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
                }
            }
            val voiceOn = voiceStatus == VoiceStatus.LISTENING || voiceStatus == VoiceStatus.LOADING_MODEL
            ToggleRow(
                label = stringResource(R.string.modules_voice_toggle),
                checked = voiceOn,
                enabled = true,
            ) { on ->
                when {
                    !on -> VoiceService.stop(context)
                    perms.microphone -> VoiceService.start(context)
                    else -> runtimePermissions.launch(arrayOf(Manifest.permission.RECORD_AUDIO))
                }
            }
            Text(stringResource(voiceStatus.labelRes()), style = MaterialTheme.typography.bodyMedium)
            if (voiceStatus == VoiceStatus.LISTENING && !ttsAvailable) {
                Text(stringResource(R.string.modules_voice_no_tts), color = LaikaTheme.status.attention, style = MaterialTheme.typography.bodySmall)
            }
            if (lastHeard.isNotBlank()) {
                Text(stringResource(R.string.modules_voice_heard, lastHeard), style = MaterialTheme.typography.bodySmall)
            }
            Text(stringResource(R.string.modules_voice_examples), style = MaterialTheme.typography.bodySmall)
        }

        Text(stringResource(R.string.modules_privacy), style = MaterialTheme.typography.bodySmall)
    }
}

private data class PermissionSnapshot(val overlay: Boolean, val usage: Boolean, val microphone: Boolean, val notifications: Boolean) {
    companion object {
        fun read(context: Context) = PermissionSnapshot(
            overlay = Permissions.canDrawOverlays(context),
            usage = Permissions.hasUsageAccess(context),
            microphone = Permissions.hasMicrophone(context),
            notifications = Permissions.hasNotifications(context),
        )
    }
}

@Composable
private fun Section(title: String, description: String, content: @Composable () -> Unit) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(title, style = MaterialTheme.typography.titleMedium)
            Text(description, style = MaterialTheme.typography.bodySmall)
            content()
        }
    }
}

@Composable
private fun PermissionRow(label: String, granted: Boolean, onGrant: () -> Unit) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Text(
            (if (granted) "✓ " else "○ ") + label,
            Modifier.weight(1f),
            color = if (granted) LaikaTheme.status.optimal else MaterialTheme.colorScheme.onSurface,
            style = MaterialTheme.typography.bodyMedium,
        )
        if (!granted) OutlinedButton(onClick = onGrant) { Text(stringResource(R.string.perm_grant)) }
    }
}

@Composable
private fun ToggleRow(label: String, checked: Boolean, enabled: Boolean, onChange: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Text(label, Modifier.weight(1f), style = MaterialTheme.typography.bodyLarge)
        Switch(checked = checked, onCheckedChange = onChange, enabled = enabled)
    }
}

private fun AppCategory.labelRes(): Int = when (this) {
    AppCategory.EXERCISE -> R.string.category_exercise
    AppCategory.JOURNAL -> R.string.category_journal
    AppCategory.FOCUSED -> R.string.category_focused
    AppCategory.SOCIAL -> R.string.category_social
    AppCategory.VIDEO -> R.string.category_video
    AppCategory.CAMERA -> R.string.category_camera
    AppCategory.LEISURE -> R.string.category_leisure
    AppCategory.NEUTRAL -> R.string.category_neutral
}

private fun VoiceStatus.labelRes(): Int = when (this) {
    VoiceStatus.OFF -> R.string.voice_status_off
    VoiceStatus.LOADING_MODEL -> R.string.voice_status_loading
    VoiceStatus.LISTENING -> R.string.voice_status_listening
    VoiceStatus.MUTED -> R.string.voice_status_muted
    VoiceStatus.ERROR_MODEL -> R.string.voice_status_error_model
    VoiceStatus.ERROR -> R.string.voice_status_error
}
