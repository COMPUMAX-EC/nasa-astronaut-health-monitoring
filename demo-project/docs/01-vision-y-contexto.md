# 01 · Visión y contexto

## Problema

En misiones de larga duración la tripulación enfrenta los **cinco peligros** del Programa de Investigación Humana (HRP) de la NASA:

1. Radiación espacial
2. Aislamiento y confinamiento
3. Distancia extrema a la Tierra
4. Campos de gravedad variables (microgravedad)
5. Entornos cerrados u hostiles

Los dashboards médicos convencionales generan **agotamiento cognitivo** y fatiga por notificaciones. Además, el retraso de comunicación de hasta **20 minutos** con Control de Misión impide la telemedicina en tiempo real.

## Propuesta

Laika es una plataforma modular que combina:

- **Monitoreo clínico estricto** (vitales, biomarcadores, radiación).
- **Robótica social relacional**: un compañero con personalidad, no una tabla de datos.
- **Calm Technology** (Weiser & Brown): interacción en la periferia de la atención.
- **Neurobiología del apego**: el vínculo con un compañero activa el sistema oxitocinérgico.

```
[Muestras y Sensores] ---> [Motor de Procesamiento Local (Edge AI)]
                                   |
                                   v
             [Máquina de Estados de Laika (Cuidado Reflejo)]
                                   |
       +---------------------------+---------------------------+
       v                                                       v
[Atención Periférica (Calm UI)]               [Atención Focal (Dashboard Interactivo)]
```

## Riesgos que mitiga

| Riesgo | Cómo lo aborda Laika | Fuente de datos |
|---|---|---|
| **Radiación neutrónica** (~30 % de la dosis en la ISS, según la CSA) | Registro continuo de dosis y guía al módulo blindado | Espectrómetro CANS (Canadian Active Neutron Spectrometer) |
| **SANS** (síndrome neuro-ocular por desplazamiento de fluidos) | Detección temprana + protocolo: *thigh cuffs* 45 min y Complejo B | Cuestionario de nitidez, escáner retinal, presión ocular |
| **Inmunodeficiencia / estrés** | Micro-intervenciones preventivas | Biomarcadores en saliva, *Omics Archive*, estudios ARCHeR / Immune Biomarkers (Artemis II) |
| **Sueño inadecuado** | Vitalidad de Laika baja si se duerme < 6 h | Wearable |
| **Aislamiento** | Contacto afectivo táctil, jardinería espacial, diario | Voz, VFC, tiempos de respuesta |
| **Distancia / autonomía médica** | Procesamiento local (edge), evaluación primaria autónoma | — |

## Fundamentos científicos

### Efecto oxitocinérgico (Beetz et al., Uvnäs-Moberg et al.)
El contacto y la atención hacia un compañero regulan el eje HPA:
1. **Menos cortisol** en saliva y suero.
2. **Estabilidad cardiovascular**: baja la presión sistólica, sube la VFC (tono parasimpático).
3. **Efecto ansiolítico**: más sensación de seguridad.

### Calm Technology (Weiser & Brown, Juola)
El sistema vive en la **periferia** de la atención y solo se mueve al **centro** cuando una métrica fisiológica o ambiental exige una acción consciente.

## Principios de producto (no negociables)

1. **Empatía antes que datos**: Laika habla en primera persona; no muestra tablas frías por defecto.
2. **Sin pánico**: incluso en alertas, tono claro, sin sirenas.
3. **Mínima carga cognitiva**: acciones rutinarias < 4 s.
4. **Offline-first**: todo debe funcionar sin conexión.
5. **Trazabilidad clínica**: toda intervención queda registrada para el *Flight Surgeon*.
