"""Small DSP toolkit for the promo's original soundtrack and sound design.

Everything is synthesized from scratch with numpy/scipy, so the music and the
effects are free of third-party rights. 48 kHz, float32 stereo arrays shaped
(n, 2) unless noted.
"""

import numpy as np
from scipy import signal

SR = 48000


def secs(n):
    return int(round(n * SR))


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- oscillators

def _polyblep(t, dt):
    dt = np.broadcast_to(dt, t.shape)
    out = np.zeros_like(t)
    m = t < dt
    x = t[m] / dt[m]
    out[m] = x + x - x * x - 1.0
    m2 = t > 1.0 - dt
    x = (t[m2] - 1.0) / dt[m2]
    out[m2] = x * x + x + x + 1.0
    return out


def saw(freq, n, phase0=0.0):
    """Band-limited sawtooth (PolyBLEP). freq: scalar or array of length n."""
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    dt = f / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    return (2.0 * ph - 1.0) - _polyblep(ph, dt)


def square(freq, n, phase0=0.0, pw=0.5):
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    dt = f / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    ph2 = (ph + (1 - pw)) % 1.0
    s = np.where(ph < pw, 1.0, -1.0)
    return s + _polyblep(ph, dt) - _polyblep(ph2, dt)


def sine(freq, n, phase0=0.0):
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    ph = phase0 + 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph)


def tri(freq, n):
    return 2.0 * np.abs(saw(freq, n)) - 1.0


def noise(n, seed=0):
    return np.random.default_rng(seed).uniform(-1, 1, n)


# ---------------------------------------------------------------- envelopes

def adsr(n, a=0.005, d=0.1, s=0.7, r=0.1, gate=None):
    """ADSR over n samples; gate = seconds the note is held (default: n - release)."""
    env = np.zeros(n)
    A, D, R = max(1, secs(a)), max(1, secs(d)), max(1, secs(r))
    G = secs(gate) if gate is not None else max(A + D, n - R)
    G = min(G, n)
    i = np.arange(n)
    env = np.where(i < A, i / A, 0.0)
    dm = (i >= A) & (i < A + D)
    env = np.where(dm, 1.0 - (1.0 - s) * (i - A) / D, env)
    env = np.where((i >= A + D) & (i < G), s, env)
    level_at_g = env[G - 1] if G > 0 else 0
    rm = i >= G
    env = np.where(rm, level_at_g * np.clip(1.0 - (i - G) / R, 0, 1), env)
    return env


def exp_decay(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


# ---------------------------------------------------------------- filters

def biquad(kind, f0, q=0.707, gain_db=0.0):
    w0 = 2 * np.pi * np.clip(f0, 10, SR * 0.45) / SR
    alpha = np.sin(w0) / (2 * q)
    cw = np.cos(w0)
    A = 10 ** (gain_db / 40)
    if kind == "lp":
        b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "hp":
        b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "bp":
        b = [alpha, 0, -alpha]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "peak":
        b = [1 + alpha * A, -2 * cw, 1 - alpha * A]
        a = [1 + alpha / A, -2 * cw, 1 - alpha / A]
    elif kind == "lowshelf":
        sq = 2 * np.sqrt(A) * alpha
        b = [A * ((A + 1) - (A - 1) * cw + sq), 2 * A * ((A - 1) - (A + 1) * cw), A * ((A + 1) - (A - 1) * cw - sq)]
        a = [(A + 1) + (A - 1) * cw + sq, -2 * ((A - 1) + (A + 1) * cw), (A + 1) + (A - 1) * cw - sq]
    elif kind == "highshelf":
        sq = 2 * np.sqrt(A) * alpha
        b = [A * ((A + 1) + (A - 1) * cw + sq), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - sq)]
        a = [(A + 1) - (A - 1) * cw + sq, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - sq]
    else:
        raise ValueError(kind)
    b = np.array(b) / a[0]
    a = np.array(a) / a[0]
    return b, a


def filt(x, kind, f0, q=0.707, gain_db=0.0):
    b, a = biquad(kind, f0, q, gain_db)
    return signal.lfilter(b, a, x, axis=0)


def sweep(x, kind, f_curve, q=0.707, block=128):
    """Time-varying biquad: f_curve is an array (len(x)) of cutoff frequencies."""
    mono = x.ndim == 1
    xs = x[:, None] if mono else x
    y = np.zeros_like(xs)
    zi = np.zeros((2, xs.shape[1]))
    for start in range(0, len(xs), block):
        end = min(len(xs), start + block)
        b, a = biquad(kind, float(f_curve[start]), q)
        # transposed direct form II state carried across blocks
        for ch in range(xs.shape[1]):
            y[start:end, ch], zi[:, ch] = signal.lfilter(b, a, xs[start:end, ch], zi=zi[:, ch])
    return y[:, 0] if mono else y


# ---------------------------------------------------------------- space

def stereo(x, pan=0.0):
    """Mono → stereo with constant-power pan (-1 left … 1 right)."""
    th = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(th), x * np.sin(th)], axis=1)


def reverb_ir(seconds=2.4, decay=0.55, seed=7, bright=6000):
    n = secs(seconds)
    rng = np.random.default_rng(seed)
    t = np.arange(n) / SR
    env = np.exp(-t / decay * 3.0)
    ir = rng.standard_normal((n, 2)) * env[:, None]
    ir = filt(ir, "lp", bright)
    ir = filt(ir, "hp", 180)
    ir[: secs(0.012)] *= np.linspace(0, 1, secs(0.012))[:, None]
    return ir / np.sqrt(np.sum(ir ** 2) / 2)


def convolve(x, ir):
    if x.ndim == 1:
        x = stereo(x)
    out = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return out


def delay(x, time, feedback=0.35, taps=5, pingpong=True, damp=5000):
    if x.ndim == 1:
        x = stereo(x)
    out = np.zeros_like(x)
    d = secs(time)
    tap = x.copy()
    for k in range(1, taps + 1):
        tap = filt(tap, "lp", damp) * feedback
        shifted = np.zeros_like(x)
        shifted[d * k:] = tap[: len(x) - d * k]
        if pingpong and k % 2 == 1:
            shifted = shifted[:, ::-1]
        out += shifted
    return out


# ---------------------------------------------------------------- dynamics

def soft_clip(x, drive=1.0):
    return np.tanh(x * drive) / np.tanh(drive)


def compress(x, threshold_db=-18, ratio=3.0, attack=0.005, release=0.12, makeup_db=0.0):
    """Simple feed-forward RMS-ish compressor (stereo-linked)."""
    level = np.max(np.abs(x), axis=1) if x.ndim == 2 else np.abs(x)
    # envelope follower
    a_att = np.exp(-1 / (attack * SR))
    a_rel = np.exp(-1 / (release * SR))
    env = np.zeros_like(level)
    # vectorized-ish: process with lfilter on a smoothed abs (approximation)
    sm = signal.lfilter([1 - a_rel], [1, -a_rel], level)
    sm = np.maximum(sm, signal.lfilter([1 - a_att], [1, -a_att], level))
    env = sm
    db = 20 * np.log10(np.maximum(env, 1e-6))
    over = np.maximum(0, db - threshold_db)
    gain_db = -over * (1 - 1 / ratio) + makeup_db
    g = 10 ** (gain_db / 20)
    return x * (g[:, None] if x.ndim == 2 else g)


def place(buf, clip, at, gain=1.0):
    """Mixes clip into buf starting at `at` seconds (clipped to the buffer)."""
    i = secs(at)
    if i >= len(buf):
        return
    if clip.ndim == 1 and buf.ndim == 2:
        clip = stereo(clip)
    j = min(len(buf), i + len(clip))
    if i < 0:
        clip = clip[-i:]
        i = 0
        j = min(len(buf), len(clip))
    buf[i:j] += clip[: j - i] * gain


def write_wav(path, x, bits=24):
    import soundfile as sf
    sf.write(path, np.clip(x, -1, 1).astype(np.float32), SR, subtype="PCM_24" if bits == 24 else "PCM_16")
