/* SkitStudio — vídeo promocional (72 s, 30 fps), in two deliveries:
 *   promo           1920 × 1080 (YouTube)
 *   promo-vertical  1080 × 1920 (Shorts / Reels / TikTok)
 *
 * A Diffusion Studio project: open this folder in Diffusion Studio
 * (`diffusion open skitstudio-promo`) to edit it on the canvas/timeline, or
 * render it headlessly with tools/ds-render (see the repository README).
 *
 * Story: hook → logo → new project → design (drag components, properties)
 * → structure (tree, XML) → event + Java logic → overview → Skit AI (model,
 * prompt, edits, diff) → build → the app running → brand lockup. Both scenes
 * play the same composition; layout that depends on the frame asks the
 * Format (lib/format.ts). Scene timing lives in lib/timeline.ts.
 */

import { C } from "./lib/theme";
import { DURATION } from "./lib/timeline";
import { FH, FV, type Format } from "./lib/format";
import { Background, TopScrim } from "./scenes/Background";
import { S1Abertura } from "./scenes/S1Abertura";
import { Story, StoryTitles } from "./scenes/Story";
import { S6Visao } from "./scenes/S6Visao";
import { S6IA, S6IATitles } from "./scenes/S6IA";
import { S7Resultado, S7Titles } from "./scenes/S7Resultado";
import { S8Encerramento } from "./scenes/S8Encerramento";
import { Soundtrack } from "./audio/Soundtrack";
import { Thumbnail } from "./scenes/Thumbnail";

function Promo(props: { f: Format }) {
  const f = props.f;
  return (
    <>
      <Background f={f} />
      <S1Abertura f={f} />
      <Story f={f} />
      <S6Visao f={f} />
      <S6IA f={f} />
      <S7Resultado f={f} />
      <TopScrim f={f} />
      <StoryTitles f={f} />
      <S6IATitles f={f} />
      <S7Titles f={f} />
      <S8Encerramento f={f} />
      <Soundtrack />
    </>
  );
}

export default function SkitStudioPromo() {
  return (
    <stage background="#111118" camera={[0.12, 0, 0, 0.12, 60, 160]}>
      <scene id="promo" name="SkitStudio — Promo 16:9" width={FH.w} height={FH.h} fill={C.ink} workarea={[0, DURATION]} volume={1} active>
        <Promo f={FH} />
      </scene>
      <scene id="promo-vertical" name="SkitStudio — Promo 9:16" x={2120} width={FV.w} height={FV.h} fill={C.ink} workarea={[0, DURATION]} volume={1}>
        <Promo f={FV} />
      </scene>
      <Thumbnail />
    </stage>
  );
}
