package nasa.space.app.ec.laikapolizon.domain.export

import java.time.Instant
import java.time.LocalDate

/**
 * Escritor JSON mínimo y sin dependencias (Kotlin puro, testeable en JVM; `org.json` de Android
 * no funciona en tests unitarios). Soporta mapas, listas, textos, números, booleanos y fechas.
 * Las claves con valor null se omiten.
 */
object Json {

    fun encode(value: Any?, indent: Int = 2): String = StringBuilder().also { write(it, value, indent, 0) }.toString()

    private fun write(sb: StringBuilder, value: Any?, indent: Int, level: Int) {
        when (value) {
            null -> sb.append("null")
            is String -> writeString(sb, value)
            is Boolean -> sb.append(value)
            is Double -> if (value.isNaN() || value.isInfinite()) sb.append("null") else sb.append(value)
            is Float -> write(sb, value.toDouble(), indent, level)
            is Number -> sb.append(value)
            is Instant, is LocalDate -> writeString(sb, value.toString())
            is Enum<*> -> writeString(sb, value.name)
            is Map<*, *> -> {
                val entries = value.entries.filter { it.value != null }
                if (entries.isEmpty()) { sb.append("{}"); return }
                sb.append("{")
                entries.forEachIndexed { i, (k, v) ->
                    if (i > 0) sb.append(",")
                    newline(sb, indent, level + 1)
                    writeString(sb, k.toString())
                    sb.append(if (indent > 0) ": " else ":")
                    write(sb, v, indent, level + 1)
                }
                newline(sb, indent, level)
                sb.append("}")
            }
            is Iterable<*> -> {
                val items = value.toList()
                if (items.isEmpty()) { sb.append("[]"); return }
                sb.append("[")
                items.forEachIndexed { i, v ->
                    if (i > 0) sb.append(",")
                    newline(sb, indent, level + 1)
                    write(sb, v, indent, level + 1)
                }
                newline(sb, indent, level)
                sb.append("]")
            }
            else -> writeString(sb, value.toString())
        }
    }

    private fun newline(sb: StringBuilder, indent: Int, level: Int) {
        if (indent > 0) sb.append('\n').append(" ".repeat(indent * level))
    }

    private fun writeString(sb: StringBuilder, s: String) {
        sb.append('"')
        for (c in s) {
            when (c) {
                '"' -> sb.append("\\\"")
                '\\' -> sb.append("\\\\")
                '\n' -> sb.append("\\n")
                '\r' -> sb.append("\\r")
                '\t' -> sb.append("\\t")
                else -> if (c < ' ') sb.append("\\u%04x".format(c.code)) else sb.append(c)
            }
        }
        sb.append('"')
    }
}
