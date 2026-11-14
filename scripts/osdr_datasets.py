"""Busca estudios en el NASA Open Science Data Repository (OSDR).

Uso: python scripts/osdr_datasets.py [termino] [cantidad]
Ejemplo: python scripts/osdr_datasets.py astronaut 10
"""
import json
import sys
import urllib.parse
import urllib.request

SEARCH = "https://osdr.nasa.gov/osdr/data/search"


def buscar(termino: str, cantidad: int = 10) -> list[dict]:
    q = urllib.parse.urlencode({"term": termino, "type": "cgene", "size": cantidad})
    req = urllib.request.Request(f"{SEARCH}?{q}", headers={"User-Agent": "astronaut-health-docs/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)["hits"]["hits"]


def main() -> None:
    termino = sys.argv[1] if len(sys.argv) > 1 else "astronaut"
    cantidad = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    for hit in buscar(termino, cantidad):
        s = hit["_source"]
        acc = s.get("Accession", "?")
        print(f"- {acc}: {s.get('Study Title', '(sin título)')}")
        print(f"  https://osdr.nasa.gov/bio/repo/data/studies/{acc}")


if __name__ == "__main__":
    main()
