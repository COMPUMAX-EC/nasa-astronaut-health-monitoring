import java.net.URI
import java.util.zip.ZipFile

plugins {
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.jetbrainsKotlinAndroid)
    alias(libs.plugins.kotlinCompose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "nasa.space.app.ec.laikapolizon"
    compileSdk = 34

    defaultConfig {
        applicationId = "nasa.space.app.ec.laikapolizon"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        compose = true
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)
    implementation(libs.androidx.lifecycle.service)
    implementation(libs.vosk.android)
    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}

// ---------------------------------------------------------------------------
// Modelo de voz Vosk en español (docs/11-red-cerrada.md).
// Se descarga UNA vez durante el desarrollo (con internet) y se empaqueta en el APK,
// para que la app instalada nunca necesite red. Carpeta ignorada por git.
// ---------------------------------------------------------------------------
val voskModelUrl = "https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip"
val voskModelDir = file("src/main/assets/vosk-model-es")

val downloadVoskModel by tasks.registering {
    description = "Descarga y descomprime el modelo Vosk español en assets/ si no existe."
    outputs.dir(voskModelDir)
    onlyIf { !voskModelDir.resolve("am/final.mdl").exists() }
    doLast {
        val zip = layout.buildDirectory.file("tmp/vosk-model-es.zip").get().asFile
        zip.parentFile.mkdirs()
        logger.lifecycle("Descargando modelo Vosk: $voskModelUrl")
        URI(voskModelUrl).toURL().openStream().use { input -> zip.outputStream().use { input.copyTo(it) } }
        voskModelDir.deleteRecursively()
        ZipFile(zip).use { archive ->
            archive.entries().asSequence().forEach { entry ->
                val relative = entry.name.substringAfter('/') // quita la carpeta raíz del zip
                if (relative.isEmpty()) return@forEach
                val target = voskModelDir.resolve(relative)
                if (entry.isDirectory) {
                    target.mkdirs()
                } else {
                    target.parentFile.mkdirs()
                    archive.getInputStream(entry).use { input -> target.outputStream().use { input.copyTo(it) } }
                }
            }
        }
        zip.delete()
    }
}

tasks.named("preBuild") { dependsOn(downloadVoskModel) }