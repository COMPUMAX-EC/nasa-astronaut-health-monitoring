package nasa.space.app.ec.laikapolizon.feature.petoverlay

import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Build
import android.os.PowerManager
import android.util.Log
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import nasa.space.app.ec.laikapolizon.domain.presence.AppCategorizer
import nasa.space.app.ec.laikapolizon.domain.presence.AppCategory
import nasa.space.app.ec.laikapolizon.domain.presence.SystemAppCategory
import nasa.space.app.ec.laikapolizon.feature.common.Permissions
import kotlin.coroutines.coroutineContext

/** App en primer plano: paquete, nombre visible y categoría. Nunca su contenido. */
data class ForegroundApp(val packageName: String, val label: String, val category: AppCategory)

/**
 * Detecta qué app está en primer plano con `UsageStatsManager` (solo el nombre del paquete,
 * nunca su contenido) y la clasifica con [AppCategorizer].
 */
class ForegroundAppMonitor(private val context: Context) {

    private val usageStats = context.getSystemService(UsageStatsManager::class.java)
    private val power = context.getSystemService(PowerManager::class.java)
    /** Última app vista en primer plano (sirve de respaldo si no hay eventos recientes). */
    private var lastSeen: String? = null
    /** Última app informada; null tras apagar la pantalla, para cerrar la sesión en curso. */
    private var lastReported: String? = null

    /**
     * Consulta cada [intervalMs] mientras la pantalla está encendida y hay permiso.
     * Al apagarse la pantalla informa `null`: el tiempo con la pantalla apagada no cuenta como uso.
     */
    suspend fun run(intervalMs: Long = 2_000L, onChange: (ForegroundApp?) -> Unit) {
        while (coroutineContext.isActive) {
            if (power.isInteractive && Permissions.hasUsageAccess(context)) {
                val pkg = currentForegroundPackage()
                if (pkg != null && pkg != lastReported) {
                    lastReported = pkg
                    val category = if (pkg == context.packageName) AppCategory.NEUTRAL else categorize(pkg)
                    Log.d(TAG, "App en primer plano: $pkg → $category")
                    onChange(ForegroundApp(pkg, label(pkg), category))
                }
            } else if (!power.isInteractive && lastReported != null) {
                lastReported = null
                onChange(null)
            }
            delay(intervalMs)
        }
    }

    private fun currentForegroundPackage(): String? {
        val now = System.currentTimeMillis()
        val events = usageStats.queryEvents(now - 60_000L, now)
        val event = UsageEvents.Event()
        val resumed = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            UsageEvents.Event.ACTIVITY_RESUMED
        } else {
            @Suppress("DEPRECATION")
            UsageEvents.Event.MOVE_TO_FOREGROUND
        }
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            if (event.eventType == resumed) lastSeen = event.packageName
        }
        return lastSeen
    }

    private fun label(packageName: String): String = try {
        val pm = context.packageManager
        pm.getApplicationLabel(pm.getApplicationInfo(packageName, 0)).toString()
    } catch (e: PackageManager.NameNotFoundException) {
        packageName.substringAfterLast('.')
    }

    private companion object {
        const val TAG = "LaikaPet"
    }

    private fun categorize(packageName: String): AppCategory {
        val systemCategory = try {
            when (context.packageManager.getApplicationInfo(packageName, 0).category) {
                ApplicationInfo.CATEGORY_GAME -> SystemAppCategory.GAME
                ApplicationInfo.CATEGORY_AUDIO -> SystemAppCategory.AUDIO
                ApplicationInfo.CATEGORY_VIDEO -> SystemAppCategory.VIDEO
                ApplicationInfo.CATEGORY_IMAGE -> SystemAppCategory.IMAGE
                ApplicationInfo.CATEGORY_SOCIAL -> SystemAppCategory.SOCIAL
                ApplicationInfo.CATEGORY_NEWS -> SystemAppCategory.NEWS
                ApplicationInfo.CATEGORY_MAPS -> SystemAppCategory.MAPS
                ApplicationInfo.CATEGORY_PRODUCTIVITY -> SystemAppCategory.PRODUCTIVITY
                else -> SystemAppCategory.UNDEFINED
            }
        } catch (e: PackageManager.NameNotFoundException) {
            SystemAppCategory.UNDEFINED
        }
        return AppCategorizer.categorize(packageName, systemCategory)
    }
}
