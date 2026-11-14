# 12. Plan de proyecto: app de salud con Laica

Este plan junta todo lo del repo en un solo producto. Parte de los requisitos oficiales ([00](00-reto-oficial.md)), la matriz de 47 indicadores ([09](09-matriz-riesgo-indicadores.md)), los instrumentos de salud mental ([data/salud](../data/salud/)), los límites de cómputo ([08](08-computo-ia-y-limitaciones.md)) y la mascota Laica ([11](11-mascota-laica.md)).

## 12.1 La idea en una frase

**Una app offline donde Laica, una corgi astronauta, acompaña al tripulante cada día, le pide sus datos de salud, le explica qué significan y le avisa a tiempo, con cariño, humor y competencia.**

Lo que nos diferencia de las soluciones similares ([10](10-soluciones-similares.md)): ellas miden bien pero no acompañan. En una misión a Marte, con 20 minutos de retraso en las comunicaciones, el aislamiento es un riesgo tan real como la radiación. Laica cubre ese hueco.

## 12.2 La personalidad de Laica

Tomamos rasgos (no personajes ni frases) de tres referencias y los unimos en una sola personalidad.

| Referencia | Rasgo que rescatamos | Cómo se ve en Laica | Por qué ayuda a la salud |
|---|---|---|---|
| **Wilson** (*Náufrago*) | Compañía en el aislamiento: alguien a quien hablarle, que "escucha" y está siempre ahí | Saluda cada mañana, recuerda lo que el tripulante le contó, tiene un diario de conversación, celebra fechas personales, nunca juzga | El aislamiento y la falta de contacto son riesgos del HRP; un compañero constante reduce la soledad percibida (UCLA‑3) |
| **Duo** (Duolingo) | Humor, sarcasmo suave, insistencia simpática, rachas | Recordatorios con gracia, rachas de check‑in, bromas cuando todo va bien, "culpa" juguetona si el tripulante se salta un registro | La constancia de los datos es lo que hace útil el monitoreo; el humor hace que el recordatorio no se sienta como una orden |
| **JARVIS** (*Iron Man*) | Asistente competente, proactivo, conciso, con humor seco | Lee los datos, se adelanta ("viene una tormenta solar en 6 h"), explica en lenguaje simple, propone acciones y escala al médico de vuelo | Autonomía médica: en Marte el tripulante decide solo; necesita un asistente que entienda los datos |

### Reglas de tono: cuándo se permite el humor

El humor es bueno para el ánimo, pero un chiste en mal momento rompe la confianza. Laica ajusta el tono según el nivel de alerta:

| Situación | Lado que manda | Humor | Ejemplo (frases propias) |
|---|---|---|---|
| 🟢 Todo bien | Duo + Wilson | Alto | "Siete días seguidos registrando tu sueño. Ya duermes mejor que yo, y yo duermo 14 horas." |
| Se salta un registro | Duo | Medio | "No vi tu presión de hoy. No es que lo esté contando… son 2 días. Pero quién lleva la cuenta." |
| 🟡 Algo cambió | JARVIS | Bajo | "Tu frecuencia en reposo subió 8 lpm en 3 días. No es grave, pero conviene dormir más. ¿Te explico por qué?" |
| 🟠 / 🔴 Alerta | JARVIS | **Ninguno** | "Presión 165/105. Siéntate y repite la medición en 5 minutos. Si sigue igual, aviso al médico de vuelo." |
| ☢️ Radiación (DONKI) | JARVIS | **Ninguno** | "Evento de partículas solares. Ve al refugio ahora. Te aviso cuando baje." |
| Estrés o ánimo bajo | Wilson | **Ninguno** | "Hoy no hace falta hacer nada más. ¿Quieres respirar conmigo un minuto?" |

**Límites que nunca se cruzan:**

- Nunca hace bromas sobre el cuerpo, el peso, el ánimo o una alerta.
- El sarcasmo apunta a Laica misma o a la situación, nunca a la persona.
- El tripulante elige el nivel de humor (0 apagado, 1 suave, 2 normal, 3 "modo Duo"). Con PSS o PHQ altos, el humor baja solo.
- Laica sugiere; el tripulante decide. En 🔴 escala al médico de vuelo cuando haya comunicación.
- Laica no es psicóloga. Ante señales de riesgo (PHQ ítem 9) da el protocolo y avisa a la tripulación o a tierra.

### Memoria de Wilson (local y privada)

Laica recuerda cosas pequeñas para que la compañía se sienta real: nombre, cumpleaños, familia, gustos, cómo durmió ayer, qué le preocupaba. Todo queda **en el dispositivo**, el tripulante puede verlo y borrarlo, y nada se envía a tierra sin su permiso (misma privacidad por diseño que en [09](09-matriz-riesgo-indicadores.md) §9.7.5).

### Cómo se implementa (sin nube)

En el espacio no hay internet y el cómputo es limitado ([08](08-computo-ia-y-limitaciones.md)). Por eso:

1. **MVP:** banco de frases en JSON, etiquetadas por estado, nivel de alerta, nivel de humor y tipo de evento. Un motor de reglas elige la frase y la animación de Laica. Es predecible, auditable y funciona en cualquier equipo.
2. **Versión 2 (opcional):** un modelo de lenguaje pequeño y local que reescribe la frase con la memoria del tripulante. El motor de reglas sigue decidiendo el nivel de alerta y la acción; el modelo solo cambia las palabras. En alertas 🟠/🔴 se usa la frase fija, sin modelo.

## 12.3 Qué hace la app (alcance)

| Módulo | Qué hace | Requisito oficial | Base en el repo |
|---|---|---|---|
| Check‑in diario con Laica | Saludo, preguntas cortas, sueño, ánimo (WHO‑5 semanal) | Recordatorios, estado de ánimo | [data/salud](../data/salud/), [11](11-mascota-laica.md) |
| Registro de signos | Presión, FC, glucosa, temperatura, peso, SpO₂ por teclado o clic | Entrada por teclado y ratón | [09](09-matriz-riesgo-indicadores.md) |
| Cuerpo clicable | Silueta SVG; cada zona se colorea según su peor indicador y al hacer clic muestra los datos y por qué importan | Figura humana clicable, código de colores | [01](01-riesgos-salud.md), [03](03-indicadores-y-sensores.md) |
| Motor de alertas | Reglas con umbrales de NASA‑STD‑3001 → 🟢🟡🟠🔴 → estado de Laica | Cuándo pedir atención | [02](02-estandares-nasa-std-3001.md), [06](06-propuesta-arquitectura.md) §6.4 |
| Gráficos | Tendencia de cada indicador por día, semana y misión | Gráficos dinámicos | [06](06-propuesta-arquitectura.md) §6.3 |
| Radiación | Eventos de DONKI (en tierra) o dosímetro simulado (a bordo) | Peligro de radiación | [04](04-datos-y-apis.md), `scripts/donki_radiacion.py` |
| Cámara (opcional) | Frecuencia cardiaca por rPPG y postura; solo números, sin guardar imágenes | Entrada por cámara | [08](08-computo-ia-y-limitaciones.md), [09](09-matriz-riesgo-indicadores.md) §9.7 |
| Gamificación | Rachas, insignias de misión, Laica celebra | Gamificación | [11](11-mascota-laica.md) |
| Perfil de misión | Estación, nave, rover o base: cambia retraso de comunicación, frecuencia y riesgos activos | Entornos | [01](01-riesgos-salud.md) |
| Explicaciones | Cada dato tiene un "¿por qué?" de 2 líneas que Laica lee | Instrucciones simples | [07](07-glosario.md) |

**Fuera del MVP:** diagnóstico médico, sensores reales conectados, cuentas en la nube.

## 12.4 Tecnología

- **App:** React + Vite como PWA offline (IndexedDB para los datos). Funciona en las laptops con Windows del equipo, en tableta y en el navegador del jurado, sin instalar nada.
- **Mascota:** el componente `<laica-mascota>` que ya existe.
- **Gráficos:** una biblioteca ligera (por ejemplo Chart.js).
- **Cámara:** MediaPipe o rPPG en el navegador, todo local.
- **Datos de prueba:** un generador que simula 30 días de un tripulante con eventos (mala noche, tormenta solar, presión alta) para la demo.

## 12.5 Fases

| Fase | Entregable | Hecho cuando… |
|---|---|---|
| 0. Documentación | Este repo | ✅ Listo |
| 1. Base | PWA, modelo de datos, generador de datos de prueba ([app/](../app/)) | ✅ Listo: la app abre offline y muestra 30 días simulados |
| 2. Registro y alertas | Formularios de signos y motor de reglas con 🟢🟡🟠🔴 | Meter 165/105 pone la alerta en 🔴 |
| 3. Cuerpo clicable | Silueta SVG con zonas coloreadas y panel de detalle | Clic en el corazón muestra FC, presión y su riesgo |
| 4. Laica con personalidad | Banco de frases (≈150), reglas de tono, memoria local, check‑in diario | Laica cambia de tono según la alerta y el nivel de humor |
| 5. Gráficos y gamificación | Tendencias, rachas, insignias | Se ve una semana mala y cómo se recupera |
| 6. Extras | Radiación con DONKI, perfiles de misión, cámara rPPG | Una tormenta solar pone a Laica en `radiacion` |
| 7. Entrega | Video de 30 s, demo pública, README final, pitch | Todo enviado en la plataforma de Space Apps |

Si falta tiempo, las fases 1 a 4 ya forman una demo completa. La 6 es opcional.

## 12.6 Guion de la demo (para el video)

1. **Mañana:** Laica saluda por el nombre y recuerda que ayer durmió poco. Check‑in de 30 segundos.
2. **Registro:** se ingresa la presión; el corazón de la silueta se pone ámbar y Laica (modo JARVIS) explica por qué.
3. **Tormenta solar:** llega un evento de DONKI; Laica pasa a `radiacion` y guía al refugio.
4. **Tarde difícil:** el WHO‑5 sale bajo; Laica (modo Wilson) deja el humor y propone respirar juntos.
5. **Cierre:** racha de 7 días; Laica (modo Duo) celebra con una broma.

## 12.7 Roles sugeridos para el equipo

| Rol | Tareas |
|---|---|
| Frontend | PWA, cuerpo clicable, gráficos |
| Lógica y datos | Modelo de datos, motor de alertas, generador de datos de prueba |
| Personalidad y contenido | Banco de frases, reglas de tono, textos de "¿por qué?" (revisar con [data/salud](../data/salud/)) |
| Diseño y Laica | Animaciones, accesibilidad, coherencia visual |
| Pitch | Video, presentación, conexión con los recursos oficiales ([00](00-reto-oficial.md)) |

## 12.8 Riesgos del proyecto

| Riesgo | Plan |
|---|---|
| El humor resulta molesto | Nivel de humor configurable; se apaga solo en alertas y con estrés alto |
| La personalidad parece copia de un personaje | Usamos rasgos, no nombres, voces, imágenes ni frases de las películas o de Duolingo |
| Se cree que es un dispositivo médico | Aviso visible: apoyo educativo, no reemplaza al médico de vuelo |
| La cámara genera dudas de privacidad | Opcional, local, solo guarda números ([09](09-matriz-riesgo-indicadores.md) §9.7.5) |
| Licencia de la imagen original de Laica | Confirmar origen de `laica-original.png` ([11](11-mascota-laica.md) §11.5) |
