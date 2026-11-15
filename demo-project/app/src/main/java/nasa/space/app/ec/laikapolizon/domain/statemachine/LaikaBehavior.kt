package nasa.space.app.ec.laikapolizon.domain.statemachine

import nasa.space.app.ec.laikapolizon.domain.analysis.Finding
import nasa.space.app.ec.laikapolizon.domain.model.Emotion
import nasa.space.app.ec.laikapolizon.domain.model.Hazard
import nasa.space.app.ec.laikapolizon.domain.model.PrescribedAction
import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.domain.vitality.VitalityCalculator

/** Emoción y acciones de Laika derivadas del estado (nunca decididas en la UI). */
object LaikaBehavior {

    fun emotionFor(state: SystemState, vitality: Double): Emotion {
        val low = vitality < VitalityCalculator.LOW_THRESHOLD
        return when (state) {
            SystemState.CRITICAL_ALERT -> Emotion.PROTECTIVE
            SystemState.THERAPEUTIC_INTERVENTION -> if (low) Emotion.TIRED else Emotion.CONCERNED
            SystemState.MICRO_INTERACTION -> if (low) Emotion.TIRED else Emotion.CURIOUS
            SystemState.PERIPHERAL_PASSIVE -> when {
                low -> Emotion.TIRED
                vitality >= VitalityCalculator.HIGH_THRESHOLD -> Emotion.JOYFUL
                else -> Emotion.CALM
            }
        }
    }

    fun actionsFor(
        state: SystemState,
        criticalFindings: List<Finding>,
        deviations: List<Finding>,
        routineDue: Boolean,
    ): List<PrescribedAction> = when (state) {
        SystemState.PERIPHERAL_PASSIVE -> emptyList()
        SystemState.MICRO_INTERACTION -> if (routineDue) ActionCatalog.forHazard(Hazard.ROUTINE) else emptyList()
        SystemState.THERAPEUTIC_INTERVENTION -> deviations.map { it.hazard }.distinct().flatMap(ActionCatalog::forHazard)
        SystemState.CRITICAL_ALERT ->
            if (criticalFindings.isEmpty()) ActionCatalog.ALL_CLEAR // D8: lectura normalizada, falta confirmar
            else criticalFindings.map { it.hazard }.distinct().flatMap(ActionCatalog::criticalFor)
    }
}

/** Catálogo de acciones preventivas/terapéuticas (docs/03-flujos-de-interaccion.md). */
object ActionCatalog {

    /** La anomalía crítica ya se normalizó; el astronauta debe confirmar para salir de la alerta (D8). */
    val ALL_CLEAR = listOf(
        PrescribedAction("CONFIRM_ALL_CLEAR", Hazard.ROUTINE.name, "La lectura ya se normalizó: confirma que estás a salvo", 1),
    )

    fun forHazard(hazard: Hazard): List<PrescribedAction> = when (hazard) {
        Hazard.ROUTINE -> listOf(
            action("MORNING_CHECKIN", hazard, "Chequeo matutino: registrar glucosa y presión arterial", 1),
        )
        Hazard.SANS -> listOf(
            action("THIGH_CUFFS", hazard, "Colocar manguitos de presión en muslos (thigh cuffs)", 45),
            action("VITAMIN_B", hazard, "Tomar la dosis diaria de Complejo B", 1),
        )
        Hazard.PSYCHOSOCIAL -> listOf(
            action("AFFECTIVE_CONTACT", hazard, "Sesión de contacto afectivo con Laika", 5),
            action("MISSION_JOURNAL", hazard, "Escribir en el diario de misión o visitar el módulo Veggie", 10),
        )
        Hazard.SLEEP -> listOf(
            action("SLEEP_WIND_DOWN", hazard, "Rutina de relajación antes de dormir, luz tenue", 15),
        )
        Hazard.CARDIOVASCULAR -> listOf(
            action("GUIDED_BREATHING", hazard, "Respiración guiada a 6 respiraciones por minuto", 5),
        )
        Hazard.METABOLIC -> listOf(
            action("RECHECK_GLUCOSE", hazard, "Repetir la medición de glucosa e hidratarse", 2),
        )
        Hazard.IMMUNE -> listOf(
            action("REST_AND_HYDRATE", hazard, "Descanso, hidratación y nueva toma de temperatura", 15),
        )
        Hazard.PHYSICAL -> listOf(
            action("ERGOMETER_SESSION", hazard, "Sesión de ejercicio en el ergómetro", 30),
        )
        Hazard.ENVIRONMENT -> listOf(
            action("REPORT_CO2", hazard, "Revisar ventilación y reportar el nivel de CO₂", 2),
        )
        Hazard.RADIATION -> criticalFor(hazard)
    }

    fun criticalFor(hazard: Hazard): List<PrescribedAction> = when (hazard) {
        Hazard.RADIATION -> listOf(
            action("RADIATION_SHELTER", hazard, "Ir al módulo blindado central y permanecer hasta que baje la lectura", 60),
        )
        else -> listOf(
            action("MEDICAL_EMERGENCY", hazard, "Protocolo de emergencia: avisar al oficial médico de la tripulación", 5),
        )
    }

    private fun action(id: String, hazard: Hazard, description: String, minutes: Int) =
        PrescribedAction(id, hazard.name, description, minutes)
}
