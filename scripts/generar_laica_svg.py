"""Genera assets/laica/laica.svg (imagen estática, estado reposo) a partir de assets/laica/laica.js.

Uso: python scripts/generar_laica_svg.py
Edita siempre laica.js; este script copia el dibujo y los estilos a un SVG independiente
(para el README, el ícono de la app y cualquier lugar donde no se pueda usar JavaScript).
"""
import re
import shutil
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
JS = RAIZ / "assets" / "laica" / "laica.js"
SVG = RAIZ / "assets" / "laica" / "laica.svg"
ICONO = RAIZ / "app" / "public" / "icon.svg"

js = JS.read_text(encoding="utf-8")
dibujo = re.search(r"const SVG = `\n?(.*?)`;", js, re.S).group(1)
estilos = re.search(r"const CSS = `\n?(.*?)`;", js, re.S).group(1)

apertura = re.search(r"<svg[^>]*>", dibujo)
etiqueta = apertura.group(0).replace('class="laica"', 'class="laica e-reposo"')
if "xmlns=" not in etiqueta:
    etiqueta = etiqueta.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)

salida = (
    "<!-- Generado desde laica.js (estado: reposo). Edita laica.js, no este archivo. -->\n"
    + etiqueta + "\n  <style>\n" + estilos + "  </style>" + dibujo[apertura.end():]
)
SVG.write_text(salida.strip() + "\n", encoding="utf-8")
shutil.copyfile(SVG, ICONO)
print(f"{SVG.relative_to(RAIZ)} y {ICONO.relative_to(RAIZ)} actualizados")
