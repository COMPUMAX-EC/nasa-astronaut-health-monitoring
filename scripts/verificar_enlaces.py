"""Verifica que los enlaces http(s) de los archivos Markdown del repo respondan.

Uso: python scripts/verificar_enlaces.py
"""
import pathlib
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PATRON = re.compile(r"https?://[^\s)<>`\"|]+")


def estado(url: str) -> tuple[str, str]:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=40) as resp:
            return url, str(resp.status)
    except Exception as exc:  # noqa: BLE001
        return url, f"ERROR {getattr(exc, 'code', exc)}"


def main() -> None:
    urls = sorted({u.rstrip(".,") for f in RAIZ.rglob("*.md") for u in PATRON.findall(f.read_text("utf-8"))})
    urls = [u for u in urls if "api_key=" not in u and "{" not in u and "<" not in u]
    with ThreadPoolExecutor(8) as pool:
        resultados = list(pool.map(estado, urls))
    fallos = [r for r in resultados if r[1] != "200"]
    for url, st in resultados:
        print(f"{st:>10}  {url}")
    print(f"\n{len(urls) - len(fallos)}/{len(urls)} enlaces OK")
    sys.exit(1 if fallos else 0)


if __name__ == "__main__":
    main()
