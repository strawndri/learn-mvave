#!/usr/bin/env python3
"""Convert the alien head (PNG with a transparent background) into a real SVG.

Usage: python3 tools/vectorize-alien.py input.png output.svg

Every pixel is snapped to the nearest flat color of a fixed palette. Each color
is traced with potrace and the layers are stacked in painting order (large
areas at the bottom, outlines and highlights on top). The blush is not traced:
it is two soft radial-gradient ellipses clipped to the skin shape.
Requires numpy, Pillow and the potrace program.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageFilter

SCALE = 3  # upscale before tracing so the curves come out smooth

# Painting order, bottom to top: (layer name, RGB color).
PALETTE = [
    ('skin', (72, 195, 155)),
    ('hair', (203, 53, 145)),
    ('gloss', (230, 182, 214)),
    ('eyelid_shadow', (50, 127, 107)),
    ('blush', (236, 118, 150)),
    ('eye_blue', (28, 31, 58)),
    ('eye_black', (7, 4, 19)),
    ('outline_blue', (34, 59, 91)),
    ('outline_purple', (55, 4, 63)),
    ('white', (221, 221, 233)),
]
LAYER = {name: index for index, (name, _) in enumerate(PALETTE)}
CHEEK_RESIZE = 1.9  # blush ellipse size relative to the measured blush area


def to_hex(color):
    return '#%02x%02x%02x' % tuple(int(c) for c in color)


def nearest_palette_index(rgb):
    colors = np.array([color for _, color in PALETTE], dtype=float)
    distances = ((rgb[:, :, None, :] - colors[None, None]) ** 2).sum(-1)
    return distances.argmin(-1).astype(np.uint8)


def trace_mask(mask, workdir, name):
    """Return the SVG path data (potrace units) that outlines `mask`."""
    grown = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))  # +1 px: no seams
    bitmap, svg = os.path.join(workdir, f'{name}.pbm'), os.path.join(workdir, f'{name}.svg')
    grown.point(lambda v: 0 if v > 127 else 255).convert('1').save(bitmap)
    subprocess.run(['potrace', '-s', '-t', '25', '-a', '1.2', '-O', '0.8', '-o', svg, bitmap], check=True)
    paths = open(svg).read().split('<path')[1:]
    return ' '.join(' '.join(p.split('d="')[1].split('"')[0] for p in paths).split())


def measure_cheek_ellipses(labels, alpha, height_px):
    """Find the two blush areas and return them as SVG ellipses, plus a cleaned label map."""
    rows, cols = labels.shape
    cheek_zone = np.zeros(labels.shape, dtype=bool)
    cheek_zone[int(rows * 0.70):, int(cols * 0.22):int(cols * 0.78)] = True
    blush = (labels == LAYER['blush']) & alpha
    ellipses = []
    for x_from, x_to in ((0, cols // 2), (cols // 2, cols)):
        side = np.zeros_like(blush)
        side[:, x_from:x_to] = blush[:, x_from:x_to]
        ys, xs = np.nonzero(side & cheek_zone)
        if len(xs) < 40:
            continue
        cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
        rx = (xs.max() - xs.min()) / 2 * CHEEK_RESIZE
        ry = (ys.max() - ys.min()) / 2 * CHEEK_RESIZE
        ellipses.append(f'<ellipse cx="{cx / SCALE:.1f}" cy="{cy / SCALE:.1f}" rx="{rx / SCALE:.1f}" '
                        f'ry="{ry / SCALE:.1f}" fill="url(#blush)"/>')
    labels[(labels == LAYER['blush']) & cheek_zone] = LAYER['skin']   # skin under the blush
    labels[(labels == LAYER['blush']) & ~cheek_zone] = LAYER['hair']  # same color on hair is just shading
    return ellipses


def vectorize(source, destination):
    image = Image.open(source).convert('RGBA')
    width, height = image.size
    big = image.resize((width * SCALE, height * SCALE), Image.LANCZOS)
    alpha = np.array(big.getchannel('A')) > 127
    labels = nearest_palette_index(np.array(big.convert('RGB')).astype(float))
    labels = np.array(Image.fromarray(labels).filter(ImageFilter.ModeFilter(5)))  # remove edge noise

    cheeks = measure_cheek_ellipses(labels, alpha, height)
    transform = f'translate(0,{height}) scale({1 / (10 * SCALE):.6f},{-1 / (10 * SCALE):.6f})'
    layers, skin_path = [], ''
    with tempfile.TemporaryDirectory() as workdir:
        for index, (name, color) in enumerate(PALETTE):
            if name == 'blush':
                layers.append('<g clip-path="url(#skin-clip)">' + ''.join(cheeks) + '</g>')
                continue
            mask = (labels == index) & alpha
            if mask.sum() < 40:
                continue
            path = trace_mask(mask, workdir, name)
            if name == 'skin':  # reused as the clip shape for the blush
                skin_path = path
                layers.append(f'<g transform="{transform}"><use href="#skin" fill="{to_hex(color)}"/></g>')
            else:
                layers.append(f'<g transform="{transform}"><path fill="{to_hex(color)}" d="{path}"/></g>')

    defs = (f'<defs><path id="skin" d="{skin_path}"/>'
            f'<clipPath id="skin-clip"><use href="#skin" transform="{transform}"/></clipPath>'
            '<radialGradient id="blush">'
            '<stop offset="0" stop-color="#f27a9a" stop-opacity=".9"/>'
            '<stop offset=".55" stop-color="#f27a9a" stop-opacity=".55"/>'
            '<stop offset="1" stop-color="#f27a9a" stop-opacity="0"/></radialGradient></defs>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" '
           f'role="img" aria-label="Alien head">{defs}{"".join(layers)}</svg>')
    open(destination, 'w').write(svg)
    print(len(layers), 'layers,', len(svg) // 1024, 'KB')


if __name__ == '__main__':
    vectorize(sys.argv[1], sys.argv[2])
