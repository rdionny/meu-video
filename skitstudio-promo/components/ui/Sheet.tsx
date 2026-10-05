/* The component properties sheet (Basic / Recent / Event) and the small
 * editing popovers used on it. */

import type { JSX } from "solid-js";
import { C, F, I } from "../../lib/theme";
import { E, Kf, Pivot, fade, type Key } from "../../lib/motion";
import { press } from "./ProjectList";

export const SHEET_Y = 556;
export const TILE = { y: SHEET_Y + 94, w: 60, h: 62, gap: 6, x0: 16 };
export const TILES = [
  { icon: I.attrs, label: "Atributos" },
  { icon: I.width, label: "Largura" },
  { icon: I.height, label: "Altura" },
  { icon: I.text, label: "Texto" },
  { icon: I.hint, label: "Dica" },
  { icon: I.font, label: "Fonte" },
];
export const TAB_X = { Basic: 16, Recent: 86, Event: 156 };

export function tileCenter(label: string): [number, number] {
  const i = TILES.findIndex((t) => t.label === label);
  return [TILE.x0 + i * (TILE.w + TILE.gap) + TILE.w / 2, TILE.y + TILE.h / 2];
}

export function tabCenter(tab: keyof typeof TAB_X): [number, number] {
  return [TAB_X[tab] + 32, SHEET_Y + 64];
}

export const EVENTS = [
  { name: "onClick", hint: "Ao tocar" },
  { name: "onLongClick", hint: "Toque longo" },
  { name: "onFocusChange", hint: "Ao focar" },
];
export function eventCenter(i: number): [number, number] {
  return [180, SHEET_Y + 100 + i * 42 + 17];
}

/**
 * The sheet. `open`: slide-up keys for offsetY (0 = open, 240 = closed).
 * `ids`: header id labels with the time each takes over.
 * `tabs`: [time, tab] switches (first = initial). Event rows show on Event.
 */
export function PropertiesSheet(props: {
  end: number;
  open: Key[];
  ids: [time: number, id: string, icon: string][];
  tabs: [number, keyof typeof TAB_X][];
  tilePresses?: [string, number][];
  eventPressAt?: number;
}): JSX.Element {
  const tabKeys: Key[] = [[0, TAB_X[props.tabs[0]![1]], E.hold]];
  for (const [t, tab] of props.tabs.slice(1)) {
    tabKeys.push([t, tabKeys[tabKeys.length - 1]![1], E.out], [t + 0.3, TAB_X[tab]]);
  }
  const eventAt = props.tabs.find(([, tab]) => tab === "Event")?.[0];
  const basicVis: Key[] = eventAt === undefined ? [[0, 1]] : [[0, 1, E.hold], [eventAt + 0.05, 1, E.in], [eventAt + 0.2, 0]];
  const eventVis: Key[] = eventAt === undefined ? [[0, 0]] : fade(eventAt + 0.18, 0.25);

  return (
    <group name="Properties sheet" y={SHEET_Y}>
      <rect name="Sheet shadow" x={0} y={-30} width={360} height={60} end={props.end}>
        <linearGradientPaint rotation={90}>
          <colorStop offset={0} color="#000000" opacity={0} />
          <colorStop offset={1} color="#000000" opacity={0.5} />
        </linearGradientPaint>
      </rect>
      <rect x={0} y={0} width={360} height={224} cornerRadius={22} cornerRadiusBottomLeft={0} cornerRadiusBottomRight={0} fill="#121320" end={props.end}>
        <stroke color="#2a2d42" width={1} />
      </rect>
      <rect x={162} y={8} width={36} height={4} cornerRadius={2} fill="#3a3d52" end={props.end} />

      {props.ids.map(([t, id, icon], i) => {
        const next = props.ids[i + 1]?.[0];
        return (
          <group name={`Header ${id}`}>
            <text x={16} y={22} fontFamily={F.icon} fontSize={20} color={C.purpleHi} end={props.end}>{icon}</text>
            <text x={44} y={23} fontFamily={F.ui} fontWeight={700} fontSize={15} color={C.text} end={props.end}>{id}</text>
            <Kf p="opacity" k={i === 0 ? (next === undefined ? [[0, 1]] : [[0, 1, E.hold], [next, 1, E.in], [next + 0.15, 0]]) : fade(t, 0.2, next, 0.15)} />
          </group>
        );
      })}
      <text x={262} y={20} fontFamily={F.icon} fontSize={22} letterSpacing={9} color="#aab0c4" end={props.end}>{I.expand}</text>
      <text x={294} y={21} fontFamily={F.icon} fontSize={20} color={C.red} end={props.end}>{I.del}</text>
      <text x={326} y={21} fontFamily={F.icon} fontSize={20} color="#aab0c4" end={props.end}>{I.save}</text>

      <rect name="Tab pill" y={50} width={64} height={28} cornerRadius={14} fill={C.purple} end={props.end}>
        <Kf p="x" k={tabKeys} />
      </rect>
      {(Object.keys(TAB_X) as (keyof typeof TAB_X)[]).map((tab) => {
        const on: Key[] = [[0, props.tabs[0]![1] === tab ? "#ffffff" : "#9aa0b4", E.hold]];
        for (const [t, sel] of props.tabs.slice(1)) on.push([t + 0.05, on[on.length - 1]![1], E.out], [t + 0.25, sel === tab ? "#ffffff" : "#9aa0b4"]);
        return (
          <text x={TAB_X[tab]} y={50} width={64} height={28} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={600} fontSize={12.5} color="#9aa0b4" end={props.end}>
            {tab}
            <Kf p="color" k={on} />
          </text>
        );
      })}

      <group name="Basic tiles">
        {TILES.map((tile, i) => {
          const x = TILE.x0 + i * (TILE.w + TILE.gap);
          const pressedAt = props.tilePresses?.find(([label]) => label === tile.label)?.[1];
          return (
            <Pivot x={x} y={94} w={TILE.w} h={TILE.h} end={props.end}>
              <rect x={0} y={0} width={TILE.w} height={TILE.h} cornerRadius={12} fill="#0e0f18" end={props.end}>
                <stroke color="#24273b" width={1} />
              </rect>
              {pressedAt !== undefined && (
                <rect x={0} y={0} width={TILE.w} height={TILE.h} cornerRadius={12} fill="#231d5e" end={props.end}>
                  <stroke color={C.purple} width={1.4} />
                  <Kf p="opacity" k={[[0, 0, E.hold], [pressedAt - 0.05, 0, E.out], [pressedAt + 0.1, 1], [pressedAt + 1.1, 1, E.in], [pressedAt + 1.4, 0]]} />
                </rect>
              )}
              <text x={0} y={10} width={TILE.w} height={28} textAlign="center" fontFamily={F.icon} fontSize={22} color={C.purpleHi} end={props.end}>{tile.icon}</text>
              <text x={0} y={40} width={TILE.w} height={16} textAlign="center" fontFamily={F.ui} fontSize={9.5} color="#c8cbe0" end={props.end}>{tile.label}</text>
              {pressedAt !== undefined && <Kf p="scale" k={press(pressedAt, 0.9)} />}
            </Pivot>
          );
        })}
        <Kf p="opacity" k={basicVis} />
      </group>

      <group name="Event list">
        {EVENTS.map((ev, i) => {
          const y = 100 + i * 42;
          const isClick = i === 0 && props.eventPressAt !== undefined;
          return (
            <group>
              <rect x={16} y={y} width={328} height={36} cornerRadius={10} fill="#0e0f18" end={props.end}>
                <stroke color="#24273b" width={1} />
              </rect>
              {isClick && (
                <rect x={16} y={y} width={328} height={36} cornerRadius={10} fill="#231d5e" end={props.end}>
                  <stroke color={C.purple} width={1.4} />
                  <Kf p="opacity" k={fade(props.eventPressAt! - 0.05, 0.15)} />
                </rect>
              )}
              <text x={28} y={y} width={26} height={36} textBaseline="middle" fontFamily={F.icon} fontSize={19} color={C.purpleHi} end={props.end}>{I.touch}</text>
              <text x={56} y={y} width={150} height={36} textBaseline="middle" fontFamily={F.mono} fontWeight={500} fontSize={12} color={C.text} end={props.end}>{ev.name}</text>
              <text x={200} y={y} width={110} height={36} textAlign="right" textBaseline="middle" fontFamily={F.ui} fontSize={10.5} color={C.muted} end={props.end}>{ev.hint}</text>
              <text x={314} y={y} width={24} height={36} textBaseline="middle" fontFamily={F.icon} fontSize={18} color="#7d8197" end={props.end}>{I.chevron}</text>
              <Kf p="offsetY" k={eventAt === undefined ? [[0, 0]] : [[0, 10, E.hold], [eventAt + 0.18 + i * 0.05, 10, E.out], [eventAt + 0.5 + i * 0.05, 0]]} />
            </group>
          );
        })}
        <Kf p="opacity" k={eventVis} />
      </group>

      <Kf p="offsetY" k={props.open} />
    </group>
  );
}

/** Slide keys for a sheet that opens at `t` and (optionally) closes at `t2`. */
export function sheetOpen(t: number, t2?: number): Key[] {
  const k: Key[] = [[0, 240, E.hold], [t, 240, E.out], [t + 0.45, 0]];
  if (t2 !== undefined) k.push([t2, 0, E.in], [t2 + 0.3, 240]);
  return k;
}

/** A small floating editor card: title + text field typing `value` + confirm. */
export function TextPopover(props: {
  end: number;
  x: number;
  y: number;
  title: string;
  value: string;
  openAt: number;
  typeAt: number;
  typeDur: number;
  confirmAt: number;
}): JSX.Element {
  const n = props.value.length;
  const cw = 7.4;
  return (
    <Pivot name={`Popover ${props.title}`} x={props.x} y={props.y} w={232} h={92} end={props.end}>
      <rect x={0} y={0} width={232} height={92} cornerRadius={16} fill="#1a1c2c" end={props.end}>
        <stroke color="#34374e" width={1} />
        <shadow color="#000000" blur={30} offsetY={12} opacity={0.6} />
      </rect>
      <text x={16} y={14} fontFamily={F.ui} fontWeight={600} fontSize={11} letterSpacing={0.4} color={C.text2} end={props.end}>{props.title}</text>
      <rect x={14} y={36} width={160} height={40} cornerRadius={10} fill="#0e0f18" end={props.end}>
        <stroke color={C.purple} width={1.6} />
      </rect>
      <text x={26} y={36} width={140} height={40} textBaseline="middle" fontFamily={F.ui} fontSize={14} color={C.text} end={props.end}>
        {props.value}
        <rect clipPath x={-2} y={0} height={40}>
          <Kf p="width" k={[[0, 0, E.hold], [props.typeAt, 0, `steps(${n})`], [props.typeAt + props.typeDur, n * cw + 8]]} />
        </rect>
      </text>
      <rect name="Caret" y={46} width={1.6} height={20} fill={C.purpleHi} end={props.end}>
        <Kf p="x" k={[[0, 27, E.hold], [props.typeAt, 27, `steps(${n})`], [props.typeAt + props.typeDur, 27 + n * cw]]} />
      </rect>
      <Pivot x={182} y={36} w={40} h={40} end={props.end}>
        <rect x={0} y={0} width={40} height={40} cornerRadius={10} fill={C.purple} end={props.end} />
        <text x={0} y={0} width={40} height={40} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={22} color="#ffffff" end={props.end}>{I.check}</text>
        <Kf p="scale" k={press(props.confirmAt, 0.88)} />
      </Pivot>
      <Kf p="scale" k={[[0, 0.85, E.hold], [props.openAt, 0.85, E.back], [props.openAt + 0.35, 1], [props.confirmAt + 0.12, 1, E.in], [props.confirmAt + 0.32, 0.9]]} />
      <Kf p="opacity" k={fade(props.openAt, 0.15, props.confirmAt + 0.12, 0.2)} />
    </Pivot>
  );
}

/** Option list popover (e.g. Largura: wrap_content / match_parent). */
export function OptionsPopover(props: {
  end: number;
  x: number;
  y: number;
  title: string;
  options: string[];
  selected: number;
  pick: number;
  openAt: number;
  pickAt: number;
}): JSX.Element {
  const h = 40 + props.options.length * 36;
  return (
    <Pivot name={`Popover ${props.title}`} x={props.x} y={props.y} w={200} h={h} end={props.end}>
      <rect x={0} y={0} width={200} height={h} cornerRadius={16} fill="#1a1c2c" end={props.end}>
        <stroke color="#34374e" width={1} />
        <shadow color="#000000" blur={30} offsetY={12} opacity={0.6} />
      </rect>
      <text x={16} y={14} fontFamily={F.ui} fontWeight={600} fontSize={11} color={C.text2} end={props.end}>{props.title}</text>
      {props.options.map((opt, i) => (
        <>
          {i === props.pick && (
            <rect x={8} y={34 + i * 36} width={184} height={32} cornerRadius={9} fill="#231d5e" end={props.end}>
              <stroke color={C.purple} width={1.3} />
              <Kf p="opacity" k={fade(props.pickAt - 0.04, 0.12)} />
            </rect>
          )}
          <text x={18} y={34 + i * 36} width={140} height={32} textBaseline="middle" fontFamily={F.mono} fontSize={12} color={C.text} end={props.end}>{opt}</text>
          {i === props.selected && (
            <text x={164} y={34 + i * 36} width={24} height={32} textBaseline="middle" fontFamily={F.icon} fontSize={18} color={C.purpleHi} end={props.end}>
              {I.check}
              <Kf p="opacity" k={[[0, 1, E.hold], [props.pickAt, 1, E.in], [props.pickAt + 0.1, 0]]} />
            </text>
          )}
          {i === props.pick && (
            <text x={164} y={34 + i * 36} width={24} height={32} textBaseline="middle" fontFamily={F.icon} fontSize={18} color={C.purpleHi} end={props.end}>
              {I.check}
              <Kf p="opacity" k={fade(props.pickAt + 0.05, 0.1)} />
            </text>
          )}
        </>
      ))}
      <Kf p="scale" k={[[0, 0.85, E.hold], [props.openAt, 0.85, E.back], [props.openAt + 0.35, 1], [props.pickAt + 0.3, 1, E.in], [props.pickAt + 0.5, 0.9]]} />
      <Kf p="opacity" k={fade(props.openAt, 0.15, props.pickAt + 0.3, 0.2)} />
    </Pivot>
  );
}
