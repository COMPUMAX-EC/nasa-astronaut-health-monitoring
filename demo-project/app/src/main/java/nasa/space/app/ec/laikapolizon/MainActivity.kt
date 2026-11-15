package nasa.space.app.ec.laikapolizon

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import nasa.space.app.ec.laikapolizon.ui.LaikaApp
import nasa.space.app.ec.laikapolizon.ui.theme.LaikaPolizonTheme

class MainActivity : ComponentActivity() {
    private val presence get() = (application as LaikaApplication).container.presence

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            LaikaPolizonTheme {
                LaikaApp()
            }
        }
    }

    // Mientras la app está en pantalla, Laika flotante se oculta: adentro ya está su avatar.
    override fun onStart() {
        super.onStart()
        presence.appVisible.value = true
    }

    override fun onStop() {
        presence.appVisible.value = false
        super.onStop()
    }
}
