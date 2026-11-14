# 🧑‍🚀 Monitorización de Salud para Astronautas — Kit de documentación NASA

Repositorio de referencia para el reto **"Crear software de monitorización de la salud para astronautas en misiones espaciales"**.

> Las misiones de larga duración exponen a los astronautas a radiación espacial, aislamiento y confinamiento, gravedad alterada y un entorno cerrado y hostil, lo que puede provocar cambios en el sistema inmunitario, pérdida ósea, eventos cardiovasculares y problemas de salud mental. En misiones largas los astronautas son en gran medida responsables de detectar estos cambios en sí mismos. **El reto:** desarrollar un software que recopile indicadores de salud y permita a los astronautas evaluar su estado y actuar en consecuencia.

Aquí se reúne la documentación **oficial de NASA** (y de agencias socias) más útil para diseñar, justificar y construir la solución. Todos los enlaces fueron verificados el 2026‑11‑14 con `python scripts/verificar_enlaces.py`.

## 📚 Índice

| # | Documento | Para qué sirve |
|---|-----------|----------------|
| 1 | [Riesgos de salud en el espacio](docs/01-riesgos-salud.md) | Los 5 peligros (RIDGE) y los riesgos oficiales del Human Research Program |
| 2 | [Estándares NASA‑STD‑3001 y boletines técnicos](docs/02-estandares-nasa-std-3001.md) | Requisitos médicos oficiales: lo que tu software debe vigilar |
| 3 | [Indicadores de salud y sensores](docs/03-indicadores-y-sensores.md) | Qué medir por sistema corporal, con qué y cada cuánto |
| 4 | [Datos abiertos y APIs de NASA](docs/04-datos-y-apis.md) | OSDR, NTRS, NLSP, DONKI (clima espacial) con ejemplos |
| 5 | [Salud mental, análogos y autonomía médica](docs/05-salud-mental-y-autonomia.md) | HERA, CHAPEA, Twins Study, comportamiento y rendimiento |
| 6 | [Propuesta de arquitectura del software](docs/06-propuesta-arquitectura.md) | Diseño sugerido, alertas, modelo de datos, MVP |
| 7 | [Glosario](docs/07-glosario.md) | Siglas NASA (SANS, HRP, OCHMO, BHP…) |
| 8 | [Cómputo, IA y limitaciones](docs/08-computo-ia-y-limitaciones.md) | Hardware a bordo, radiación, SWaP, visión artificial vs. alternativas |
| 9 | [Matriz de riesgo de indicadores](docs/09-matriz-riesgo-indicadores.md) | 46 indicadores con probabilidad × gravedad, frecuencia de medición, formas de recolectarlos, instrumentación disponible a bordo y viabilidad por cámara ([CSV](data/indicadores.csv)) |
| 10 | [Soluciones similares](docs/10-soluciones-similares.md) | CMO‑DA (NASA+Google), AMOS, Astroskin, Cognition, CIMON, EXPAND, proyectos de Space Apps… y qué hueco cubrimos |

## 🗂️ Datos

| Carpeta / archivo | Contenido |
|---|---|
| [`data/indicadores.csv`](data/indicadores.csv) | Los 46 indicadores de la matriz de riesgo |
| [`data/salud/`](data/salud/) | Estrés, aislamiento y conexión social: documentos de **OMS, OPS y MSP Ecuador** e instrumentos de medición (WHO‑5, PSS, PHQ, GAD, UCLA‑3, Lubben…) |

## 🛠️ Scripts

| Script | Qué hace |
|--------|----------|
| [`scripts/buscar_ntrs.py`](scripts/buscar_ntrs.py) | Busca papers técnicos en el NASA Technical Reports Server |
| [`scripts/osdr_datasets.py`](scripts/osdr_datasets.py) | Lista datasets del Open Science Data Repository (OSDR) |
| [`scripts/donki_radiacion.py`](scripts/donki_radiacion.py) | Descarga eventos de partículas solares (SEP) y fulguraciones de DONKI |
| [`scripts/verificar_enlaces.py`](scripts/verificar_enlaces.py) | Comprueba que todos los enlaces del repo sigan vivos |
| [`scripts/generar_matriz.py`](scripts/generar_matriz.py) | Regenera la matriz de riesgo (Markdown y CSV) a partir de la lista de indicadores |

Solo usan la biblioteca estándar de Python 3.9+:

```bash
python scripts/buscar_ntrs.py "bone loss countermeasures"
python scripts/osdr_datasets.py
python scripts/donki_radiacion.py 2026-10-01 2026-10-31
python scripts/verificar_enlaces.py
```

## 🔗 Las 10 fuentes imprescindibles

1. **Human Research Program (HRP)** — https://www.nasa.gov/hrp/
2. **5 Hazards of Human Spaceflight** — https://www.nasa.gov/hrp/hazards/
3. **Human Research Roadmap (riesgos + evidence reports)** — https://humanresearchroadmap.nasa.gov/
4. **NASA‑STD‑3001 Vol. 1 (salud de la tripulación)** — https://www.nasa.gov/reference/nasa-std-3001v1/
5. **NASA‑STD‑3001 Vol. 2 (factores humanos y hábitat)** — https://www.nasa.gov/reference/nasa-std-3001v2/
6. **Boletines técnicos OCHMO** — https://www.nasa.gov/ochmo/hsa-standards/ochmo-technical-briefs/
7. **NASA Twins Study** — https://www.nasa.gov/humans-in-space/twins-study/
8. **Open Science Data Repository (OSDR)** — https://science.nasa.gov/biological-physical/data/
9. **NASA Technical Reports Server (NTRS)** — https://ntrs.nasa.gov/
10. **NASA Life Sciences Portal (NLSP, antes LSDA)** — https://nlsp.nasa.gov/

## ⚠️ Aviso

Material educativo para un reto/hackathon. No es un dispositivo médico ni sustituye el criterio de un médico de vuelo. Los umbrales citados provienen de documentos NASA públicos; revisa siempre la versión vigente del estándar.

## Licencia

Textos propios bajo CC BY 4.0; código bajo MIT. El contenido de NASA citado es, en general, de dominio público (revisa las NASA Media Usage Guidelines).
