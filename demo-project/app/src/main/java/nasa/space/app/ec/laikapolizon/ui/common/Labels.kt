package nasa.space.app.ec.laikapolizon.ui.common

import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.data.simulator.Scenario
import nasa.space.app.ec.laikapolizon.domain.model.Emotion
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementRecord
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementSource
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.ui.theme.LaikaTheme
import java.util.Locale

@StringRes
fun SystemState.labelRes(): Int = when (this) {
    SystemState.PERIPHERAL_PASSIVE -> R.string.state_passive
    SystemState.MICRO_INTERACTION -> R.string.state_micro
    SystemState.THERAPEUTIC_INTERVENTION -> R.string.state_therapeutic
    SystemState.CRITICAL_ALERT -> R.string.state_critical
}

/** Color de la Calm Palette asociado a cada estado (docs/05-sistema-de-diseno.md). */
@Composable
fun SystemState.containerColor(): Pair<Color, Color> {
    val s = LaikaTheme.status
    return when (this) {
        SystemState.PERIPHERAL_PASSIVE -> s.optimal to s.onOptimal
        SystemState.MICRO_INTERACTION -> s.attention to s.onAttention
        SystemState.THERAPEUTIC_INTERVENTION -> s.intervention to s.onIntervention
        SystemState.CRITICAL_ALERT -> s.critical to s.onCritical
    }
}

@StringRes
fun Emotion.messageRes(): Int = when (this) {
    Emotion.JOYFUL -> R.string.laika_joyful
    Emotion.CALM -> R.string.laika_calm
    Emotion.CURIOUS -> R.string.laika_curious
    Emotion.TIRED -> R.string.laika_tired
    Emotion.CONCERNED -> R.string.laika_concerned
    Emotion.PROTECTIVE -> R.string.laika_protective
}

@StringRes
fun Emotion.labelRes(): Int = when (this) {
    Emotion.JOYFUL -> R.string.emotion_joyful
    Emotion.CALM -> R.string.emotion_calm
    Emotion.CURIOUS -> R.string.emotion_curious
    Emotion.TIRED -> R.string.emotion_tired
    Emotion.CONCERNED -> R.string.emotion_concerned
    Emotion.PROTECTIVE -> R.string.emotion_protective
}

@StringRes
fun MeasurementType.labelRes(): Int = when (this) {
    MeasurementType.HEART_RATE -> R.string.type_heart_rate
    MeasurementType.HRV -> R.string.type_hrv
    MeasurementType.BLOOD_PRESSURE -> R.string.type_blood_pressure
    MeasurementType.GLUCOSE -> R.string.type_glucose
    MeasurementType.BODY_TEMPERATURE -> R.string.type_body_temperature
    MeasurementType.SLEEP_DURATION -> R.string.type_sleep
    MeasurementType.ACTIVITY_MINUTES -> R.string.type_activity
    MeasurementType.CORTISOL -> R.string.type_cortisol
    MeasurementType.VISION_CLARITY -> R.string.type_vision
    MeasurementType.NEUTRON_DOSE_RATE -> R.string.type_neutron
    MeasurementType.CO2 -> R.string.type_co2
}

@StringRes
fun MeasurementSource.labelRes(): Int = when (this) {
    MeasurementSource.MANUAL -> R.string.source_manual
    MeasurementSource.VOICE -> R.string.source_voice
    MeasurementSource.SENSOR -> R.string.source_sensor
    MeasurementSource.SIMULATED -> R.string.source_simulated
}

@StringRes
fun Scenario.labelRes(): Int = when (this) {
    Scenario.NOMINAL -> R.string.scenario_nominal
    Scenario.POOR_SLEEP -> R.string.scenario_poor_sleep
    Scenario.RADIATION_SPIKE -> R.string.scenario_radiation
    Scenario.SANS -> R.string.scenario_sans
    Scenario.LOW_MOOD -> R.string.scenario_low_mood
    Scenario.WEEKLY_PATTERN -> R.string.scenario_weekly
}

private val spanish = Locale("es")

fun formatNumber(value: Double): String =
    if (value % 1.0 == 0.0) value.toLong().toString() else String.format(spanish, "%.1f", value)

fun MeasurementRecord.formattedValue(): String {
    val main = if (type == MeasurementType.BLOOD_PRESSURE && secondaryValue != null) {
        "${formatNumber(value)}/${formatNumber(secondaryValue)}"
    } else {
        formatNumber(value)
    }
    return "$main ${type.unit}"
}
