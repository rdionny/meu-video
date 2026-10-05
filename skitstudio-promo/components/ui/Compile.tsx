/* The build screen: "Compilando <app>" with the real progress steps, the
 * orbiting cube, and the green "Build concluído ✓" state. */

import type { JSX } from "solid-js";
import { createEffect } from "solid-js";
import { useResolution, useTicker, type SceneNode } from "@diffusionstudio/jsx";
import { C, F } from "../../lib/theme";
import { E, Kf, Pivot, fade, type Key } from "../../lib/motion";
import { StatusBar, SystemNav } from "./Phone";
import { press } from "./ProjectList";

/** The steps the real build reports, in order. */
export const BUILD_STEPS: [pct: number, status: string][] = [
  [0, "Preparando..."],
  [10, "Preparando recursos..."],
  [30, "Vinculando recursos (AAPT2)..."],
  [50, "Compilando Java (ECJ)..."],
  [70, "Gerando DEX (D8)..."],
  [85, "Empacotando APK..."],
  [95, "Assinando APK..."],
  [100, "APK gerado com sucesso!"],
];

/** Cube with three precessing orbits, drawn every frame from the playhead. */
function Orbits(props: { x: number; y: number; size: number; end?: number }): JSX.Element {
  const { time } = useTicker();
  const resolution = useResolution();
  const draw = (node: SceneNode) => {
    createEffect(() => {
      const el = node.element;
      if (!el) return;
      const k = Math.max(1, resolution()) * 2.4;
      const S = props.size;
      if (el.width !== Math.round(S * k)) {
        el.width = Math.round(S * k);
        el.height = Math.round(S * k);
      }
      const ctx = el.getContext("2d")!;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.clearRect(0, 0, S, S);
      const t = time();
      const cx = S / 2;
      const cy = S / 2;

      // backdrop discs
      for (const [r, a] of [[S * 0.44, 0.35], [S * 0.3, 0.5]] as const) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(42, 36, 104, ${a})`;
        ctx.fill();
      }

      const orbits = [
        { color: "#22d3ee", rx: S * 0.44, ry: S * 0.13, tilt: -0.35 + 0.25 * Math.sin(t * 0.9), speed: 1.4, phase: 0 },
        { color: "#f472b6", rx: S * 0.36, ry: S * 0.12, tilt: 0.55 + 0.3 * Math.sin(t * 0.7 + 1), speed: -1.1, phase: 2 },
        { color: "#9b8cff", rx: S * 0.4, ry: S * 0.1, tilt: 1.45 + 0.2 * Math.sin(t * 0.8 + 2), speed: 0.9, phase: 4 },
      ];

      const arc = (o: (typeof orbits)[number], from: number, to: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(o.tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, o.rx, o.ry, 0, from, to);
        ctx.strokeStyle = o.color;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = o.color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      };
      const dot = (o: (typeof orbits)[number], front: boolean) => {
        const a = o.phase + t * o.speed;
        const s = Math.sin(a);
        if (front !== s > 0) return;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(o.tilt);
        ctx.beginPath();
        ctx.arc(Math.cos(a) * o.rx, s * o.ry, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = o.color;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.restore();
      };

      // back halves
      for (const o of orbits) arc(o, Math.PI, Math.PI * 2);
      for (const o of orbits) dot(o, false);

      // the cube (isometric)
      const L = S * 0.17;
      const a = L * Math.cos(Math.PI / 6);
      const b = L * 0.5;
      const bob = Math.sin(t * 2) * 3;
      const fx = cx;
      const fy = cy + bob;
      const face = (pts: number[][], fill: string) => {
        ctx.beginPath();
        ctx.moveTo(pts[0]![0]!, pts[0]![1]!);
        for (const p of pts.slice(1)) ctx.lineTo(p[0]!, p[1]!);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
      };
      ctx.save();
      ctx.shadowColor = "#7c6cf8";
      ctx.shadowBlur = 30;
      face([[fx, fy], [fx + a, fy - b], [fx, fy - 2 * b], [fx - a, fy - b]], "#b3a8ff");
      ctx.restore();
      face([[fx, fy], [fx - a, fy - b], [fx - a, fy - b + L], [fx, fy + L]], "#7c6cf8");
      face([[fx, fy], [fx + a, fy - b], [fx + a, fy - b + L], [fx, fy + L]], "#5a48e6");

      // front halves
      for (const o of orbits) arc(o, 0, Math.PI);
      for (const o of orbits) dot(o, true);
    });
  };
  return <surface name="Orbits" x={props.x} y={props.y} width={props.size} height={props.size} ref={draw} end={props.end} />;
}

/**
 * steps: [time, stepIndex] — when each progress step shows.
 * doneAt: header turns green. installPressAt: "Instalar APK" pressed.
 */
export function CompileScreen(props: { end: number; app: string; steps: [number, number][]; doneAt: number; installPressAt?: number }): JSX.Element {
  const barKeys: Key[] = [[0, 0, E.hold]];
  for (const [t, i] of props.steps) barKeys.push([t, barKeys[barKeys.length - 1]![1], E.out], [t + 0.25, (288 * BUILD_STEPS[i]![0]) / 100]);
  return (
    <group name="Compile screen">
      <rect x={0} y={0} width={360} height={780} fill="#08090f" end={props.end} />
      <rect name="Header" x={0} y={0} width={360} height={100} end={props.end}>
        <solidPaint color="#7868f8">
          <Kf p="color" k={[[0, "#7868f8", E.hold], [props.doneAt, "#7868f8", E.out], [props.doneAt + 0.3, "#22c55e"]]} />
        </solidPaint>
      </rect>
      <group name="Header building">
        <text x={18} y={44} fontFamily={F.ui} fontWeight={700} fontSize={17} color="#ffffff" end={props.end}>{`Compilando ${props.app}`}</text>
        <text x={18} y={68} fontFamily={F.ui} fontSize={11} color="#eeeaff" end={props.end}>Gerando o APK do seu app...</text>
        <Kf p="opacity" k={[[0, 1, E.hold], [props.doneAt - 0.02, 1, E.in], [props.doneAt + 0.06, 0]]} />
      </group>
      <group name="Header done">
        <text x={18} y={44} fontFamily={F.ui} fontWeight={700} fontSize={17} color="#ffffff" end={props.end}>Build concluído ✓</text>
        <text x={18} y={68} fontFamily={F.ui} fontSize={11} color="#eafff0" end={props.end}>Toque em Instalar APK</text>
        <Kf p="opacity" k={fade(props.doneAt + 0.08, 0.18)} />
      </group>

      <rect x={16} y={116} width={328} height={118} cornerRadius={14} fill="#161827" end={props.end}>
        <stroke color="#262a3d" width={1} />
      </rect>
      {props.steps.map(([t, i], k) => {
        const next = props.steps[k + 1]?.[0];
        return (
          <group name={`Step ${BUILD_STEPS[i]![0]}%`}>
            <text x={16} y={130} width={328} height={44} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={32} color={C.purple} end={props.end}>
              {`${BUILD_STEPS[i]![0]}%`}
            </text>
            <text x={16} y={194} width={328} height={22} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontSize={11.5} color="#c8cbe0" end={props.end}>
              {BUILD_STEPS[i]![1]}
            </text>
            <Kf p="opacity" k={k === 0 ? (next === undefined ? [[0, 1]] : [[0, 1, E.hold], [next, 0]]) : [[0, 0, E.hold], [t, 1, E.hold], ...(next !== undefined ? ([[next, 0]] as Key[]) : [])]} />
          </group>
        );
      })}
      <rect x={36} y={182} width={288} height={3} cornerRadius={1.5} fill="#43465a" end={props.end} />
      <rect x={36} y={182} height={3} cornerRadius={1.5} fill={C.purple} end={props.end}>
        <Kf p="width" k={barKeys} />
      </rect>
      <Pivot name="Done pulse" x={16} y={116} w={328} h={118} end={props.end}>
        <rect x={0} y={0} width={328} height={118} cornerRadius={14} end={props.end}>
          <stroke color={C.green} width={2.5} />
        </rect>
        <Kf p="opacity" k={[[0, 0, E.hold], [props.doneAt, 0, E.out], [props.doneAt + 0.1, 1], [props.doneAt + 0.9, 0]]} />
        <Kf p="scale" k={[[0, 1, E.hold], [props.doneAt, 1, E.out], [props.doneAt + 0.9, 1.08]]} />
      </Pivot>

      <Orbits x={30} y={280} size={300} end={props.end} />

      <text x={18} y={660} fontFamily={F.ui} fontWeight={500} fontSize={11.5} color={C.purpleHi} end={props.end}>▸ Ver detalhes</text>
      <Pivot name="Instalar APK" x={16} y={698} w={158} h={40} end={props.end}>
        <rect x={0} y={0} width={158} height={40} cornerRadius={20} fill={C.green} end={props.end}>
          <shadow color={C.green} blur={18} opacity={0.0}>
            <Kf p="opacity" k={fade(props.doneAt, 0.3, undefined, 0.2, 0.55)} />
          </shadow>
        </rect>
        <text x={0} y={0} width={158} height={40} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={500} fontSize={12.5} color="#ffffff" end={props.end}>Instalar APK</text>
        {props.installPressAt !== undefined && <Kf p="scale" k={press(props.installPressAt, 0.92)} />}
      </Pivot>
      <rect x={186} y={698} width={158} height={40} cornerRadius={20} fill="#121827" end={props.end} />
      <text x={186} y={698} width={158} height={40} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={500} fontSize={12.5} color="#e6e7f0" end={props.end}>Fechar</text>
      <StatusBar end={props.end} />
      <SystemNav end={props.end} />
    </group>
  );
}
