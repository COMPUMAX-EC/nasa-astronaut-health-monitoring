package nasa.space.app.ec.laikapolizon.feature.voice

import android.content.Context
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.speech.tts.Voice

/**
 * Texto a voz en español usando SOLO voces que no requieren red (docs/11-red-cerrada.md).
 * Si no hay ninguna voz española offline instalada, [available] queda en falso y Laika
 * responde solo con texto en el globo del screen pet.
 */
class LaikaTts(
    context: Context,
    private val onReady: (available: Boolean) -> Unit,
    private val onSpeakingChanged: (speaking: Boolean) -> Unit,
) {
    private var tts: TextToSpeech? = null
    var available = false
        private set
    private var nextId = 0L

    init {
        tts = TextToSpeech(context.applicationContext) { status ->
            available = status == TextToSpeech.SUCCESS && selectOfflineSpanishVoice()
            onReady(available)
        }
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) = onSpeakingChanged(true)
            override fun onDone(utteranceId: String?) = onSpeakingChanged(false)
            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String?) = onSpeakingChanged(false)
        })
    }

    private fun selectOfflineSpanishVoice(): Boolean {
        val engine = tts ?: return false
        val voices: Set<Voice> = try { engine.voices.orEmpty() } catch (e: Exception) { emptySet() }
        val best = voices
            .filter { it.locale.language == "es" }
            .filter { !it.isNetworkConnectionRequired }
            .filter { TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED !in it.features.orEmpty() }
            .maxByOrNull { it.quality }
            ?: return false
        return engine.setVoice(best) == TextToSpeech.SUCCESS
    }

    fun speak(text: String) {
        if (!available) return
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "laika-${nextId++}")
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
    }
}
