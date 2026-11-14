"""Verifica que los enlaces http(s) de los archivos Markdown del repo respondan.

Uso: python scripts/verificar_enlaces.py
"""
import pathlib
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PATRON = re.compile(r"https?://[^\s)<>`\"|]+")


UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"


def estado(url: str, intentos: int = 3) -> tuple[str, str]:
    """Devuelve (url, código). Reintenta ante timeouts y errores 5xx (NTRS se satura a veces)."""
    ultimo = ""
    for n in range(intentos):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return url, str(resp.status)
        except Exception as exc:  # noqa: BLE001
            code = getattr(exc, "code", None)
            ultimo = f"ERROR {code or exc}"
            if code and code < 500:
                break
            time.sleep(3 * (n + 1))
    return url, ultimo


def main() -> None:
    urls = sorted({u.rstrip(".,") for f in RAIZ.rglob("*.md") for u in PATRON.findall(f.read_text("utf-8"))})
    urls = [u for u in urls if "api_key=" not in u and "{" not in u and "<" not in u]
    with ThreadPoolExecutor(4) as pool:
        resultados = list(pool.map(estado, urls))
    fallos = [r for r in resultados if r[1] != "200"]
    for url, st in resultados:
        print(f"{st:>10}  {url}")
    print(f"\n{len(urls) - len(fallos)}/{len(urls)} enlaces OK")
    sys.exit(1 if fallos else 0)


if __name__ == "__main__":
    main()
