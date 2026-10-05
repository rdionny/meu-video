/* Shared motion-design pieces: the finger, drags, headlines, background. */

import type { JSX } from "solid-js";
import { createEffect } from "solid-js";
import { useResolution, useTicker, type SceneNode } from "@diffusionstudio/jsx";
import { C, F } from "../../lib/theme";
import { E, Kf, Pivot, fade, type Key } from "../../lib/motion";

/** A tap: the finger arrives, presses (ripple), and lifts. Coordinates in the parent's units. */
export function Tap(props: { x: number; y: number; t: number; size?: number; end?: number; from?: [number, number] }): JSX.Element {
  const s = props.size ?? 26;
  const t = props.t;
  const from = props.from ?? [props.x + s * 0.9, props.y + s * 1.4];
  return (
    <group name="Tap">
      <Pivot x={props.x - s * 1.5} y={props.y - s * 1.5} w={s * 3} h={s * 3} end={props.end}>
        <rect x={s} y={s} width={s} height={s} cornerRadius={s / 2} end={props.end}>
          <stroke color="#ffffff" width={s * 0.07} />
        </rect>
        <Kf p="scale" k={[[0, 1, E.hold], [t, 1, E.out], [t + 0.5, 2.6]]} />
        <Kf p="opacity" k={[[0, 0, E.hold], [t, 0.9, E.out], [t + 0.5, 0]]} />
      </Pivot>
      <Pivot w={s} h={s} end={props.end}>
        <rect x={0} y={0} width={s} height={s} cornerRadius={s / 2} fill="#ffffff" end={props.end}>
          <shadow color="#000000" blur={s * 0.5} offsetY={s * 0.15} opacity={0.35} />
        </rect>
        <Kf p="x" k={[[0, from[0] - s / 2, E.hold], [t - 0.38, from[0] - s / 2, E.out], [t - 0.06, props.x - s / 2]]} />
        <Kf p="y" k={[[0, from[1] - s / 2, E.hold], [t - 0.38, from[1] - s / 2, E.out], [t - 0.06, props.y - s / 2]]} />
        <Kf p="scale" k={[[0, 1.3, E.hold], [t - 0.38, 1.3, E.out], [t - 0.1, 1], [t - 0.02, 1, E.out], [t + 0.06, 0.78, E.out], [t + 0.25, 1]]} />
        <Kf p="opacity" k={[[0, 0, E.hold], [t - 0.38, 0, E.out], [t - 0.22, 0.85], [t + 0.25, 0.85, E.in], [t + 0.45, 0]]} />
      </Pivot>
    </group>
  );
}

/**
 * A palette item dragged onto the canvas: the finger holds a ghost chip from
 * `a` to `b` between t0 and t1, then the chip drops into place.
 */
export function Drag(props: { a: [number, number]; b: [number, number]; t0: number; t1: number; icon: string; label: string; end?: number }): JSX.Element {
  const w = 92;
  const h = 28;
  const { a, b, t0, t1 } = props;
  const lift = t0 + 0.12;
  const xk: Key[] = [[0, a[0] - w / 2, E.hold], [lift, a[0] - w / 2, E.inOut], [t1, b[0] - w / 2]];
  // an arc: y eases differently from x
  const yk: Key[] = [[0, a[1] - h / 2, E.hold], [lift, a[1] - h / 2, "cubicBezier(0.3,0,0.2,1)"], [t1, b[1] - h / 2]];
  return (
    <group name={`Drag ${props.label}`}>
      <Pivot w={w} h={h} end={props.end}>
        <rect x={0} y={0} width={w} height={h} cornerRadius={9} fill={C.purple} end={props.end}>
          <stroke color="#c9c2ff" width={1} opacity={0.6} />
          <shadow color={C.purple} blur={20} offsetY={8} opacity={0.7} />
        </rect>
        <text x={9} y={0} width={20} height={h} textBaseline="middle" fontFamily={F.icon} fontSize={15} color="#ffffff" end={props.end}>{props.icon}</text>
        <text x={29} y={0} width={w - 31} height={h} textBaseline="middle" fontFamily={F.ui} fontWeight={600} fontSize={11} color="#ffffff" end={props.end}>{props.label}</text>
        <Kf p="x" k={xk} />
        <Kf p="y" k={yk} />
        <Kf p="scale" k={[[0, 0.9, E.hold], [t0, 0.9, E.back], [lift + 0.1, 1.12], [t1 - 0.05, 1.12, E.in], [t1 + 0.12, 0.6]]} />
        <Kf p="rotation" k={[[0, 0, E.hold], [lift, 0, E.out], [lift + 0.2, -4], [t1 - 0.2, -4, E.out], [t1, 0]]} />
        <Kf p="opacity" k={[[0, 0, E.hold], [t0, 0, E.out], [t0 + 0.08, 1], [t1, 1, E.in], [t1 + 0.12, 0]]} />
      </Pivot>
      <Pivot w={24} h={24} end={props.end}>
        <rect x={0} y={0} width={24} height={24} cornerRadius={12} fill="#ffffff" end={props.end}>
          <shadow color="#000000" blur={12} offsetY={4} opacity={0.35} />
        </rect>
        <Kf p="x" k={[[0, a[0] + 16 + 20, E.hold], [t0 - 0.35, a[0] + 16 + 20, E.out], [t0 - 0.05, a[0] + 16], [lift, a[0] + 16, E.inOut], [t1, b[0] + 16]]} />
        <Kf p="y" k={[[0, a[1] - 2 + 30, E.hold], [t0 - 0.35, a[1] - 2 + 30, E.out], [t0 - 0.05, a[1] - 2], [lift, a[1] - 2, "cubicBezier(0.3,0,0.2,1)"], [t1, b[1] - 2]]} />
        <Kf p="scale" k={[[0, 1.2, E.hold], [t0 - 0.35, 1.2, E.out], [t0 - 0.05, 1], [t0, 0.8, E.out], [t0 + 0.1, 0.85], [t1, 0.85, E.out], [t1 + 0.12, 1]]} />
        <Kf p="opacity" k={[[0, 0, E.hold], [t0 - 0.35, 0, E.out], [t0 - 0.2, 0.85], [t1 + 0.1, 0.85, E.in], [t1 + 0.35, 0]]} />
      </Pivot>
    </group>
  );
}

/**
 * Left-column headline: kicker + big lines (+ optional sub), in at `t`,
 * out at `t2`. Pixel coordinates (frame space).
 */
export function Headline(props: { x?: number; y: number; kicker: string; lines: string[]; sub?: string; t: number; t2: number; size?: number; accent?: number[] }): JSX.Element {
  // lives in a group of its own, from just before `t` to just after `t2`;
  // keys below are relative to that group
  const t0 = Math.max(0, props.t - 0.2);
  const local = { ...props, t: props.t - t0, t2: props.t2 - t0, end: props.t2 - t0 + 0.8 };
  return (
    <group name={`Headline ${props.lines.join(" ")}`} start={t0} end={props.t2 + 0.6}>
      <HeadlineBody {...local} />
    </group>
  );
}

function HeadlineBody(props: { x?: number; y: number; kicker: string; lines: string[]; sub?: string; t: number; t2: number; size?: number; end?: number; accent?: number[] }): JSX.Element {
  const x = props.x ?? 140;
  const size = props.size ?? 78;
  const lh = size * 1.08;
  const out = props.t2;
  const subY = props.y + 52 + props.lines.length * lh + 18;
  return (
    <group name="Headline body">
      <group name="Kicker">
        <rect x={x} y={props.y + 13} width={34} height={3} cornerRadius={1.5} fill={C.purpleHi} end={props.end} />
        <text x={x + 48} y={props.y} fontFamily={F.ui} fontWeight={600} fontSize={21} letterSpacing={4.5} color={C.purpleHi} end={props.end}>
          {props.kicker}
        </text>
        <Kf p="opacity" k={fade(props.t, 0.25, out, 0.22)} />
        <Kf p="offsetX" k={[[0, -24, E.hold], [props.t, -24, E.out], [props.t + 0.5, 0]]} />
      </group>
      {props.lines.map((line, i) => {
        const t = props.t + 0.08 + i * 0.07;
        return (
          <text x={x - 3} y={props.y + 46 + i * lh} fontFamily={F.display} fontWeight={800} fontSize={size} letterSpacing={-1.5} color={C.text} end={props.end}>
            {line}
            {props.accent?.includes(i) && <linearGradientPaint rotation={0}>
              <colorStop offset={0} color={C.purpleHi} />
              <colorStop offset={1} color={C.cyan} />
            </linearGradientPaint>}
            <Kf p="opacity" k={fade(t, 0.3, out + i * 0.03, 0.22)} />
            <Kf p="offsetY" k={[[0, 46, E.hold], [t, 46, E.out], [t + 0.6, 0], [out + i * 0.03, 0, E.in], [out + i * 0.03 + 0.3, -26]]} />
            <Kf p="blur" k={[[0, 14, E.hold], [t, 14, E.out], [t + 0.45, 0], [out, 0, E.in], [out + 0.3, 8]]} />
          </text>
        );
      })}
      {props.sub && (
        <text x={x} y={subY} width={620} height={90} fontFamily={F.ui} fontSize={30} color={C.text2} end={props.end}>
          {props.sub}
          <Kf p="opacity" k={fade(props.t + 0.3, 0.35, out, 0.22)} />
          <Kf p="offsetY" k={[[0, 16, E.hold], [props.t + 0.3, 16, E.out], [props.t + 0.8, 0]]} />
        </text>
      )}
    </group>
  );
}

/** Falling code glyphs, as on SkitStudio's splash screen. */
export function CodeRain(props: { end: number; opacity: Key[]; color?: string }): JSX.Element {
  const { time } = useTicker();
  const resolution = useResolution();
  const glyphs = "01{}<>/#;()=+[]".split("");
  // deterministic columns
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const cols = Array.from({ length: 46 }, (_, i) => ({
    x: 20 + i * 41.5 + rnd() * 14,
    speed: 40 + rnd() * 90,
    offset: rnd() * 1400,
    len: 3 + Math.floor(rnd() * 6),
    size: 14 + rnd() * 10,
    g: Math.floor(rnd() * 1000),
  }));
  const draw = (node: SceneNode) => {
    createEffect(() => {
      const el = node.element;
      if (!el) return;
      const k = Math.max(1, resolution());
      if (el.width !== 1920 * k) {
        el.width = 1920 * k;
        el.height = 1080 * k;
      }
      const ctx = el.getContext("2d")!;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.clearRect(0, 0, 1920, 1080);
      const t = time();
      ctx.font = `500 16px "JetBrains Mono"`;
      ctx.textAlign = "center";
      for (const c of cols) {
        const head = ((c.offset + t * c.speed) % 1400) - 160;
        for (let j = 0; j < c.len; j++) {
          const y = head - j * c.size * 1.4;
          if (y < -30 || y > 1110) continue;
          const a = (1 - j / c.len) * 0.55;
          ctx.globalAlpha = a;
          ctx.fillStyle = j === 0 ? "#b9b0ff" : props.color ?? "#5e4fd6";
          ctx.font = `500 ${c.size}px "JetBrains Mono"`;
          ctx.fillText(glyphs[(c.g + j * 7 + Math.floor(t * 3 + j)) % glyphs.length]!, c.x, y);
        }
      }
      ctx.globalAlpha = 1;
    });
  };
  return (
    <group name="Code rain">
      <surface x={0} y={0} width={1920} height={1080} ref={draw} end={props.end} />
      <Kf p="opacity" k={props.opacity} />
    </group>
  );
}

/** Soft colour glows drifting across the background. */
export function Glow(props: { x: number; y: number; r: number; color: string; opacity?: number; end: number; drift?: [number, number]; opacityKeys?: Key[] }): JSX.Element {
  const d = props.drift ?? [0, 0];
  return (
    <rect name="Glow" x={props.x - props.r} y={props.y - props.r} width={props.r * 2} height={props.r * 2} opacity={props.opacity ?? 1} end={props.end}>
      <radialGradientPaint>
        <colorStop offset={0} color={props.color} opacity={0.55} />
        <colorStop offset={0.45} color={props.color} opacity={0.18} />
        <colorStop offset={1} color={props.color} opacity={0} />
      </radialGradientPaint>
      <Kf p="offsetX" k={[[0, 0, E.inOut], [props.end, d[0]]]} />
      <Kf p="offsetY" k={[[0, 0, E.inOut], [props.end, d[1]]]} />
      {props.opacityKeys && <Kf p="opacity" k={props.opacityKeys} />}
    </rect>
  );
}

/** A floating UI chip (component name + icon) used in the opening and the outro. */
export function Chip(props: { icon: string; label: string; x: number; y: number; scale?: number; end?: number; children?: JSX.Element; tone?: "solid" | "glass" }): JSX.Element {
  const w = 64 + props.label.length * 15;
  const h = 72;
  const solid = props.tone === "solid";
  return (
    <Pivot name={`Chip ${props.label}`} x={props.x - w / 2} y={props.y - h / 2} w={w} h={h} scale={props.scale ?? 1} end={props.end}>
      <rect x={0} y={0} width={w} height={h} cornerRadius={20} fill={solid ? C.purple : "#15172a"} end={props.end}>
        <stroke color={solid ? "#c9c2ff" : "#34385a"} width={1.5} />
        <shadow color={solid ? C.purple : "#000000"} blur={30} offsetY={10} opacity={solid ? 0.6 : 0.5} />
      </rect>
      <text x={20} y={0} width={40} height={h} textBaseline="middle" fontFamily={F.icon} fontSize={32} color={solid ? "#ffffff" : C.purpleHi} end={props.end}>{props.icon}</text>
      <text x={62} y={0} width={w - 64} height={h} textBaseline="middle" fontFamily={F.ui} fontWeight={600} fontSize={26} color={solid ? "#ffffff" : "#e6e7f2"} end={props.end}>{props.label}</text>
      {props.children}
    </Pivot>
  );
}
