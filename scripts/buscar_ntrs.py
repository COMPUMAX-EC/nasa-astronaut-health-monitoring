"""Busca documentos en el NASA Technical Reports Server (NTRS).

Uso: python scripts/buscar_ntrs.py "astronaut health monitoring" [cantidad]
"""
import json
import sys
import urllib.parse
import urllib.request

API = "https://ntrs.nasa.gov/api/citations/search"


def buscar(consulta: str, cantidad: int = 10) -> list[dict]:
    url = f"{API}?{urllib.parse.urlencode({'q': consulta, 'size': cantidad})}"
    req = urllib.request.Request(url, headers={"User-Agent": "astronaut-health-docs/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp).get("results", [])


def main() -> None:
    consulta = sys.argv[1] if len(sys.argv) > 1 else "astronaut health monitoring"
    cantidad = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    for r in buscar(consulta, cantidad):
        anio = (r.get("publications") or [{}])[0].get("publicationDate", "")[:4]
        print(f"- [{anio}] {r.get('title')}")
        print(f"  https://ntrs.nasa.gov/citations/{r.get('id')}")


if __name__ == "__main__":
    main()
