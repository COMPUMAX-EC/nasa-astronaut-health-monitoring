package nasa.space.app.ec.laikapolizon.domain.voice

import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType

/** Intenciones del asistente de voz (docs/10-modulos-de-la-app.md, módulo B). */
sealed interface VoiceIntent {
    data class LogMeasurement(val type: MeasurementType, val value: Double, val secondaryValue: Double?) : VoiceIntent
    /** Se nombró una métrica que se puede registrar, pero no se entendió el número. */
    data class MissingNumber(val type: MeasurementType) : VoiceIntent
    data class QueryMetric(val type: MeasurementType) : VoiceIntent
    data object QueryStatus : VoiceIntent
    data object RadiationStatus : VoiceIntent
    data object ActionDone : VoiceIntent
    data object Greeting : VoiceIntent
    /** "¿Qué hice hoy?": resumen del contexto del día. */
    data object QueryDay : VoiceIntent
    /** "Platiquemos", "¿qué recuerdas?": Laika trae un recuerdo o hace una pregunta. */
    data object Chat : VoiceIntent
    data object Mute : VoiceIntent
    data object Yes : VoiceIntent
    data object No : VoiceIntent
    data object Unknown : VoiceIntent
}

/** Intérprete por reglas: determinista y sin red. */
object IntentParser {

    /** Variantes con las que el reconocedor suele transcribir "Laika". */
    private val wakeSingle = setOf("laika", "laica", "layka", "lajka", "laik", "laica.")
    private val wakePairs = setOf("la ica", "lai ca", "lay ka", "lai ka")

    /** Palabras clave → tipo. El orden importa: la primera coincidencia gana. */
    private val typeKeywords: List<Pair<MeasurementType, List<String>>> = listOf(
        MeasurementType.HRV to listOf("variabilidad", "vfc"),
        MeasurementType.BLOOD_PRESSURE to listOf("presion", "tension"),
        MeasurementType.GLUCOSE to listOf("glucosa", "azucar", "glucemia"),
        MeasurementType.HEART_RATE to listOf("pulso", "frecuencia", "ritmo", "pulsaciones", "latidos"),
        MeasurementType.BODY_TEMPERATURE to listOf("temperatura", "fiebre"),
        MeasurementType.SLEEP_DURATION to listOf("dormi", "sueno", "dormido", "dormir"),
        MeasurementType.ACTIVITY_MINUTES to listOf("ejercicio", "actividad", "entrene", "entrenamiento"),
        MeasurementType.CORTISOL to listOf("cortisol"),
        MeasurementType.VISION_CLARITY to listOf("vision", "vista", "nitidez"),
    )

    private val muteWords = listOf("silencio", "deja de escuchar", "no escuches", "apagate", "callate")
    private val doneWords = listOf(
        "listo", "lista", "termine", "terminado", "hecho", "completado", "completada", "ya estoy", "ya llegue",
    )
    private val radiationWords = listOf("radiacion", "neutrones", "particulas")
    private val statusWords = listOf("como estamos", "como estoy", "como te sientes", "como estas", "mi estado", "vitalidad")
    private val greetingWords = listOf("hola", "buenos dias", "buenas tardes", "buenas noches", "buenas")
    private val dayWords = listOf("que hice hoy", "mi dia", "resumen del dia", "como fue hoy", "como me fue hoy")
    private val chatWords = listOf(
        "platiquemos", "conversemos", "hablemos", "charlemos", "cuentame algo", "que recuerdas", "te acuerdas", "recuerdas",
    )
    private val yesWords = setOf("si", "correcto", "confirmo", "exacto", "vale", "ok", "dale", "afirmativo", "claro")
    private val noWords = setOf("no", "incorrecto", "cancela", "cancelar", "negativo", "equivocado")

    /**
     * Busca la palabra de activación. Devuelve el comando que viene después
     * ("" si solo se dijo "Laika"), o null si no se dijo "Laika".
     */
    fun afterWakeWord(text: String): String? {
        val tokens = SpanishText.tokens(text)
        for (i in tokens.indices) {
            if (tokens[i] in wakeSingle) return tokens.drop(i + 1).joinToString(" ")
            if (i + 1 < tokens.size && "${tokens[i]} ${tokens[i + 1]}" in wakePairs) {
                return tokens.drop(i + 2).joinToString(" ")
            }
        }
        return null
    }

    fun parse(command: String): VoiceIntent {
        val text = SpanishText.normalize(command)
        if (text.isEmpty()) return VoiceIntent.Unknown
        val tokens = text.split(' ')
        fun has(phrases: List<String>) = phrases.any { phrase ->
            if (' ' in phrase) " $text ".contains(" $phrase ") else phrase in tokens
        }

        if (tokens.size <= 2 && tokens.all { it in yesWords }) return VoiceIntent.Yes
        if (tokens.size <= 2 && tokens.first() in noWords) return VoiceIntent.No
        if (has(muteWords)) return VoiceIntent.Mute
        if (has(radiationWords)) return VoiceIntent.RadiationStatus

        val type = typeKeywords.firstOrNull { (_, keys) -> keys.any { k -> tokens.any { it.startsWith(k) } } }?.first
        if (type != null) {
            val numbers = SpanishNumbers.extractFromTokens(tokens)
            val isQuestion = tokens.any { it in setOf("cuanto", "cuanta", "cual", "como", "dime") }
            return when {
                numbers.isNotEmpty() && !isQuestion -> VoiceIntent.LogMeasurement(
                    type = type,
                    value = numbers[0],
                    secondaryValue = if (type == MeasurementType.BLOOD_PRESSURE) numbers.getOrNull(1) else null,
                )
                isQuestion -> VoiceIntent.QueryMetric(type)
                else -> VoiceIntent.MissingNumber(type)
            }
        }

        if (has(dayWords)) return VoiceIntent.QueryDay
        if (has(chatWords)) return VoiceIntent.Chat
        if (has(doneWords)) return VoiceIntent.ActionDone
        if (has(statusWords)) return VoiceIntent.QueryStatus
        if (has(greetingWords)) return VoiceIntent.Greeting
        return VoiceIntent.Unknown
    }
}
