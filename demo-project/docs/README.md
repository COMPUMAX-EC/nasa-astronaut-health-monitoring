# Documentación del proyecto Laika Polizón

Esta carpeta contiene el contexto funcional y técnico de **Laika**, un compañero digital de monitoreo fisiológico y soporte psicosocial para astronautas en misiones de larga duración (Artemis, Marte). El código vive en el módulo Android `:app` (Kotlin + Jetpack Compose, paquete `nasa.space.app.ec.laikapolizon`).

> Fuente original: `../laika-interaction-flow-docs.md` (especificación general de UX). Estos documentos la dividen por tema y añaden las decisiones de implementación para Android.

## Índice

| # | Documento | Para qué sirve |
|---|-----------|----------------|
| 01 | [Visión y contexto](01-vision-y-contexto.md) | Problema, riesgos espaciales que mitiga y fundamentos científicos |
| 02 | [Máquina de estados](02-maquina-de-estados.md) | Los 4 estados del sistema y las reglas de transición |
| 03 | [Flujos de interacción](03-flujos-de-interaccion.md) | Los 4 flujos de usuario paso a paso |
| 04 | [Vitalidad y gamificación](04-vitalidad-y-gamificacion.md) | Métrica espejo, anti-habituación y jardinería espacial |
| 05 | [Sistema de diseño](05-sistema-de-diseno.md) | Paleta, micro-interacciones, hápticos y mapa corporal |
| 06 | [Modelos de datos](06-modelos-de-datos.md) | JSON Schemas y su equivalente en Kotlin |
| 07 | [Arquitectura Android](07-arquitectura-android.md) | Estructura del proyecto, capas y convenciones |
| 08 | [Glosario](08-glosario.md) | Siglas y términos (HRP, CANS, SANS, VFC…) |
| 09 | [Roadmap y decisiones abiertas](09-roadmap-y-decisiones-abiertas.md) | Alcance del demo, fases y preguntas sin resolver |
| 10 | [Módulos de la app](10-modulos-de-la-app.md) | Screen pet flotante, asistente de voz y registro central de datos |
| 11 | [Red cerrada](11-red-cerrada.md) | Operación sin internet: dependencias descartadas y verificación |
| 12 | [Investigación futura](12-investigacion-futura.md) | Diseño pospuesto: LLM local y biometría afectiva |

## Lectura rápida (TL;DR)

- Laika **refleja** la salud del astronauta: si el astronauta duerme mal, Laika se ve cansada. Cuidar a Laika = cuidarse a sí mismo.
- La UI sigue **Calm Technology**: vive en la periferia de la atención y solo pasa al centro cuando hace falta una acción.
- Hay **4 estados**: `PERIPHERAL_PASSIVE` → `MICRO_INTERACTION` → `THERAPEUTIC_INTERVENTION` → `CRITICAL_ALERT`.
- Todo se procesa **en el dispositivo** (edge): no hay dependencia de la Tierra (hasta 20 min de retraso). La app funciona en **red cerrada**, sin internet ni nube.
- Las interacciones de rutina deben durar **< 4 segundos**.
- El rojo/coral se reserva **solo** para alertas críticas.
- Tres módulos: **screen pet** (Laika flota sobre otras apps), **asistente de voz** ("Laika, …", offline) y **registro central** de mediciones (escritas o dictadas).
