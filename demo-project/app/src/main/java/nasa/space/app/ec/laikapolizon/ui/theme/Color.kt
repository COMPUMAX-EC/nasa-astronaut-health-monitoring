package nasa.space.app.ec.laikapolizon.ui.theme

import androidx.compose.ui.graphics.Color

// ---------------------------------------------------------------------------
// Calm Palette — colores de estado (docs/05-sistema-de-diseno.md).
// Son fijos: no dependen del fondo de pantalla ni del tema del teléfono.
// El coral (StatusCritical) se reserva SOLO para CRITICAL_ALERT.
// ---------------------------------------------------------------------------
val StatusOptimal = Color(0xFF2D8A56)       // Verde Mente      → PERIPHERAL_PASSIVE
val StatusAttention = Color(0xFFD98A2B)     // Ámbar Calmo      → MICRO_INTERACTION
val StatusIntervention = Color(0xFF1D5C96)  // Azul Cobalto     → THERAPEUTIC_INTERVENTION
val StatusCritical = Color(0xFFC84B31)      // Coral Espacial   → CRITICAL_ALERT

val OnStatusOptimal = Color(0xFFFFFFFF)
val OnStatusAttention = Color(0xFF231400)   // texto oscuro: blanco sobre ámbar no tiene contraste suficiente
val OnStatusIntervention = Color(0xFFFFFFFF)
val OnStatusCritical = Color(0xFFFFFFFF)

// ---------------------------------------------------------------------------
// Esquema Material 3 propio de Laika — tema claro
// ---------------------------------------------------------------------------
val LightPrimary = Color(0xFF1D5C96)
val LightOnPrimary = Color(0xFFFFFFFF)
val LightPrimaryContainer = Color(0xFFD3E4F7)
val LightOnPrimaryContainer = Color(0xFF0A2540)
val LightSecondary = Color(0xFF2D8A56)
val LightOnSecondary = Color(0xFFFFFFFF)
val LightSecondaryContainer = Color(0xFFCDEBD8)
val LightOnSecondaryContainer = Color(0xFF0B2E1B)
val LightTertiary = Color(0xFF5B5F97)
val LightOnTertiary = Color(0xFFFFFFFF)
val LightTertiaryContainer = Color(0xFFE1E0FF)
val LightOnTertiaryContainer = Color(0xFF161A4F)
val LightError = Color(0xFFC84B31)
val LightOnError = Color(0xFFFFFFFF)
val LightErrorContainer = Color(0xFFF9DAD3)
val LightOnErrorContainer = Color(0xFF4A140A)
val LightBackground = Color(0xFFF5F7FA)
val LightOnBackground = Color(0xFF14202B)
val LightSurface = Color(0xFFF5F7FA)
val LightOnSurface = Color(0xFF14202B)
val LightSurfaceVariant = Color(0xFFDDE3EA)
val LightOnSurfaceVariant = Color(0xFF424B55)
val LightOutline = Color(0xFF727C87)

// ---------------------------------------------------------------------------
// Esquema Material 3 propio de Laika — tema oscuro (cabina con poca luz)
// ---------------------------------------------------------------------------
val DarkPrimary = Color(0xFFA3C9F0)
val DarkOnPrimary = Color(0xFF003256)
val DarkPrimaryContainer = Color(0xFF1D5C96)
val DarkOnPrimaryContainer = Color(0xFFD3E4F7)
val DarkSecondary = Color(0xFF8FD4A9)
val DarkOnSecondary = Color(0xFF00391E)
val DarkSecondaryContainer = Color(0xFF1F6B41)
val DarkOnSecondaryContainer = Color(0xFFCDEBD8)
val DarkTertiary = Color(0xFFC0C2FF)
val DarkOnTertiary = Color(0xFF2A2E64)
val DarkTertiaryContainer = Color(0xFF43477D)
val DarkOnTertiaryContainer = Color(0xFFE1E0FF)
val DarkError = Color(0xFFFFB4A3)
val DarkOnError = Color(0xFF5F1606)
val DarkErrorContainer = Color(0xFFA13A23)
val DarkOnErrorContainer = Color(0xFFF9DAD3)
val DarkBackground = Color(0xFF0E141B)
val DarkOnBackground = Color(0xFFE1E7EE)
val DarkSurface = Color(0xFF0E141B)
val DarkOnSurface = Color(0xFFE1E7EE)
val DarkSurfaceVariant = Color(0xFF2A333D)
val DarkOnSurfaceVariant = Color(0xFFBEC7D1)
val DarkOutline = Color(0xFF88929C)
