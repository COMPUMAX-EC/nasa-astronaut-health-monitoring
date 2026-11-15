package nasa.space.app.ec.laikapolizon.feature.voice

import android.content.Context
import androidx.core.content.pm.PackageInfoCompat
import java.io.File
import java.io.IOException

/**
 * Copia el modelo Vosk empaquetado en `assets/vosk-model-es` al almacenamiento interno
 * (Vosk necesita rutas de archivo reales). Se hace una sola vez por versión de la app.
 * El modelo nunca se descarga en tiempo de ejecución (red cerrada).
 */
object VoskModelInstaller {
    private const val ASSET_DIR = "vosk-model-es"

    @Throws(IOException::class)
    fun install(context: Context): File {
        val target = File(context.filesDir, ASSET_DIR)
        val versionCode = PackageInfoCompat.getLongVersionCode(context.packageManager.getPackageInfo(context.packageName, 0))
        val marker = File(target, ".installed-$versionCode")
        if (marker.exists()) return target

        if (context.assets.list(ASSET_DIR).isNullOrEmpty()) {
            throw IOException("Falta el modelo en assets/$ASSET_DIR (se descarga al compilar con :app:downloadVoskModel)")
        }
        target.deleteRecursively()
        copyAssetDir(context, ASSET_DIR, target)
        marker.createNewFile()
        return target
    }

    private fun copyAssetDir(context: Context, assetPath: String, target: File) {
        val children = context.assets.list(assetPath).orEmpty()
        if (children.isEmpty()) {
            target.parentFile?.mkdirs()
            context.assets.open(assetPath).use { input -> target.outputStream().use { input.copyTo(it) } }
            return
        }
        target.mkdirs()
        children.forEach { copyAssetDir(context, "$assetPath/$it", File(target, it)) }
    }
}
