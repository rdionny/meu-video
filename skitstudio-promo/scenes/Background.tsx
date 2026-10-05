/* The stage everything plays on: the navy plate, drifting glows, and the
 * code rain from SkitStudio's splash screen (opening and closing). */

import type { JSX } from "solid-js";
import { C } from "../lib/theme";
import { E, Kf } from "../lib/motion";
import { CodeRain, Glow } from "../components/fx/Fx";
import { DURATION } from "../lib/timeline";
import type { Format } from "../lib/format";

export function Background(props: { f: Format }): JSX.Element {
  const f = props.f;
  const end = DURATION;
  const sx = f.w / 1920;
  const sy = f.h / 1080;
  return (
    <group name="Background">
      <image name="Plate" src={f.v ? "images/bg/plate-vertical.png" : "images/bg/plate.png"} x={0} y={0} width={f.w} height={f.h} end={end} />
      <Glow x={320 * sx} y={180 * sy} r={760} color={C.purpleDeep} end={end} drift={[260 * sx, 120 * sy]} opacity={0.9} />
      <Glow x={1700 * sx} y={940 * sy} r={680} color="#0e7490" end={end} drift={[-220 * sx, -90 * sy]} opacity={0.55} />
      <Glow x={1100 * sx} y={1180 * sy} r={900} color="#6d28d9" end={end} drift={[-160 * sx, -40 * sy]} opacity={0.4} />
      <CodeRain
        w={f.w}
        h={f.h}
        end={end}
        opacity={[
          [0, 0, E.out],
          [0.8, 0.5, E.linear],
          [2.9, 0.42, E.out],
          [3.3, 0.16, E.linear],
          [5.4, 0.16, E.in],
          [6.0, 0, E.hold],
          [66.0, 0, E.out],
          [66.4, 0.14, E.linear],
          [68.0, 0.14, E.out],
          [68.6, 0.22, E.linear],
          [72.0, 0.22],
        ]}
      />
    </group>
  );
}

/** Vertical only: keeps the headline area readable over the zoomed phone. */
export function TopScrim(props: { f: Format }): JSX.Element {
  if (!props.f.v) return null as unknown as JSX.Element;
  return (
    <rect name="Top scrim" x={0} y={0} width={1080} height={700} start={6} end={66}>
      <linearGradientPaint rotation={90}>
        <colorStop offset={0} color={C.bg} opacity={0.97} />
        <colorStop offset={0.62} color={C.bg} opacity={0.9} />
        <colorStop offset={1} color={C.bg} opacity={0} />
      </linearGradientPaint>
      <Kf p="opacity" k={[[0, 0, E.out], [0.4, 1, E.hold], [31.8, 1, E.in], [32.0, 0, E.hold], [36.0, 0, E.out], [36.3, 1]]} />
    </rect>
  );
}
