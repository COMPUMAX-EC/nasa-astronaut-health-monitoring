# 11 · Operación en red cerrada (sin internet)

**Requisito:** una vez compilada e instalada, Laika debe funcionar completa en una red cerrada, sin acceso a internet ni a servicios en la nube, ni siquiera de forma ocasional. Esto refleja la condición real de una nave (hasta 20 min de retraso con la Tierra) y aplica tanto al demo como al producto. El desarrollo y la compilación sí pueden usar internet.

## Regla general

- La app **no declara el permiso `android.permission.INTERNET`** en el manifiesto. Así, cualquier librería que intente conectarse falla de inmediato y se detecta en pruebas.
- Todo modelo o recurso (voz, wake word, TTS, animaciones) va **empaquetado en el APK** o se instala antes de entrar a la red cerrada; nada se descarga en tiempo de ejecución.

## Dependencias de internet ocultas detectadas

| Componente | Riesgo | Decisión |
|---|---|---|
| **Picovoice Porcupine** (wake word) | El SDK valida su *AccessKey* contra los servidores de Picovoice al iniciarse. | ❌ **Descartado.** Usar Vosk u openWakeWord. |
| **`SpeechRecognizer` de Android / Google** | El reconocimiento on-device depende de Google y de paquetes de idioma que se descargan desde sus servidores; en algunos dispositivos usa la nube. | ❌ **Descartado.** Usar Vosk. |
| **Modelo de Vosk** | Los ejemplos de Vosk descargan el modelo al primer uso. | ✅ Empaquetar el modelo español pequeño en `assets/` (aumenta el APK unas decenas de MB). |
| **TTS de Android** | Algunas voces del motor de Google son de red (`Voice.isNetworkConnectionRequired()`), y la voz española offline puede no estar instalada. | ✅ Instalar la voz española offline **antes** de entrar a la red cerrada y seleccionar en código solo voces sin requisito de red. Alternativa: motor TTS empaquetado (p. ej. Sherpa-ONNX/Piper), decisión D14. |
| **Copia de seguridad automática** | `android:allowBackup="true"` (valor actual de la plantilla) sube datos a Google Drive. | ✅ Desactivar la copia en la nube (`allowBackup="false"` o excluir todo en `<cloud-backup>`). Los datos son médicos. |
| **Wearables comerciales** (Fitbit, Garmin, etc.) | Sincronizan a través de la nube del fabricante. | ✅ Leer sensores por **Bluetooth LE directo** (perfil estándar *Heart Rate* GATT) o usar el simulador. |
| **Google Play Services** | Ubicación, Firebase, analítica, crash reporting. | ❌ No usar ninguna librería que dependa de Play Services o Firebase. |
| **Hora del sistema** | Normalmente se sincroniza por NTP de internet. | ✅ Usar el servidor de hora de la red cerrada, o aceptar la hora del dispositivo; los `timestamp` deben ser consistentes en un mismo dispositivo. |

## Desarrollo vs. ejecución

La restricción aplica **solo a la app compilada (APK) en ejecución**. El entorno de desarrollo **sí puede usar internet** con normalidad:

- Gradle descarga dependencias de Google Maven y Maven Central.
- Se pueden descargar modelos (Vosk, wake word, voces TTS) durante el desarrollo para **empaquetarlos en el APK**.
- Herramientas, documentación y servicios de desarrollo en la nube están permitidos.

Lo que no puede pasar es que el APK instalado necesite conectarse para funcionar. Antes de llevar los dispositivos a la red cerrada, dejar instalado: el APK, la voz TTS española (si no se empaqueta) y las apps de ejemplo que usa el screen pet.

## Estado actual (Fase 2)

- El modelo Vosk se descarga **al compilar** (tarea `:app:downloadVoskModel`, enganchada a `preBuild`) y viaja dentro del APK. La primera compilación de un equipo nuevo necesita internet; las siguientes no.
- La app instalada no declara `INTERNET`. Vosk funciona sin red; la voz de respuesta usa solo voces sin `isNetworkConnectionRequired()` y, si no hay ninguna, Laika responde solo con texto.
- **Contexto social (D20):** las redes sociales y apps de video de la tripulación pueden usar la red de la nave; Laika no. «Mostrar a Laika» guarda el texto y el sitio del enlace, pero **nunca lo abre ni descarga una vista previa**. De los videos e imágenes compartidos solo lee nombre y duración, sin copiar el archivo.

## Verificación

- [ ] El manifiesto no contiene `INTERNET` ni `ACCESS_NETWORK_STATE`.
- [x] Copia de seguridad desactivada: `allowBackup="false"` y reglas en `res/xml/` que excluyen todo (nube y transferencia entre dispositivos).
- [ ] La app arranca y completa los flujos 1–4 con el dispositivo en **modo avión** (Bluetooth activado si hay sensores).
- [ ] La voz reconoce "Laika", transcribe y responde en modo avión.
- [ ] `./gradlew :app:dependencies` no incluye `com.google.firebase`, `com.google.android.gms` ni SDKs de analítica.
