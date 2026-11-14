"""Consulta eventos de partículas solares (SEP) y fulguraciones (FLR) en NASA DONKI.

Uso: python scripts/donki_radiacion.py AAAA-MM-DD AAAA-MM-DD
La API admite como máximo 60 días por consulta. Define NASA_API_KEY para usar tu clave
(gratis en https://api.nasa.gov/); si no, se usa DEMO_KEY.
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

BASE = "https://api.nasa.gov/DONKI"


def consultar(tipo: str, inicio: str, fin: str) -> list[dict]:
    q = urllib.parse.urlencode({
        "startDate": inicio,
        "endDate": fin,
        "api_key": os.environ.get("NASA_API_KEY", "DEMO_KEY"),
    })
    try:
        with urllib.request.urlopen(f"{BASE}/{tipo}?{q}", timeout=60) as resp:
            return json.load(resp) or []
    except urllib.error.HTTPError as exc:
        # 429 = límite de DEMO_KEY alcanzado; usa tu propia clave en NASA_API_KEY
        print(f"  (no se pudo consultar {tipo}: HTTP {exc.code})")
        return []


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    inicio, fin = sys.argv[1], sys.argv[2]

    seps = consultar("SEP", inicio, fin)
    print(f"Eventos SEP (riesgo de radiación para la tripulación): {len(seps)}")
    for e in seps:
        print(f"  - {e.get('eventTime')}  {e.get('sepID')}")

    flares = consultar("FLR", inicio, fin)
    fuertes = [f for f in flares if str(f.get("classType", "")).startswith("X")]
    print(f"Fulguraciones: {len(flares)} (clase X: {len(fuertes)})")
    for f in fuertes:
        print(f"  - {f.get('peakTime')}  {f.get('classType')}")


if __name__ == "__main__":
    main()
