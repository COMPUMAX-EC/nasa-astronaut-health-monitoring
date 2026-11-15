package nasa.space.app.ec.laikapolizon.feature.share

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.OpenableColumns
import android.util.Log
import android.widget.Toast
import kotlinx.coroutines.launch
import nasa.space.app.ec.laikapolizon.LaikaApplication
import nasa.space.app.ec.laikapolizon.R
import nasa.space.app.ec.laikapolizon.domain.knowledge.SharedContent
import java.time.Instant

/**
 * "Mostrar a Laika" en el menú Compartir de Android (contexto social, docs/10).
 * Es la única vía por la que Laika conoce contenido de otras apps: el astronauta elige qué
 * mostrarle. Del archivo solo se leen nombre y duración; no se copia, y los enlaces no se abren
 * (la app no tiene internet).
 */
class ShareToLaikaActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val container = (application as LaikaApplication).container

        val note = if (intent?.action == Intent.ACTION_SEND) {
            val stream = streamUri(intent)
            SharedContent.toNote(
                mimeType = intent.type,
                text = intent.getStringExtra(Intent.EXTRA_TEXT),
                subject = intent.getStringExtra(Intent.EXTRA_SUBJECT) ?: intent.getStringExtra(Intent.EXTRA_TITLE),
                fileName = stream?.let(::displayName),
                durationSec = stream?.takeIf { intent.type.orEmpty().startsWith("video/") }?.let(::videoDurationSec),
                sourceApp = sourceAppLabel(),
                now = Instant.now(),
            )
        } else null

        if (note == null) {
            Toast.makeText(this, R.string.share_nothing, Toast.LENGTH_SHORT).show()
        } else {
            container.applicationScope.launch { container.conversations.onShared(note) }
            Toast.makeText(this, R.string.share_saved, Toast.LENGTH_SHORT).show()
        }
        finish()
    }

    private fun streamUri(intent: Intent): Uri? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
    } else {
        @Suppress("DEPRECATION")
        intent.getParcelableExtra(Intent.EXTRA_STREAM)
    }

    private fun displayName(uri: Uri): String? = runCatching {
        contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) cursor.getString(0) else null
        }
    }.getOrNull()?.substringBeforeLast('.')

    private fun videoDurationSec(uri: Uri): Long? = runCatching {
        MediaMetadataRetriever().run {
            try {
                setDataSource(this@ShareToLaikaActivity, uri)
                extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull()?.div(1000)
            } finally {
                release()
            }
        }
    }.onFailure { Log.w(TAG, "No se pudo leer la duración del video", it) }.getOrNull()

    /** Nombre de la app desde la que se compartió, si Android lo informa. */
    private fun sourceAppLabel(): String? {
        val pkg = referrer?.takeIf { it.scheme == "android-app" }?.host ?: return null
        if (pkg == packageName) return null
        return try {
            packageManager.getApplicationLabel(packageManager.getApplicationInfo(pkg, 0)).toString()
        } catch (e: PackageManager.NameNotFoundException) {
            null
        }
    }

    private companion object {
        const val TAG = "LaikaShare"
    }
}
