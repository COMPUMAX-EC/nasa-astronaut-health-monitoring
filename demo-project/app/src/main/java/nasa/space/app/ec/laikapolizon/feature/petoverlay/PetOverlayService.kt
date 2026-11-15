package nasa.space.app.ec.laikapolizon.feature.petoverlay

import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import androidx.compose.ui.platform.ComposeView
import androidx.lifecycle.LifecycleService
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch
import nasa.space.app.ec.laikapolizon.LaikaApplication
import nasa.space.app.ec.laikapolizon.MainActivity
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.domain.presence.AppCategory
import nasa.space.app.ec.laikapolizon.feature.common.Haptics
import nasa.space.app.ec.laikapolizon.feature.common.Notifications
import nasa.space.app.ec.laikapolizon.feature.common.Permissions
import nasa.space.app.ec.laikapolizon.ui.theme.LaikaPolizonTheme

/**
 * Módulo A: Laika flotando sobre cualquier app (docs/10-modulos-de-la-app.md).
 * Solo observa el estado del LaikaEngine; nunca lo decide.
 */
class PetOverlayService : LifecycleService(), SavedStateRegistryOwner {

    private val savedStateController = SavedStateRegistryController.create(this)
    override val savedStateRegistry: SavedStateRegistry get() = savedStateController.savedStateRegistry

    private lateinit var windowManager: WindowManager
    private var overlayView: ComposeView? = null
    private val params = WindowManager.LayoutParams(
        WindowManager.LayoutParams.WRAP_CONTENT,
        WindowManager.LayoutParams.WRAP_CONTENT,
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
        // No roba el foco ni el teclado a la app que se está usando; no puede salirse de la pantalla.
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
        PixelFormat.TRANSLUCENT,
    ).apply {
        // Anclada abajo a la derecha, como los ayudantes de escritorio: el globo crece hacia arriba
        // sin desplazar al personaje. x/y son distancias desde ese borde.
        gravity = Gravity.BOTTOM or Gravity.END
    }

    override fun onCreate() {
        savedStateController.performRestore(null)
        super.onCreate()
        val container = (application as LaikaApplication).container

        if (!Permissions.canDrawOverlays(this)) {
            stopSelf()
            return
        }
        Notifications.startForeground(
            this, Notifications.PET_ID,
            Notifications.build(this, getString(R.string.notification_pet)),
            microphone = false,
        )
        container.presence.petRunning.value = true

        windowManager = getSystemService(WindowManager::class.java)
        val density = resources.displayMetrics.density
        params.x = (12 * density).toInt()
        params.y = (230 * density).toInt() // por encima del dock de íconos y la barra de navegación
        val view = ComposeView(this).apply {
            setViewTreeLifecycleOwner(this@PetOverlayService)
            setViewTreeSavedStateRegistryOwner(this@PetOverlayService)
            setContent {
                LaikaPolizonTheme(applyToWindow = false) {
                    PetOverlay(
                        engineStatus = container.engine.status,
                        presence = container.presence,
                        onDrag = ::moveBy,
                        onOpenApp = ::openApp,
                        onAffectiveTouch = { Haptics.heartbeat(this@PetOverlayService) },
                        onStartChat = container.conversations::startChat,
                        onReply = { reply ->
                            Log.d(TAG, "Respuesta rápida: $reply")
                            container.conversations.answer(reply)
                        },
                        onDismissChat = container.conversations::dismiss,
                    )
                }
            }
        }
        windowManager.addView(view, params)
        overlayView = view

        // Dentro de la app de Laika ya está su avatar; en una app de concentración se oculta, salvo en
        // alerta crítica (T4). Se oculta la vista entera: si el contenido quedara en 0×0, Android seguiría
        // mostrando el último cuadro pegado al borde.
        lifecycleScope.launch {
            combine(container.presence.appVisible, container.presence.foregroundCategory, container.engine.status) { inApp, category, status ->
                inApp || (category == AppCategory.FOCUSED && status.event.currentSystemState != SystemState.CRITICAL_ALERT)
            }.distinctUntilChanged().collect { hidden -> view.visibility = if (hidden) View.GONE else View.VISIBLE }
        }

        // Reacción a la app en primer plano: alimenta la regla T1 (momento oportuno).
        val monitor = ForegroundAppMonitor(this)
        lifecycleScope.launch {
            monitor.run { app ->
                val category = app?.category ?: AppCategory.NEUTRAL
                container.presence.foregroundPackage.value = app?.packageName
                container.presence.foregroundCategory.value = category
                container.engine.setFocusedAppActive(category == AppCategory.FOCUSED)
                // Contexto social: tiempo en redes, videos y cámara (nunca su contenido). "Mostrar a Laika"
                // abre una pantalla propia de paso que no debe cortar la sesión de la app desde la que se comparte.
                val passingThrough = app?.packageName == packageName && !container.presence.appVisible.value
                if (!passingThrough) container.conversations.onForegroundApp(app?.packageName, app?.label, category)
            }
        }
        lifecycleScope.launch {
            while (true) {
                delay(30_000)
                container.conversations.onTick()
            }
        }
    }

    private fun moveBy(dx: Float, dy: Float) {
        val view = overlayView ?: return
        // Con gravedad BOTTOM|END, x/y crecen hacia la izquierda y hacia arriba: se resta el movimiento del dedo.
        params.x = (params.x - dx.toInt()).coerceAtLeast(0)
        params.y = (params.y - dy.toInt()).coerceAtLeast(0)
        windowManager.updateViewLayout(view, params)
    }

    private fun openApp() {
        startActivity(
            Intent(this, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
        )
    }

    override fun onDestroy() {
        overlayView?.let { windowManager.removeView(it) }
        overlayView = null
        val container = (application as LaikaApplication).container
        container.presence.petRunning.value = false
        container.conversations.onForegroundApp(null, null, AppCategory.NEUTRAL)
        container.conversations.dismiss()
        container.presence.foregroundCategory.value = AppCategory.NEUTRAL
        container.engine.setFocusedAppActive(false)
        super.onDestroy()
    }

    companion object {
        private const val TAG = "LaikaPet"

        fun start(context: Context) = context.startForegroundService(Intent(context, PetOverlayService::class.java))
        fun stop(context: Context) = context.stopService(Intent(context, PetOverlayService::class.java))
    }
}
