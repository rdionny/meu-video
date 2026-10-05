/* The device the SkitStudio screens live in. All UI is authored in Android dp
 * (360 × 780 screen); the rig scales dp to pixels. */

import type { JSX } from "solid-js";
import { C, F, I } from "../../lib/theme";
import { Pivot } from "../../lib/motion";

export const SW = 360;
export const SH = 780;
export const BEZEL = 11;
export const DW = SW + BEZEL * 2;
export const DH = SH + BEZEL * 2;
/** Room around the device inside the rig's pivot frame. */
export const MARGIN = 300;

/** Status bar overlay (time + system icons), as in the screen recordings. */
export function StatusBar(props: { end?: number; dark?: boolean; time?: string }): JSX.Element {
  const color = props.dark ? "#1c1a33" : "#f2f2f7";
  return (
    <group name="Status bar" end={props.end}>
      <text x={20} y={8} fontFamily={F.ui} fontWeight={500} fontSize={12} color={color} end={props.end}>
        {props.time ?? "13:00"}
      </text>
      <text x={286} y={7} fontFamily={F.icon} fontSize={14} letterSpacing={2} color={color} end={props.end}>
        {I.signal + I.wifi + I.battery}
      </text>
    </group>
  );
}

/** Android system navigation (■ ● ◀) at the bottom of the screen. */
export function SystemNav(props: { end?: number; light?: boolean }): JSX.Element {
  const color = props.light ? "#55536c" : "#c8c8d4";
  return (
    <group name="System nav" end={props.end}>
      <rect x={112} y={753} width={13} height={13} cornerRadius={3} fill={color} opacity={0.85} end={props.end} />
      <rect x={172} y={751} width={17} height={17} cornerRadius={9} end={props.end}>
        <stroke color={color} width={2.4} opacity={0.85} />
      </rect>
      <rect x={176.5} y={755.5} width={8} height={8} cornerRadius={4} fill={color} opacity={0.85} end={props.end} />
      <text x={233} y={749} fontFamily={F.icon} fontSize={20} color={color} opacity={0.85} rotation={180} end={props.end}>
        {I.play}
      </text>
    </group>
  );
}

/**
 * The phone: bezel, screen clip, and whatever the screen shows. Placed so
 * that the device centre sits at (cx, cy) in the parent, at `scale` px/dp.
 */
export function PhoneRig(props: {
  name?: string;
  cx: number;
  cy: number;
  scale: number;
  rotation?: number;
  end?: number;
  glow?: boolean;
  children?: JSX.Element;
}): JSX.Element {
  const fw = DW + MARGIN * 2;
  const fh = DH + MARGIN * 2;
  return (
    <Pivot name={props.name ?? "Phone"} w={fw} h={fh} x={props.cx - fw / 2} y={props.cy - fh / 2} scale={props.scale} rotation={props.rotation ?? 0} end={props.end}>
      {props.glow !== false && (
        <rect name="Ambient glow" x={MARGIN - 260} y={MARGIN - 120} width={DW + 520} height={DH + 240} opacity={0.55} end={props.end}>
          <radialGradientPaint>
            <colorStop offset={0} color={C.purpleDeep} opacity={0.75} />
            <colorStop offset={0.55} color={C.purpleDeep} opacity={0.18} />
            <colorStop offset={1} color={C.purpleDeep} opacity={0} />
          </radialGradientPaint>
        </rect>
      )}
      <rect name="Bezel" x={MARGIN} y={MARGIN} width={DW} height={DH} cornerRadius={50} fill="#0b0b10" end={props.end}>
        <stroke color="#2b2d3c" width={1.6} />
        <shadow color="#000000" blur={60} offsetY={30} opacity={0.7} />
      </rect>
      <rect name="Side key" x={MARGIN + DW - 1} y={MARGIN + 170} width={3} height={60} cornerRadius={1.5} fill="#22232e" end={props.end} />
      <rect name="Side key 2" x={MARGIN + DW - 1} y={MARGIN + 250} width={3} height={90} cornerRadius={1.5} fill="#22232e" end={props.end} />
      <group name="Screen" x={MARGIN + BEZEL} y={MARGIN + BEZEL}>
        <rect name="Screen base" x={0} y={0} width={SW} height={SH} cornerRadius={40} fill={C.app} end={props.end} />
        {props.children}
        <rect clipPath x={0} y={0} width={SW} height={SH} cornerRadius={40} end={props.end} />
      </group>
      <rect name="Glass edge" x={MARGIN + BEZEL} y={MARGIN + BEZEL} width={SW} height={SH} cornerRadius={40} end={props.end}>
        <stroke color="#ffffff" width={0.8} opacity={0.06} />
      </rect>
    </Pivot>
  );
}
