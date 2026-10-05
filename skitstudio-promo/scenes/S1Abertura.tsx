/* Scene 1 — Abertura (0–6 s): hook line, UI pieces converge, the SkitStudio
 * icon lands on the beat (3.0 s), wordmark + slogan, then the camera dives
 * through the icon into the app (6.0 s). */

import type { JSX } from "solid-js";
import { C, F, I } from "../lib/theme";
import { E, Kf, Pivot, fade, type Key } from "../lib/motion";
import { Chip } from "../components/fx/Fx";

const CHIPS: { icon: string; label: string; x: number; y: number; s: number; blur: number; tone?: "solid" }[] = [
  { icon: I.button, label: "Button", x: 380, y: 230, s: 1.25, blur: 0, tone: "solid" },
  { icon: I.textView, label: "TextView", x: 1540, y: 220, s: 1.1, blur: 0 },
  { icon: I.editText, label: "EditText", x: 330, y: 850, s: 1.05, blur: 0 },
  { icon: I.image, label: "Imagem", x: 1600, y: 860, s: 1.2, blur: 0 },
  { icon: I.switchIcon, label: "Switch", x: 1160, y: 110, s: 0.75, blur: 3 },
  { icon: I.code, label: "Código", x: 720, y: 975, s: 0.8, blur: 2.5 },
  { icon: I.checkbox, label: "CheckBox", x: 150, y: 540, s: 0.7, blur: 4 },
  { icon: I.linearV, label: "LinearLayout", x: 1770, y: 540, s: 0.7, blur: 4 },
];

const CONVERGE = 2.45;
const HIT = 3.0;

function HookLine(props: { text: string; y: number; t: number; gradient?: boolean }): JSX.Element {
  return (
    <group name={`Hook ${props.text}`}>
      <text x={0} y={props.y} width={1920} height={150} textAlign="center" fontFamily={F.display} fontWeight={800} fontSize={118} letterSpacing={-3} color={C.text}>
        {props.text}
        {props.gradient && (
          <linearGradientPaint rotation={0}>
            <colorStop offset={0.2} color={C.purpleHi} />
            <colorStop offset={0.8} color={C.cyan} />
          </linearGradientPaint>
        )}
        <Kf p="offsetY" k={[[0, 150, E.hold], [props.t, 150, E.out], [props.t + 0.7, 0]]} />
        <Kf p="blur" k={[[0, 10, E.hold], [props.t, 10, E.out], [props.t + 0.5, 0], [CONVERGE, 0, E.in], [CONVERGE + 0.4, 18]]} />
        <Kf p="opacity" k={[[0, 0, E.hold], [props.t, 0, E.out], [props.t + 0.25, 1], [CONVERGE + 0.1, 1, E.in], [CONVERGE + 0.4, 0]]} />
      </text>
      <rect clipPath x={0} y={props.y - 30} width={1920} height={170} end={3} />
    </group>
  );
}

export function S1Abertura(): JSX.Element {
  const iconSize = 300;
  const cx = 960;
  const cy = 420;
  return (
    <group name="S1 Abertura" start={0} end={6}>
      {/* floating UI pieces with depth, converging into the logo */}
      <group name="Chips">
        {CHIPS.map((c, i) => {
          const t = 0.15 + i * 0.09;
          const driftX = (c.x - 960) * 0.06;
          const driftY = (c.y - 540) * 0.06;
          return (
            <Chip icon={c.icon} label={c.label} x={c.x} y={c.y} tone={c.tone}>
              {c.blur > 0 && <effect type="blur" value={c.blur} />}
              <Kf p="offsetX" k={[[0, 0, E.hold], [t, 0, E.linear], [CONVERGE, driftX, E.expoIn], [CONVERGE + 0.5, cx - c.x]]} />
              <Kf p="offsetY" k={[[0, 40, E.hold], [t, 40, E.out], [t + 0.8, 0, E.linear], [CONVERGE, driftY, E.expoIn], [CONVERGE + 0.5, cy - c.y]]} />
              <Kf p="opacity" k={[[0, 0, E.hold], [t, 0, E.out], [t + 0.4, 1], [CONVERGE + 0.3, 1, E.in], [CONVERGE + 0.52, 0]]} />
              <Kf p="scale" k={[[0, c.s * 0.85, E.hold], [t, c.s * 0.85, E.out], [t + 0.6, c.s], [CONVERGE, c.s, E.expoIn], [CONVERGE + 0.5, 0.15]]} />
            </Chip>
          );
        })}
      </group>

      {/* the hook */}
      <HookLine text="Crie apps Android" y={372} t={0.3} />
      <HookLine text="direto do celular." y={510} t={0.72} gradient />

      {/* logo lockup */}
      <Pivot name="Ring" x={cx - 170} y={cy - 170} w={340} h={340} end={6}>
          <rect x={0} y={0} width={340} height={340} cornerRadius={170} end={6}>
            <stroke color={C.lavender} width={3} />
          </rect>
          <Kf p="scale" k={[[0, 0.8, E.hold], [HIT, 0.8, E.out], [HIT + 0.9, 2.6]]} />
          <Kf p="opacity" k={[[0, 0, E.hold], [HIT, 0.9, E.out], [HIT + 0.9, 0]]} />
        </Pivot>

      <Pivot name="Logo dive" w={1920} h={cy * 2} end={6}>
        <rect name="Halo" x={cx - cy} y={0} width={cy * 2} height={cy * 2} end={6}>
          <radialGradientPaint>
            <colorStop offset={0} color={C.purple} opacity={0.6} />
            <colorStop offset={0.4} color={C.purpleDeep} opacity={0.22} />
            <colorStop offset={1} color={C.purpleDeep} opacity={0} />
          </radialGradientPaint>
          <Kf p="opacity" k={[[0, 0, E.hold], [HIT, 0, E.out], [HIT + 0.5, 1], [5.3, 0.85, E.in], [5.6, 0]]} />
        </rect>
        <Pivot
          name="Icon"
          x={cx - iconSize / 2}
          y={cy - iconSize / 2}
          w={iconSize}
          h={iconSize}
          pad={200}
          end={6}
          k={[
            { p: "scale", k: [[0, 0.35, E.hold], [HIT - 0.02, 0.35, E.backHard], [HIT + 0.5, 1]] },
            { p: "opacity", k: [[0, 0, E.hold], [HIT - 0.02, 0, E.out], [HIT + 0.08, 1]] },
            { p: "blur", k: [[0, 12, E.hold], [HIT - 0.02, 12, E.out], [HIT + 0.3, 0]] },
          ]}
        >
          <image name="Icon card" src="images/brand/skitstudio-card.png" x={0} y={0} width={iconSize} height={iconSize} end={6} />
          <group name="Sheen">
            <rect x={-120} y={-60} width={70} height={iconSize + 120} rotation={22} end={6}>
              <linearGradientPaint rotation={0}>
                <colorStop offset={0} color="#ffffff" opacity={0} />
                <colorStop offset={0.5} color="#ffffff" opacity={0.35} />
                <colorStop offset={1} color="#ffffff" opacity={0} />
              </linearGradientPaint>
              <Kf p="offsetX" k={[[0, 0, E.hold], [4.35, 0, E.inOut], [5.0, 520]]} />
            </rect>
            <rect clipPath x={12} y={12} width={iconSize - 24} height={iconSize - 24} cornerRadius={66} end={6} />
          </group>
          <Pivot
            name="Cube"
            w={iconSize}
            h={iconSize}
            pad={0}
            end={6}
            k={[
              { p: "offsetY", k: [[0, -150, E.hold], [HIT + 0.08, -150, E.back], [HIT + 0.45, 0]] },
              { p: "opacity", k: fade(HIT + 0.08, 0.12) },
              { p: "scale", k: [[0, 1.25, E.hold], [HIT + 0.08, 1.25, E.back], [HIT + 0.45, 1]] },
            ]}
          >
            <image src="images/brand/skitstudio-cube.png" x={0} y={0} width={iconSize} height={iconSize} end={6} />
          </Pivot>
        </Pivot>

        <group name="Wordmark">
          <text x={0} y={cy + 196} width={1920} height={140} textAlign="center" fontFamily={F.ui} fontWeight={700} fontSize={112} letterSpacing={-1} color={C.text} end={6}>
            SkitStudio
            <textRange start={4} color={C.purple} />
            <Kf p="offsetY" k={[[0, 30, E.hold], [3.5, 30, E.out], [4.1, 0]]} />
          </text>
          <rect clipPath y={cy + 170} height={180} end={6}>
            <Kf p="x" k={[[0, 960, E.hold], [3.5, 960, E.out], [4.1, 0]]} />
            <Kf p="width" k={[[0, 0, E.hold], [3.5, 0, E.out], [4.1, 1920]]} />
          </rect>
          <Kf p="opacity" k={[[0, 0, E.hold], [3.5, 0, E.out], [3.7, 1], [5.3, 1, E.in], [5.5, 0]]} />
        </group>
        <text name="Slogan" x={0} y={cy + 338} width={1920} height={48} textAlign="center" fontFamily={F.ui} fontSize={36} color="#b3aed6" end={6}>
          Crie apps Android no seu dispositivo
          <Kf p="opacity" k={fade(3.95, 0.4, 5.25, 0.2)} />
          <Kf p="offsetY" k={[[0, 18, E.hold], [3.95, 18, E.out], [4.5, 0]]} />
        </text>
        <Kf p="scale" k={[[0, 0.96, E.hold], [HIT, 0.96, E.linear], [5.3, 1.03, E.expoIn], [6.0, 9]]} />
      </Pivot>

      {/* white flash on the hit */}
      <rect name="Hit flash" x={0} y={0} width={1920} height={1080} end={6}>
        <radialGradientPaint>
          <colorStop offset={0} color="#ffffff" opacity={0.5} />
          <colorStop offset={0.5} color={C.lavender} opacity={0.12} />
          <colorStop offset={1} color={C.lavender} opacity={0} />
        </radialGradientPaint>
        <Kf p="opacity" k={[[0, 0, E.hold], [HIT - 0.02, 0, E.out], [HIT + 0.04, 1], [HIT + 0.45, 0]]} />
      </rect>
    </group>
  );
}

export const S1_KEYS = { CONVERGE, HIT } as const;
export type _K = Key;
