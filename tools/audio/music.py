"""Original soundtrack for the SkitStudio promo: 60 s of modern electronic
music at 120 BPM (one bar = 2 s), arranged against the video's timeline so
that every scene change starts on a bar and the brand lockup lands on the
final hit.

    python3 tools/audio/music.py skitstudio-promo/assets/audio/music/skit-theme.wav

Timeline (seconds) — kept in sync with skitstudio-promo/lib/timeline.ts:
   0  intro (pad + filtered arp)        3  logo impact
   6  scene 2: beat enters               12 scene 3: full groove
  24  scene 4: variation                 30 scene 5
  36  build                              38 drop (overview montage)
  44  build                              46 result (impact)
  52  build                              54 outro word stabs (54, 54.5, 55, 55.5)
  56  final hit — brand lockup           60 end
"""

import sys
import numpy as np

from dsp import (SR, secs, midi_hz, saw, square, sine, noise, adsr, exp_decay, filt, sweep, stereo,
                 reverb_ir, convolve, delay, soft_clip, compress, place, write_wav)

BPM = 120
BEAT = 60 / BPM          # 0.5 s
BAR = 4 * BEAT           # 2 s
LENGTH = 60.0
N = secs(LENGTH)

# A minor: Am9 | Fmaj9 | Cadd9 | G6/9, one chord per bar
CHORDS = [
    {"root": 45, "pad": [57, 60, 64, 67, 71], "arp": [69, 72, 76, 79, 83]},
    {"root": 41, "pad": [53, 57, 60, 64, 67], "arp": [65, 69, 72, 76, 79]},
    {"root": 48, "pad": [55, 60, 62, 64, 67], "arp": [67, 72, 74, 76, 79]},
    {"root": 43, "pad": [55, 59, 62, 64, 69], "arp": [67, 71, 74, 76, 81]},
]


def chord_at(bar):
    return CHORDS[bar % 4]


def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT


# ------------------------------------------------------------------ voices

def kick(vel=1.0, tone=1.0):
    n = secs(0.5)
    t = np.arange(n) / SR
    f = 46 + 120 * np.exp(-t / 0.032)
    body = sine(f, n) * np.exp(-t / 0.30)
    click = filt(noise(n, 3), "hp", 2500) * np.exp(-t / 0.004) * 0.35 * tone
    k = soft_clip((body + click) * 1.6, 1.4)
    return k * vel


def clap(vel=1.0, seed=11):
    n = secs(0.5)
    t = np.arange(n) / SR
    nz = filt(noise(n, seed), "bp", 1300, 0.9)
    env = np.zeros(n)
    for off in (0.0, 0.009, 0.019):
        i = secs(off)
        env[i:] += np.exp(-(t[: n - i]) / 0.008) * 0.8
    env += np.exp(-np.maximum(0, t - 0.025) / 0.13) * (t > 0.025) * 0.9
    c = nz * env
    c = filt(c, "hp", 500)
    return c * vel * 1.4


def snare(vel=1.0, seed=5):
    n = secs(0.3)
    t = np.arange(n) / SR
    tone = sine(185 + 40 * np.exp(-t / 0.02), n) * np.exp(-t / 0.06) * 0.6
    nz = filt(noise(n, seed), "bp", 3000, 0.7) * np.exp(-t / 0.11)
    return (tone + nz) * vel


def hat(open_=False, vel=1.0, seed=21):
    n = secs(0.35 if open_ else 0.08)
    t = np.arange(n) / SR
    nz = noise(n, seed)
    nz = filt(filt(nz, "hp", 7500), "peak", 10500, 1.0, 5)
    env = np.exp(-t / (0.11 if open_ else 0.018))
    return nz * env * vel * 0.55


def crash(vel=1.0, length=2.4, seed=31):
    n = secs(length)
    t = np.arange(n) / SR
    nz = noise(n, seed)
    metal = sum(square(f, n) for f in (1170, 1593, 2289, 3061)) * 0.08
    s = filt(nz + metal, "hp", 4200)
    env = np.exp(-t / (length * 0.32)) * np.minimum(1, t / 0.002)
    return stereo(s * env * vel * 0.5, 0.0) + stereo(filt(noise(n, seed + 1), "hp", 5000) * env * vel * 0.25, 0.3)


def impact(vel=1.0, length=2.5):
    n = secs(length)
    t = np.arange(n) / SR
    f = 34 + 52 * np.exp(-t / 0.08)
    boom = sine(f, n) * np.exp(-t / 0.9)
    thud = filt(noise(n, 41), "lp", 900) * np.exp(-t / 0.12) * 0.7
    return soft_clip((boom + thud) * 1.3, 1.2) * vel


def riser(length, vel=1.0, seed=51, f0=300, f1=9000):
    n = secs(length)
    t = np.arange(n) / SR
    p = t / length
    fc = f0 * (f1 / f0) ** (p ** 1.5)
    nz = sweep(noise(n, seed), "bp", fc, q=1.6)
    pitch = sine(220 * 2 ** (p * 2.0), n) * 0.12 + saw(110 * 2 ** (p * 2.0), n) * 0.05
    env = p ** 2.2
    return stereo((nz * 0.9 + pitch) * env * vel, 0.0)


def reverse_crash(length=1.2, vel=1.0):
    c = crash(1.0, length + 0.2)[: secs(length)]
    return c[::-1] * vel


def supersaw(m, n, detune=0.11, voices=5, seed=0):
    rng = np.random.default_rng(seed + m)
    left = np.zeros(n)
    right = np.zeros(n)
    for v in range(voices):
        cents = (v - (voices - 1) / 2) / ((voices - 1) / 2) * detune * 100
        f = midi_hz(m) * 2 ** (cents / 1200)
        s = saw(f, n, phase0=rng.random())
        pan = (v / (voices - 1)) * 2 - 1
        left += s * np.cos((pan + 1) * np.pi / 4)
        right += s * np.sin((pan + 1) * np.pi / 4)
    return np.stack([left, right], axis=1) / voices


def pad_chord(notes, length, cutoff=1800, attack=0.35, release=0.6, seed=0):
    n = secs(length + release)
    out = np.zeros((n, 2))
    for m in notes:
        out += supersaw(m, n, detune=0.12, voices=5, seed=seed)
    env = adsr(n, a=attack, d=0.3, s=0.85, r=release, gate=length)
    out = filt(out, "lp", cutoff, 0.6)
    return out * env[:, None] * 0.35


def pluck(m, length=0.25, bright=1.0):
    n = secs(length + 0.25)
    t = np.arange(n) / SR
    x = saw(midi_hz(m), n) * 0.7 + square(midi_hz(m) * 1.003, n, pw=0.3) * 0.3
    fc = 300 + 4200 * bright * np.exp(-t / 0.07)
    y = sweep(x, "lp", fc, q=1.1, block=64)
    return y * np.exp(-t / 0.16)


def bass_note(m, length, drive=1.0, bright=1.0):
    n = secs(length + 0.05)
    t = np.arange(n) / SR
    f = midi_hz(m)
    x = saw(f, n) * 0.55 * drive + sine(f, n) * 0.9
    fc = 180 + 900 * bright * np.exp(-t / 0.09)
    y = sweep(x, "lp", fc, q=0.9, block=64)
    env = adsr(n, a=0.004, d=0.08, s=0.8, r=0.04, gate=length)
    return soft_clip(y * env * 1.2, 1.3)


def lead_note(m, length, prev=None):
    n = secs(length + 0.3)
    t = np.arange(n) / SR
    f0 = midi_hz(m)
    f = np.full(n, f0)
    if prev is not None:
        glide = np.exp(-t / 0.035)
        f = f0 * (midi_hz(prev) / f0) ** glide
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.18) / 0.2, 0, 1)
    f = f * vib
    x = saw(f, n) * 0.5 + square(f * 1.004, n, pw=0.45) * 0.35 + saw(f * 0.5, n) * 0.15
    y = filt(x, "lp", 3600, 0.8)
    env = adsr(n, a=0.01, d=0.15, s=0.75, r=0.18, gate=length)
    return y * env


def stab(notes, length=0.28, bright=1.0):
    n = secs(length + 0.3)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for m in notes:
        out += supersaw(m, n, detune=0.14, voices=5)
    fc = 500 + 6000 * bright * np.exp(-t / 0.09)
    out = sweep(out, "lp", fc, q=0.8, block=64)
    env = adsr(n, a=0.002, d=0.12, s=0.5, r=0.2, gate=length)
    return out * env[:, None] * 0.4


# ------------------------------------------------------------------ arrangement

def build():
    drums = np.zeros((N, 2))
    bass = np.zeros((N, 2))
    pads = np.zeros((N, 2))
    arps = np.zeros((N, 2))
    leads = np.zeros((N, 2))
    fx = np.zeros((N, 2))
    kicks = []  # times, for sidechain

    total_bars = int(LENGTH / BAR)

    for bar in range(total_bars):
        t0 = t_of(bar)
        ch = chord_at(bar)

        # ---------------- pads (all the way to the final hit)
        if t0 < 56:
            if t0 < 6:
                cutoff = 700 + 260 * bar
            elif t0 < 12:
                cutoff = 1500
            elif t0 < 38:
                cutoff = 2200 if t0 < 24 else 3000
            elif t0 < 46:
                cutoff = 3600
            else:
                cutoff = 2600
            p = pad_chord(ch["pad"], BAR, cutoff=cutoff, attack=0.6 if t0 < 6 else 0.25, seed=bar)
            place(pads, p, t0, 1.0 if t0 >= 6 else 0.8)

        # ---------------- arp, 16ths (from 0.5 s, filtered intro)
        if t0 < 54:
            pattern = [0, 2, 1, 3, 2, 4, 3, 1]
            for k in range(16):
                at = t0 + k * BEAT / 4
                if at < 0.5:
                    continue
                note = ch["arp"][pattern[k % 8]]
                if t0 < 6:
                    bright, vel = 0.25 + 0.12 * bar, 0.45
                elif t0 < 12:
                    bright, vel = 0.5, 0.6
                elif 38 <= t0 < 46:
                    bright, vel = 1.0, 0.55
                else:
                    bright, vel = 0.8, 0.65
                accent = 1.0 if k % 4 == 0 else 0.75
                place(arps, stereo(pluck(note, 0.12, bright), 0.15 if k % 2 else -0.15), at, vel * accent)

        # ---------------- drums
        if 6 <= t0 < 54:
            for b in range(4):
                at = t_of(bar, b)
                if 37.5 <= at < 38 or 53.5 <= at < 54:
                    continue
                if 6 <= t0 < 12:
                    k = filt(kick(0.75), "lp", 1400)
                else:
                    k = kick(1.0)
                place(drums, stereo(k), at, 0.95)
                kicks.append(at)
            # claps on 2 and 4 from scene 3
            if t0 >= 12:
                for b in (1, 3):
                    at = t_of(bar, b)
                    if (36 <= at < 38) or (52 <= at < 54):
                        continue
                    place(drums, stereo(clap(0.8, seed=bar * 7 + b), 0.05), at)
            # hats
            if t0 < 12:
                for e in range(8):
                    place(drums, stereo(hat(False, 0.35 if e % 2 else 0.2, seed=bar * 16 + e), 0.25), t_of(bar, e / 2))
            else:
                for s in range(16):
                    v = [0.5, 0.25, 0.4, 0.25][s % 4]
                    if 46 <= t0 < 52:
                        v *= 0.8
                    place(drums, stereo(hat(False, v, seed=bar * 32 + s), 0.25 if s % 2 else -0.2), t_of(bar, s / 4))
                for b in range(4):  # open hats on the off-beat
                    place(drums, stereo(hat(True, 0.35, seed=bar * 9 + b), -0.3), t_of(bar, b + 0.5))
            # perc on scene 4+ (rim-ish snare ghost notes)
            if 24 <= t0 < 36 or 38 <= t0 < 44:
                for b in (0.75, 2.25, 3.75):
                    place(drums, stereo(filt(snare(0.25, seed=bar + int(b * 4)), "hp", 900), 0.4), t_of(bar, b))

        # quiet hats in the intro's second half
        if t0 == 4:
            for e in range(8):
                place(drums, stereo(hat(False, 0.12 + 0.03 * e, seed=e), 0.2), t_of(bar, e / 2))

        # ---------------- bass, 8ths
        if 6 <= t0 < 54:
            slots = [0, 2, 3, 5, 6, 7] if t0 >= 12 else [0, 3, 6]
            for s in slots:
                at = t_of(bar, s / 2)
                if 37.5 <= at < 38 or 53.5 <= at < 54:
                    continue
                m = ch["root"] + (12 if (s == 6 and t0 >= 12) else 0)
                drive = 1.4 if 38 <= t0 < 46 else 1.0
                bright = 1.3 if 38 <= t0 < 46 else (0.5 if t0 < 12 else 1.0)
                place(bass, stereo(bass_note(m, 0.2 if t0 >= 12 else 0.4, drive, bright)), at, 0.8 if t0 >= 12 else 0.65)

        # ---------------- drop: stabs + lead
        if 38 <= t0 < 46:
            for b in (0.5, 1.5, 2.5, 3.5):
                place(leads, stab([n + 12 for n in ch["pad"][:4]], 0.18, 0.9), t_of(bar, b), 0.55)

    # lead melody over the drop (bars 19–22), beats within each bar
    melody = [
        [(0, 76, .75), (.75, 74, .25), (1, 72, .5), (1.5, 69, .5), (2, 72, .5), (2.5, 74, .5), (3, 76, 1)],
        [(0, 77, .75), (.75, 76, .25), (1, 72, 1), (2, 69, .5), (2.5, 72, .5), (3, 74, 1)],
        [(0, 79, .75), (.75, 76, .25), (1, 74, .5), (1.5, 72, .5), (2, 74, .5), (2.5, 76, .5), (3, 79, 1)],
        [(0, 81, 1.5), (1.5, 79, .5), (2, 76, 1), (3, 74, 1)],
    ]
    prev = None
    for i, bar_notes in enumerate(melody):
        for (b, m, d) in bar_notes:
            ln = lead_note(m, d * BEAT * 0.92, prev)
            place(leads, stereo(ln, 0.0), t_of(19 + i, b), 0.55)
            prev = m

    # ---------------- outro word stabs (54, 54.5, 55, 55.5) and final hit (56)
    for i, at in enumerate((54.0, 54.5, 55.0, 55.5)):
        chord = CHORDS[0]["pad"]
        place(leads, stab([n + 12 for n in chord[:4]], 0.22, 1.0), at, 0.75)
        place(drums, stereo(kick(1.0)), at, 1.0)
        kicks.append(at)
        place(drums, stereo(clap(0.9, seed=90 + i)), at, 0.8)
        place(bass, stereo(bass_note(45, 0.3, 1.3, 1.2)), at, 0.8)

    final = pad_chord([57, 60, 64, 67, 71, 76], 1.6, cutoff=5200, attack=0.01, release=2.4, seed=99)
    place(pads, final, 56.0, 1.6)
    place(leads, stab([69, 72, 76, 79, 83], 0.6, 1.0), 56.0, 0.9)
    place(bass, stereo(bass_note(33, 1.2, 1.0, 0.8)), 56.0, 1.0)
    place(fx, stereo(impact(1.0, 3.5)), 56.0, 0.9)
    place(fx, crash(1.0, 3.5), 56.0, 0.7)
    place(drums, stereo(kick(1.0)), 56.0, 1.0)

    # ---------------- transitions and accents
    place(fx, reverse_crash(1.2, 0.6), 3.0 - 1.2)
    place(fx, stereo(impact(0.9, 2.5)), 3.0, 0.85)
    place(fx, crash(0.8, 2.6), 3.0, 0.5)

    place(fx, riser(1.5, 0.35), 6.0 - 1.5)
    place(fx, crash(0.6, 2.0), 6.0, 0.35)
    place(fx, riser(2.0, 0.45), 12.0 - 2.0)
    place(fx, crash(0.8, 2.2), 12.0, 0.55)
    place(fx, crash(0.6, 2.0), 24.0, 0.4)
    place(fx, crash(0.6, 2.0), 30.0, 0.4)

    place(fx, riser(2.0, 0.7), 38.0 - 2.0)
    for k in range(16):  # snare roll into the drop
        at = 36.0 + k * 0.125 if k < 12 else 37.5 + (k - 12) * 0.0625 * 2
        place(drums, stereo(snare(0.25 + 0.04 * k, seed=200 + k), 0.0), at, 0.7)
    place(fx, crash(1.0, 2.6), 38.0, 0.7)
    place(fx, stereo(impact(0.7, 2.0)), 38.0, 0.6)
    place(fx, crash(0.7, 2.0), 42.0, 0.45)

    place(fx, riser(2.0, 0.6), 46.0 - 2.0)
    place(fx, stereo(impact(0.9, 2.5)), 46.0, 0.8)
    place(fx, crash(0.9, 2.4), 46.0, 0.6)

    place(fx, riser(2.0, 0.6), 54.0 - 2.0)
    for k in range(8):
        place(drums, stereo(snare(0.2 + 0.05 * k, seed=300 + k)), 52.0 + k * 0.1875 + (0.0 if k < 6 else 0.0), 0.6)
    place(fx, reverse_crash(1.0, 0.5), 56.0 - 1.0)

    # ---------------- sidechain on the tonal layers
    duck = np.ones(N)
    t = np.arange(N) / SR
    for kt in kicks:
        i = secs(kt)
        j = min(N, i + secs(0.35))
        seg = (t[i:j] - kt)
        duck[i:j] = np.minimum(duck[i:j], 1 - 0.55 * np.exp(-seg / 0.09))

    # ---------------- effects sends
    ir = reverb_ir(2.8, 0.7)
    ir_short = reverb_ir(1.2, 0.35, seed=3)
    pads_w = pads + convolve(pads, ir) * 0.35
    arps_w = arps + delay(arps, BEAT * 0.75, 0.32, taps=4) * 0.6
    arps_w = arps_w + convolve(arps_w, ir) * 0.25
    leads_w = leads + delay(leads, BEAT * 0.75, 0.28, taps=3) * 0.5
    leads_w = leads_w + convolve(leads_w, ir) * 0.3
    drums_w = drums + convolve(filt(drums, "hp", 400), ir_short) * 0.12
    fx_w = fx + convolve(fx, ir) * 0.3

    stems = {
        "drums": drums_w,
        "bass": bass * duck[:, None],
        "pads": pads_w * duck[:, None] ** 0.6,
        "arps": arps_w * duck[:, None] ** 0.7,
        "leads": leads_w * duck[:, None] ** 0.4,
        "fx": fx_w,
    }
    return stems


def rms_db(x, a=12.0, b=36.0):
    seg = x[secs(a):secs(b)]
    return 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9)


# Relative stem levels over the full groove (dB RMS, 12–36 s), and the
# section energy curve (dB) the master follows — the music grows scene by scene.
TARGETS = {"drums": -15.0, "bass": -17.0, "pads": -22.0, "arps": -23.0, "leads": -19.0, "fx": None}
ENERGY = [(0.0, -9.0), (2.9, -9.0), (3.0, -5.0), (5.9, -7.0), (6.0, -5.0), (11.9, -4.0), (12.0, -2.0),
          (23.9, -2.0), (24.0, -1.5), (35.9, -1.5), (37.9, -0.5), (38.0, 0.0), (45.9, 0.0), (46.0, -1.0),
          (53.9, -1.0), (54.0, 0.0), (60.0, 0.0)]


def mixdown(stems):
    mix = np.zeros((N, 2))
    for name, x in stems.items():
        target = TARGETS[name]
        if target is None:
            gain = 0.5
        else:
            ref = rms_db(x, 38, 46) if name == "leads" else rms_db(x)
            gain = 10 ** ((target - ref) / 20)
        mix += x * gain
        print(f"  {name:6s} gain {20 * np.log10(gain):+.1f} dB")

    mix = filt(mix, "hp", 28)
    mix = filt(mix, "lowshelf", 120, 0.7, 1.0)
    mix = filt(mix, "peak", 350, 0.9, -1.5)
    mix = filt(mix, "highshelf", 9000, 0.7, 1.5)
    mix = compress(mix, threshold_db=-12, ratio=2.0, attack=0.01, release=0.2)

    t = np.arange(N) / SR
    times, dbs = zip(*ENERGY)
    curve = 10 ** (np.interp(t, times, dbs) / 20)
    mix *= curve[:, None]

    # tail: let the final hit ring and fade to silence by 60 s
    fade = np.ones(N)
    a, b = secs(58.2), secs(59.85)
    fade[a:b] = np.linspace(1, 0, b - a) ** 2
    fade[b:] = 0
    mix *= fade[:, None]
    mix[: secs(0.02)] *= np.linspace(0, 1, secs(0.02))[:, None]

    peak = np.max(np.abs(mix))
    mix = soft_clip(mix / peak * 1.15, 1.1)
    mix = mix / np.max(np.abs(mix)) * 0.89  # ≈ -1 dBFS
    return mix


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "skit-theme.wav"
    stems = build()
    write_wav(out, mixdown(stems))
    print("wrote", out)
