package nasa.space.app.ec.laikapolizon.domain

import nasa.space.app.ec.laikapolizon.domain.model.Emotion
import nasa.space.app.ec.laikapolizon.domain.model.MeasurementType
import nasa.space.app.ec.laikapolizon.domain.model.SystemState
import nasa.space.app.ec.laikapolizon.domain.presence.AppCategorizer
import nasa.space.app.ec.laikapolizon.domain.presence.AppCategory
import nasa.space.app.ec.laikapolizon.domain.presence.SystemAppCategory
import nasa.space.app.ec.laikapolizon.domain.validation.ValidationIssue
import nasa.space.app.ec.laikapolizon.domain.voice.IntentParser
import nasa.space.app.ec.laikapolizon.domain.voice.SpanishNumbers
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceContext
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceDialogue
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceEffect
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceIntent
import nasa.space.app.ec.laikapolizon.domain.voice.VoiceReply
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Duration
import java.time.Instant

class SpanishNumbersTest {
    private fun n(text: String) = SpanishNumbers.extract(text)

    @Test fun integers() {
        assertEquals(listOf(110.0), n("ciento diez"))
        assertEquals(listOf(95.0), n("noventa y cinco"))
        assertEquals(listOf(25.0), n("veinticinco"))
        assertEquals(listOf(100.0), n("cien"))
        assertEquals(listOf(345.0), n("trescientos cuarenta y cinco"))
        assertEquals(listOf(2026.0), n("dos mil veintiséis"))
    }

    @Test fun `two numbers in a row`() = assertEquals(listOf(120.0, 80.0), n("ciento veinte sobre ochenta"))

    @Test fun decimals() {
        assertEquals(36.5, n("treinta y seis punto cinco").single(), 1e-9)
        assertEquals(36.8, n("treinta y seis coma ocho").single(), 1e-9)
        assertEquals(0.05, n("cero punto cero cinco").single(), 1e-9)
    }

    @Test fun `y media adds half`() = assertEquals(listOf(7.5), n("dormí siete horas y media"))

    @Test fun digits() = assertEquals(listOf(36.5, 110.0), n("36,5 y 110"))

    @Test fun `article una is not a number`() = assertEquals(listOf(90.0), n("registra una glucosa de noventa"))

    @Test fun `accents are ignored`() = assertEquals(listOf(16.0, 22.0), n("dieciséis veintidós"))
}

class IntentParserTest {

    @Test fun `wake word variants`() {
        assertEquals("glucosa ciento diez", IntentParser.afterWakeWord("Laika, glucosa ciento diez"))
        assertEquals("como estamos", IntentParser.afterWakeWord("oye laica cómo estamos"))
        assertEquals("", IntentParser.afterWakeWord("Laika"))
        assertNull(IntentParser.afterWakeWord("pásame la llave"))
    }

    @Test fun `log glucose`() =
        assertEquals(VoiceIntent.LogMeasurement(MeasurementType.GLUCOSE, 110.0, null), IntentParser.parse("glucosa ciento diez"))

    @Test fun `log blood pressure with two values`() =
        assertEquals(
            VoiceIntent.LogMeasurement(MeasurementType.BLOOD_PRESSURE, 120.0, 80.0),
            IntentParser.parse("presión ciento veinte sobre ochenta"),
        )

    @Test fun `log sleep`() =
        assertEquals(VoiceIntent.LogMeasurement(MeasurementType.SLEEP_DURATION, 6.5, null), IntentParser.parse("anoche dormí seis horas y media"))

    @Test fun `question is a query not a log`() {
        assertEquals(VoiceIntent.QueryMetric(MeasurementType.SLEEP_DURATION), IntentParser.parse("¿cuánto dormí anoche?"))
        assertEquals(VoiceIntent.QueryMetric(MeasurementType.BLOOD_PRESSURE), IntentParser.parse("cómo está mi presión"))
    }

    @Test fun `metric without number`() =
        assertEquals(VoiceIntent.MissingNumber(MeasurementType.GLUCOSE), IntentParser.parse("glucosa"))

    @Test fun `other intents`() {
        assertEquals(VoiceIntent.QueryStatus, IntentParser.parse("¿cómo estamos hoy?"))
        assertEquals(VoiceIntent.RadiationStatus, IntentParser.parse("¿cómo está la radiación?"))
        assertEquals(VoiceIntent.ActionDone, IntentParser.parse("ya estoy en el módulo blindado"))
        assertEquals(VoiceIntent.Mute, IntentParser.parse("silencio"))
        assertEquals(VoiceIntent.Greeting, IntentParser.parse("buenos días"))
        assertEquals(VoiceIntent.Yes, IntentParser.parse("sí"))
        assertEquals(VoiceIntent.No, IntentParser.parse("no"))
        assertEquals(VoiceIntent.Unknown, IntentParser.parse("abre la escotilla"))
    }
}

class VoiceDialogueTest {

    private val t0 = Instant.parse("2026-11-14T12:00:00Z")
    private val ctx = VoiceContext(SystemState.PERIPHERAL_PASSIVE, 70.0, Emotion.JOYFUL, emptyList(), emptyMap(), false)

    @Test fun `ignores speech without wake word`() {
        val d = VoiceDialogue()
        assertNull(d.onUtterance("glucosa ciento diez", t0, ctx).reply)
    }

    @Test fun `dictation is confirmed before saving`() {
        val d = VoiceDialogue()
        val ask = d.onUtterance("Laika glucosa ciento diez", t0, ctx)
        assertEquals(VoiceReply.ConfirmMeasurement(MeasurementType.GLUCOSE, 110.0, null, unusual = false), ask.reply)
        assertTrue(ask.effects.isEmpty())

        val yes = d.onUtterance("sí", t0.plusSeconds(3), ctx)
        assertEquals(VoiceReply.MeasurementSaved(MeasurementType.GLUCOSE), yes.reply)
        val save = yes.effects.single() as VoiceEffect.SaveMeasurement
        assertEquals(110.0, save.value, 1e-9)
        assertEquals("Laika glucosa ciento diez", save.transcript)
    }

    @Test fun `saying no cancels`() {
        val d = VoiceDialogue()
        d.onUtterance("Laika glucosa ciento diez", t0, ctx)
        val no = d.onUtterance("no", t0.plusSeconds(2), ctx)
        assertEquals(VoiceReply.MeasurementCancelled, no.reply)
        assertTrue(no.effects.isEmpty())
    }

    @Test fun `unusual value is flagged in confirmation`() {
        val reply = VoiceDialogue().onUtterance("Laika glucosa doscientos veinte", t0, ctx).reply as VoiceReply.ConfirmMeasurement
        assertTrue(reply.unusual)
    }

    @Test fun `impossible value is rejected without confirmation`() =
        assertEquals(
            VoiceReply.MeasurementRejected(MeasurementType.BODY_TEMPERATURE, ValidationIssue.IMPOSSIBLE),
            VoiceDialogue().onUtterance("Laika temperatura cincuenta", t0, ctx).reply,
        )

    @Test fun `wake word alone opens a conversation window`() {
        val d = VoiceDialogue(conversationWindow = Duration.ofSeconds(10))
        assertEquals(VoiceReply.Listening, d.onUtterance("Laika", t0, ctx).reply)
        assertTrue(d.onUtterance("cómo estamos", t0.plusSeconds(5), ctx).reply is VoiceReply.Status)
    }

    @Test fun `conversation window expires`() {
        val d = VoiceDialogue(conversationWindow = Duration.ofSeconds(10))
        d.onUtterance("Laika", t0, ctx)
        assertNull(d.onUtterance("cómo estamos", t0.plusSeconds(30), ctx).reply)
    }

    @Test fun `expired confirmation does not save`() {
        val d = VoiceDialogue(conversationWindow = Duration.ofSeconds(10))
        d.onUtterance("Laika glucosa ciento diez", t0, ctx)
        val late = d.onUtterance("sí", t0.plusSeconds(60), ctx)
        assertTrue(late.effects.isEmpty())
    }

    @Test fun `mute and action done produce effects`() {
        assertEquals(listOf(VoiceEffect.Mute), VoiceDialogue().onUtterance("Laika silencio", t0, ctx).effects)
        assertEquals(listOf(VoiceEffect.CompleteAction), VoiceDialogue().onUtterance("Laika ya terminé", t0, ctx).effects)
    }
}

class AppCategorizerTest {

    @Test fun `keywords and system categories`() {
        assertEquals(AppCategory.EXERCISE, AppCategorizer.categorize("com.strava"))
        assertEquals(AppCategory.JOURNAL, AppCategorizer.categorize("com.example.diario"))
        assertEquals(AppCategory.VIDEO, AppCategorizer.categorize("com.example.app", SystemAppCategory.VIDEO))
        assertEquals(AppCategory.LEISURE, AppCategorizer.categorize("com.example.app", SystemAppCategory.GAME))
        assertEquals(AppCategory.FOCUSED, AppCategorizer.categorize("com.example.app", SystemAppCategory.PRODUCTIVITY))
        assertEquals(AppCategory.FOCUSED, AppCategorizer.categorize("com.adobe.reader.pdf"))
        assertEquals(AppCategory.NEUTRAL, AppCategorizer.categorize("com.android.settings"))
    }

    @Test fun `overrides win over everything`() {
        assertEquals(AppCategory.JOURNAL, AppCategorizer.categorize("com.google.android.keep", SystemAppCategory.PRODUCTIVITY))
        assertEquals(
            AppCategory.FOCUSED,
            AppCategorizer.categorize("com.strava", overrides = mapOf("com.strava" to AppCategory.FOCUSED)),
        )
    }
}
