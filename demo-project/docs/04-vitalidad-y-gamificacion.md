# 04 · Vitalidad y gamificación (sostenibilidad 1,000+ días)

## El problema: efecto novedad

La literatura de robótica social (Leite et al., Gockley et al., Fernaeus et al.) muestra que el interés decae drásticamente **entre 2 semanas y 2 meses**. Una misión a Marte dura ~3 años. Laika se apoya en tres pilares para sostener el vínculo.

## 1. Bucle de cuidado reflejo (*Mirror Care Loop*)

Inspirado en el análisis del Tamagotchi (Lawton y Titusland): el impulso humano al animismo y al cuidado altruista.

### Métrica espejo

```
Vitalidad_Laika = w1·CalidadSueño + w2·VFC + w3·ActividadFísica − w4·Cortisol
```

- Las tareas de salud (tomarse la presión, ergómetro *Zero T2*) se perciben como **cuidar a Laika**, no como obligaciones médicas.
- Resultado: `laika_vitality_score` en `LaikaStateEvent`.

### Propuesta de implementación (a validar)

La spec no define pesos ni normalización. Propuesta inicial:

| Término | Normalización a [0, 1] | Peso |
|---|---|---|
| CalidadSueño | `clamp(horas / 8, 0, 1)` | w1 = 0.30 |
| VFC | `clamp((hrv_ms − 20) / (100 − 20), 0, 1)` (relativo a línea base cuando exista) | w2 = 0.30 |
| ActividadFísica | minutos de ejercicio / objetivo diario | w3 = 0.25 |
| Cortisol | nivel relativo a línea base | w4 = 0.15 |

Implementado en `domain/vitality/VitalityCalculator.kt` con estos detalles:

- Para que el resultado quede en 0–100 se usa la forma equivalente `w4·(1 − Cortisol)` y se divide por la suma de pesos: `V = (w1·S + w2·H + w3·A + w4·(1 − C)) / Σw · 100`.
- Si falta un dato, su término se omite y los pesos restantes se re-normalizan. Sin ningún dato → 50 (neutral).
- Actividad: objetivo de **120 min/día** (en la ISS se entrena ~2 h al día). Cortisol salival: 5 nmol/L → 0, 25 nmol/L → 1 (orientativo).
- Umbral alto ≥ 60, bajo < 40 (usado para la emoción de Laika y en el Flujo 1).

## 2. Mecanismos anti-habituación

1. **Revelación progresiva (*self-disclosure*):** diálogos, historias, animaciones y rasgos se desbloquean con el tiempo.
   - Mes 3: "recuerdos de entrenamiento en la Tierra".
   - Mes 12: celebración de mitad de camino a Marte.
2. **Memoria episódica adaptativa:** Laika recuerda contextos. Ej.: *"Sé que los martes tras el mantenimiento de filtros te suele doler la espalda. ¿Hacemos la rutina de movilidad?"*
3. **Ánimo variable (modelo de Kirby et al.):** variaciones autónomas pero coherentes con el entorno de la nave.

### Implementación (Fase 4)

**Revelación progresiva** (`domain/mission/Disclosure.kt`): 11 entradas que se desbloquean por día de misión. El día 1 es el del primer arranque (`MissionProfileStore`).

| Día | Entrada | Tipo |
|---|---|---|
| 1 | Quién soy | Historia |
| 7 | Ya conozco tus mañanas | Rasgo |
| 14 | Más allá de la novedad | Rasgo |
| 30 | Mi primer vuelo parabólico | Historia |
| 90 | Recuerdos de entrenamiento en la Tierra (spec, mes 3) | Historia |
| 180 | Latimos al mismo ritmo | Rasgo |
| 270 | Un punto azul | Historia |
| 365 | ¡Mitad del camino a Marte! (spec, mes 12) | Hito |
| 540 | Marte por la ventana | Hito |
| 730 | Rumbo a casa | Hito |
| 900 | La Tierra se agranda | Historia |

Laika avisa "Tengo algo que contarte" con la entrada nueva más reciente (nunca durante una alerta crítica). Todas las desbloqueadas quedan en "Recuerdos de Laika", y el texto vive en `strings.xml`.

**Memoria episódica** (`domain/memory/EpisodicMemory.kt`): se calcula a partir de los datos, no se guarda aparte, así nunca recuerda algo que el registro ya no respalda.

- *Patrón semanal:* en las últimas 8 semanas, un día de la semana con al menos 3 lecturas cuya media está a 1σ o más del total, en la dirección "mala". El día que corresponde, Laika lo menciona y sugiere una acción ("Sé que los domingos tu sueño suele ser menor…").
- *Misión que ayudó:* una misión completada seguida, en menos de 72 h, por una mejora de una métrica relacionada. Laika la recuerda cuando esa acción vuelve a proponerse.

## 3. Jardinería espacial (*Veggie*)

Al cumplir metas de salud, Laika "ayuda" a optimizar ciclos de luz y riego del módulo agrícola → recompensa con alimentos frescos e indicadores visuales de florecimiento.

## Economía de puntos

| Acción | Recompensa |
|---|---|
| Completar chequeo matutino | +10 PTS Cuidado (definido en spec) |
| Completar una intervención terapéutica | +10 (provisional, D5) |
| Seguir un protocolo crítico hasta confirmar que todo está bien | +10 (provisional, D5) |

Implementado en `LaikaEngine.recordCare()`: el motor otorga los puntos al detectar la transición, y cada evento queda en la tabla `care_events` como historial para el Flight Surgeon (pestaña Historial). El chequeo cuenta cuando hoy pasa de "pendiente" a "hecho" con una medición real; un reinicio de la app no lo vuelve a otorgar.
