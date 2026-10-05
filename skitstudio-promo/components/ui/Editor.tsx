/* SkitStudio's layout editor ("Editor de Layout"): header, Visual / Código /
 * Chat tabs, Canvas / Árvore sub-tabs, the component palette and the canvas
 * panel. Recreated in dp from the app's screens. */

import type { JSX } from "solid-js";
import { C, F, I } from "../../lib/theme";
import { E, Kf, Pivot, fade, type Key } from "../../lib/motion";
import { StatusBar, SystemNav } from "./Phone";
import { press } from "./ProjectList";

/** Tab geometry (x of the pill per tab), and label centres. */
export const TABS = { pillX: [11, 124, 237], label: ["Visual", "Código", "Chat"] };
export const SUBTABS = { pillX: [10, 180], label: ["Canvas", "Árvore"] };

/** Switches between tabs: [time, index] in local seconds; first entry is the initial tab. */
export type TabSwitch = [time: number, index: number];

function pillKeys(switches: TabSwitch[], xs: number[]): Key[] {
  const k: Key[] = [[0, xs[switches[0]![1]]!, E.hold]];
  for (const [t, i] of switches.slice(1)) {
    const prev = k[k.length - 1]![1];
    k.push([t, prev, E.out], [t + 0.35, xs[i]!]);
  }
  return k;
}

function labelKeys(switches: TabSwitch[], index: number, on: string, off: string): Key[] {
  const k: Key[] = [[0, switches[0]![1] === index ? on : off, E.hold]];
  for (const [t, i] of switches.slice(1)) {
    const prev = k[k.length - 1]![1];
    k.push([t + 0.05, prev, E.out], [t + 0.3, i === index ? on : off]);
  }
  return k;
}

/** Header + tabs + sub-tabs + bottom "Tela" bar. */
export function EditorChrome(props: {
  end: number;
  appName: string;
  tabs: TabSwitch[];
  subtabs?: TabSwitch[];
  /** sub-tab row visible (Visual tab) — opacity keys */
  subtabsOpacity?: Key[];
  playPressAt?: number;
  enterAt?: number;
}): JSX.Element {
  const enter = props.enterAt;
  const sub = props.subtabs ?? [[0, 0]];
  return (
    <group name="Editor chrome">
      <rect name="Editor bg" x={0} y={0} width={360} height={780} fill={C.app} end={props.end} />
      <group name="Header">
        <rect x={10} y={34} width={34} height={34} cornerRadius={9} fill={C.panel} end={props.end}>
          <stroke color={C.border} width={1} />
        </rect>
        <text x={10} y={34} width={34} height={34} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={20} color="#9aa0b4" end={props.end}>{I.close}</text>
        <image src="images/brand/skitstudio-icon.png" x={50} y={31} width={40} height={40} end={props.end} />
        <text x={97} y={34} fontFamily={F.ui} fontWeight={700} fontSize={15} color={C.text} end={props.end}>{props.appName}</text>
        <text x={97} y={54} fontFamily={F.ui} fontSize={10.5} color="#8a8fa5" end={props.end}>Editor de Layout</text>
        {[I.save, I.robot, I.play, I.add, I.grid].map((icon, i) => {
          const x = 164 + i * 38;
          const isPlay = icon === I.play;
          return (
            <Pivot x={x} y={34} w={34} h={34} end={props.end}>
              <rect x={0} y={0} width={34} height={34} cornerRadius={9} fill={isPlay ? "#211b55" : C.panel} end={props.end}>
                <stroke color={isPlay ? C.purple : C.border} width={isPlay ? 1.5 : 1} />
              </rect>
              <text x={0} y={0} width={34} height={34} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={isPlay ? 24 : 20} color={isPlay ? C.lavender : "#c3c6da"} end={props.end}>{icon}</text>
              {isPlay && props.playPressAt !== undefined && <Kf p="scale" k={press(props.playPressAt, 0.86)} />}
            </Pivot>
          );
        })}
        {enter !== undefined && <Kf p="opacity" k={fade(enter, 0.3)} />}
      </group>

      <group name="Tabs">
        <rect x={8} y={82} width={344} height={38} cornerRadius={12} fill="#0f1019" end={props.end}>
          <stroke color="#22253a" width={1} />
        </rect>
        <rect name="Tab pill" y={85} width={112} height={32} cornerRadius={10} fill={C.purple} end={props.end}>
          <Kf p="x" k={pillKeys(props.tabs, TABS.pillX)} />
          <shadow color={C.purple} blur={10} opacity={0.35} />
        </rect>
        {TABS.label.map((label, i) => (
          <text x={TABS.pillX[i]} y={85} width={112} height={32} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={600} fontSize={14} color="#9aa0b4" end={props.end}>
            {label}
            <Kf p="color" k={labelKeys(props.tabs, i, "#ffffff", "#9aa0b4")} />
          </text>
        ))}
        {enter !== undefined && <Kf p="opacity" k={fade(enter + 0.06, 0.3)} />}
      </group>

      <group name="Sub-tabs">
        <rect x={8} y={126} width={344} height={30} cornerRadius={10} fill="#0f1019" end={props.end}>
          <stroke color="#22253a" width={1} />
        </rect>
        <rect name="Sub-tab pill" y={128} width={170} height={26} cornerRadius={8} fill={C.purple} end={props.end}>
          <Kf p="x" k={pillKeys(sub, SUBTABS.pillX)} />
        </rect>
        {SUBTABS.label.map((label, i) => (
          <text x={SUBTABS.pillX[i]} y={128} width={170} height={26} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={500} fontSize={12} color="#9aa0b4" end={props.end}>
            {label}
            <Kf p="color" k={labelKeys(sub, i, "#ffffff", "#9aa0b4")} />
          </text>
        ))}
        {props.subtabsOpacity && <Kf p="opacity" k={props.subtabsOpacity} />}
        {!props.subtabsOpacity && enter !== undefined && <Kf p="opacity" k={fade(enter + 0.1, 0.3)} />}
      </group>

      <group name="Tela bar">
        <text x={12} y={719} fontFamily={F.ui} fontSize={10} color="#8a8fa5" end={props.end}>Tela:</text>
        <rect x={40} y={714} width={312} height={22} cornerRadius={6} fill="#0f1019" end={props.end}>
          <stroke color="#1f2133" width={1} />
        </rect>
        <text x={48} y={718} fontFamily={F.ui} fontSize={11} color="#d7d9e4" end={props.end}>activity_main.xml</text>
        <text x={328} y={714} fontFamily={F.icon} fontSize={20} color="#c3c6da" end={props.end}>{I.expand}</text>
        {enter !== undefined && <Kf p="opacity" k={fade(enter + 0.2, 0.3)} />}
      </group>
      <StatusBar end={props.end} />
      <SystemNav end={props.end} />
    </group>
  );
}

export type PaletteItem = { icon: string; label: string };
export const PALETTE: { section: string; items: PaletteItem[] }[] = [
  {
    section: "LAYOUTS",
    items: [
      { icon: I.linearV, label: "Linear (V)" },
      { icon: I.linearH, label: "Linear (H)" },
      { icon: I.frame, label: "Frame" },
      { icon: I.scroll, label: "Scroll" },
      { icon: I.gradeIcon, label: "Grade" },
      { icon: I.radio, label: "RadioGroup" },
      { icon: I.cardIcon, label: "Card" },
    ],
  },
  {
    section: "WIDGETS",
    items: [
      { icon: I.textView, label: "TextView" },
      { icon: I.editText, label: "EditText" },
      { icon: I.button, label: "Button" },
      { icon: I.image, label: "Imagem" },
      { icon: I.checkbox, label: "CheckBox" },
      { icon: I.switchIcon, label: "Switch" },
      { icon: I.progress, label: "Progresso" },
    ],
  },
  {
    section: "LISTAS",
    items: [
      { icon: I.spinner, label: "Spinner" },
      { icon: I.listView, label: "ListView" },
    ],
  },
];

export const PALETTE_BOX = { x: 8, y: 166, w: 98, h: 546 };
const ROW = 29;

/** y (screen dp) of the centre of a palette row, by label. */
export function paletteRowY(label: string): number {
  let y = PALETTE_BOX.y + 8;
  for (const s of PALETTE) {
    y += 20;
    for (const item of s.items) {
      if (item.label === label) return y + ROW / 2;
      y += ROW;
    }
    y += 6;
  }
  throw new Error(`no palette item ${label}`);
}

/** The component palette, with optional "pressed" highlights: [label, time]. */
export function Palette(props: { end: number; presses?: [string, number][]; opacity?: Key[]; enterAt?: number }): JSX.Element {
  const rows: JSX.Element[] = [];
  let y = 8;
  for (const s of PALETTE) {
    rows.push(
      <text x={10} y={y + 6} fontFamily={F.ui} fontWeight={700} fontSize={8.5} letterSpacing={0.8} color="#8f95ab" end={props.end}>{s.section}</text>,
    );
    y += 20;
    for (const item of s.items) {
      const pressedAt = props.presses?.find(([label]) => label === item.label)?.[1];
      const rowY = y;
      rows.push(
        <group name={`Palette ${item.label}`}>
          {pressedAt !== undefined && (
            <rect x={4} y={rowY + 1} width={90} height={ROW - 2} cornerRadius={7} fill={C.purple} end={props.end}>
              <Kf p="opacity" k={[[0, 0, E.hold], [pressedAt - 0.1, 0, E.out], [pressedAt + 0.05, 0.38], [pressedAt + 0.6, 0.38, E.in], [pressedAt + 0.9, 0]]} />
            </rect>
          )}
          <text x={9} y={rowY + 7} fontFamily={F.icon} fontSize={14} color={C.purpleHi} end={props.end}>{item.icon}</text>
          <text x={28} y={rowY + 8} fontFamily={F.ui} fontSize={10.5} color="#d7d9e4" end={props.end}>{item.label}</text>
          <rect x={6} y={rowY + ROW - 0.6} width={86} height={0.6} fill="#1c1e2e" end={props.end} />
        </group>,
      );
      y += ROW;
    }
    y += 6;
  }
  return (
    <group name="Palette" x={PALETTE_BOX.x} y={PALETTE_BOX.y}>
      <rect x={0} y={0} width={PALETTE_BOX.w} height={PALETTE_BOX.h} cornerRadius={12} fill="#0e0f18" end={props.end}>
        <stroke color="#1f2133" width={1} />
      </rect>
      <rect x={PALETTE_BOX.w - 3} y={12} width={2} height={300} cornerRadius={1} fill="#2a2d42" end={props.end} />
      {rows}
      <rect clipPath x={0} y={0} width={PALETTE_BOX.w} height={PALETTE_BOX.h} cornerRadius={12} end={props.end} />
      {props.opacity && <Kf p="opacity" k={props.opacity} />}
      {!props.opacity && props.enterAt !== undefined && <Kf p="opacity" k={fade(props.enterAt, 0.3)} />}
    </group>
  );
}

export const CANVAS_BOX = { x: 112, y: 166, w: 240, h: 546 };
/** The app preview inside the canvas panel. */
export const PREVIEW = { x: 120, y: 178, w: 224, h: 500 };

/** Canvas panel frame; children are drawn in PREVIEW coordinates. */
export function CanvasPanel(props: { end: number; opacity?: Key[]; enterAt?: number; children?: JSX.Element }): JSX.Element {
  return (
    <group name="Canvas panel">
      <rect x={CANVAS_BOX.x} y={CANVAS_BOX.y} width={CANVAS_BOX.w} height={CANVAS_BOX.h} cornerRadius={14} fill="#07080d" end={props.end}>
        <stroke color="#1f2133" width={1} />
      </rect>
      <group name="Preview" x={PREVIEW.x} y={PREVIEW.y}>
        <rect x={0} y={0} width={PREVIEW.w} height={PREVIEW.h} cornerRadius={10} fill={C.appBg} end={props.end} />
        {props.children}
        <rect clipPath x={0} y={0} width={PREVIEW.w} height={PREVIEW.h} cornerRadius={10} end={props.end} />
      </group>
      {props.opacity && <Kf p="opacity" k={props.opacity} />}
      {!props.opacity && props.enterAt !== undefined && <Kf p="opacity" k={fade(props.enterAt, 0.35)} />}
    </group>
  );
}
