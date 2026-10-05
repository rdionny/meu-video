"""Mixes the sound-design cue sheet into one effects track ("SFX bed").

Diffusion Studio's offline export schedules each audio clip when the frame
loop reaches it, while the audio renderer runs up to a second ahead — short
clips placed mid-timeline can be cut off. One bed starting at 0 s, like the
music, is scheduled up front and lands every effect on its exact sample.

    python3 tools/audio/sfx_bed.py skitstudio-promo/audio/cues.json \
        skitstudio-promo/assets/audio/sfx skitstudio-promo/assets/audio/sfx-bed.wav
"""
import json
import sys

import numpy as np
import soundfile as sf

SR = 48000
LENGTH = 60.0

cues_path, sfx_dir, out = sys.argv[1:4]
cues = json.load(open(cues_path))
bed = np.zeros((int(LENGTH * SR), 2), dtype=np.float64)
for t, name, vol in cues:
    clip, sr = sf.read(f"{sfx_dir}/{name}.wav", always_2d=True)
    assert sr == SR, f"{name}: {sr} Hz"
    if clip.shape[1] == 1:
        clip = np.repeat(clip, 2, axis=1)
    i = int(round(t * SR))
    j = min(len(bed), i + len(clip))
    bed[i:j] += clip[: j - i] * 10 ** (vol / 20)
peak = np.abs(bed).max()
assert peak < 1.0, f"bed clips (peak {peak:.2f})"
sf.write(out, bed.astype(np.float32), SR, subtype="PCM_24")
print(f"wrote {out}: {len(cues)} cues, peak {20 * np.log10(peak):.1f} dBFS")
