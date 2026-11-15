package nasa.space.app.ec.laikapolizon.domain.voice

import java.text.Normalizer

/** Utilidades de texto para lo que transcribe el reconocedor de voz (español). */
object SpanishText {

    private val diacritics = Regex("\\p{Mn}+")
    private val nonWord = Regex("[^a-z0-9.,\\s]")
    private val punctuationNotInNumber = Regex("(?<!\\d)[.,]|[.,](?!\\d)")
    private val spaces = Regex("\\s+")

    /** Minúsculas, sin tildes ni signos; conserva decimales escritos con dígitos ("36,5"). */
    fun normalize(text: String): String {
        val noAccents = Normalizer.normalize(text.lowercase(), Normalizer.Form.NFD).replace(diacritics, "")
        return noAccents
            .replace(nonWord, " ")
            .replace(punctuationNotInNumber, " ")
            .replace(spaces, " ")
            .trim()
    }

    fun tokens(text: String): List<String> = normalize(text).split(' ').filter { it.isNotEmpty() }
}

/**
 * Extrae números escritos en palabras ("ciento veinte sobre ochenta" → [120, 80],
 * "treinta y seis punto cinco" → [36.5], "siete horas y media" → [7.5]) o en dígitos.
 */
object SpanishNumbers {

    private enum class Kind { SMALL, TEN, HUNDRED }

    private data class Word(val value: Int, val kind: Kind)

    private val words: Map<String, Word> = buildMap {
        listOf(
            "cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
            "diez", "once", "doce", "trece", "catorce", "quince", "dieciseis", "diecisiete", "dieciocho", "diecinueve",
            "veinte", "veintiuno", "veintidos", "veintitres", "veinticuatro", "veinticinco", "veintiseis",
            "veintisiete", "veintiocho", "veintinueve",
        ).forEachIndexed { i, w -> put(w, Word(i, Kind.SMALL)) }
        put("un", Word(1, Kind.SMALL)); put("una", Word(1, Kind.SMALL))
        put("veintiun", Word(21, Kind.SMALL)); put("veintiuna", Word(21, Kind.SMALL))
        listOf("treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa")
            .forEachIndexed { i, w -> put(w, Word(30 + i * 10, Kind.TEN)) }
        put("cien", Word(100, Kind.HUNDRED)); put("ciento", Word(100, Kind.HUNDRED))
        listOf("doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos")
            .forEachIndexed { i, w ->
                put(w, Word((i + 2) * 100, Kind.HUNDRED))
                put(w.dropLast(2) + "as", Word((i + 2) * 100, Kind.HUNDRED)) // doscientas, ...
            }
    }

    private fun isDigits(token: String) = token.first().isDigit()

    fun extract(text: String): List<Double> = extractFromTokens(SpanishText.tokens(text))

    fun extractFromTokens(tokens: List<String>): List<Double> {
        val result = mutableListOf<Double>()
        var i = 0
        while (i < tokens.size) {
            val token = tokens[i]
            when {
                isDigits(token) -> {
                    token.replace(',', '.').toDoubleOrNull()?.let { result += it }
                    i++
                }
                token in words || token == "mil" -> {
                    val (value, next) = readInteger(tokens, i)
                    // "un"/"una" sueltos suelen ser artículos ("registra una glucosa de noventa"):
                    // se ignoran si más adelante aparece otro número.
                    if ((token == "un" || token == "una") && next == i + 1 &&
                        tokens.drop(next).any { it in words || isDigits(it) }
                    ) {
                        i = next
                        continue
                    }
                    var number = value.toDouble()
                    var j = next
                    // Decimales: "punto" / "coma" + dígitos en palabras
                    if (j + 1 < tokens.size && (tokens[j] == "punto" || tokens[j] == "coma") && tokens[j + 1] in words) {
                        var leadingZeros = 0
                        var k = j + 1
                        while (k < tokens.size && tokens[k] == "cero") { leadingZeros++; k++ }
                        if (k < tokens.size && tokens[k] in words) {
                            val (fraction, afterFraction) = readInteger(tokens, k)
                            val digits = fraction.toString().length + leadingZeros
                            number += fraction / Math.pow(10.0, digits.toDouble())
                            j = afterFraction
                        } else {
                            j = k
                        }
                    }
                    result += number
                    i = j
                }
                // "... y media" / "... y cuarto" suma a la cifra anterior ("siete horas y media").
                token == "y" && i + 1 < tokens.size && result.isNotEmpty() &&
                    (tokens[i + 1] == "media" || tokens[i + 1] == "cuarto") -> {
                    result[result.lastIndex] = result.last() + if (tokens[i + 1] == "media") 0.5 else 0.25
                    i += 2
                }
                else -> i++
            }
        }
        return result
    }

    /** Lee un entero desde [start]; devuelve el valor y el índice siguiente. */
    private fun readInteger(tokens: List<String>, start: Int): Pair<Int, Int> {
        var total = 0
        var current = 0
        var last: Kind? = null
        var i = start
        while (i < tokens.size) {
            val token = tokens[i]
            if (token == "mil") {
                total += (if (current == 0) 1 else current) * 1000
                current = 0
                last = null
                i++
                continue
            }
            // "treinta y cinco": la "y" solo une decena + unidad.
            if (token == "y") {
                val next = tokens.getOrNull(i + 1)?.let { words[it] }
                if (last == Kind.TEN && next != null && next.kind == Kind.SMALL && next.value in 1..9) {
                    current += next.value
                    last = Kind.SMALL
                    i += 2
                    continue
                }
                break
            }
            val word = words[token] ?: break
            val attaches = when (last) {
                null -> true
                Kind.HUNDRED -> word.kind != Kind.HUNDRED
                Kind.TEN -> word.kind == Kind.SMALL && word.value in 1..9
                Kind.SMALL -> false
            }
            if (!attaches) break
            current += word.value
            last = word.kind
            i++
        }
        return (total + current) to i
    }
}
