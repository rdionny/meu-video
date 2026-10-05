"""Checks every SFX cue made it into a rendered mix at the right time:
subtracts the music bed from the mix and measures each cue's window."""
import json, sys
import numpy as np
import soundfile as sf

cues_json, mix_f32, music_wav, sfx_dir = sys.argv[1:5]
sr = 48000
cues = json.load(open(cues_json))
mix = np.fromfile(mix_f32, dtype=np.float32).reshape(-1, 2).mean(1)
mus, _ = sf.read(music_wav)
mus = mus.mean(1)
n = min(len(mix), len(mus))
g = np.dot(mix[sr * 2:sr * 58], mus[sr * 2:sr * 58]) / np.dot(mus[sr * 2:sr * 58], mus[sr * 2:sr * 58])
res = mix[:n] - g * mus[:n]
low = []
for t, name, vol in cues:
    clip, _ = sf.read(f"{sfx_dir}/{name}.wav")
    clip = clip.mean(1) if clip.ndim == 2 else clip
    expected = 20 * np.log10(np.abs(clip).max()) + vol
    i = int(t * sr)
    got = 20 * np.log10(np.abs(res[i:i + len(clip)]).max() + 1e-9)
    ok = got > expected - 6
    if not ok:
        low.append((t, name))
    print(f"{t:6.2f} {name:13s} expected {expected:6.1f}  got {got:6.1f}{'' if ok else '  <-- LOW'}")
print(f"music gain {20 * np.log10(g):.2f} dB; low cues: {low}")
