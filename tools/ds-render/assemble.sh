#!/usr/bin/env bash
# Joins the rendered video segments (exact frame counts, concat filter — no
# container-duration drift at the seams) with the continuous audio pass, and
# encodes the delivery MP4.
#   tools/ds-render/assemble.sh <work-dir> <out.mp4>
set -euo pipefail
WORK="$1"; OUT="$2"
segs=( "$WORK"/seg-*.webm )
inputs=(); labels=""
for i in "${!segs[@]}"; do inputs+=( -i "${segs[$i]}" ); labels+="[$i:v:0]"; done
n=${#segs[@]}
ffmpeg -y -hide_banner -loglevel error "${inputs[@]}" -i "$WORK/audio.ogg" \
  -filter_complex "${labels}concat=n=${n}:v=1:a=0,setpts=N/(30*TB),fps=30[v]" \
  -map "[v]" -map "${n}:a:0" \
  -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p -profile:v high -level 4.2 -g 60 -bf 2 \
  -c:a aac -b:a 256k -ar 48000 -t 60 -movflags +faststart \
  -metadata title="SkitStudio — Crie apps Android no seu dispositivo" \
  -metadata comment="Made with Diffusion Studio" \
  "$OUT"
echo "delivery → $OUT"
