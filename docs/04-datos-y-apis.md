# 4. Datos abiertos y APIs de NASA

## 4.1 Open Science Data Repository (OSDR) — incluye GeneLab y ALSDA

Datos de biología espacial: ómicas, fisiología, estudios de astronautas y modelos animales.

- Portal: https://science.nasa.gov/biological-physical/data/
- Repositorio de estudios: https://osdr.nasa.gov/bio/repo/
- API de metadatos y datos: https://visualization.osdr.nasa.gov/biodata/api/

```bash
# Lista de datasets (OSD-1, OSD-2, ...)
curl "https://visualization.osdr.nasa.gov/biodata/api/v2/datasets/?format=json"

# Búsqueda de estudios con astronautas
curl "https://osdr.nasa.gov/osdr/data/search?term=astronaut&type=cgene&size=10"
```

Script: [`scripts/osdr_datasets.py`](../scripts/osdr_datasets.py)

## 4.2 NASA Technical Reports Server (NTRS)

Más de 500 000 documentos técnicos de NASA, con API pública sin clave.

- Portal: https://ntrs.nasa.gov/
- API: `https://ntrs.nasa.gov/api/citations/search?q=<términos>`

```bash
curl "https://ntrs.nasa.gov/api/citations/search?q=astronaut%20health%20monitoring&size=5"
```

Búsquedas útiles para este reto:

- `astronaut health monitoring wearable`
- `Earth independent medical operations`
- `spaceflight bone loss countermeasures`
- `behavioral health long duration isolation`
- `Integrated Medical Model`
- `Spaceflight Standard Measures`
- `exploration medical capability decision support`

Script: [`scripts/buscar_ntrs.py`](../scripts/buscar_ntrs.py)

## 4.3 NASA Life Sciences Portal (NLSP, antes LSDA)

Archivo de experimentos de ciencias de la vida y datos de salud de astronautas (parte de acceso público, parte bajo solicitud).

- Portal: https://nlsp.nasa.gov/
- Información en HRP: https://www.nasa.gov/hrp/nlsp/

## 4.4 Clima espacial (DONKI)

La **Database Of Notifications, Knowledge, Information** registra fulguraciones solares (FLR), eventos de partículas energéticas (SEP), tormentas geomagnéticas (GST) y CME. Útil para generar **alertas de radiación** y recomendar refugio.

- Herramienta: https://ccmc.gsfc.nasa.gov/tools/DONKI/
- API (clave gratuita en https://api.nasa.gov/, o `DEMO_KEY` para pruebas; máximo 60 días por consulta):

```bash
curl "https://api.nasa.gov/DONKI/SEP?startDate=2026-09-01&endDate=2026-10-30&api_key=DEMO_KEY"
curl "https://api.nasa.gov/DONKI/FLR?startDate=2026-09-01&endDate=2026-10-30&api_key=DEMO_KEY"
```

Script: [`scripts/donki_radiacion.py`](../scripts/donki_radiacion.py)

## 4.5 Otros catálogos

| Recurso | Enlace |
|---|---|
| Catálogo de datos abiertos de NASA | https://data.nasa.gov/ |
| ISS Research Explorer (experimentos a bordo, muchos de salud) | https://www.nasa.gov/mission/station/research-explorer/ |
| Investigación y tecnología en la ISS | https://www.nasa.gov/international-space-station/space-station-research-and-technology/ |
| Ciencia financiada por HRP (FY24, PDF) | https://www.nasa.gov/wp-content/uploads/2025/03/final-fy24-hrp-funded-science-002-1.pdf |
| Informe anual OCHMO 2024 (PDF) | https://www.nasa.gov/wp-content/uploads/2025/07/ochmo-2024-annual-report-final.pdf |

## 4.6 Ideas para usar los datos en el prototipo

- **Datos sintéticos realistas:** genera series de FC, sueño y masa corporal con las tendencias descritas en los evidence reports para probar las alertas.
- **Feed de radiación en vivo:** consulta DONKI cada hora y cruza los eventos SEP con la ubicación de la nave.
- **Biblioteca de conocimiento:** indexa los boletines OCHMO y los resultados de NTRS para que el astronauta busque "qué hacer si…" sin conexión.
