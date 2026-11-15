# Arma index.html (presentación sin internet) a partir de slides/*.html, deck.css y deck.json.
# Uso: python construir.py   (desde esta carpeta o desde la raíz del repo)
import json, os, re

AQUI = os.path.dirname(os.path.abspath(__file__))
leer = lambda n: open(os.path.join(AQUI, n), encoding="utf-8").read()

orden = json.loads(leer("deck.json"))["order"]
css = leer("deck.css")

# Íconos de línea propios (24x24, trazo) para reemplazar <x-icon name="...">
ICONOS = {
    "Activity": '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    "Chat": '<path d="M4 5h16v11H9l-5 4z"/>',
    "Globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    "Lightning": '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    "PaperPlane": '<path d="M21 3 3 10l7 3 3 7z"/><path d="m10 13 4-4"/>',
    "Search": '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    "Star": '<path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z"/>',
    "Users": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.7 3.5 2.8 3.5 5.7"/>',
    "Warning": '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
}

def icono(m):
    attrs, nombre = m.group(1), re.search(r'name="([^"]+)"', m.group(1)).group(1)
    attrs = re.sub(r'\s*name="[^"]*"', "", attrs)
    return (f'<svg{attrs} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONOS.get(nombre, "")}</svg>')

def video(m):
    tag = m.group(0)
    src = re.search(r'data-video="([^"]+)"', tag).group(1)
    poster = re.search(r'\ssrc="([^"]+)"', tag).group(1)
    resto = re.sub(r'\s(src|data-video|alt)="[^"]*"', "", tag[4:-1])
    return f'<video{resto} src="{src}" poster="{poster}" muted loop playsinline preload="auto"></video>'

secciones = []
for id_ in orden:
    s = leer(f"slides/{id_}.html")
    s = re.sub(r"<x-icon([^>]*)></x-icon>", icono, s)
    s = re.sub(r"<img[^>]*data-video=[^>]*>", video, s)
    secciones.append(s)

plantilla = leer("plantilla.html")
html = plantilla.replace("/*DECK_CSS*/", css).replace("<!--SLIDES-->", "\n".join(secciones))
open(os.path.join(AQUI, "index.html"), "w", encoding="utf-8").write(html)
print(f"index.html listo: {len(secciones)} diapositivas")
