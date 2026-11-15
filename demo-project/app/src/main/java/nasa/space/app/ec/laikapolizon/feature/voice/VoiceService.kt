package nasa.space.app.ec.laikapolizon.feature.voice

import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.lifecycle.LifecycleService
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import nasa.space.app.ec.laikapolizon.AppContainer
import nasa.space.app.ec.laikapolizon.LaikaApplication
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.analysis.FindingKind
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementSource
import nasa.space.app.ec.laikapolizon.domain.model.effective
import nasa.space.app.ec.laikapolizon.domain.presence.VoiceLine
import nasa.space.app.ec.laikapolizon.domain.presence.VoiceStatus
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceContext
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceDialogue
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceEffect
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceReply
import nasa.space.app.ec.laikapolizon.feature.common.Haptics
import nasa.space.app.ec.laikapolizon.feature.common.Notifications
import nasa.space.app.ec.laikapolizon.feature.common.Permissions
import org.json.JSONObject
import org.vosk.LibVosk
import org.vosk.LogLevel
import org.vosk.Model
import org.vosk.Recognizer
import org.vosk.android.RecognitionListener
import org.vosk.android.SpeechService
import java.time.Instant

/**
 * Módulo B: Laika escucha su nombre y conversa (docs/10-modulos-de-la-app.md).
 * Todo ocurre en el dispositivo: Vosk para voz → texto, reglas para intenciones,
 * TTS del sistema con voz offline. El audio nunca se guarda.
 */
class VoiceService : LifecycleService(), RecognitionListener {

    private lateinit var container: AppContainer
    private val dialogue = VoiceDialogue()
    private var model: Model? = null
    private var recognizer: Recognizer? = null
    private var speechService: SpeechService? = null
    private var tts: LaikaTts? = null
    private var nextLineId = 0L

    private val latestByType by lazy {
        container.measurementRepository.observeAll()
            .map { records -> records.effective().groupBy { it.type }.mapValues { (_, l) -> l.maxBy { it.timestamp } } }
            .stateIn(lifecycleScope, SharingStarted.Eagerly, emptyMap())
    }

    override fun onCreate() {
        super.onCreate()
        container = (application as LaikaApplication).container
        if (!Permissions.hasMicrophone(this)) {
            stopSelf()
            return
        }
        Notifications.startForeground(
            this, Notifications.VOICE_ID,
            Notifications.build(this, getString(R.string.notification_voice)),
            microphone = true,
        )
        val presence = container.presence
        presence.voiceStatus.value = VoiceStatus.LOADING_MODEL
        latestByType // empieza a observar el registro

        tts = LaikaTts(
            this,
            onReady = { presence.ttsAvailable.value = it },
            // Mientras Laika habla no escucha, para no transcribirse a sí misma.
            onSpeakingChanged = { speaking -> speechService?.setPause(speaking) },
        )

        lifecycleScope.launch {
            try {
                val service = withContext(Dispatchers.IO) {
                    LibVosk.setLogLevel(LogLevel.WARNINGS)
                    val path = VoskModelInstaller.install(this@VoiceService)
                    val m = Model(path.absolutePath).also { model = it }
                    val r = Recognizer(m, SAMPLE_RATE).also { recognizer = it }
                    SpeechService(r, SAMPLE_RATE)
                }
                speechService = service
                service.startListening(this@VoiceService)
                presence.voiceStatus.value = VoiceStatus.LISTENING
            } catch (e: Exception) {
                Log.e(TAG, "No se pudo iniciar el reconocimiento de voz", e)
                presence.voiceStatus.value = VoiceStatus.ERROR_MODEL
            }
        }

        // Actualiza el indicador de "orejas" cuando expira la ventana de conversación.
        lifecycleScope.launch {
            while (true) {
                presence.voiceAwake.value = dialogue.isAwake(Instant.now())
                delay(500)
            }
        }
    }

    // --- RecognitionListener (Vosk entrega los resultados en el hilo principal) ---

    override fun onResult(hypothesis: String?) = handleHypothesis(hypothesis)
    override fun onFinalResult(hypothesis: String?) = handleHypothesis(hypothesis)
    override fun onPartialResult(hypothesis: String?) = Unit
    override fun onTimeout() = Unit
    override fun onError(exception: Exception?) {
        Log.e(TAG, "Error de reconocimiento", exception)
        container.presence.voiceStatus.value = VoiceStatus.ERROR
    }

    private fun handleHypothesis(hypothesis: String?) {
        val text = hypothesis?.let { runCatching { JSONObject(it).optString("text") }.getOrNull() }.orEmpty().trim()
        if (text.isEmpty()) return
        container.presence.lastHeard.value = text

        val status = container.engine.status.value
        val context = VoiceContext(
            state = status.event.currentSystemState,
            vitality = status.event.laikaVitalityScore,
            emotion = status.event.activeEmotionDisplay,
            actions = status.event.prescribedActions,
            latest = latestByType.value,
            radiationAlert = status.findings.any { it.kind == FindingKind.RADIATION_SPIKE },
            knowledge = container.conversations.notes.value,
            zone = container.clock.zone,
        )
        val output = dialogue.onUtterance(text, Instant.now(), context)
        output.effects.forEach(::apply)
        output.reply?.let(::reply)
    }

    private fun apply(effect: VoiceEffect) {
        when (effect) {
            is VoiceEffect.SaveMeasurement -> lifecycleScope.launch {
                container.measurementRepository.add(
                    MeasurementRecord(
                        timestamp = Instant.now(),
                        type = effect.type,
                        value = effect.value,
                        secondaryValue = effect.secondaryValue,
                        source = MeasurementSource.VOICE,
                        rawTranscript = effect.transcript,
                    )
                )
            }
            VoiceEffect.CompleteAction -> lifecycleScope.launch { container.engine.completeCurrentAction() }
            VoiceEffect.Mute -> lifecycleScope.launch {
                container.presence.voiceStatus.value = VoiceStatus.MUTED
                speechService?.stop()
                delay(4_000) // deja terminar la frase de despedida
                stopSelf()
            }
        }
    }

    private fun reply(reply: VoiceReply) {
        if (reply == VoiceReply.Listening) Haptics.softTick(this)
        val text = VoiceResponses.text(this, reply)
        container.presence.lastReply.value = VoiceLine(nextLineId++, text)
        tts?.speak(text)
    }

    override fun onDestroy() {
        speechService?.stop()
        speechService?.shutdown()
        recognizer?.close()
        model?.close()
        tts?.shutdown()
        if (::container.isInitialized) {
            val presence = container.presence
            if (presence.voiceStatus.value != VoiceStatus.MUTED) presence.voiceStatus.value = VoiceStatus.OFF
            presence.voiceAwake.value = false
        }
        super.onDestroy()
    }

    companion object {
        private const val TAG = "LaikaVoice"
        private const val SAMPLE_RATE = 16_000f

        fun start(context: Context) = context.startForegroundService(Intent(context, VoiceService::class.java))
        fun stop(context: Context) = context.stopService(Intent(context, VoiceService::class.java))
    }
}
