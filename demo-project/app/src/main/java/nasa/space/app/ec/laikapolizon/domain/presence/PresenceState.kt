package nasa.space.app.ec.laikapolizon.domain.presence

import kotlinx.coroutines.flow.MutableStateFlow
import nasa.space.app.ec.laikapolizon.domain.knowledge.ChatMessage
import nasa.space.app.ec.laikapolizon.domain.knowledge.Conversation

enum class VoiceStatus {
    OFF,
    LOADING_MODEL,
    LISTENING,
    /** Silenciada con "Laika, silencio": se reactiva solo a mano. */
    MUTED,
    ERROR_MODEL,
    ERROR,
}

/** Frase de Laika; el id distingue dos respuestas iguales seguidas. */
data class VoiceLine(val id: Long, val text: String)

/**
 * Estado de los módulos de presencia (screen pet y voz), compartido entre servicios y UI.
 * Lo escriben los servicios; la UI y el overlay solo lo leen.
 */
class PresenceState {
    val petRunning = MutableStateFlow(false)
    val foregroundCategory = MutableStateFlow(AppCategory.NEUTRAL)
    val foregroundPackage = MutableStateFlow<String?>(null)
    /** La app de Laika está en pantalla: el overlay se oculta (adentro ya está el avatar). */
    val appVisible = MutableStateFlow(false)

    /** Pregunta abierta en el globo del screen pet (contexto social, docs/10). */
    val conversation = MutableStateFlow<Conversation?>(null)
    /** Última frase de Laika en la conversación del globo. */
    val chatMessage = MutableStateFlow<ChatMessage?>(null)

    val voiceStatus = MutableStateFlow(VoiceStatus.OFF)
    /** Laika espera una orden o confirmación (indicador de "orejas" en el overlay). */
    val voiceAwake = MutableStateFlow(false)
    /** Última frase reconocida (para mostrarla en pantalla). */
    val lastHeard = MutableStateFlow("")
    /** Última respuesta de Laika (se muestra en el globo aunque no haya voz TTS instalada). */
    val lastReply = MutableStateFlow<VoiceLine?>(null)
    /** Falso si no hay una voz española offline instalada: Laika responde solo por texto. */
    val ttsAvailable = MutableStateFlow(true)
}
