#!/usr/bin/env bash
# Final delivery render: the video in parallel segments, the audio in one
# continuous pass, then muxed into the H.264/AAC MP4.
#   tools/ds-render/render-final.sh [segments...]   (default: 0 15 30 45 60)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
OUT=render
WORK=render/previews/final
mkdir -p "$WORK"
cuts=("${@:-0 15 30 45 60}")
read -r -a cuts <<< "${cuts[*]}"
pids=()
for ((i = 0; i < ${#cuts[@]} - 1; i++)); do
  a=${cuts[$i]}; b=${cuts[$((i + 1))]}
  node tools/ds-render/render.mjs --project skitstudio-promo --scene promo --start "$a" --end "$b" \
    --out "$WORK/seg-$(printf %02d "$i").webm" > "$WORK/seg-$i.log" 2>&1 &
  pids+=($!)
done
node tools/ds-render/render.mjs --project skitstudio-promo --scene promo --audio-only --out "$WORK/audio.ogg" > "$WORK/audio.log" 2>&1 &
pids+=($!)
for p in "${pids[@]}"; do wait "$p"; done

"$ROOT/tools/ds-render/assemble.sh" "$WORK" "$OUT/skitstudio-promo-1080p.mp4"
