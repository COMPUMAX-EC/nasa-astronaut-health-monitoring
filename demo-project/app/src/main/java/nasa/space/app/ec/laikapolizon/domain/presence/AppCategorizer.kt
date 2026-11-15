package nasa.space.app.ec.laikapolizon.domain.presence

/** Cómo reacciona el screen pet según la app en primer plano (docs/10, módulo A). */
enum class AppCategory {
    /** Ejercicio / ergómetro: Laika "corre" con el astronauta. */
    EXERCISE,
    /** Diario / notas: Laika se sienta tranquila y sugiere escribir. */
    JOURNAL,
    /** Procedimientos / tareas que exigen concentración: Laika se oculta y no interrumpe. */
    FOCUSED,
    /** Redes sociales y mensajería: al salir, Laika pregunta cómo le fue (docs/10, contexto). */
    SOCIAL,
    /** Ver videos o streaming. */
    VIDEO,
    /** Cámara: el astronauta está grabando o fotografiando. */
    CAMERA,
    /** Otro ocio (juegos, música, galería, noticias): momento oportuno para micro-interacciones. */
    LEISURE,
    NEUTRAL;

    /** Categorías de las que Laika aprende contexto: cuánto tiempo, nunca qué se vio. */
    val feedsKnowledge: Boolean get() = this == SOCIAL || this == VIDEO || this == CAMERA
}

/** Espejo, independiente de Android, de `ApplicationInfo.CATEGORY_*`. */
enum class SystemAppCategory { GAME, AUDIO, VIDEO, IMAGE, SOCIAL, NEWS, MAPS, PRODUCTIVITY, ACCESSIBILITY, UNDEFINED }

/**
 * Clasificación de apps (decisión D12): primero excepciones explícitas, luego palabras clave del
 * nombre de paquete y, por último, la categoría que la propia app declara a Android.
 */
object AppCategorizer {

    /** Excepciones por paquete. Ampliar aquí cuando una app quede mal clasificada. */
    val DEFAULT_OVERRIDES: Map<String, AppCategory> = mapOf(
        "com.google.android.apps.fitness" to AppCategory.EXERCISE,
        "com.google.android.keep" to AppCategory.JOURNAL,
        "com.google.android.apps.docs" to AppCategory.FOCUSED,
        "com.google.android.apps.docs.editors.docs" to AppCategory.FOCUSED,
        "com.google.android.apps.docs.editors.sheets" to AppCategory.FOCUSED,
        "com.google.android.GoogleCamera" to AppCategory.CAMERA,
        "com.android.camera2" to AppCategory.CAMERA,
    )

    private val exerciseKeys = listOf("fitness", "fit.", ".fit", "workout", "strava", "running", "runtastic", "training", "sport")
    private val journalKeys = listOf("journal", "diary", "diario", "notes", "notas", "keep", "notebook")
    private val focusedKeys = listOf("pdf", "office", "docs", "sheets", "slides", "calculator", "procedure", "checklist")
    private val cameraKeys = listOf("camera", "camara", "gcam", "snapcam")
    private val socialKeys = listOf(
        "instagram", "facebook", "katana", "twitter", "tiktok", "musically", "trill", "snapchat", "whatsapp",
        "telegram", "reddit", "threads", "mastodon", "bluesky", "discord", "linkedin", "pinterest", "messenger",
        "orca", "signal", "social",
    )
    private val videoKeys = listOf("youtube", "netflix", "twitch", "vlc", "primevideo", "disney", "hbo", "video", "player")
    private val leisureKeys = listOf("music", "spotify", "game", "podcast", "photos", "gallery")

    fun categorize(
        packageName: String,
        systemCategory: SystemAppCategory = SystemAppCategory.UNDEFINED,
        overrides: Map<String, AppCategory> = DEFAULT_OVERRIDES,
    ): AppCategory {
        overrides[packageName]?.let { return it }
        val pkg = packageName.lowercase()
        if (exerciseKeys.any { it in pkg }) return AppCategory.EXERCISE
        if (journalKeys.any { it in pkg }) return AppCategory.JOURNAL
        if (cameraKeys.any { it in pkg }) return AppCategory.CAMERA
        // Redes antes que video: el paquete de TikTok se llama "musically".
        if (socialKeys.any { it in pkg }) return AppCategory.SOCIAL
        if (videoKeys.any { it in pkg }) return AppCategory.VIDEO
        when (systemCategory) {
            SystemAppCategory.PRODUCTIVITY, SystemAppCategory.MAPS -> return AppCategory.FOCUSED
            SystemAppCategory.SOCIAL -> return AppCategory.SOCIAL
            SystemAppCategory.VIDEO -> return AppCategory.VIDEO
            SystemAppCategory.GAME, SystemAppCategory.AUDIO,
            SystemAppCategory.IMAGE, SystemAppCategory.NEWS -> return AppCategory.LEISURE
            SystemAppCategory.ACCESSIBILITY, SystemAppCategory.UNDEFINED -> Unit
        }
        if (focusedKeys.any { it in pkg }) return AppCategory.FOCUSED
        if (leisureKeys.any { it in pkg }) return AppCategory.LEISURE
        return AppCategory.NEUTRAL
    }
}
