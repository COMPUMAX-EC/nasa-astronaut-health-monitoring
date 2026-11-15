package nasa.space.app.ec.laikapolizon.feature.common

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

/** Patrones hápticos de Laika (docs/05-sistema-de-diseno.md). */
object Haptics {

    private fun vibrator(context: Context): Vibrator? =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            context.getSystemService(VibratorManager::class.java)?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }

    /** Latido "lub-dub" a 60 bpm (Flujo 4, contacto afectivo), [beats] latidos. */
    fun heartbeat(context: Context, beats: Int = 6) {
        val timings = mutableListOf<Long>()
        val amplitudes = mutableListOf<Int>()
        repeat(beats) {
            // 1 s por latido: lub 60 ms, pausa 120 ms, dub 50 ms, resto en silencio.
            timings += listOf(0L, 60L, 120L, 50L, 770L)
            amplitudes += listOf(0, 90, 0, 60, 0)
        }
        vibrator(context)?.vibrate(VibrationEffect.createWaveform(timings.toLongArray(), amplitudes.toIntArray(), -1))
    }

    /** Pulso corto y suave (confirmar un toque o la activación por voz). */
    fun softTick(context: Context) {
        vibrator(context)?.vibrate(VibrationEffect.createOneShot(30L, 60))
    }

    /** Latido a 60 bpm que se repite hasta [stop]: dura mientras el astronauta toca a Laika (Flujo 4). */
    fun startHeartbeatLoop(context: Context) {
        val timings = longArrayOf(0L, 60L, 120L, 50L, 770L)
        val amplitudes = intArrayOf(0, 90, 0, 60, 0)
        vibrator(context)?.vibrate(VibrationEffect.createWaveform(timings, amplitudes, 0))
    }

    fun stop(context: Context) {
        vibrator(context)?.cancel()
    }

    /** Pulsación rítmica suave de aviso de radiación (Flujo 2, paso 2). Sin sirenas. */
    fun radiationPulse(context: Context) {
        val timings = longArrayOf(0L, 120L, 380L, 120L, 380L, 120L)
        val amplitudes = intArrayOf(0, 80, 0, 80, 0, 80)
        vibrator(context)?.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
    }
}
