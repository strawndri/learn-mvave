#!/usr/bin/env python3
"""Gera o papel de parede do site (planeta gasoso e céu estrelado) por código.

Uso: python3 tools/gerar-planeta.py [largura] [saida.jpg]
Padrão: 3840 x 2160 em assets/planeta-3840.jpg, mais uma versão de 1920 pixels.
Precisa de numpy e Pillow.
"""
import sys
import numpy as np
from PIL import Image

W = int(sys.argv[1]) if len(sys.argv) > 1 else 3840
H = W * 9 // 16
OUT = sys.argv[2] if len(sys.argv) > 2 else 'assets/planeta-3840.jpg'
S = W / 3840.0  # escala em relação ao tamanho de referência

# ---------- ruído de valor 3D ----------
N = 64
_G = {}


def grid(seed):
    if seed not in _G:
        _G[seed] = np.random.default_rng(seed).random((N, N, N), dtype=np.float32)
    return _G[seed]


def vnoise(seed, x, y, z):
    G = grid(seed)
    xi = np.floor(x).astype(np.int32); yi = np.floor(y).astype(np.int32); zi = np.floor(z).astype(np.int32)
    xf = x - xi; yf = y - yi; zf = z - zi
    xf = xf * xf * (3 - 2 * xf); yf = yf * yf * (3 - 2 * yf); zf = zf * zf * (3 - 2 * zf)
    x0 = xi % N; x1 = (xi + 1) % N; y0 = yi % N; y1 = (yi + 1) % N; z0 = zi % N; z1 = (zi + 1) % N
    c00 = G[x0, y0, z0] * (1 - xf) + G[x1, y0, z0] * xf
    c10 = G[x0, y1, z0] * (1 - xf) + G[x1, y1, z0] * xf
    c01 = G[x0, y0, z1] * (1 - xf) + G[x1, y0, z1] * xf
    c11 = G[x0, y1, z1] * (1 - xf) + G[x1, y1, z1] * xf
    return (c00 * (1 - yf) + c10 * yf) * (1 - zf) + (c01 * (1 - yf) + c11 * yf) * zf


def fbm(seed, x, y, z, octaves, lac=2.03, gain=0.5):
    total = np.zeros_like(x, dtype=np.float32)
    amp, f, norm = 1.0, 1.0, 0.0
    for o in range(octaves):
        total += amp * (vnoise(seed + o, x * f + o * 17.3, y * f + o * 9.1, z * f + o * 5.7) - 0.5) * 2
        norm += amp
        amp *= gain
        f *= lac
    return total / norm


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def hexrgb(h):
    h = h.lstrip('#')
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]


PALETTE = [(0.00, '#E36DB4'), (0.12, '#F4A9D0'), (0.22, '#F6E7C6'), (0.32, '#D6DF86'), (0.42, '#8FD0A0'),
           (0.52, '#6BC4C4'), (0.62, '#7FA9DD'), (0.72, '#B493E0'), (0.84, '#D77FC6'), (1.00, '#E36DB4')]


def palette(t):
    t = np.mod(t, 1.0)
    xs = [p[0] for p in PALETTE]
    cols = np.array([hexrgb(p[1]) for p in PALETTE], dtype=np.float32)
    return np.stack([np.interp(t, xs, cols[:, c]) for c in range(3)], axis=-1).astype(np.float32)


# ---------- céu ----------
def sky():
    rng = np.random.default_rng(11)
    img = np.zeros((H, W, 3), dtype=np.float32)
    img[:] = np.array([0.012, 0.006, 0.028], dtype=np.float32)

    # nebulosas azul-violeta, mais fortes no alto
    yy, xx = np.mgrid[0:H:4, 0:W:4].astype(np.float32)
    nx, ny = xx / W, yy / H
    zero = np.zeros_like(nx)
    n1 = fbm(31, nx * 3.2, ny * 3.2, zero + 1.7, 5)
    n2 = fbm(41, nx * 6.5 + 3, ny * 6.5, zero + 4.1, 4)
    neb = 1.4 * smooth(0.05, 0.75, n1) * (0.35 + 0.65 * smooth(0.0, 0.7, n2)) * (1.15 - ny)
    neb = np.clip(neb, 0, 1)
    tint = np.stack([0.20 * neb, 0.17 * neb, 0.52 * neb], axis=-1) * 0.55
    tint2 = np.stack([0.42 * (n2 > 0.3) * neb, 0.10 * neb, 0.32 * neb], axis=-1) * 0.25
    small = (tint + tint2).astype(np.float32)
    big = np.array(Image.fromarray(np.clip(small * 255, 0, 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), dtype=np.float32) / 255
    img += big

    def add_gauss(cx, cy, sigma, color, inten, half):
        x0, x1 = max(0, int(cx) - half), min(W, int(cx) + half + 1)
        y0, y1 = max(0, int(cy) - half), min(H, int(cy) + half + 1)
        if x0 >= x1 or y0 >= y1:
            return
        gx = np.arange(x0, x1, dtype=np.float32) - cx
        gy = np.arange(y0, y1, dtype=np.float32) - cy
        g = np.exp(-(gx[None, :] ** 2 + gy[:, None] ** 2) / (2 * sigma ** 2)) * inten
        img[y0:y1, x0:x1] += g[..., None] * np.array(color, dtype=np.float32)

    cols = [(1, 1, 1), (1, 1, 1), (0.85, 0.9, 1.0), (1.0, 0.85, 0.95), (0.8, 0.85, 1.0)]
    for _ in range(int(5200 * S * S + 800)):
        u = rng.random()
        add_gauss(rng.random() * W, rng.random() * H, (0.6 + 0.7 * u) * max(S, 0.6) * 1.2, cols[rng.integers(len(cols))], 0.25 + 0.9 * u ** 3, 5)

    # estrelas brilhantes com raios, mais comuns no alto
    spots = [(0.10, 0.10), (0.30, 0.06), (0.52, 0.12), (0.80, 0.08), (0.93, 0.20), (0.07, 0.34), (0.40, 0.30), (0.62, 0.05)]
    for i in range(28):
        if i < len(spots):
            cx, cy = spots[i][0] * W, spots[i][1] * H
        else:
            cx, cy = rng.random() * W, (rng.random() ** 1.6) * H
        col = cols[rng.integers(len(cols))]
        sg = (4 + rng.random() * 8) * S * 1.4
        add_gauss(cx, cy, sg, col, 0.55, int(sg * 4))
        add_gauss(cx, cy, sg * 0.25, (1, 1, 1), 1.0, int(sg))
        L = (45 + rng.random() * 120) * S * 1.4
        half = int(L * 2.2)
        x0, x1 = max(0, int(cx) - half), min(W, int(cx) + half + 1)
        y0, y1 = max(0, int(cy) - half), min(H, int(cy) + half + 1)
        if x0 >= x1 or y0 >= y1:
            continue
        gx = np.arange(x0, x1, dtype=np.float32) - cx
        gy = np.arange(y0, y1, dtype=np.float32) - cy
        lw = max(0.8, 1.0 * S * 1.4)
        horiz = np.exp(-(gy[:, None] ** 2) / (2 * lw ** 2)) * np.exp(-np.abs(gx[None, :]) / (L * 0.35))
        vert = np.exp(-(gx[None, :] ** 2) / (2 * lw ** 2)) * np.exp(-np.abs(gy[:, None]) / (L * 0.35))
        spikes = (horiz + vert) * 0.85
        d1 = (gx[None, :] + gy[:, None]) / 1.414
        d2 = (gx[None, :] - gy[:, None]) / 1.414
        diag = (np.exp(-(d2 ** 2) / (2 * lw ** 2)) * np.exp(-np.abs(d1) / (L * 0.12)) + np.exp(-(d1 ** 2) / (2 * lw ** 2)) * np.exp(-np.abs(d2) / (L * 0.12))) * 0.35
        img[y0:y1, x0:x1] += (spikes + diag)[..., None] * np.array(col, dtype=np.float32) * 0.6
    return img


# ---------- planeta ----------
def planet(img):
    R = 1500.0 * S
    cx, cy = 0.665 * W, 1.02 * H
    tau = np.deg2rad(-13.0)
    ct, st = np.cos(tau), np.sin(tau)
    L = np.array([-0.52, 0.50, 0.69], dtype=np.float32)
    L /= np.linalg.norm(L)

    x0, x1 = max(0, int(cx - R * 1.4)), min(W, int(cx + R * 1.4))
    y0, y1 = max(0, int(cy - R * 1.4)), min(H, int(cy + R * 1.4))
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    px = (xx - cx) / R
    py = -(yy - cy) / R
    r2 = px * px + py * py
    r = np.sqrt(r2)

    # halo fora do disco
    d = np.clip(r - 1.0, 0, None)
    lit_dir = np.clip((px * L[0] + py * L[1]) / np.maximum(r, 1e-3) * 0.5 + 0.55, 0, 1)
    halo = np.exp(-d * 11.0) * 0.55 * (d >= 0) * lit_dir
    halo_col = np.array([0.72, 0.36, 0.78], dtype=np.float32)
    region = img[y0:y1, x0:x1]
    region += (halo[..., None] * halo_col).astype(np.float32) * (r[..., None] > 0.995)

    alpha = np.clip((1.0 - r) * R / 1.6 + 0.5, 0, 1)
    idx = np.where(alpha > 0)
    pxm, pym, rm = px[idx], py[idx], r[idx]
    z = np.sqrt(np.clip(1 - rm * rm, 0, 1)).astype(np.float32)

    qx = pxm * ct - pym * st
    qy = pxm * st + pym * ct
    w1 = fbm(101, qx * 1.4, qy * 1.2, z * 1.4, 5)
    w2 = fbm(201, qx * 3.0 + w1 * 0.8, qy * 8.0, z * 3.0 + w1 * 0.6, 5)
    fine = fbm(301, qx * 9.0, qy * 28.0, z * 9.0, 4)
    b = qy * 2.5 + 0.95 * w1 + 0.42 * w2 + 0.12 * fine
    col = palette(b * 0.52 + 0.05)
    gray = col.mean(axis=-1, keepdims=True)
    col = gray + (col - gray) * 0.82  # menos saturado

    cl = fbm(401, qx * 5.0 + w1 * 0.9, qy * 15.0, z * 5.0, 5)
    cloud = smooth(0.12, 0.58, cl) * (0.55 + 0.45 * smooth(-0.2, 0.5, w2))
    col = col * (1 - 0.55 * cloud[..., None]) + np.array([1.0, 0.96, 0.9], dtype=np.float32) * 0.55 * cloud[..., None]
    shade_var = 1.0 + 0.10 * fine
    col *= shade_var[..., None]

    nrm = np.stack([pxm, pym, z], axis=-1)
    diff = np.clip(nrm @ L, 0, 1)
    light = 0.10 + 0.95 * smooth(0.0, 0.98, diff)
    light *= 0.50 + 0.50 * np.sqrt(z)
    col *= light[..., None]
    shadow_tint = np.array([0.10, 0.04, 0.22], dtype=np.float32)
    col += shadow_tint * (1 - smooth(0.0, 0.5, diff))[..., None] * 0.55

    rim = (1 - z) ** 2.4
    col += (rim * (0.35 + 0.65 * smooth(-0.2, 0.7, diff)))[..., None] * np.array([0.95, 0.50, 0.85], dtype=np.float32) * 0.55
    col = np.clip(col, 0, 1.2)

    a = alpha[idx][..., None].astype(np.float32)
    sub = region[idx]
    region[idx] = sub * (1 - a) + col * a
    return img


def main():
    img = sky()
    img = planet(img)
    img = np.clip(img, 0, 1)
    rng = np.random.default_rng(5)
    img = img + (rng.random(img.shape, dtype=np.float32) - 0.5) / 255.0  # evita faixas
    out = Image.fromarray(np.clip(img * 255 + 0.5, 0, 255).astype(np.uint8))
    out.save(OUT, quality=86, optimize=True, progressive=True, subsampling='4:2:0')
    print('salvo', OUT, out.size)


if __name__ == '__main__':
    main()
