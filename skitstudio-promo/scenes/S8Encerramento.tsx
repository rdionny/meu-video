/* Scene 8 — Encerramento (54–60 s): four words on the beat, everything
 * converges, and the brand lands on the final hit (56 s). */

import type { JSX } from "solid-js";
import { C, F, I } from "../lib/theme";
import { E, Kf, Pivot, fade } from "../lib/motion";
import { Chip } from "../components/fx/Fx";

const S8 = 54;
const HIT = 2.0; // 56 s

const WORDS = [
  { text: "DESIGN", icon: "", t: 0.0 },
  { text: "EVENTOS", icon: I.touch, t: 0.5 },
  { text: "LÓGICA", icon: "", t: 1.0 },
  { text: "BUILD", icon: "", t: 1.5 },
];

const CONVERGE = [
  { icon: I.button, label: "Button", x: 220, y: 200 },
  { icon: I.textView, label: "TextView", x: 1700, y: 180 },
  { icon: I.editText, label: "EditText", x: 160, y: 900 },
  { icon: I.touch, label: "onClick", x: 1760, y: 880 },
  { icon: I.code, label: "Java", x: 960, y: 1010 },
  { icon: I.tree, label: "Árvore", x: 960, y: 70 },
  { icon: I.image, label: "Imagem", x: 80, y: 540 },
  { icon: I.download, label: "APK", x: 1840, y: 540 },
];

export function S8Encerramento(): JSX.Element {
  const cx = 960;
  const cy = 392;
  const icon = 250;
  return (
    <group name="S8 Encerramento" start={S8} end={60}>
      {WORDS.map((w, i) => (
        <group name={`Word ${w.text}`} start={w.t} end={w.t + 0.5}>
          <text x={0} y={0} width={1920} height={1080} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={820} color={C.purple} opacity={0.1} rotation={-6 + i * 4}>
            {w.icon}
            <Kf p="scale" k={[[0, 1.15, E.out], [0.5, 1.0]]} />
          </text>
          <text x={0} y={0} width={1920} height={1080} textAlign="center" textBaseline="middle" fontFamily={F.display} fontWeight={800} fontSize={228} letterSpacing={8} color={C.text}>
            {w.text}
            {i % 2 === 1 && (
              <linearGradientPaint rotation={0}>
                <colorStop offset={0.25} color={C.purpleHi} />
                <colorStop offset={0.75} color={C.cyan} />
              </linearGradientPaint>
            )}
            <Kf p="scale" k={[[0, 1.22, E.expo], [0.42, 1.0]]} />
            <Kf p="blur" k={[[0, 10, E.out], [0.18, 0]]} />
          </text>
          <rect x={860} y={690} width={200} height={6} cornerRadius={3} fill={C.purpleHi}>
            <Kf p="width" k={[[0, 0, E.out], [0.35, 200]]} />
            <Kf p="x" k={[[0, 960, E.out], [0.35, 860]]} />
          </rect>
        </group>
      ))}

      <group name="Converge">
        {CONVERGE.map((c, i) => (
          <Chip icon={c.icon} label={c.label} x={c.x} y={c.y} end={HIT + 0.1}>
            <Kf p="offsetX" k={[[0, 0, E.hold], [1.5, 0, E.expoIn], [HIT, cx - c.x]]} />
            <Kf p="offsetY" k={[[0, 0, E.hold], [1.5, 0, E.expoIn], [HIT, cy - c.y]]} />
            <Kf p="scale" k={[[0, 0.6, E.hold], [1.45 + i * 0.01, 0.6, E.out], [1.6, 1, E.expoIn], [HIT, 0.1]]} />
            <Kf p="opacity" k={[[0, 0, E.hold], [1.45 + i * 0.01, 0, E.out], [1.55, 1, E.in], [HIT, 0]]} />
          </Chip>
        ))}
      </group>

      <group name="Lockup" start={HIT}>
        <rect name="Halo" x={cx - 600} y={cy - 600} width={1200} height={1200}>
          <radialGradientPaint>
            <colorStop offset={0} color={C.purple} opacity={0.55} />
            <colorStop offset={0.45} color={C.purpleDeep} opacity={0.18} />
            <colorStop offset={1} color={C.purpleDeep} opacity={0} />
          </radialGradientPaint>
          <Kf p="opacity" k={[[0, 0, E.out], [0.6, 1]]} />
        </rect>
        <Pivot name="Burst" x={cx - 160} y={cy - 160} w={320} h={320}>
          <rect x={0} y={0} width={320} height={320} cornerRadius={160}>
            <stroke color={C.lavender} width={3} />
          </rect>
          <Kf p="scale" k={[[0, 0.8, E.out], [1.0, 3.2]]} />
          <Kf p="opacity" k={[[0, 0.9, E.out], [1.0, 0]]} />
        </Pivot>
        <Pivot
          name="Brand"
          w={1920}
          h={cy * 2 + 40}
          k={[{ p: "scale", k: [[0, 0.98, E.linear], [3.4, 1.04]] }]}
        >
          <Pivot
            name="Icon"
            x={cx - icon / 2}
            y={cy - icon / 2}
            w={icon}
            h={icon}
            k={[
              { p: "scale", k: [[0, 0.3, E.backHard], [0.55, 1]] },
              { p: "opacity", k: [[0, 0, E.out], [0.08, 1]] },
              { p: "blur", k: [[0, 14, E.out], [0.3, 0]] },
            ]}
          >
            <image src="images/brand/skitstudio-icon.png" x={0} y={0} width={icon} height={icon} />
          </Pivot>
          <group name="Wordmark">
            <text x={0} y={cy + 160} width={1920} height={150} textAlign="center" fontFamily={F.ui} fontWeight={700} fontSize={116} letterSpacing={-1} color={C.text}>
              SkitStudio
              <textRange start={4} color={C.purple} />
            </text>
            <rect clipPath y={cy + 140} height={170}>
              <Kf p="x" k={[[0, 960, E.hold], [0.25, 960, E.out], [0.8, 0]]} />
              <Kf p="width" k={[[0, 0, E.hold], [0.25, 0, E.out], [0.8, 1920]]} />
            </rect>
          </group>
        </Pivot>
        <text x={0} y={cy + 318} width={1920} height={70} textAlign="center" fontFamily={F.display} fontWeight={700} fontSize={50} letterSpacing={1} color={C.text}>
          Crie. Programe. Teste.
          <textRange start={6} end={15} color={C.purpleHi} />
          <textRange start={16} color={C.cyan} />
          <animation type="appearWord" delay={0.55} duration={0.6} />
        </text>
        <text x={0} y={cy + 402} width={1920} height={40} textAlign="center" fontFamily={F.ui} fontSize={28} color="#8f94ab">
          Crie apps Android no seu dispositivo
          <Kf p="opacity" k={fade(1.35, 0.5)} />
        </text>
        <rect name="Hit flash" x={0} y={0} width={1920} height={1080}>
          <radialGradientPaint>
            <colorStop offset={0} color="#ffffff" opacity={0.55} />
            <colorStop offset={0.5} color={C.lavender} opacity={0.12} />
            <colorStop offset={1} color={C.lavender} opacity={0} />
          </radialGradientPaint>
          <Kf p="opacity" k={[[0, 1, E.out], [0.45, 0]]} />
        </rect>
      </group>

      <rect name="Fade out" x={0} y={0} width={1920} height={1080} fill="#000000">
        <Kf p="opacity" k={[[0, 0, E.hold], [5.3, 0, E.inOut], [6.0, 1]]} />
      </rect>
    </group>
  );
}
