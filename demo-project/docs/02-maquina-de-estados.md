# 02 · Máquina de estados

La interfaz opera bajo una **máquina de estados determinista** según el nivel de atención requerido y el estado fisiológico del astronauta. Es el núcleo del comportamiento de la app: cada pantalla y cada reacción de Laika debe derivarse del estado actual.

## Estados

| Enum (`current_system_state`) | Nombre | Campo de atención | Disparador | Comportamiento de Laika | Interacción del usuario |
|---|---|---|---|---|---|
| `PERIPHERAL_PASSIVE` | Periferia pasiva (Sombra) | Periferia | Vitales normales, CANS nominal | Micro-movimientos, "respiración" lumínica sutil | Ninguna (percepción subconsciente) |
| `MICRO_INTERACTION` | Micro-interacción activa | Periferia → Centro | Rutina, recordatorio de medición o hábito | Curiosidad o pequeña necesidad ("Tengo sed / Hora de medir glucosa") | Toque o confirmación **< 4 s** |
| `THERAPEUTIC_INTERVENTION` | Intervención terapéutica | Centro | Desviación leve/moderada (VFC baja, SANS temprano, cortisol alto) | Comunicación empática en 1ª persona, propone misión guiada | Mapa corporal, manguitos, estiramientos |
| `CRITICAL_ALERT` | Alerta médica crítica | Centro absoluto | Anomalía severa (pico de radiación solar, arritmia) | Cambio de contraste, tono auditivo claro **sin sirena**, instrucciones directas | Protocolo de emergencia, ir al módulo blindado |

## Diagrama

```
                 rutina / opportune moment
 PERIPHERAL_PASSIVE ─────────────────────────► MICRO_INTERACTION
        ▲   ▲                                        │
        │   │ acción correctiva completada            │ 3 mediciones con tendencia negativa
        │   │                                        │ o desviación > 1.5σ de la línea base
        │   └──────────── THERAPEUTIC_INTERVENTION ◄──┘
        │                          │
        │  evento resuelto         │ anomalía severa
        └──────────── CRITICAL_ALERT ◄──── (desde cualquier estado)
```

## Reglas de transición

Diseñadas para evitar la **fatiga por alarmas** (*alarm fatigue*):

| ID | De → A | Condición |
|---|---|---|
| T1 | Pasiva → Micro-interacción | Solo en momentos de **baja carga cognitiva** (*opportune moments*), detectados por sensores de actividad o pausas entre tareas. |
| T2 | Micro-interacción → Intervención | Indicador con **tendencia negativa en 3 mediciones consecutivas** **o** desviación **> 1.5σ** respecto a la línea base individual. |
| T3 | Cualquiera → Periferia | **Inmediatamente** tras completar la acción correctiva. |
| T4* | Cualquiera → Alerta crítica | Anomalía severa (ej. flujo de neutrones > 30 % sobre el fondo, arritmia). *Implícita en la spec; no requiere opportune moment.* |

\* T4 no está numerada en la especificación original; se explicita aquí porque una alerta crítica no puede esperar a un momento oportuno.

## Emociones de Laika

`active_emotion_display` ∈ `JOYFUL`, `CALM`, `CURIOUS`, `TIRED`, `CONCERNED`, `PROTECTIVE`.

Mapeo sugerido (orientativo, no normativo):

| Estado | Emociones típicas |
|---|---|
| `PERIPHERAL_PASSIVE` | `CALM`, `JOYFUL` |
| `MICRO_INTERACTION` | `CURIOUS`, `TIRED` (si vitalidad baja) |
| `THERAPEUTIC_INTERVENTION` | `CONCERNED`, `TIRED` |
| `CRITICAL_ALERT` | `PROTECTIVE` |

## Implementación (Fase 1)

| Pieza | Archivo (`domain/`) |
|---|---|
| Transiciones (función pura) | `statemachine/StateMachine.kt` |
| Emoción y acciones según estado | `statemachine/LaikaBehavior.kt` |
| Detección de desviaciones, críticos y rutina | `analysis/HealthAnalyzer.kt` |
| Orquestación + silencios | `engine/LaikaEngine.kt` |

Interpretaciones tomadas donde la spec es ambigua:

- **T2 "tendencia negativa en 3 mediciones":** 3 empeoramientos consecutivos (4 lecturas) en la dirección "mala" de la métrica. No aplica a métricas donde ambos sentidos son malos (FC, glucosa, temperatura).
- **T2 "> 1.5σ":** la línea base usa hasta 14 días de historial, excluye las 3 lecturas más recientes y exige al menos 5 muestras. Solo cuenta la desviación en la dirección "mala".
- **T2 desde periferia:** una desviación puede pasar de `PERIPHERAL_PASSIVE` directo a `THERAPEUTIC_INTERVENTION`, pero solo en un momento oportuno (misma condición que T1).
- **T3 y fatiga por alarmas:** al completar una intervención, ese peligro se silencia 6 h. Lo crítico nunca se silencia.
- **Rutina pendiente (T1):** chequeo matutino pendiente si hoy no hubo registro manual o por voz de glucosa o presión.
- **Lecturas viejas:** una lectura de más de 12 h no genera hallazgos.
- Prioridad: `CRITICAL_ALERT` > `THERAPEUTIC_INTERVENTION` > `MICRO_INTERACTION` > `PERIPHERAL_PASSIVE`.
