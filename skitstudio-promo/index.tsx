/* SkitStudio — vídeo promocional (60 s, 1920 × 1080, 30 fps).
 *
 * A Diffusion Studio project: open this folder in Diffusion Studio
 * (`diffusion open skitstudio-promo`) to edit it on the canvas/timeline, or
 * render it headlessly with tools/ds-render (see the repository README).
 *
 * Story: hook → logo → new project → design (drag components, properties)
 * → structure (tree, XML) → event + Java logic → overview + build → the app
 * running → brand lockup. Scene timing lives in lib/timeline.ts.
 */

import { C } from "./lib/theme";
import { DURATION } from "./lib/timeline";
import { Background } from "./scenes/Background";
import { S1Abertura } from "./scenes/S1Abertura";
import { Story, StoryTitles } from "./scenes/Story";
import { S6Visao, S6Titles } from "./scenes/S6Visao";
import { S7Resultado, S7Titles } from "./scenes/S7Resultado";
import { S8Encerramento } from "./scenes/S8Encerramento";
import { Soundtrack } from "./audio/Soundtrack";
import { Thumbnail } from "./scenes/Thumbnail";

export default function SkitStudioPromo() {
  return (
    <stage background="#111118" camera={[0.16, 0, 0, 0.16, 60, 220]}>
      <scene id="promo" name="SkitStudio — Promo" width={1920} height={1080} fill={C.ink} workarea={[0, DURATION]} volume={1} active>
        <Background />
        <S1Abertura />
        <Story />
        <StoryTitles />
        <S6Visao />
        <S6Titles />
        <S7Resultado />
        <S7Titles />
        <S8Encerramento />
        <Soundtrack />
      </scene>
      <Thumbnail />
    </stage>
  );
}
