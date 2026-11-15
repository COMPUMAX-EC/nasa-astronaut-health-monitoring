# 03 · Flujos de interacción

Cuatro flujos principales. Cada uno indica los estados de la [máquina de estados](02-maquina-de-estados.md) por los que pasa.

> **Implementación (Fase 3):** la pestaña Laika (`ui/companion/CompanionScreen.kt`) muestra el panel del flujo que corresponde al estado actual: `CheckInPanel` (Flujo 1), `RadiationPanel` (Flujo 2), `MissionActions` + `BodyMapView` + `MissionTimerSession` (Flujo 3) y `AffectiveSession` (Flujo 4). Las alertas críticas tienen prioridad sobre cualquier sesión abierta. En el Simulador, "Fin del evento de radiación" agrega lecturas CANS normales para demostrar el paso 4 del Flujo 2; en builds de depuración el temporizador tiene un atajo "Demo: terminar ahora".

---

## Flujo 1 · Chequeo matutino (*Routine Health Assessment & Mirror Care*)

**Estados:** `PERIPHERAL_PASSIVE` → `MICRO_INTERACTION` → `PERIPHERAL_PASSIVE`

```
[Inicio de rutina matutina]
        │
[Periferia pasiva] ──► luz sutil de despertar
        │
[Micro-interacción] ──► Laika saluda con vitalidad refleja
        ├─ vitalidad ALTA: "¡Nos sentimos genial! Registro rápido de glucosa."
        └─ vitalidad BAJA: "Me siento un poco deshidratada. ¿Tomamos agua y medimos VFC?"
        │
[Entrada de datos] ──► wearable / muestra bioquímica / cámara
        │
[Cierre de bucle] ──► animación de florecimiento, +10 PTS Cuidado
```

1. **Iniciación amigable:** iluminación tenue; al acercarse el astronauta, Laika aparece en móvil o pantalla de pared.
2. **Estado reflejo:** si durmió < 6 h, Laika luce con poca energía (`TIRED`).
3. **Ingreso multimodal:**
   - *Pasiva:* sincronización de banda cardíaca (FC, VFC, temperatura) por Bluetooth LE directo, sin la nube del fabricante (ver [11-red-cerrada](11-red-cerrada.md)).
   - *Semi-pasiva:* escaneo facial de ánimo / micro-expresiones.
   - *Activa:* entrada numérica de glucemia (mg/dL) o presión arterial, escrita o **dictada por voz** ("Laika, glucosa ciento diez"), con confirmación antes de guardar (ver [10-modulos-de-la-app](10-modulos-de-la-app.md)).
4. **Feedback empático:** diálogo adaptativo, no estadísticas. Ej.: *"Tu frecuencia cardíaca se estabilizó tras los ejercicios de ayer. ¡Siento que recuperamos energía!"*

**Criterios de aceptación**
- [ ] El saludo cambia según la vitalidad (alta/baja).
- [ ] Cada registro se confirma en < 4 s.
- [ ] Al completar, se otorgan +10 puntos de cuidado y se vuelve a periferia.

---

## Flujo 2 · Evento de radiación (CANS / CSA)

**Estados:** `PERIPHERAL_PASSIVE` → `CRITICAL_ALERT` → `PERIPHERAL_PASSIVE`

1. **Detección:** CANS registra un incremento continuo del flujo de neutrones **> 30 %** sobre el fondo.
2. **Alerta periférica escalada:** iluminación ámbar cálida + pulsación háptica rítmica suave en el wearable.
3. **Desplazamiento guiado:** Laika aparece con vestuario de protección: *"Se acerca una marejada de partículas. Acompáñame al módulo blindado central mientras leemos los últimos reportes."*
4. **Verificación de resguardo:** en zona protegida, Laika confirma la caída de lecturas y ofrece una actividad de bajo estrés (lectura, audio relajante) hasta que pase el evento.

**Criterios de aceptación**
- [ ] Umbral configurable (por defecto 30 % sobre línea base de `cans_neutron_dose_uSv_h`).
- [ ] Sin sirenas ni rojo agresivo durante la guía; coral solo para el indicador crítico.
- [ ] Emoción `PROTECTIVE` durante todo el evento.

---

## Flujo 3 · Protocolo preventivo SANS

**Estados:** `MICRO_INTERACTION` → `THERAPEUTIC_INTERVENTION` → `PERIPHERAL_PASSIVE`

```
[Detección de riesgo SANS] ──► presión ocular / cuestionario de nitidez
        │
[Mapa corporal interactivo] ──► zona ocular y piernas resaltadas (amarillo/ámbar)
        │
[Prescripción gamificada] ──► "Misión: 45 min con Thigh Cuffs + Complejo B"
        │
[Monitoreo de sesión] ──► cronómetro con Laika haciendo estiramientos
        │
[Historial] ──► registro local para el Flight Surgeon
```

1. **Síntoma inicial:** borrosidad reportada en el chequeo subjetivo o cambios morfológicos en el escáner retinal.
2. **Mapa corporal:** sistema ocular y extremidades inferiores resaltados.
3. **Prescripción** (respaldada por HRP):
   - *Thigh cuffs* (manguitos de presión venosa en muslos) **45 min**.
   - Dosis diaria de **Complejo B**.
4. **Acompañamiento:** temporizador animado + juego mental o relajación.

**Criterios de aceptación**
- [ ] Temporizador de 45 min resistente a rotación/pausa de la app.
- [ ] La sesión se guarda como `prescribed_actions` con `target_hazard = "SANS"`.

---

## Flujo 4 · Soporte psicosocial (ARCHeR / Omics)

**Estados:** `PERIPHERAL_PASSIVE` → `THERAPEUTIC_INTERVENTION` → `PERIPHERAL_PASSIVE`

1. **Detección de caída anímica:** análisis multimodal (tono de voz, velocidad de respuesta, VFC, sueño ARCHeR) indica fatiga acumulada e insularidad.
2. **Contacto afectivo táctil:** Laika pide contacto directo en pantalla. Se reconocen gestos de caricia, presión o contacto afectivo (Andreasson et al., estudio con robot Nao).
3. **Respuesta oxitocinérgica:** háptico de ronroneo/latido rítmico a **60 bpm** + voz tranquilizadora.
4. **Conexión biocultural:** sugiere el módulo de jardinería (*Veggie*) o escribir en el diario de misión.

**Criterios de aceptación**
- [ ] Se distinguen al menos 2 gestos (caricia = swipe lento, presión = long-press).
- [ ] Patrón háptico a 60 bpm mientras dura el contacto.
