"""Interface sound design for the promo — every effect synthesized from scratch.

    python3 tools/audio/sfx.py skitstudio-promo/assets/audio/sfx
"""

import os
import sys
import numpy as np

from dsp import SR, secs, sine, noise, saw, filt, sweep, stereo, exp_decay, reverb_ir, convolve, write_wav


def norm(x, peak_db=-6.0):
    return x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)


def env_ad(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)


def click(seed=1, pitch=1.0):
    n = secs(0.09)
    t = np.arange(n) / SR
    tick = filt(noise(n, seed), "hp", 3000) * np.exp(-t / 0.0025)
    blip = sine(2100 * pitch * (1 - 0.25 * np.minimum(1, t / 0.03)), n) * np.exp(-t / 0.012) * 0.6
    body = sine(150 * pitch, n) * np.exp(-t / 0.015) * 0.5
    return stereo(tick * 0.7 + blip + body, 0.0)


def select():
    n = secs(0.16)
    out = np.zeros(n)
    for k, (f, at) in enumerate(((1250, 0.0), (1760, 0.055))):
        i = secs(at)
        m = n - i
        t = np.arange(m) / SR
        out[i:] += sine(f, m) * env_ad(m, 0.002, 0.03) * (0.8 if k else 0.6)
    return stereo(out, 0.0)


def pick():
    n = secs(0.18)
    t = np.arange(n) / SR
    fc = 600 * (8 ** (t / 0.18))
    nz = sweep(noise(n, 9), "bp", fc, q=2.5)
    tone = sine(500 + 900 * t / 0.18, n) * 0.25
    return stereo((nz + tone) * env_ad(n, 0.03, 0.06), -0.1)


def snap():
    n = secs(0.22)
    t = np.arange(n) / SR
    tick = filt(noise(n, 4), "hp", 2500) * np.exp(-t / 0.003)
    thock = sine(230 * (1 - 0.3 * np.minimum(1, t / 0.04)), n) * np.exp(-t / 0.035)
    sub = sine(90, n) * np.exp(-t / 0.05) * 0.6
    knock = filt(noise(n, 5), "bp", 900, 1.5) * np.exp(-t / 0.02) * 0.6
    return stereo(tick * 0.8 + thock + sub + knock, 0.0)


def whoosh(length=0.6, seed=12, f0=250, f1=4500, pan_from=-0.6, pan_to=0.6):
    n = secs(length)
    t = np.arange(n) / SR
    p = t / length
    shape = np.sin(np.pi * np.clip(p, 0, 1)) ** 1.6
    fc = f0 * (f1 / f0) ** (np.sin(np.pi * p / 2))
    nz = sweep(noise(n, seed), "bp", fc, q=1.2)
    nz2 = sweep(noise(n, seed + 1), "lp", fc * 0.6, q=0.7) * 0.5
    x = (nz + nz2) * shape
    pan = pan_from + (pan_to - pan_from) * p
    th = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(th), x * np.sin(th)], axis=1)


def keystroke(seed):
    rng = np.random.default_rng(seed)
    n = secs(0.06)
    t = np.arange(n) / SR
    f = rng.uniform(1800, 3200)
    k = filt(noise(n, seed), "bp", f, 1.8) * np.exp(-t / 0.006)
    b = sine(rng.uniform(170, 260), n) * np.exp(-t / 0.012) * 0.35
    return (k + b) * rng.uniform(0.6, 1.0)


def typing(length, rate=11.0, seed=100):
    n = secs(length)
    out = np.zeros(n)
    rng = np.random.default_rng(seed)
    at = 0.0
    k = 0
    while at < length - 0.06:
        s = keystroke(seed + k)
        i = secs(at)
        j = min(n, i + len(s))
        out[i:j] += s[: j - i]
        at += rng.uniform(0.7, 1.3) / rate
        k += 1
    return stereo(out, 0.15)


def success():
    n = secs(1.6)
    out = np.zeros(n)
    for f, at, g in ((1318.5, 0.0, 0.7), (1760.0, 0.09, 0.8), (2637.0, 0.09, 0.25)):
        i = secs(at)
        m = n - i
        t = np.arange(m) / SR
        bell = sine(f, m) + 0.3 * sine(f * 2.76, m) * np.exp(-t / 0.08) + 0.15 * sine(f * 5.4, m) * np.exp(-t / 0.04)
        out[i:] += bell * env_ad(m, 0.003, 0.35) * g
    x = stereo(out, 0.0)
    return x + convolve(x, reverb_ir(1.4, 0.4, seed=4)) * 0.25


def pop():
    n = secs(0.2)
    t = np.arange(n) / SR
    f = 380 + 700 * np.minimum(1, t / 0.05)
    x = sine(f, n) * env_ad(n, 0.002, 0.045)
    tick = filt(noise(n, 77), "hp", 4000) * np.exp(-t / 0.002) * 0.3
    return stereo(x + tick, 0.0)


def shimmer(length=1.4, seed=61):
    n = secs(length)
    rng = np.random.default_rng(seed)
    out = np.zeros((n, 2))
    for k in range(18):
        at = rng.uniform(0, length * 0.55)
        f = rng.uniform(2800, 7800)
        i = secs(at)
        m = n - i
        t = np.arange(m) / SR
        s = sine(f, m) * env_ad(m, 0.004, rng.uniform(0.06, 0.18)) * rng.uniform(0.3, 1.0)
        out[i:] += stereo(s, rng.uniform(-0.8, 0.8))
    return out + convolve(out, reverb_ir(1.6, 0.5, seed=8)) * 0.4


def sheet():
    """Bottom sheet sliding up: a soft, low whoosh with a landing tick."""
    w = whoosh(0.4, seed=33, f0=160, f1=1800, pan_from=0, pan_to=0) * 0.7
    c = click(seed=34, pitch=0.7) * 0.35
    out = np.zeros((secs(0.45), 2))
    out[: len(w)] += w
    i = secs(0.3)
    out[i:i + len(c)] += c[: len(out) - i]
    return out


def glitch(length=0.25, seed=71):
    """Short digital stutter for the word-flash cuts."""
    n = secs(length)
    rng = np.random.default_rng(seed)
    out = np.zeros(n)
    at = 0
    while at < n:
        seg = secs(rng.uniform(0.008, 0.02))
        f = rng.uniform(300, 2400)
        out[at:at + seg] = (np.sign(sine(f, seg)) * 0.5 + filt(noise(seg, at), "hp", 2000) * 0.5)[: n - at]
        at += seg + secs(rng.uniform(0.004, 0.015))
    return stereo(out * np.linspace(1, 0.2, n), 0.0)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(out, exist_ok=True)
    effects = {
        "click": norm(click(), -4),
        "click-soft": norm(click(seed=2, pitch=0.8), -8),
        "select": norm(select(), -8),
        "pick": norm(pick(), -6),
        "snap": norm(snap(), -3),
        "whoosh": norm(whoosh(0.6), -4),
        "whoosh-short": norm(whoosh(0.35, seed=20, f0=400, f1=6000, pan_from=0.5, pan_to=-0.5), -5),
        "whoosh-long": norm(whoosh(1.0, seed=24, f0=150, f1=3800, pan_from=-0.8, pan_to=0.8), -4),
        "typing-short": norm(typing(0.7, 12, seed=100), -7),
        "typing-medium": norm(typing(1.2, 12, seed=200), -7),
        "typing-long": norm(typing(3.2, 14, seed=300), -7),
        "success": norm(success(), -4),
        "pop": norm(pop(), -5),
        "shimmer": norm(shimmer(), -6),
        "sheet": norm(sheet(), -6),
        "glitch": norm(glitch(), -8),
    }
    for name, x in effects.items():
        write_wav(os.path.join(out, f"{name}.wav"), x)
        print(f"wrote {name}.wav ({len(x) / SR:.2f}s)")
