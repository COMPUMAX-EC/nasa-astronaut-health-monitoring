# 12 · Investigación futura: LLM local y biometría afectiva

Dos puntos de la Fase 4 se **pospusieron a propósito** (decisión del equipo, D17 y D18). Este documento deja el diseño listo para retomarlos sin rehacer el análisis.

## LLM local para conversación libre (D17)

### Por qué se pospuso

- Un modelo útil (p. ej. Gemma 2B en int4 con MediaPipe LLM Inference) pesa **~1–2 GB** y necesita un teléfono reciente (≥ 6 GB de RAM). No cabe razonablemente en el APK y no se puede validar bien en el emulador.
- Hay que revisar y aceptar la licencia del modelo elegido.
- Las intenciones por reglas (`IntentParser`) ya cubren lo crítico: registrar mediciones, consultar estado, cerrar acciones. Esas rutas **deben seguir siendo deterministas** aunque haya un LLM.

### Diseño propuesto

```
texto reconocido ──► IntentParser (reglas)
                          │
          intención conocida ──► VoiceDialogue (igual que hoy)
                          │
          VoiceIntent.Unknown / SmallTalk ──► ConversationEngine (LLM local)
                                                    │
                                     respuesta libre, SIN efectos
```

- Interfaz nueva `ConversationEngine { suspend fun reply(text: String, context: VoiceContext): String? }` con una implementación nula (devuelve `null`) y otra con LLM.
- **El LLM nunca produce efectos** (`VoiceEffect`): no guarda mediciones ni cierra misiones. Solo conversa. Así un error del modelo no puede alterar datos clínicos.
- Prompt de sistema con la personalidad de Laika (primera persona, femenino, calma, nunca alarmista) y el `VoiceContext` actual (estado, vitalidad, acciones).
- El modelo se copia al dispositivo antes de entrar a la red cerrada (`adb push` o almacenamiento externo); la app lo busca en una ruta fija y, si no está, usa la implementación nula.
- Presupuesto de latencia: si la respuesta tarda más de ~3 s, Laika dice una frase corta ("Déjame pensarlo…") por TTS mientras tanto.

## Análisis de voz y escaneo facial (D18)

### Por qué se pospuso

- Son **datos biométricos sensibles**; inferir emociones a partir de la cara o la voz tiene una precisión limitada y puede equivocarse con un astronauta concreto.
- Requieren consentimiento explícito, controles claros y una evaluación ética que excede el demo.

### Diseño propuesto (si se retoma)

| Señal | Fuente | Qué mide | Nunca hace |
|---|---|---|---|
| Ritmo de habla | Vosk con tiempos por palabra (`setWords(true)`) | Palabras por minuto frente a la línea base personal | Guardar audio |
| Expresión facial | Detector de caras local empaquetado (sin servicios de Google) | Probabilidad de sonrisa, apertura de ojos | Guardar imágenes ni identificar personas |

Reglas:

1. **Activación explícita** por señal, desactivada por defecto, revocable en cualquier momento desde Módulos.
2. Solo se guardan **números agregados** (p. ej. `SPEECH_RATE` como un `MeasurementType` más), nunca audio ni imágenes.
3. Estas señales **solo pueden sumar contexto** a una desviación ya detectada por métricas fisiológicas; por sí solas nunca disparan una intervención ni una alerta.
4. Su línea base y su polaridad pasan por el mismo `HealthAnalyzer` que el resto, con los mismos tests.
