#!/usr/bin/env bash
# Contact sheet of a rendered segment at given absolute times.
#   sheet.sh <video> <segment-start-seconds> <out.png> <t1> <t2> ...
set -euo pipefail
video="$1"; seg="$2"; out="$3"; shift 3
tmp=$(mktemp -d)
i=0
for t in "$@"; do
  rel=$(python3 -c "print(max(0, $t - $seg))")
  ffmpeg -hide_banner -loglevel error -ss "$rel" -i "$video" -frames:v 1 -vf "scale=640:-1,drawtext=text='$t s':x=8:y=8:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.7" "$tmp/$(printf %03d $i).png" -y
  i=$((i+1))
done
cols=3
ffmpeg -hide_banner -loglevel error -pattern_type glob -i "$tmp/*.png" -vf "tile=${cols}x$(( (i + cols - 1) / cols )):padding=4:color=gray" -frames:v 1 "$out" -y
rm -rf "$tmp"
echo "$out"
