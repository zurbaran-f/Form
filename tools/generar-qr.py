#!/usr/bin/env python3
"""Genera los códigos QR que llevan al formulario.

Uso:
    python3 tools/generar-qr.py                       # usa la URL por defecto
    python3 tools/generar-qr.py https://otra-web.com  # usa otra URL

Requiere:  pip install segno pillow fonttools

Crea/actualiza en la carpeta qr/:
    qr-kd.svg / qr-kd.png            el QR con el monograma KD en el centro
    qr-formulario.svg / .png         el QR liso, sin monograma
    cartel.html                      pone al día la URL que muestra el cartel
"""

import io
import pathlib
import re
import sys

import segno
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

URL_POR_DEFECTO = "https://zurbaran-f.github.io/Form/"

MONOGRAMA = "KD"
OSCURO = "#16181d"      # color de los módulos del QR
ACENTO = "#3b5bfd"      # color de las letras
CLARO = "#ffffff"
BORDE = 4               # margen blanco, en módulos (el mínimo del estándar)
LADO_LOGO = 0.26        # lado del recuadro central, respecto al lado del QR
ALTO_LETRAS = 0.46      # alto de las letras, respecto al recuadro

RAIZ = pathlib.Path(__file__).resolve().parent.parent
CARPETA = RAIZ / "qr"
FUENTES = [
    RAIZ / "tools" / "fuentes" / "Outfit-Bold.ttf",
    pathlib.Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
]


def fuente():
    for ruta in FUENTES:
        if ruta.exists():
            return ruta
    raise SystemExit("No encuentro ninguna fuente para dibujar el monograma.")


def glifos(texto, ruta_fuente):
    """Devuelve las letras como trazos vectoriales, para que el SVG no
    dependa de que quien lo abra tenga la fuente instalada."""
    tipo = TTFont(ruta_fuente)
    juego = tipo.getGlyphSet()
    tabla = tipo.getBestCmap()
    alto_mayusculas = getattr(tipo["OS/2"], "sCapHeight", 0) or tipo["head"].unitsPerEm * 0.7

    trazos = []
    for letra in texto:
        nombre = tabla[ord(letra)]
        pluma = SVGPathPen(juego)
        juego[nombre].draw(pluma)
        trazos.append((pluma.getCommands(), juego[nombre].width))
    return trazos, alto_mayusculas


def logo_svg(lado_qr, centro, ruta_fuente):
    lado = lado_qr * LADO_LOGO
    x = centro - lado / 2
    alto = lado * ALTO_LETRAS

    trazos, alto_mayusculas = glifos(MONOGRAMA, ruta_fuente)
    escala = alto / alto_mayusculas
    ancho_total = sum(avance for _, avance in trazos) * escala

    # Si las letras se salieran del recuadro, las encogemos.
    maximo = lado * 0.70
    if ancho_total > maximo:
        escala *= maximo / ancho_total
        ancho_total = maximo

    partes = [
        '<g>',
        f'<rect x="{x:.3f}" y="{x:.3f}" width="{lado:.3f}" height="{lado:.3f}" '
        f'rx="{lado * 0.24:.3f}" fill="{CLARO}" stroke="{ACENTO}" '
        f'stroke-width="{lado * 0.05:.3f}"/>',
    ]

    cursor = centro - ancho_total / 2
    linea_base = centro + alto / 2
    for trazo, avance in trazos:
        partes.append(
            f'<path d="{trazo}" fill="{ACENTO}" '
            f'transform="translate({cursor:.3f} {linea_base:.3f}) '
            f'scale({escala:.6f} {-escala:.6f})"/>'
        )
        cursor += avance * escala

    partes.append('</g>')
    return "".join(partes)


def svg(qr, con_logo, ruta_fuente):
    filas = [list(fila) for fila in qr.matrix]
    n = len(filas)
    total = n + 2 * BORDE

    modulos = "".join(
        f"M{x + BORDE} {y + BORDE}h1v1h-1z"
        for y, fila in enumerate(filas)
        for x, valor in enumerate(fila)
        if valor
    )

    piezas = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total} {total}" '
        f'width="{total * 12}" height="{total * 12}" role="img" '
        f'aria-label="Código QR que abre el formulario de contacto">',
        f'<rect width="{total}" height="{total}" fill="{CLARO}"/>',
        f'<path fill="{OSCURO}" d="{modulos}"/>',
    ]
    if con_logo:
        piezas.append(logo_svg(n, total / 2, ruta_fuente))
    piezas.append("</svg>")
    return "\n".join(piezas)


def png(qr, con_logo, ruta_fuente, escala=14):
    memoria = io.BytesIO()
    qr.save(memoria, kind="png", scale=escala, border=BORDE, dark=OSCURO, light=CLARO)
    memoria.seek(0)
    imagen = Image.open(memoria).convert("RGB")

    if not con_logo:
        return imagen

    n = len(qr.matrix)
    lado_qr = n * escala
    centro = imagen.width / 2
    lado = lado_qr * LADO_LOGO
    x0, x1 = centro - lado / 2, centro + lado / 2
    grosor = max(1, round(lado * 0.05))

    lienzo = ImageDraw.Draw(imagen)
    lienzo.rounded_rectangle(
        [x0, x0, x1, x1],
        radius=lado * 0.24,
        fill=CLARO,
        outline=ACENTO,
        width=grosor,
    )

    # Buscamos el tamaño de letra que deja el alto que queremos.
    objetivo = lado * ALTO_LETRAS
    tamano = max(8, int(objetivo * 1.35))
    for _ in range(40):
        tipo = ImageFont.truetype(str(ruta_fuente), tamano)
        caja = lienzo.textbbox((0, 0), MONOGRAMA, font=tipo)
        alto = caja[3] - caja[1]
        if alto <= objetivo or tamano <= 8:
            break
        tamano -= 1

    lienzo.text((centro, centro), MONOGRAMA, font=tipo, fill=ACENTO, anchor="mm")
    return imagen


def main():
    url = sys.argv[1] if len(sys.argv) > 1 else URL_POR_DEFECTO
    if not url.startswith(("http://", "https://")):
        print(f"La URL debe empezar por http:// o https:// — recibido: {url}")
        return 1

    CARPETA.mkdir(exist_ok=True)
    ruta_fuente = fuente()

    # error="h": el QR aguanta que se tape hasta un 30 %, que es lo que nos
    # permite poner el monograma encima sin que deje de leerse.
    qr = segno.make(url, error="h")

    (CARPETA / "qr-kd.svg").write_text(svg(qr, True, ruta_fuente), encoding="utf-8")
    png(qr, True, ruta_fuente).save(CARPETA / "qr-kd.png")

    (CARPETA / "qr-formulario.svg").write_text(svg(qr, False, ruta_fuente), encoding="utf-8")
    png(qr, False, ruta_fuente).save(CARPETA / "qr-formulario.png")

    cartel = CARPETA / "cartel.html"
    if cartel.exists():
        html = cartel.read_text(encoding="utf-8")
        html = re.sub(r'(<span id="url">).*?(</span>)', r"\g<1>" + url + r"\g<2>", html)
        cartel.write_text(html, encoding="utf-8")

    print(f"QR generado para: {url}")
    for nombre in ("qr-kd.svg", "qr-kd.png", "qr-formulario.svg", "qr-formulario.png"):
        print(f"  {CARPETA / nombre}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
