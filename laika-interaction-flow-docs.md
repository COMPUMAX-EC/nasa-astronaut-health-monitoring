# Documentación de Arquitectura de UX y Flujo de Interacción: Sistema Laika

## 1. Fundamentos del Sistema y Marco Teórico-Clínico

El sistema **Laika** está concebido como una plataforma de software modular de monitoreo fisiológico y soporte psicosocial para tripulaciones en misiones espaciales de larga duración, como el programa Artemis de la NASA o futuras misiones tripuladas a Marte. En estas misiones, los astronautas se enfrentan a los cinco peligros fundamentales identificados por el Programa de Investigación Humana (HRP) de la NASA: la radiación espacial, el aislamiento y confinamiento, la extrema distancia de la Tierra, los campos de gravedad variables (microgravedad) y los entornos cerrados u hostiles.

Para superar el agotamiento cognitivo que generan los dashboards médicos convencionales, Laika fusiona el seguimiento clínico estricto con los principios de la robótica social relacional, la interacción periférica (*Calm Technology*) y la neurobiología del apego.

```
[Muestras y Sensores] ---> [Motor de Procesamiento Local (Edge AI)] 
                                   |
                                   v
             [Máquina de Estados de Laika (Cuidado Reflejo)]
                                   |
       +---------------------------+---------------------------+
       |                                                       |
       v                                                       v
[Atención Periférica (Calm UI)]               [Atención Focal (Dashboard Interactivo)]
```

### 1.1 Mitigación de Riesgos Espaciales Integrados
El diseño operativo de Laika responde directamente a los requerimientos de la NASA HRP y la Agencia Espacial Canadiense (CSA):

* **Radiación Neutrónica:** La radiación representa uno de los peligros más sigilosos en el espacio profundo. La CSA señala que los neutrones constituyen aproximadamente el 30% de la radiación total recibida en la Estación Espacial Internacional (ISS) y causan un daño biológico celular severo. Laika se conecta con espectrómetros autónomos continuos como el *Canadian Active Neutron Spectrometer* (CANS) para registrar la dosis absorbida en tiempo real de manera transparente para la tripulación.
* **Síndrome Neuro-ocular Asociado al Vuelo Espacial (SANS):** En microgravedad, el desplazamiento de fluidos corporales hacia la cabeza eleva la presión intracraneal y altera la estructura ocular. Laika rastrea los síntomas iniciales e integra protocolos de mitigación probados por el HRP de la NASA, como el uso de manguitos de presión en extremidades inferiores (*thigh cuffs*) para retener fluidos en las piernas y la administración de suplementos de Complejo B.
* **Inmunodeficiencia y Biomarcadores:** Misiones como Artemis II (estudios ARCHeR e *Immune Biomarkers*) demuestran que el estrés de espacio profundo provoca respuestas inmunitarias detectables en fluidos corporales y saliva. Laika monitorea los archivos ómicos (*Omics Archive*) y patrones de sueño/actividad para aplicar micro-intervenciones preventivas.
* **Autonomía Médica por Distancia:** Debido al retraso en las comunicaciones de hasta 20 minutos con el Control de Misión en la Tierra, Laika funciona mediante procesamiento local (*Edge Computing*), actuando como sistema de evaluación primaria autónoma sin depender de telemedicina en tiempo real.

### 1.2 Fundamentos Neurobiológicos e Interacción Calma
La interacción con Laika no se basa en el entretenimiento pasivo, sino en la activación del **sistema oxitocinérgico**. Investigaciones sobre interacción humano-animal (Beetz et al., Uvnäs-Moberg et al.) demuestran que el contacto y la atención hacia un compañero regulan el eje hipotálamo-hipófisis-adrenal (HPA), produciendo:

1. **Reducción de Cortisol:** Descenso probado de los niveles de cortisol en saliva y suero, atenuando la respuesta biológica al estrés.
2. **Estabilización Cardiovascular:** Disminución de la presión arterial sistólica y aumento de la variabilidad del ritmo cardíaco (VFC), favoreciendo el tono parasimpático.
3. **Efecto Ansiolítico y de Confianza:** La liberación endógena de oxitocina incrementa la percepción de seguridad y reduce la ansiedad en entornos de alto riesgo.

Desde la perspectiva de la interacción humano-computadora (HCI), Laika aplica el paradigma de *Calm Technology* (Weiser & Brown, Juola). El sistema interactúa predominantemente en la **periferia de la atención** del astronauta, trasladándose al **centro de la atención** únicamente cuando una métrica fisiológica o ambiental requiere una acción consciente.

---

## 2. Máquina de Estados del Sistema y Transiciones

La interfaz de Laika opera bajo una máquina de estados determinista basada en el nivel de atención requerida y el estado fisiológico del astronauta.

| Estado del Sistema | Campo de Atención | Disparador de Entorno / Salud | Comportamiento de Laika | Interacción del Usuario |
| :--- | :--- | :--- | :--- | :--- |
| **Periferia Pasiva (Sombra)** | Periferia de la atención | Signos vitales normales, ambiente seguro (CANS nominal) | Micro-movimientos ambientales, respiración lumínica sutil en la cabina o wearable | Ninguna (Percepción subconsciente) |
| **Micro-interacción Activa** | Transición Periferia $\rightarrow$ Centro | Horario de rutina, recordatorio de medición o hábito | Laika muestra curiosidad o ligera necesidad (ej. "Tengo sed / Hora de medir glucosa") | Micro-acción táctil o clic de confirmación (< 4 segundos) |
| **Intervención Terapéutica** | Centro de la atención | Desviación leve/moderada (ej. VFC baja, SANS temprano, cortisol alto) | Comunicación empática en primera persona, propuesta de misión guiada en equipo | Mapeo corporal interactivo, colocación de manguitos, estiramientos |
| **Alerta Médica Crítica** | Centro de la atención absoluto | Anomalía severa (ej. Pico de radiación solar, arritmia) | Cambio de contraste visual, tono auditivo claro sin sirena, instrucciones directas | Ejecución de protocolo de emergencia y aislamiento en módulo blindado |

### 2.1 Reglas de Transición de Estados
Las transiciones entre estados están reguladas para evitar la fatiga por notificaciones (*alarm fatigue*):

* **Transición 1 (Pasiva a Micro-interacción):** Ocurre únicamente en momentos de baja carga cognitiva (*opportune moments*), detectados por sensores de actividad o pausas entre tareas.
* **Transición 2 (Micro-interacción a Intervención):** Se activa cuando un indicador de salud registra una tendencia negativa durante tres mediciones consecutivas o una desviación superior al $1.5\sigma$ de la línea base individual.
* **Transición 3 (Retorno a Periferia):** Ocurre inmediatamente después de completar la acción correctiva, regresar a un estado visualmente relajante para liberar la carga mental del astronauta.

---

## 3. Flujos de Interacción Detallados (Interaction Workflows)

### 3.1 Flujo 1: Routine Health Assessment & Mirror Care (Chequeo Matutino)
Este flujo convierte la toma de muestras y constantes vitales en una rutina de cuidado mutuo entre el astronauta y Laika.

```
[Inicio de Rutina Matutina]
           |
           v
[Laika en Periferia Pasiva] ---> (Luz sutil de despertar en cabina)
           |
           v
[Micro-interacción Activa] ---> (Laika saluda y muestra vitalidad refleja)
           |
           +---> Si vitalidad es ALTA: "¡Nos sentimos genial! Registro rápido de glucosa".
           |
           +---> Si vitalidad es BAJA: "Me siento un poco deshidratada. ¿Tomamos agua y medimos VFC?".
           |
           v
[Entrada de Datos] ---> (Sensor wearable / muestra bioquímica / cámara)
           |
           v
[Cierre de Bucle] ---> (Laika reacciona con animación de florecimiento; +10 PTS Cuidado)
```

1. **Iniciación Amigable:** Al despertar, Laika proyecta un tono de iluminación tenue en la cabina (interacción periférica). Al aproximarse el astronauta, Laika aparece en el dispositivo móvil o pantalla de pared.
2. **Evaluación de Estado Reflejo:** Laika muestra un estado físico que refleja la tendencia de salud del astronauta. Si el astronauta durmió menos de 6 horas (Riesgo de Sueño Inadecuado HRP), Laika luce con poca energía.
3. **Ingreso de Datos Multimodal:** El astronauta puede registrar métricas de tres formas:
   * **Pasiva:** Sincronización automática de banda cardíaca (frecuencia, VFC, temperatura corporal).
   * **Semi-pasiva:** Escaneo por cámara (análisis facial de estado de ánimo / micro-expresiones).
   * **Activa:** Entrada numérica de glucemia ($mg/dL$) o presión arterial.
4. **Retroalimentación Empática e Inmediata:** Laika no muestra tablas estadísticas frías; responde con un diálogo adaptativo: *"Tu frecuencia cardíaca se estabilizó tras los ejercicios de ayer. ¡Siento que recuperamos energía!"*.

### 3.2 Flujo 2: Mitigación Periférica de Evento de Radiación (CANS CSA)
Ante un evento de partículas solares o picos de neutrones detectados por el sensor CANS de la CSA, Laika guía la protección sin generar pánico.

1. **Detección del Evento:** El sensor CANS registra un incremento continuo en el flujo de neutrones ($> 30\%$ sobre el nivel de fondo de la ISS/nave).
2. **Alerta Periférica Escalada:** La iluminación ambiental de la estación adopta un tono ámbar cálido. El wearable del astronauta emite una pulsación háptica rítmica suave.
3. **Desplazamiento Guiado por Laika:** En la interfaz, Laika aparece equipada con un vestuario táctico o de protección y dice: *"Se acerca una marejada de partículas. Acompáñame al módulo blindado central mientras leemos los últimos reportes"*.
4. **Verificación de Resguardo:** Una vez en la zona protegida, Laika confirma la caída en los niveles de lectura del sensor y ofrece una actividad de bajo estrés cognitivo (como lectura o audio relajante) mientras pasa el evento.

### 3.3 Flujo 3: Protocolo Preventivo para SANS y Presión Craneal
Cuando se detecta una desviación en la visión o un aumento en los biomarcadores de presión en fluido cerebroespinal (HRP NASA).

```
[Detección de Riesgo SANS] ---> (Lectura de presión ocular / cuestionario de nitidez)
           |
           v
[Despliegue de Mapa Corporal Interactivo] ---> (Resaltado de zona ocular y piernas)
           |
           v
[Prescripción Gamificada] ---> "Sugerencia de Misión: 45 min con Thigh Cuffs + Complejo B"
           |
           v
[Monitoreo de Sesión] ---> (Cronómetro interactivo con Laika realizando estiramientos)
           |
           v
[Actualización de Historial] ---> (Registro local para Flight Surgeon)
```

1. **Detección de Síntoma Inicial:** El astronauta reporta una ligera borrosidad visual en su chequeo subjetivo diario o el escáner retinal indica cambios morfológicos.
2. **Despliegue del Mapa Corporal 3D:** Laika abre una vista anatómica interactiva donde el sistema ocular y las extremidades inferiores aparecen resaltados en amarillo.
3. **Prescripción de Acción Preventiva:** Laika prescribe dos acciones respaldadas por el HRP de la NASA:
   * Colocación de manguitos de presión venosa en muslos (*Thigh Cuffs*) durante 45 minutos para desplazar fluidos hacia las piernas.
   * Toma de la dosis diaria de suplementos de Complejo B.
4. **Acompañamiento Durante la Terapia:** Durante los 45 minutos de manguitos, Laika muestra un temporizador animado y propone un juego mental o sesión de relajación para mitigar la molestia física.

### 3.4 Flujo 4: Soporte Psicosocial y Regulación Afectiva (ARCHeR / Omics)
Ante índices de aislamiento o alteración inmune/hormonal (aumento de cortisol en saliva):

1. **Detección de Caída Anímica:** El análisis multimodal (tono de voz, velocidad de respuesta en pantalla, VFC y datos ARCHeR de sueño) indica fatiga acumulada e insularidad.
2. **Activación de Contacto Afectivo Táctil:** Laika solicita un contacto directo en la pantalla o superficie háptica. Siguiendo el estudio de Andreasson et al. sobre expresión de emociones por contacto táctil en robots (*Nao robot study*), el sistema reconoce gestos de caricia, presión o contacto afectivo.
3. **Respuesta de Regulación Oxitocinérgica:** Laika emite una respuesta háptica de ronroneo/latido rítmico a 60 bpm y una voz tranquilizadora, estimulando la liberación endógena de oxitocina en el astronauta.
4. **Sugerencia de Conexión Biocultural:** Laika sugiere revisar el módulo de jardinería espacial (*Space Gardening / Veggie*) o escribir un registro en el diario de misión.

---

## 4. Arquitectura de Gamificación y Sostenibilidad a Largo Plazo (1,000+ Días)

Un desafío crítico identificado en la literatura de robótica social (Leite et al., Gockley et al., Fernaeus et al.) es el **desgaste del efecto novedad** (*novelty effect*), el cual provoca que el interés del usuario decaiga drásticamente entre las 2 semanas y los 2 meses de interacción. En una misión a Marte de tres años, esto inutilizaría cualquier sistema convencional.

Para sostener el vínculo relacional durante 1,000 días, Laika incorpora tres pilares de diseño a largo plazo:

### 4.1 Bucle de Cuidado Reflejo (*Mirror Care Loop* & Animismo)
Inspirado en el análisis de Lawton y Titusland sobre la aceptación social de dispositivos móviles mediante el Tamagotchi, el sistema explota el impulso humano natural hacia el animismo y el cuidado altruista:

* **Métrica Espejo:** El "Nivel de Vitalidad" de Laika es una función matemática compuesta de los indicadores reales del astronauta:
  $$\text{Vitalidad}_{\text{Laika}} = w_1 \cdot \text{CalidadSueño} + w_2 \cdot \text{VFC} + w_3 \cdot \text{ActividadFísica} - w_4 \cdot \text{Cortisol}$$
* **Sensación de Responsabilidad:** El astronauta percibe las tareas de salud (tomarse la presión, ejercitarse en el ergómetro *Zero T2*) no como obligaciones médicas frías, sino como acciones para mantener a Laika en un estado óptimo y saludable.

### 4.2 Mecanismos Anti-Habituación
Para evitar la habituación y la pérdida de interés descrita por Leite et al. y Kozima et al., Laika implementa:

1. **Revelación Progresiva (*Self-disclosure*):** Laika no muestra todo su repertorio desde el inicio. Bloques de diálogo, historias de fondo, animaciones y rasgos de personalidad se desbloquean progresivamente a lo largo de los meses de la misión (ej. Mes 3: Laika comparte "recuerdos de entrenamiento en la Tierra"; Mes 12: Laika celebra el hito de mitad de camino a Marte).
2. **Sistema de Memoria Episódica Adaptativa:** Laika recuerda contextos e interacciones pasadas (ej. *"Sé que los martes tras el mantenimiento de filtros te suele doler la espalda. ¿Hacemos la rutina de movilidad?"*). Esta personalización incrementa la sensación de presencia social e interdependencia afectiva.
3. **Modelado de Estado de Ánimo Variable:** Basado en el modelo de Kirby et al., Laika expresa variaciones de ánimo autónomas pero coherentes con el entorno de la nave, volviéndola un agente orgánico en lugar de un software estático.

### 4.3 Integración con Jardinería Espacial (*Space Gardening*)
El HRP de la NASA investiga la jardinería en el espacio (*Veggie / Space Gardening*) como contramedida psicológica contra el aislamiento. Laika conecta el cuidado de la salud física con el crecimiento de las plantas en el módulo agrícola de la nave: al cumplir metas de salud, Laika "ayuda" a optimizar los ciclos de luz y riego de los cultivos, recompensando al astronauta con alimentos frescos e indicadores visuales de florecimiento.

---

## 5. Especificación de Componentes UI/UX y Sistema de Diseño

### 5.1 Mapeo Corporal Interactivo 3D/2D
El módulo de diagnóstico de Laika incluye un avatar humanoide navegable basado en los principios Gestalt de percepción visual y el modelo de Donald Norman (Etapas de Percepción, Cognición y Acción):

* **Organización Visual:** Ley de Agrupamiento y Proximidad para vincular indicadores fisiológicos (ej. presión arterial y ritmo cardíaco agrupados cerca del tórax).
* **Interacción Directa:** Cada región corporal es seleccionable mediante interfaz táctil. Al seleccionar una zona (ej. ojos), la interfaz despliega:
  1. Estado actual y tendencia ($24\text{h} / 7\text{d}$).
  2. Riesgo asociado según el marco de la NASA (ej. SANS).
  3. Lista de acciones preventivas o tratamientos disponibles en la nave.

### 5.2 Codificación Cromática e Interacción Calma (*Calm Palette*)
La interfaz utiliza una paleta cromática de alto contraste optimizada para entornos de iluminación espacial, evitando tonos rojos agresivos salvo en emergencias críticas:

* **Estado Óptimo (Verde Mente / #2D8A56):** Indicadores en rango nominal. Laika luce relajada.
* **Atención Sugerida (Ámbar Calmo / #D98A2B):** Ligera desviación. Laika muestra curiosidad sin saturar.
* **Intervención Requerida (Azul Cobalto / #1D5C96):** Necesidad de acción terapéutica (ej. colocar manguitos).
* **Alerta Crítica (Coral Espacial / #C84B31):** Riesgo inmediato o pico ambiental.

### 5.3 Micro-interacciones Táctiles y Hápticas (< 4 Segundos)
Siguiendo los conceptos de Ashbrook y Dingler sobre micro-interacciones en computación calma:

* Toda acción de registro rutinario debe completarse en **menos de 4 segundos** (un toque para confirmar medición, un deslizamiento para registrar estado de ánimo).
* Retroalimentación háptica adaptativa: el dispositivo emite patrones de frecuencia baja (40-60 Hz) que simulan pulsaciones biológicas relajantes durante las interacciones táctiles directas.

---

## 6. Modelos de Datos e Integración Técnica (JSON Schemas)

Para garantizar la interoperabilidad con los sistemas de aviónica de la nave y los sensores médicos, se definen las siguientes estructuras de datos estándar en formato JSON.

### 6.1 Schema de Ingesta de Telemetría de Salud (`HealthTelemetryEvent`)

```json
{
  "title": "HealthTelemetryEvent",
  "type": "object",
  "properties": {
    "timestamp": { "type": "string", "format": "date-time" },
    "astronaut_id": { "type": "string" },
    "vital_signs": {
      "type": "object",
      "properties": {
        "heart_rate_bpm": { "type": "number" },
        "hrv_ms": { "type": "number" },
        "blood_pressure": {
          "type": "object",
          "properties": {
            "systolic": { "type": "number" },
            "diastolic": { "type": "number" }
          }
        },
        "blood_glucose_mg_dl": { "type": "number" },
        "body_temp_celsius": { "type": "number" },
        "sleep_duration_hours": { "type": "number" }
      }
    },
    "environmental_hazards": {
      "type": "object",
      "properties": {
        "cans_neutron_dose_uSv_h": { "type": "number" },
        "ambient_co2_percentage": { "type": "number" }
      }
    }
  }
}
```

### 6.2 Schema de Estado del Acompañante (`LaikaStateEvent`)

```json
{
  "title": "LaikaStateEvent",
  "type": "object",
  "properties": {
    "timestamp": { "type": "string", "format": "date-time" },
    "current_system_state": {
      "type": "string",
      "enum": ["PERIPHERAL_PASSIVE", "MICRO_INTERACTION", "THERAPEUTIC_INTERVENTION", "CRITICAL_ALERT"]
    },
    "laika_vitality_score": { "type": "number" },
    "active_emotion_display": {
      "type": "string",
      "enum": ["JOYFUL", "CALM", "CURIOUS", "TIRED", "CONCERNED", "PROTECTIVE"]
    },
    "prescribed_actions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "action_id": { "type": "string" },
          "target_hazard": { "type": "string" },
          "description": { "type": "string" },
          "estimated_duration_min": { "type": "integer" }
        }
      }
    }
  }
}
```

---

## 7. Conclusiones y Hoja de Ruta de Desarrollo

La especificación de **Laika** demuestra que la combinación de un monitoreo biomédico riguroso —alineado con las investigaciones del HRP de la NASA y la CSA— con una interfaz relacional guiada por la psicología del apego y la computación calma, ofrece una solución integral para los riesgos de misiones espaciales profundas. 

Al transformar la toma de muestras y la mitigación de peligros en una experiencia de cuidado reflejo y soporte mutuo, Laika no solo preserva la salud física del astronauta frente a la radiación, el SANS y el deterioro cardiovascular, sino que protege activamente su bienestar emocional y la cohesión psicológica durante el largo viaje a través del cosmos.
