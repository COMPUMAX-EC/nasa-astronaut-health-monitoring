# 8. Recursos computacionales y limitaciones para visión artificial e IA a bordo

Esta guía explica **con qué hardware se cuenta en una nave**, **qué limita** ejecutar visión artificial u otros modelos de IA, y **qué alternativas** hay para monitorear la salud de la tripulación.

> Las cifras marcadas con "≈" son órdenes de magnitud para dimensionar el prototipo, no especificaciones de un vehículo concreto. Para un diseño real consulta las fuentes enlazadas.

## 8.1 Restricciones del entorno espacial

| Restricción | Qué significa | Impacto en una solución de IA |
|---|---|---|
| **SWaP** (Size, Weight and Power: tamaño, masa y energía) | Cada kilo y cada vatio cuesta; la energía se comparte con soporte vital y ciencia | Modelos pequeños, inferencia en CPU o en aceleradores de bajo consumo; nada de servidores con GPU grande |
| **Radiación** | Rayos cósmicos y partículas solares provocan *bit flips* (SEU), bloqueos (latch‑up) y degradación por dosis total (TID) | Pesos del modelo o memoria corruptos → resultados erróneos o caídas. Hace falta ECC, verificación de integridad y reinicio seguro |
| **Térmica** | En microgravedad no hay convección natural; el calor se extrae con ventiladores o placas frías | Límite de potencia sostenida; no se puede "exprimir" un procesador durante horas |
| **Comunicaciones** | La ISS tiene enlace casi continuo; a Marte el retraso es de ≈4 a ≈24 min por sentido, con apagones (conjunción solar) y ancho de banda limitado | La IA debe correr **a bordo y offline**; no se puede depender de la nube. Se sincroniza cuando hay enlace ([DTN](https://www.nasa.gov/communicating-with-missions/delay-disruption-tolerant-networking/)) |
| **Hardware antiguo y certificado** | Los procesadores endurecidos a la radiación van varias generaciones por detrás de los comerciales | Menos rendimiento por vatio; hay que optimizar el modelo |
| **Seguridad y certificación** | Software que influye en decisiones médicas exige validación, trazabilidad y explicabilidad | Preferir modelos interpretables; la IA *asiste*, no decide |
| **Tiempo de la tripulación** | El tiempo del astronauta es el recurso más escaso de la misión | Medición pasiva o de pocos minutos; nada de calibraciones largas |
| **Privacidad** | Cámaras y micrófonos en un hábitat cerrado y compartido | Procesar en el dispositivo, no guardar imágenes crudas, consentimiento explícito |
| **Pocos datos** | Pocos astronautas y casi ningún dato etiquetado de vuelo | Riesgo alto de sobreajuste; usar líneas base personales, análogos y datos sintéticos |

Fuentes: [HPSC – NASA](https://www.nasa.gov/game-changing-development-projects/high-performance-spaceflight-computing-hpsc/) · [NASA Electronic Parts and Packaging (NEPP)](https://nepp.nasa.gov/) · [Radiation Effects and Analysis – GSFC](https://etd.gsfc.nasa.gov/capabilities/capabilities-listing/radiation-effects-and-analysis/) · [System‑Level Radiation Hardening (NTRS)](https://ntrs.nasa.gov/citations/20140010782) · [Riesgo de usar componentes comerciales en la ISS (NTRS)](https://ntrs.nasa.gov/citations/20010038727)

## 8.2 Hardware disponible o en desarrollo

| Clase | Ejemplos | Rendimiento relativo | Adecuado para |
|---|---|---|---|
| **Computadoras de vuelo endurecidas a la radiación** | Procesadores de la familia PowerPC usados en naves y rovers | Muy bajo (cientos de MHz) | Control crítico; reglas simples, no visión |
| **HPSC – High Performance Spaceflight Computing** | Nuevo procesador multinúcleo RISC‑V de NASA y Microchip, tolerante a radiación | ≈100× las computadoras de vuelo actuales, según NASA | IA embebida y autonomía en futuras misiones |
| **Electrónica comercial (COTS) a bordo** | Portátiles comerciales en la ISS; Snapdragon del helicóptero Ingenuity en Marte; Spaceborne Computer‑2 (servidor comercial en la ISS) | Alto, pero sin protección ante radiación | Prototipos y apps de tripulación no críticas |
| **Wearables y microcontroladores** | Monitores fisiológicos como [Bio‑Monitor / Astroskin](https://www.asc-csa.gc.ca/eng/sciences/bio-monitor.asp) | Muy bajo; mW | Captura de señales y preprocesamiento simple |
| **Robots asistentes** | [Astrobee](https://www.nasa.gov/ames/astrobee/) (NASA), [CIMON](https://www.dlr.de/en/research-and-transfer/projects-and-missions/horizons/cimon) (DLR/Airbus) | Variable | Cámaras móviles, interacción por voz |

Documentos NASA de referencia:

- HPSC – página del proyecto: https://www.nasa.gov/game-changing-development-projects/high-performance-spaceflight-computing-hpsc/
- HPSC Program Overview: https://ntrs.nasa.gov/citations/20180003537
- Casos de uso humanos y robóticos para cómputo espacial de alto rendimiento: https://ntrs.nasa.gov/citations/20150007993
- NASA's Vision for Spaceflight Computing: https://ntrs.nasa.gov/citations/20220015330
- Hábitats lunares autónomos y tolerantes a fallos con HPSC: https://ntrs.nasa.gov/citations/20260000719
- Caja HPSC de bajo SWaP para autonomía: https://ntrs.nasa.gov/citations/20260007807
- Benchmark de aplicaciones en Qualcomm Snapdragon: https://ntrs.nasa.gov/citations/20230005660
- Estado del arte de la aviónica de pequeñas naves (SST‑SOA, capítulo de aviónica): https://www.nasa.gov/smallsat-institute/sst-soa/small-spacecraft-avionics/

## 8.3 IA médica autónoma en NASA (el contexto del reto)

NASA trabaja en las **Earth‑Independent Medical Operations (EIMO)**: que la tripulación pueda detectar, diagnosticar y tratar sin depender de la Tierra, apoyada por software de decisión e IA.

| Documento | Enlace |
|---|---|
| EIMO – Concept of Operations (2024) | https://ntrs.nasa.gov/citations/20240001402 |
| EIMO Datascope: retos y soluciones (datos médicos a bordo) | https://ntrs.nasa.gov/citations/20240000914 |
| Estrategia para avanzar en EIMO | https://ntrs.nasa.gov/citations/20220014757 |
| Gestión de la carga de trabajo en EIMO | https://ntrs.nasa.gov/citations/20230015503 |
| Uso de IA en el HRP para mitigar el riesgo médico de exploración (2026) | https://ntrs.nasa.gov/citations/20260001797 |
| MEDICS: sistema de apoyo a decisiones médicas para exploración | https://ntrs.nasa.gov/citations/20200000615 |
| AMOS – guía autónoma de procedimientos médicos (demo en la ISS) | https://ntrs.nasa.gov/citations/20240012964 |
| Demostraciones tecnológicas en la ISS para futuros sistemas médicos | https://ntrs.nasa.gov/citations/20240004905 |
| Entrenamiento "just‑in‑time" para usar instrumentos diagnósticos (ultrasonido) | https://ntrs.nasa.gov/citations/20050218812 |
| Cuestionario de autoevaluación de visión en vuelo | https://ntrs.nasa.gov/citations/20100039152 |

## 8.4 Casos de uso de visión artificial: viabilidad y limitaciones

| Caso de uso | Indicador de salud | Modelo típico | Cómputo ≈ | Limitaciones principales |
|---|---|---|---|---|
| **Forma del ejercicio** (estimación de pose) | Músculo/hueso: técnica en el equipo de ejercicio resistivo, conteo de repeticiones | MoveNet / BlazePose / YOLO‑pose ligero | CPU móvil, ≈1–5 W, tiempo real a baja resolución | Cuerpos flotando y orientaciones raras; los modelos están entrenados en 1 g; espacio estrecho y oclusiones |
| **Frecuencia cardiaca por cámara (rPPG)** | Cardiovascular sin contacto | Procesamiento de señal + CNN pequeña | Bajo | Muy sensible a la luz y al movimiento; un wearable de contacto es más fiable |
| **Expresión facial / fatiga** | Salud mental, somnolencia | Detector facial + clasificador | Bajo–medio | Privacidad, sesgos, poca validez clínica; la cara cambia por el desplazamiento de fluidos (*puffy face*); debe ser opcional |
| **Imagen ocular** (fondo de ojo / OCT) | SANS | CNN de clasificación o segmentación | Medio; análisis ocasional, no continuo | Requiere el equipo de imagen y un operador entrenado; pocos casos etiquetados de vuelo |
| **Ultrasonido guiado** | Trombosis, órganos, vejiga | Segmentación y guía de la sonda | Medio | La IA guía al operador no médico; validación clínica exigente |
| **Lesiones de piel / heridas** | Sistema inmune, infecciones | Clasificador de imágenes | Bajo | Iluminación variable; utilidad como apoyo, no como diagnóstico |
| **Foto de comidas** | Nutrición | Clasificación + estimación de porciones | Bajo–medio | Los envases de comida espacial son estandarizados: un código de barras puede ser más simple y exacto |

**Cómo reducir el costo computacional:**

- Cuantizar a INT8 y usar arquitecturas móviles (MobileNet, EfficientNet‑Lite, YOLO‑nano).
- Ejecutar con TensorFlow Lite, ONNX Runtime u OpenVINO en CPU, sin depender de una GPU.
- Inferir **por eventos** (al hacer ejercicio, una vez al día) en lugar de continuamente.
- Bajar resolución y fps; recortar la región de interés antes del modelo.
- Presupuesto orientativo para el prototipo: modelo < 50 MB, < 5 W sostenidos, < 200 ms por inferencia en CPU.

## 8.5 Tolerancia a fallos (radiación y errores)

1. **Verificar la integridad del modelo** (hash SHA‑256 de los pesos) al arrancar y de forma periódica; si no coincide, recargar desde una copia buena.
2. **Watchdog**: si la inferencia no responde, reiniciar el proceso.
3. **Comprobaciones de plausibilidad**: descartar salidas imposibles (FC de 300 lpm, NaN).
4. **Degradación elegante**: si el modelo falla, volver a reglas simples y cuestionarios.
5. **Redundancia** en decisiones críticas: dos inferencias o dos métodos que deben coincidir.
6. **Memoria ECC** y almacenamiento con corrección de errores cuando sea posible.

## 8.6 Alternativas a la visión artificial (a menudo mejores para el MVP)

| Alternativa | Ventajas | Cuándo usarla |
|---|---|---|
| **Reglas y umbrales del estándar** (NASA‑STD‑3001) | Explicable, certificable, cómputo casi nulo | Siempre como base |
| **Estadística sobre la línea base personal** (z‑score, EWMA, CUSUM, pendiente de tendencia) | Funciona con pocos datos y con cada persona | Detección de cambios lentos: masa, sueño, FC en reposo |
| **ML clásico** (Isolation Forest, regresión, árboles) | Ligero e interpretable | Combinar varias señales de wearables |
| **Señales de wearables** (ECG, VFC, SpO₂, actigrafía) | Medición pasiva, más precisa que la cámara | Cardiovascular, sueño, actividad |
| **Cuestionarios y tests cognitivos breves** (ánimo, PVT) | Validados; dan contexto subjetivo | Salud mental y fatiga |
| **Análisis de voz** en el dispositivo | Sin cámara; detecta estrés y fatiga | Solo con consentimiento; validez aún limitada |
| **LLM pequeño local** como asistente médico | Explica alertas y procedimientos sin conexión | Con base de conocimiento cerrada (boletines OCHMO), sin inventar diagnósticos; requiere más RAM |
| **Gemelo digital / modelos fisiológicos** | Predice la evolución (pérdida ósea, dosis) | Planificación de contramedidas |

## 8.7 Datos para entrenar y validar

- **Pocos sujetos:** usar la línea base personal y modelos que se adapten a cada astronauta.
- **Análogos terrestres:** [HERA](https://www.nasa.gov/mission/hera/), [CHAPEA](https://www.nasa.gov/humans-in-space/chapea/), estudios de reposo en cama.
- **Datos abiertos:** [OSDR](https://science.nasa.gov/biological-physical/data/) (ver [04-datos-y-apis.md](04-datos-y-apis.md)).
- **Datos sintéticos:** generar series con las tendencias descritas en los evidence reports para probar las alertas.
- **Transfer learning:** partir de modelos públicos y ajustarlos con pocas muestras; validar por separado en cada persona (*leave‑one‑subject‑out*).

## 8.8 Recomendación para el reto

1. **Núcleo del MVP sin visión:** wearables + cuestionarios + estadística sobre la línea base + reglas del estándar. Ligero, offline, explicable.
2. **Un módulo de visión como demostración**, por ejemplo la estimación de pose para verificar el ejercicio con un modelo cuantizado en CPU, mostrando consumo y latencia medidos.
3. **Documentar el presupuesto de cómputo**: RAM, CPU, W, MB del modelo y el plan de degradación ante fallos o radiación. Eso demuestra que la solución es viable en una nave real.
