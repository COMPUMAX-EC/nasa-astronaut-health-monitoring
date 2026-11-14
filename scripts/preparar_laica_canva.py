"""Prepara las vistas de Laica (diseño de Canva del equipo) para la web y el escritorio.

Uso: python scripts/preparar_laica_canva.py

Lee los originales a calidad completa de assets/laica/canva/originales/ (PNG 1254 px con
transparencia, sin modificar) y escribe en assets/laica/canva/ una versión WebP por vista:
- todas con el MISMO recorte, para que al cambiar de vista (frente, tres cuartos, espalda)
  Laica no salte de lugar;
- 720 px de ancho, suficiente para verse nítida al doble de densidad de pantalla;
- calidad 92 con el canal de transparencia intacto.
"""
from pathlib import Path

from PIL import Image, ImageFilter

RAIZ = Path(__file__).resolve().parent.parent
ORIG = RAIZ / "assets" / "laica" / "canva" / "originales"
SALIDA = RAIZ / "assets" / "laica" / "canva"
VISTAS = ["frente", "izquierda", "derecha", "espalda", "saludando"]
ANCHO = 720

imagenes = {v: Image.open(ORIG / f"{v}.png").convert("RGBA") for v in VISTAS}

# Recorte común: la unión de lo visible en todas las vistas, con un pequeño margen.
cajas = [im.getchannel("A").getbbox() for im in imagenes.values()]
x0 = min(c[0] for c in cajas) - 8
y0 = min(c[1] for c in cajas) - 8
x1 = max(c[2] for c in cajas) + 8
y1 = max(c[3] for c in cajas) + 4
caja = (max(0, x0), max(0, y0), x1, y1)
alto = round(ANCHO * (caja[3] - caja[1]) / (caja[2] - caja[0]))
print("recorte", caja, "→", ANCHO, "x", alto)

for vista, im in imagenes.items():
    chica = im.crop(caja).resize((ANCHO, alto), Image.LANCZOS)
    # Un toque de nitidez para compensar la reducción, sin halos.
    chica = chica.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    destino = SALIDA / f"{vista}.webp"
    chica.save(destino, "WEBP", quality=92, method=6, exact=True)
    print(f"{destino.relative_to(RAIZ)}  {destino.stat().st_size // 1024} KB")

huella = Image.open(ORIG / "huella.png").convert("RGBA")
huella = huella.crop(huella.getchannel("A").getbbox())
huella.thumbnail((256, 256), Image.LANCZOS)
huella.save(SALIDA / "huella.webp", "WEBP", quality=92, method=6, exact=True)
print("assets/laica/canva/huella.webp")
