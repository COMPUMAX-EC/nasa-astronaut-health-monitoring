package nasa.space.app.ec.laikapolizon.feature.voice

import android.content.Context
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.validation.ValidationIssue
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceReply
import nasa.space.app.ec.laikapolizon.ui.common.ChatTexts
import nasa.space.app.ec.laikapolizon.ui.common.formatNumber
import nasa.space.app.ec.laikapolizon.ui.common.labelRes
import nasa.space.app.ec.laikapolizon.ui.common.messageRes
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.roundToInt

/** Convierte una [VoiceReply] en la frase que Laika dice y muestra (textos en strings.xml). */
object VoiceResponses {

    private val dateFormat = DateTimeFormatter.ofPattern("dd/MM 'a las' HH:mm", Locale("es")).withZone(ZoneId.systemDefault())

    fun text(context: Context, reply: VoiceReply): String = with(context) {
        fun label(type: MeasurementType) = getString(type.labelRes()).lowercase(Locale("es"))

        when (reply) {
            VoiceReply.Listening -> getString(R.string.voice_listening)
            is VoiceReply.ConfirmMeasurement -> getString(
                if (reply.unusual) R.string.voice_confirm_unusual else R.string.voice_confirm,
                getString(reply.type.labelRes()),
                spokenValue(context, reply.type, reply.value, reply.secondaryValue),
            )
            is VoiceReply.MeasurementSaved -> getString(R.string.voice_saved, label(reply.type))
            VoiceReply.MeasurementCancelled -> getString(R.string.voice_cancelled)
            is VoiceReply.MeasurementRejected -> when (reply.issue) {
                ValidationIssue.MISSING_SECONDARY -> getString(R.string.voice_rejected_missing)
                ValidationIssue.SYSTOLIC_NOT_ABOVE_DIASTOLIC -> getString(R.string.voice_rejected_order)
                else -> getString(R.string.voice_rejected, label(reply.type))
            }
            is VoiceReply.MissingNumber -> getString(R.string.voice_missing_number, label(reply.type))
            is VoiceReply.Status -> buildString {
                append(getString(R.string.voice_status, getString(reply.emotion.messageRes()), reply.vitality.roundToInt()))
                reply.firstAction?.let { append(' ').append(getString(R.string.voice_status_action, it.description)) }
            }
            is VoiceReply.MetricValue -> metric(context, reply.type, reply.record)
            is VoiceReply.Radiation -> {
                val record = reply.record
                when {
                    record == null -> getString(R.string.voice_radiation_none)
                    reply.alert -> getString(R.string.voice_radiation_alert, formatNumber(record.value))
                    else -> getString(R.string.voice_radiation_ok, formatNumber(record.value))
                }
            }
            VoiceReply.ActionCompleted -> getString(R.string.voice_action_done)
            VoiceReply.Greeting -> getString(R.string.voice_greeting)
            is VoiceReply.Day -> ChatTexts.day(context, reply.summary)
            is VoiceReply.Chat -> ChatTexts.text(context, reply.line)
            VoiceReply.Muted -> getString(R.string.voice_muted)
            VoiceReply.NotUnderstood -> getString(R.string.voice_not_understood)
            VoiceReply.ConfirmYesOrNo -> getString(R.string.voice_yes_or_no)
        }
    }

    private fun metric(context: Context, type: MeasurementType, record: MeasurementRecord?): String {
        val label = context.getString(type.labelRes()).lowercase(Locale("es"))
        if (record == null) return context.getString(R.string.voice_metric_none, label)
        return context.getString(
            R.string.voice_metric, label,
            spokenValue(context, type, record.value, record.secondaryValue),
            dateFormat.format(record.timestamp),
        )
    }

    private fun spokenValue(context: Context, type: MeasurementType, value: Double, secondary: Double?): String {
        val number = if (type == MeasurementType.BLOOD_PRESSURE && secondary != null) {
            context.getString(R.string.voice_over, formatNumber(value), formatNumber(secondary))
        } else {
            formatNumber(value)
        }
        return "$number ${context.getString(spokenUnit(type))}"
    }

    private fun spokenUnit(type: MeasurementType): Int = when (type) {
        MeasurementType.HEART_RATE -> R.string.unit_bpm
        MeasurementType.HRV -> R.string.unit_ms
        MeasurementType.BLOOD_PRESSURE -> R.string.unit_mmhg
        MeasurementType.GLUCOSE -> R.string.unit_mgdl
        MeasurementType.BODY_TEMPERATURE -> R.string.unit_celsius
        MeasurementType.SLEEP_DURATION -> R.string.unit_hours
        MeasurementType.ACTIVITY_MINUTES -> R.string.unit_minutes
        MeasurementType.CORTISOL -> R.string.unit_nmol
        MeasurementType.VISION_CLARITY -> R.string.unit_over_ten
        MeasurementType.NEUTRON_DOSE_RATE -> R.string.unit_usvh
        MeasurementType.CO2 -> R.string.unit_percent
    }
}
