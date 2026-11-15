package nasa.space.app.ec.laikapolizon.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// La app usa SIEMPRE su propia paleta. No se usa dynamic color (Material You)
// para que los colores de estado de la Calm Palette no choquen con los colores
// derivados del fondo de pantalla del teléfono.

private val LightColorScheme = lightColorScheme(
    primary = LightPrimary,
    onPrimary = LightOnPrimary,
    primaryContainer = LightPrimaryContainer,
    onPrimaryContainer = LightOnPrimaryContainer,
    secondary = LightSecondary,
    onSecondary = LightOnSecondary,
    secondaryContainer = LightSecondaryContainer,
    onSecondaryContainer = LightOnSecondaryContainer,
    tertiary = LightTertiary,
    onTertiary = LightOnTertiary,
    tertiaryContainer = LightTertiaryContainer,
    onTertiaryContainer = LightOnTertiaryContainer,
    error = LightError,
    onError = LightOnError,
    errorContainer = LightErrorContainer,
    onErrorContainer = LightOnErrorContainer,
    background = LightBackground,
    onBackground = LightOnBackground,
    surface = LightSurface,
    onSurface = LightOnSurface,
    surfaceVariant = LightSurfaceVariant,
    onSurfaceVariant = LightOnSurfaceVariant,
    outline = LightOutline,
)

private val DarkColorScheme = darkColorScheme(
    primary = DarkPrimary,
    onPrimary = DarkOnPrimary,
    primaryContainer = DarkPrimaryContainer,
    onPrimaryContainer = DarkOnPrimaryContainer,
    secondary = DarkSecondary,
    onSecondary = DarkOnSecondary,
    secondaryContainer = DarkSecondaryContainer,
    onSecondaryContainer = DarkOnSecondaryContainer,
    tertiary = DarkTertiary,
    onTertiary = DarkOnTertiary,
    tertiaryContainer = DarkTertiaryContainer,
    onTertiaryContainer = DarkOnTertiaryContainer,
    error = DarkError,
    onError = DarkOnError,
    errorContainer = DarkErrorContainer,
    onErrorContainer = DarkOnErrorContainer,
    background = DarkBackground,
    onBackground = DarkOnBackground,
    surface = DarkSurface,
    onSurface = DarkOnSurface,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = DarkOnSurfaceVariant,
    outline = DarkOutline,
)

/** Colores de estado de la Calm Palette. Usar siempre estos tokens, nunca hex sueltos. */
@Immutable
data class LaikaStatusColors(
    val optimal: Color = StatusOptimal,
    val onOptimal: Color = OnStatusOptimal,
    val attention: Color = StatusAttention,
    val onAttention: Color = OnStatusAttention,
    val intervention: Color = StatusIntervention,
    val onIntervention: Color = OnStatusIntervention,
    val critical: Color = StatusCritical,
    val onCritical: Color = OnStatusCritical,
)

val LocalLaikaStatusColors = staticCompositionLocalOf { LaikaStatusColors() }

/** Acceso: `LaikaTheme.status.attention` dentro de [LaikaPolizonTheme]. */
object LaikaTheme {
    val status: LaikaStatusColors
        @Composable get() = LocalLaikaStatusColors.current
}

@Composable
fun LaikaPolizonTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    /** Falso fuera de una Activity (p. ej. el overlay del screen pet, que vive en un Service). */
    applyToWindow: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    val activity = view.context as? Activity
    if (applyToWindow && activity != null && !view.isInEditMode) {
        SideEffect {
            val window = activity.window
            window.statusBarColor = colorScheme.background.toArgb()
            // Fondo claro → iconos oscuros en la barra de estado, y viceversa.
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    CompositionLocalProvider(LocalLaikaStatusColors provides LaikaStatusColors()) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}
