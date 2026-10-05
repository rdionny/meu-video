/* The motion language of the promo: one set of curves, one way of writing
 * keyframes. Every move in the video goes through these.
 *
 * Times in a Key are the element's local seconds (keyframes are source-local:
 * 0 is the element's own start). Scenes pass scene-relative times.
 */

import type { JSX } from "solid-js";
import type { AnimatableProperty, Easing } from "@diffusionstudio/jsx";

export type Key = [time: number, value: number | string, easing?: string];

/** Curves — named for their intent, kept few on purpose. */
export const E = {
  /** arrivals: fast in, long soft settle */
  out: "cubicBezier(0.16,1,0.3,1)",
  /** energetic entrance that settles softly */
  snappy: "cubicBezier(0,0.6,0.4,1)",
  /** dramatic reveal / scale pop */
  expo: "cubicBezier(0,1,0,1)",
  /** small overshoot for things that land */
  back: "cubicBezier(0.34,1.45,0.64,1)",
  /** stronger overshoot (logo pop) */
  backHard: "cubicBezier(0.34,1.8,0.5,1)",
  /** A-to-B moves at rest on both ends (camera) */
  inOut: "cubicBezier(0.65,0,0.35,1)",
  /** camera glide: gentle start, long settle */
  glide: "cubicBezier(0.45,0,0.15,1)",
  /** wind-ups that exit at full speed */
  in: "cubicBezier(0.7,0,0.84,0)",
  /** anticipation into a hard exit/cut */
  expoIn: "cubicBezier(0.9,0,1,0.3)",
  linear: "linear",
  hold: "steps(1)",
};

/** A keyframe track for one prop. */
export function Kf(props: { p: string; k: Key[] }): JSX.Element {
  const property = props.p as AnimatableProperty;
  return (
    <keyframeTrack property={property}>
      {props.k.map(([time, value, easing]) => (
        <keyframe time={time} value={value} easing={(easing ?? "linear") as Easing} />
      ))}
    </keyframeTrack>
  );
}

/** Opacity in at `t` (over `d`), optionally out at `t2` (over `d2`). */
export function fade(t: number, d = 0.3, t2?: number, d2 = 0.25, to = 1): Key[] {
  const k: Key[] = [[0, 0, E.hold], [t, 0, E.out], [t + d, to]];
  if (t2 !== undefined) k.push([t2, to, E.in], [t2 + d2, 0]);
  if (t <= 0) k.shift();
  return k;
}

/** A value that moves from `a` to `b` between t and t+d, holding outside. */
export function move(t: number, d: number, a: number, b: number, easing = E.out): Key[] {
  return [[0, a, E.hold], [t, a, easing], [t + d, b]];
}

/** Several segments chained: [[t, value, easing], ...] already sorted. */
export function path(...k: Key[]): Key[] {
  return k;
}

/**
 * A group whose transforms pivot around the middle of its (w × h) box.
 *
 * The runtime pivots a group around (width/2, height/2) of the box its
 * children span, measured from the group's own origin — so the group carries
 * an invisible frame (0,0)–(w,h) and its children must stay inside it.
 *
 * With `pad`, the frame grows by `pad` on every side (children are shifted
 * into it), so content may move up to `pad` outside the box. The group's own
 * motion then goes in `k` (x/y keys stay in box coordinates); with pad 0,
 * <Kf> children work directly.
 */
export function Pivot(props: {
  name?: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
  pad?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  start?: number;
  end?: number;
  k?: { p: string; k: Key[] }[];
  children?: JSX.Element;
}): JSX.Element {
  const pad = props.pad ?? 0;
  const keys = (props.k ?? []).map((track) =>
    track.p === "x" || track.p === "y"
      ? { p: track.p, k: track.k.map(([t, v, e]) => [t, (v as number) - pad, e] as Key) }
      : track,
  );
  return (
    <group
      name={props.name}
      x={(props.x ?? 0) - pad}
      y={(props.y ?? 0) - pad}
      scale={props.scale ?? 1}
      rotation={props.rotation ?? 0}
      opacity={props.opacity ?? 1}
      start={props.start}
      end={props.end}
    >
      <rect name="pivot-frame" x={0} y={0} width={props.w + pad * 2} height={props.h + pad * 2} end={props.end} />
      {pad > 0 ? (
        <group name="content" x={pad} y={pad}>
          {props.children}
        </group>
      ) : (
        props.children
      )}
      {keys.map((track) => (
        <Kf p={track.p} k={track.k} />
      ))}
    </group>
  );
}

/** Camera math: put world point P at frame point Q with zoom Z (pivot = frame centre). */
export function cam(P: [number, number], Z: number, Q: [number, number] = [960, 540]) {
  return { x: Q[0] - 960 - Z * (P[0] - 960), y: Q[1] - 540 - Z * (P[1] - 540), s: Z };
}

export type CamKey = [time: number, cam: { x: number; y: number; s: number }, easing?: string];

/** An adjustment layer driving the clip right below it like a camera. */
export function Camera(props: { name?: string; start?: number; end?: number; k: CamKey[] }): JSX.Element {
  return (
    <adjustmentLayer name={props.name ?? "Camera"} start={props.start} end={props.end} width={1920} height={1080}>
      <Kf p="x" k={props.k.map(([t, c, e]) => [t, c.x, e] as Key)} />
      <Kf p="y" k={props.k.map(([t, c, e]) => [t, c.y, e] as Key)} />
      <Kf p="scale" k={props.k.map(([t, c, e]) => [t, c.s, e] as Key)} />
    </adjustmentLayer>
  );
}
