/* The stage everything plays on: the navy plate, drifting glows, and the
 * code rain from SkitStudio's splash screen (opening and closing). */

import type { JSX } from "solid-js";
import { C } from "../lib/theme";
import { E } from "../lib/motion";
import { CodeRain, Glow } from "../components/fx/Fx";
import { DURATION } from "../lib/timeline";

export function Background(): JSX.Element {
  const end = DURATION;
  return (
    <group name="Background">
      <image name="Plate" src="images/bg/plate.png" x={0} y={0} width={1920} height={1080} end={end} />
      <Glow x={320} y={180} r={760} color={C.purpleDeep} end={end} drift={[260, 120]} opacity={0.9} />
      <Glow x={1700} y={940} r={680} color="#0e7490" end={end} drift={[-220, -90]} opacity={0.55} />
      <Glow x={1100} y={1180} r={900} color="#6d28d9" end={end} drift={[-160, -40]} opacity={0.4} />
      <CodeRain
        end={end}
        opacity={[
          [0, 0, E.out],
          [0.8, 0.5, E.linear],
          [2.9, 0.42, E.out],
          [3.3, 0.16, E.linear],
          [5.4, 0.16, E.in],
          [6.0, 0, E.hold],
          [54.0, 0, E.out],
          [54.4, 0.14, E.linear],
          [56.0, 0.14, E.out],
          [56.6, 0.22, E.linear],
          [60.0, 0.22],
        ]}
      />
    </group>
  );
}
