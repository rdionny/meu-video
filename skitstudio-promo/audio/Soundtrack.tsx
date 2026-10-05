/* Music bed and the sound-design cue sheet. Every cue sits on the frame of
 * the action it belongs to (taps, drops, typing, transitions); levels keep
 * the effects under the music.
 *
 * The cues are mixed into one effects track (assets/audio/sfx-bed.wav) by
 * tools/audio/sfx_bed.py: an export schedules each audio clip when the frame
 * loop reaches it while the audio renderer runs ahead, which can cut short
 * clips placed mid-timeline — a bed starting at 0 s lands every cue exactly.
 * Edit CUES, then: node tools/audio/export-cues.mjs && python3 tools/audio/sfx_bed.py ... */

import type { JSX } from "solid-js";
import { STORY_BEATS as T } from "../scenes/Story";

type Cue = [time: number, sfx: string, volume: number];

export const CUES: Cue[] = [
  // 1 — abertura
  [0.28, "whoosh-short", -18],
  [0.7, "whoosh-short", -20],
  [2.42, "whoosh", -11],
  [3.08, "snap", -15],
  [3.5, "shimmer", -13],
  [4.35, "whoosh-short", -21],
  [5.25, "whoosh-long", -9],
  // 2 — novo projeto
  [T.newProject, "click", -8],
  [T.newProject + 0.42, "typing-short", -16],
  [T.edit, "click", -8],
  [T.expand, "whoosh-short", -15],
  [10.45, "whoosh-short", -19],
  // 3 — design: pick + drop for each component
  ...T.drags.flatMap((d): Cue[] => [
    [d.drop - 0.83, "pick", -15],
    [d.drop, "snap", -8],
  ]),
  [T.selectBtn, "click", -8],
  [T.sheetA, "sheet", -12],
  [T.tapTexto, "click", -8],
  [T.typeEnviar, "typing-short", -15],
  [T.confirm, "click", -8],
  [T.btnText, "pop", -14],
  [T.tapLargura, "click", -8],
  [T.pickMatch, "click", -8],
  [T.btnWidth, "whoosh-short", -17],
  [T.sheetAClose, "sheet", -18],
  // 4 — estrutura + código
  [T.tapArvore, "click", -8],
  [T.tapArvore + 0.1, "whoosh-short", -20],
  [T.tapTreeBtn, "select", -12],
  [T.tapCodigo, "click", -8],
  [27.0, "whoosh-short", -21],
  // 5 — eventos + lógica
  [T.tapVisual, "click", -8],
  [T.selectBtn2, "click", -8],
  [T.sheetB, "sheet", -12],
  [T.tapEvent, "click", -8],
  [T.tapOnClick, "click", -8],
  [T.toJava, "whoosh-short", -16],
  [T.typeJava, "typing-long", -13],
  [T.highlight, "select", -14],
  [37.45, "whoosh-long", -8],
  // 6 — visão geral + build
  [38.0, "whoosh-short", -16],
  [39.0, "whoosh-short", -17],
  [40.0, "whoosh-short", -17],
  [41.75, "whoosh", -11],
  [42.5, "click", -8],
  [42.62, "whoosh-short", -18],
  [45.0, "success", -7],
  [45.5, "click", -8],
  [45.55, "whoosh-long", -9],
  // 7 — resultado
  [47.0, "click", -8],
  [47.25, "typing-short", -14],
  [48.5, "click", -8],
  [49.0, "pop", -9],
  [49.02, "shimmer", -12],
  [53.35, "whoosh", -11],
  // 8 — encerramento
  [54.0, "glitch", -20],
  [54.5, "glitch", -21],
  [55.0, "glitch", -21],
  [55.5, "glitch", -20],
  [55.5, "whoosh-long", -11],
  [56.05, "shimmer", -11],
];

export function Soundtrack(): JSX.Element {
  return (
    <group name="Audio">
      <audio name="Music · skit-theme" src="audio/music/skit-theme.wav" start={0} volume={-1} />
      <audio name={`SFX bed · ${CUES.length} cues`} src="audio/sfx-bed.wav" start={0} volume={0} />
    </group>
  );
}
