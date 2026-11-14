# 0. El reto oficial 2026 y cómo lo cubre este repo

Enunciado oficial: [Create Health Monitoring Software for Astronauts on Space Missions](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/) (NASA Space Apps Challenge 2026).

## 0.1 Resumen del enunciado

En misiones largas los astronautas sufren radiación, aislamiento y confinamiento, gravedad alterada y un entorno cerrado y hostil. Lejos de la Tierra, ellos mismos deben detectar los cambios en su salud. **El reto:** crear un software que recoja indicadores de salud y ayude al astronauta a evaluar su estado y actuar.

- **Indicadores de ejemplo:** presión arterial, frecuencia cardiaca, glucosa en sangre, temperatura corporal, horas de sueño y estado de ánimo.
- **Entrada de datos:** teclado, clics de ratón o imágenes de cámara.
- **Interfaz:** con animaciones e interactividad, por ejemplo una figura del cuerpo humano en la que se pueda hacer clic.
- **Entornos posibles:** nave, estación, rover o base planetaria.
- **Funciones opcionales:** recordatorios periódicos, gamificación, gráficos dinámicos en el tiempo, código de colores, instrucciones simples y explicaciones.

## 0.2 Preguntas guía y dónde se responden

| Pregunta del reto | Respuesta corta | Dónde |
|---|---|---|
| ¿Qué mediciones se pueden hacer en el espacio? | Columna "instrumentación a bordo" (disponible, limitada, casi imposible) para 47 indicadores | [03](03-indicadores-y-sensores.md), [09](09-matriz-riesgo-indicadores.md) |
| ¿Por qué hace falta cada examen? | Cada indicador está ligado a un riesgo del HRP | [01](01-riesgos-salud.md), [09](09-matriz-riesgo-indicadores.md) |
| ¿Cómo afectan los peligros a los indicadores? | Los 5 peligros (RIDGE) y su efecto por sistema corporal | [01](01-riesgos-salud.md), [05](05-salud-mental-y-autonomia.md) |
| ¿Cuándo un resultado merece atención de la tripulación o del médico de vuelo? | Umbrales de NASA‑STD‑3001 y niveles 🟢🟡🟠🔴 | [02](02-estandares-nasa-std-3001.md), [06](06-propuesta-arquitectura.md) §6.4 |
| ¿Qué acciones preventivas se pueden tomar? | Contramedidas por riesgo (ejercicio, dieta, refugio, sueño, apoyo psicológico) | [01](01-riesgos-salud.md), [05](05-salud-mental-y-autonomia.md), [data/salud](../data/salud/) |

## 0.3 Lista de requisitos

| Requisito | Estado | Dónde |
|---|---|---|
| Lista de indicadores con frecuencia y forma de medirlos | ✅ Hecho | [09](09-matriz-riesgo-indicadores.md), [CSV](../data/indicadores.csv) |
| Glucosa en sangre (citada en el enunciado) | ✅ Hecho (ME‑01) | [09](09-matriz-riesgo-indicadores.md) |
| Estado de ánimo con instrumentos validados | ✅ Hecho (WHO‑5, PSS, PHQ, GAD, UCLA‑3) | [data/salud](../data/salud/) |
| Entrada por cámara, con privacidad por diseño | ✅ Analizado | [08](08-computo-ia-y-limitaciones.md), [09](09-matriz-riesgo-indicadores.md) §9.7 |
| Animaciones e interactividad | 🟡 Mascota lista; falta la app | [11](11-mascota-laica.md) |
| Figura del cuerpo humano clicable | ⬜ Por construir | [12](12-plan-de-proyecto.md) |
| Código de colores y alertas | 🟡 Diseñado | [06](06-propuesta-arquitectura.md) |
| Gráficos en el tiempo | ⬜ Por construir | [12](12-plan-de-proyecto.md) |
| Recordatorios y gamificación | 🟡 Diseñado (personalidad de Laica) | [12](12-plan-de-proyecto.md) |
| Instrucciones y explicaciones simples | 🟡 Diseñado (Laica explica) | [11](11-mascota-laica.md), [12](12-plan-de-proyecto.md) |
| Entornos: nave, estación, rover, base | 🟡 Perfiles de misión en el plan | [12](12-plan-de-proyecto.md) |

## 0.4 Recursos oficiales del reto

| Recurso | Agencia | En el repo |
|---|---|---|
| [5 Hazards of Human Spaceflight](https://www.nasa.gov/hrp/hazards/) | NASA | [01](01-riesgos-salud.md) |
| [Human Research Program Risks](https://www.nasa.gov/hrp/risks/) | NASA | [01](01-riesgos-salud.md) |
| [Ongoing HRP Research](https://www.nasa.gov/hrp/ongoing-hrp-research/) | NASA | [01](01-riesgos-salud.md) |
| [Monitoring Radiation for Astronaut Health](https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp) | Agencia Espacial Canadiense (CSA) | Nuevo: base para RA‑01/RA‑02 |
| [Why Do We Conduct Science Experiments in Space?](https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp) | CSA | Nuevo: contexto para el pitch |
