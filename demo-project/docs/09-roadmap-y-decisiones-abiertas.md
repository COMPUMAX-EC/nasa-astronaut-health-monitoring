# 09 · Roadmap y decisiones abiertas

## Alcance sugerido del demo (NASA Space Apps)

Sin hardware real, el demo debe funcionar con **telemetría simulada** y un panel para disparar escenarios.

### Fase 1 — Núcleo ✅
- [x] Modelos de dominio (doc 06).
- [x] Máquina de estados + tests (doc 02).
- [x] Cálculo de vitalidad (doc 04).
- [x] Fuente de telemetría mock con escenarios: *nominal*, *dormí mal*, *pico de radiación*, *SANS*, *caída anímica*.
- [x] Tokens de color de la Calm Palette en el tema, sin dynamic color (doc 05).
- [x] Registro central de datos (módulo C): Room + formulario de entrada con validación + historial.

Pendiente de la Fase 1, movido a fases siguientes: corrección de registros desde la UI (el repositorio ya lo soporta), exportación JSON para el Flight Surgeon.

### Fase 2 — Módulos de presencia ✅
- [x] Screen pet: overlay flotante con estados y gestos (módulo A).
- [x] Detección de app en primer plano + tabla de categorías.
- [x] Asistente de voz: wake word "Laika" + STT offline + TTS español (módulo B).
- [x] Dictado de mediciones por voz con confirmación.
- [x] Onboarding de permisos especiales (pestaña "Módulos").

Verificado en emulador: overlay sobre otras apps, alerta crítica visible, detección de apps (YouTube → ocio), carga del modelo Vosk y estado "escuchando".
**Pendiente de probar en un dispositivo físico:** el reconocimiento con voz real (el emulador no tiene micrófono útil) y la lista de variantes con que Vosk transcribe "Laika".

### Fase 3 — Experiencia ✅
- [x] Avatar de Laika con las 6 emociones (también en el screen pet).
- [x] Flujo 1: chequeo matutino con entrada < 4 s (valores precargados, un toque) + flor "+10 PTS Cuidado".
- [x] Flujo 2: alerta de radiación guiada (resguardo, gráfico CANS, respiración guiada, confirmación).
- [x] Flujo 3: mapa corporal 2D + temporizador de 45 min persistente.
- [x] Flujo 4: gestos táctiles (caricia / presión) + háptico a 60 bpm mientras dura el contacto.
- [x] Puntos de cuidado e historial de misiones para el Flight Surgeon.

Verificado en emulador de punta a punta (los 4 flujos, la migración de base de datos v1→v2 y el historial). Pendiente: probar los hápticos en un dispositivo físico (el emulador no vibra) y notificar el fin del temporizador si la app está cerrada.

### Fase 4 — Largo plazo
- [x] Persistencia e historial para Flight Surgeon: exportación JSON local (pestaña Historial).
- [x] Revelación progresiva por día de misión (11 recuerdos e hitos hasta el día 900).
- [x] Memoria episódica: patrones semanales y misiones que ayudaron.
- [ ] Integración con jardinería espacial (Veggie). *Pendiente, no priorizada.*
- [ ] LLM local para conversación libre. *Pospuesto (D17), diseño en doc 12.*
- [ ] Análisis de voz / escaneo facial. *Pospuesto (D18), diseño en doc 12.*
- [x] Contexto social (D20): preguntas al salir de redes, videos y cámara; «Mostrar a Laika»; recuerdos y resumen del día por voz.

Verificado en emulador: aviso y diálogo de revelación (día 1 y día 365), memoria semanal con el escenario "Historial de 8 semanas", y exportación a Descargas (JSON válido con 556 mediciones y 4 misiones).

Verificado en emulador (contexto social): Laika flotante de 64 dp oculta dentro de la app, pregunta al salir de la cámara, conversación al tocarla, «Mostrar a Laika» con detección de tema, migración de base de datos v2→v3. **Pendiente en dispositivo físico:** probar con las apps reales de redes y video que usará la tripulación y ajustar `AppCategorizer`.

## Decisiones abiertas

La especificación original deja estos puntos sin definir:

| # | Pregunta | Propuesta actual |
|---|---|---|
| D1 | Pesos `w1..w4` y normalización de la vitalidad | 🛠 **Implementado (provisional):** 0.30 / 0.30 / 0.25 / 0.15 en `VitalityCalculator` (doc 04) |
| D2 | Umbrales de vitalidad "alta" y "baja" | 🛠 **Implementado (provisional):** ≥ 60 alta, < 40 baja |
| D3 | ¿Cómo se detecta un *opportune moment* sin sensores de actividad? | 🛠 **Implementado:** interruptor "Estoy libre" en la pantalla de Laika. En Fase 2 se sumará la app en primer plano |
| D4 | Umbrales de "anomalía severa" (arritmia, etc.) | 🛠 **Implementado (orientativo, no clínico):** FC < 40 o > 150; presión ≥ 180/120; glucosa < 54 o > 300; temperatura < 35 o > 39.5; neutrones > 1.3× fondo en 2 lecturas seguidas. Configurables en `AnalyzerConfig`. Validar con fuentes clínicas |
| D5 | Recompensas de puntos fuera del chequeo matutino | 🛠 **Implementado (provisional):** +10 chequeo matutino, +10 intervención completada, +10 protocolo crítico. Los otorga el `LaikaEngine` al detectar la transición, así que valen igual desde la pantalla, la voz o el screen pet. Posponer una micro-interacción no suma |
| D6 | ¿Un solo astronauta por dispositivo o tripulación? | ✅ **Resuelto:** uno por dispositivo, en español |
| D7 | Mapa corporal 2D o 3D | 🛠 **Implementado:** 2D con Canvas de Compose; 5 regiones (cabeza, tórax, abdomen, piernas, entorno de la nave) |
| D8 | Salida del estado `CRITICAL_ALERT`: ¿automática o confirmada por el usuario? | 🛠 **Implementado:** confirmación del usuario y solo cuando la lectura ya se normalizó |
| D9 | Arte/animación del avatar de Laika | 🛠 **Implementado:** diseño original dibujado con Canvas de Compose (sin archivos de arte): orejas, ojos, cejas y boca por emoción, parpadeo, casco espacial en modo protector. Puede reemplazarse por arte profesional sin tocar la lógica. **Screen pet:** usa el arte de referencia del equipo (`laika_sprite.png`) de cuerpo entero pero del tamaño de una cabeza (64 dp), con efectos animados por emoción, al estilo de los ayudantes de escritorio (doc 10). Dentro de la app se oculta y queda el avatar de la cara |
| D10 | Motor de wake word offline | 🛠 **Implementado:** el mismo Vosk que transcribe; se busca "Laika" y variantes ("laica", "layka"…) en el texto (`IntentParser.afterWakeWord`). Un solo motor y un solo modelo. Si en pruebas reales falla mucho, evaluar openWakeWord |
| D11 | Motor de voz a texto offline | ✅ **Resuelto:** Vosk español pequeño, empaquetado en el APK |
| D12 | Lista de apps y categorías para el screen pet | 🛠 **Implementado:** excepciones por paquete → palabras clave del paquete → categoría que la app declara a Android (`AppCategorizer`). Para el demo, decidir qué apps reales harán de ergómetro / diario / procedimientos y agregarlas a `DEFAULT_OVERRIDES` |
| D14 | Motor de texto a voz | 🛠 **Implementado:** TTS del sistema, solo voces españolas offline ya instaladas. Si no hay ninguna, Laika responde solo con texto en el globo. Un motor empaquetado (Sherpa-ONNX/Piper) queda como mejora |
| D15 | Operación en red cerrada | ✅ **Resuelto:** sin internet ni nube; sin permiso `INTERNET` (ver doc 11) |
| D17 | LLM local para conversación libre | ⏸ **Pospuesto:** modelo de 1–2 GB, hardware exigente y licencia por revisar. Diseño listo en doc 12 (el LLM nunca produce efectos sobre datos) |
| D18 | Análisis de voz y escaneo facial | ⏸ **Pospuesto:** datos biométricos sensibles y precisión limitada. Diseño y reglas de privacidad en doc 12 |
| D19 | Inicio de la misión | 🛠 **Implementado:** el día del primer arranque; el Simulador puede moverlo para presentar la revelación progresiva |
| D16 | Persistencia local | ✅ **Resuelto:** Room 2.7.2 con KSP (Room 2.6.x falla con KSP2) |
| D13 | Alcance del screen pet y la voz | ✅ **Resuelto:** overlay + reacción a la app en primer plano (sin leer contenido ni notificaciones); voz 100 % local con wake word |
| D20 | ¿De dónde saca Laika contexto para conversar? | 🛠 **Implementado:** tiempo en redes / videos / cámara (sin contenido), lo que el astronauta comparte con «Mostrar a Laika» y sus respuestas de un toque. Sin `AccessibilityService`: leer la pantalla expondría mensajes privados de la tripulación. Preguntas solo en periferia pasiva y cada ≥ 15 min. Notas visibles y borrables; fuera del reporte médico (doc 10) |

Al resolver una decisión, actualizar esta tabla y el documento afectado.
