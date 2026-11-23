#!/usr/bin/env python3
"""Redraw the decorative stars in the same style as the alien head.

Each star becomes four flat layers: a thick pen-like purple outline, the fill
color, a shade on the lower right edge and a soft pink gloss.

Usage: python3 tools/restyle-stars.py <source-dir-with-star-N.png> [output-dir]
Reads star-1.png .. star-5.png (only the silhouette matters) and writes
star-1.svg .. star-5.svg. Requires numpy, Pillow and the potrace program.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageChops, ImageFilter

SCALE = 4         # upscale before tracing so the curves come out smooth
MARGIN = 12       # padding in source pixels, room for the outline
OUTLINE_WIDTH = 6.0

# fill color, shade color
TONES = {
    'mint': ((72, 195, 155), (50, 127, 107)),
    'pink': ((203, 53, 145), (168, 44, 127)),
    'sun': ((243, 229, 154), (201, 178, 74)),
}
STAR_TONE = {1: 'mint', 2: 'pink', 3: 'sun', 4: 'mint', 5: 'pink'}
OUTLINE_COLOR, GLOSS_COLOR = (55, 4, 63), (230, 182, 214)


def to_hex(color):
    return '#%02x%02x%02x' % color


def grow(mask, radius):
    return mask.filter(ImageFilter.GaussianBlur(radius * 0.8)).point(lambda v: 255 if v > 40 else 0)


def shrink(mask, radius):
    return mask.filter(ImageFilter.GaussianBlur(radius * 0.8)).point(lambda v: 255 if v > 215 else 0)


def trace_mask(mask, workdir, name):
    bitmap, svg = os.path.join(workdir, f'{name}.pbm'), os.path.join(workdir, f'{name}.svg')
    mask.point(lambda v: 0 if v > 127 else 255).convert('1').save(bitmap)
    subprocess.run(['potrace', '-s', '-t', '30', '-a', '1.2', '-O', '0.8', '-o', svg, bitmap], check=True)
    paths = open(svg).read().split('<path')[1:]
    return ' '.join(' '.join(p.split('d="')[1].split('"')[0] for p in paths).split())


def pen_outline(silhouette, seed):
    """Grow the silhouette by OUTLINE_WIDTH with a smooth random variation, like a marker line."""
    noise = Image.fromarray((np.random.default_rng(seed).random(silhouette.size[::-1]) * 255).astype(np.uint8))
    noise = np.array(noise.filter(ImageFilter.GaussianBlur(7 * SCALE)), dtype=float)
    noise = (noise - noise.mean()) / (noise.std() + 1e-6)
    spread = np.array(silhouette.filter(ImageFilter.GaussianBlur(OUTLINE_WIDTH * SCALE * 0.8)), dtype=float)
    mask = ((spread + noise * 14) > 40) & (spread > 6)
    return ImageChops.lighter(Image.fromarray(mask.astype(np.uint8) * 255), silhouette)


def gloss_drop(silhouette, width, height):
    """A tilted ellipse up and to the left of the star centre, kept inside the star."""
    ys, xs = np.nonzero(np.array(silhouette) > 0)
    cx, cy = xs.mean() - 0.11 * width * SCALE, ys.mean() - 0.11 * height * SCALE
    yy, xx = np.mgrid[0:silhouette.height, 0:silhouette.width]
    angle = np.deg2rad(-38)
    along = (xx - cx) * np.cos(angle) + (yy - cy) * np.sin(angle)
    across = -(xx - cx) * np.sin(angle) + (yy - cy) * np.cos(angle)
    drop = ((along / (0.085 * width * SCALE)) ** 2 + (across / (0.034 * height * SCALE)) ** 2) < 1
    return ImageChops.multiply(Image.fromarray((drop * 255).astype(np.uint8)), shrink(silhouette, 4 * SCALE))


def restyle(index, source_dir, output_dir):
    source = Image.open(os.path.join(source_dir, f'star-{index}.png')).convert('RGBA')
    width, height = source.size
    canvas = Image.new('L', ((width + 2 * MARGIN) * SCALE, (height + 2 * MARGIN) * SCALE), 0)
    canvas.paste(source.getchannel('A').resize((width * SCALE, height * SCALE), Image.LANCZOS), (MARGIN * SCALE, MARGIN * SCALE))
    silhouette = canvas.filter(ImageFilter.GaussianBlur(SCALE * 0.8)).point(lambda v: 255 if v > 127 else 0)
    silhouette = shrink(grow(silhouette, 5 * SCALE), 5 * SCALE)  # closes the holes left by the halftone

    fill, shade_color = TONES[STAR_TONE[index]]
    shifted = ImageChops.offset(silhouette, -int(2.6 * SCALE), -int(2.6 * SCALE))
    shade = ImageChops.multiply(silhouette, ImageChops.invert(shifted))  # lower right rim: light comes from the top left
    layers = [
        ('outline', pen_outline(silhouette, index), OUTLINE_COLOR),
        ('fill', silhouette, fill),
        ('shade', shade, shade_color),
        ('gloss', gloss_drop(silhouette, width, height), GLOSS_COLOR),
    ]
    total_w, total_h = width + 2 * MARGIN, height + 2 * MARGIN
    transform = f'translate(0,{total_h}) scale({1 / (10 * SCALE):.6f},{-1 / (10 * SCALE):.6f})'
    with tempfile.TemporaryDirectory() as workdir:
        paths = [f'<path fill="{to_hex(color)}" d="{trace_mask(mask, workdir, name)}"/>' for name, mask, color in layers]
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w} {total_h}" width="{total_w}" height="{total_h}" '
           f'role="img" aria-hidden="true"><g transform="{transform}">{"".join(paths)}</g></svg>')
    open(os.path.join(output_dir, f'star-{index}.svg'), 'w').write(svg)
    print(f'star-{index}.svg', STAR_TONE[index], len(svg) // 1024, 'KB')


if __name__ == '__main__':
    source_dir = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else source_dir
    for star in range(1, 6):
        restyle(star, source_dir, output_dir)
