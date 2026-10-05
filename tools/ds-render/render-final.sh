#!/usr/bin/env bash
# Final delivery render: the video in parallel segments, the audio in one
# continuous pass, then muxed into the H.264/AAC MP4.
#   tools/ds-render/render-final.sh [scene] [out.mp4] [segments...]
#     scene     promo (1920×1080, default) | promo-vertical (1080×1920)
#     out.mp4   relative to the repository root
#     segments  cut points in seconds (default: 0 18 36 54 72)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
SCENE="${1:-promo}"
OUT="${2:-render/skitstudio-promo-1080p.mp4}"
shift $(( $# > 2 ? 2 : $# ))
cuts=("${@:-0 18 36 54 72}")
read -r -a cuts <<< "${cuts[*]}"
WORK="render/previews/final-$SCENE"
mkdir -p "$WORK"
rm -f "$WORK"/seg-*.webm
pids=()
for ((i = 0; i < ${#cuts[@]} - 1; i++)); do
  a=${cuts[$i]}; b=${cuts[$((i + 1))]}
  node tools/ds-render/render.mjs --project skitstudio-promo --scene "$SCENE" --start "$a" --end "$b" \
    --out "$WORK/seg-$(printf %02d "$i").webm" > "$WORK/seg-$i.log" 2>&1 &
  pids+=($!)
done
node tools/ds-render/render.mjs --project skitstudio-promo --scene "$SCENE" --audio-only --out "$WORK/audio.ogg" > "$WORK/audio.log" 2>&1 &
pids+=($!)
for p in "${pids[@]}"; do wait "$p"; done

"$ROOT/tools/ds-render/assemble.sh" "$WORK" "$OUT" "${cuts[-1]}"
