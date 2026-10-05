/* "Olá App" — the small app built in the video: an image, a title, a name
 * field and a button whose click event changes the title. Authored at the
 * real screen's 360 dp width; the editor's canvas shows it scaled down. */

import type { JSX } from "solid-js";
import { C, F, I } from "../../lib/theme";
import { E, Kf, Pivot, fade, type Key } from "../../lib/motion";
import { StatusBar, SystemNav } from "./Phone";

export const APP = { w: 360, h: 780 };
/** Slots in app dp. */
export const SLOT = {
  img: { x: 140, y: 70, w: 80, h: 80 },
  title: { x: 0, y: 176, w: 360, h: 44 },
  field: { x: 28, y: 250, w: 304, h: 54 },
  btnWrap: { x: 112, y: 326, w: 136, h: 52 },
  btnFull: { x: 28, y: 326, w: 304, h: 52 },
  /** "Limpar" (borderless), added by Skit AI */
  limpar: { x: 28, y: 390, w: 304, h: 46 },
};

const NEVER = 1e4;

export type AppTimes = {
  /** component drops (appear with a pop + selection outline) */
  imgAt?: number;
  titleAt?: number;
  fieldAt?: number;
  btnAt?: number;
  /** "Button" → "Enviar" */
  btnTextAt?: number;
  /** wrap_content → match_parent */
  btnWidthAt?: number;
  /** selection outline around the button: [on, off] */
  btnSelect?: [number, number];
  /** selection outline around the field: [on, off] */
  fieldSelect?: [number, number];
  /** typing "Ana" in the field: [start, duration] */
  typeName?: [number, number];
  /** button pressed (ripple) */
  btnPressAt?: number;
  /** title changes to "Olá, Ana!" */
  titleChangeAt?: number;
  /** the "Limpar" button Skit AI added (and its click: field and title reset) */
  limpar?: boolean;
  limparPressAt?: number;
  clearAt?: number;
};

function pop(t: number | undefined): { scale: Key[]; opacity: Key[] } | null {
  if (t === undefined) return null;
  return {
    scale: [[0, 0.6, E.hold], [t, 0.6, E.back], [t + 0.42, 1]],
    opacity: [[0, 0, E.hold], [t, 0, E.out], [t + 0.12, 1]],
  };
}

function Selection(props: { box: { x: number; y: number; w: number; h: number }; on: number; off: number; widthKeys?: { x: Key[]; w: Key[] } }): JSX.Element {
  const pad = 5;
  return (
    <rect name="Selection" x={props.box.x - pad} y={props.box.y - pad} width={props.box.w + pad * 2} height={props.box.h + pad * 2} cornerRadius={8}>
      <stroke color={C.purple} width={2.2} />
      {props.widthKeys && <Kf p="x" k={props.widthKeys.x.map(([t, v, e]) => [t, (v as number) - pad, e] as Key)} />}
      {props.widthKeys && <Kf p="width" k={props.widthKeys.w.map(([t, v, e]) => [t, (v as number) + pad * 2, e] as Key)} />}
      <Kf p="opacity" k={[[0, 0, E.hold], [props.on, 0, E.out], [props.on + 0.12, 1], [props.off, 1, E.in], [props.off + 0.2, 0]]} />
    </rect>
  );
}

/** The layout itself (no status/app bar), at 360 dp wide. */
export function AppLayout(props: { t: AppTimes; end?: number; showSelections?: boolean }): JSX.Element {
  const t = props.t;
  const img = pop(t.imgAt);
  const title = pop(t.titleAt);
  const field = pop(t.fieldAt);
  const btn = pop(t.btnAt);
  const wAt = t.btnWidthAt ?? NEVER;
  const btnX: Key[] = wAt <= 0 ? [[0, SLOT.btnFull.x]] : [[0, SLOT.btnWrap.x, E.hold], [wAt, SLOT.btnWrap.x, E.back], [wAt + 0.5, SLOT.btnFull.x]];
  const btnW: Key[] = wAt <= 0 ? [[0, SLOT.btnFull.w]] : [[0, SLOT.btnWrap.w, E.hold], [wAt, SLOT.btnWrap.w, E.back], [wAt + 0.5, SLOT.btnFull.w]];
  const textAt = t.btnTextAt ?? NEVER;
  const textDone = textAt <= 0;
  const changeAt = t.titleChangeAt ?? NEVER;
  const typed = t.typeName;
  const pressAt = t.btnPressAt ?? NEVER;
  const clearAt = t.clearAt ?? NEVER;
  const cleared = t.clearAt !== undefined;

  return (
    <group name="Olá App layout">
      <Pivot name="ImageView" x={SLOT.img.x} y={SLOT.img.y} w={SLOT.img.w} h={SLOT.img.h} end={props.end}>
        <rect x={0} y={0} width={80} height={80} cornerRadius={24} end={props.end}>
          <linearGradientPaint rotation={45}>
            <colorStop offset={0} color={C.purple} />
            <colorStop offset={1} color={C.cyan} />
          </linearGradientPaint>
          <shadow color={C.purple} blur={18} offsetY={6} opacity={0.35} />
        </rect>
        <text x={0} y={0} width={80} height={80} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={46} color="#ffffff" end={props.end}>{I.wave}</text>
        {img && <Kf p="scale" k={img.scale} />}
        {img && <Kf p="opacity" k={img.opacity} />}
      </Pivot>

      <Pivot name="TextView" x={SLOT.title.x} y={SLOT.title.y} w={SLOT.title.w} h={SLOT.title.h} end={props.end}>
        <text x={0} y={0} width={360} height={44} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={34} color={C.appText} end={props.end}>
          Olá!
          <Kf p="opacity" k={[[0, 1, E.hold], [changeAt - 0.08, 1, E.in], [changeAt + 0.02, 0], ...(cleared ? ([[clearAt, 0, E.out], [clearAt + 0.12, 1]] as Key[]) : [])]} />
        </text>
        <text x={0} y={0} width={360} height={44} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={34} color={C.appText} end={props.end}>
          Olá, Ana!
          <textRange start={5} end={8} color={C.purple} />
          <Kf p="opacity" k={[[0, 0, E.hold], [changeAt, 0, E.out], [changeAt + 0.08, 1], ...(cleared ? ([[clearAt - 0.06, 1, E.in], [clearAt + 0.04, 0]] as Key[]) : [])]} />
        </text>
        {title && <Kf p="scale" k={title.scale} />}
        {title && <Kf p="opacity" k={title.opacity} />}
        {!title && t.titleChangeAt !== undefined && <Kf p="scale" k={[[0, 1, E.hold], [changeAt, 0.8, E.backHard], [changeAt + 0.5, 1]]} />}
      </Pivot>

      <Pivot name="EditText" x={SLOT.field.x} y={SLOT.field.y} w={SLOT.field.w} h={SLOT.field.h} end={props.end}>
        <rect x={0} y={0} width={SLOT.field.w} height={SLOT.field.h} cornerRadius={12} fill={C.appField} end={props.end}>
          <stroke color={C.appBorder} width={1.4} />
        </rect>
        {typed && (
          <rect x={0} y={0} width={SLOT.field.w} height={SLOT.field.h} cornerRadius={12} end={props.end}>
            <stroke color={C.purple} width={2} />
            <Kf p="opacity" k={fade(typed[0] - 0.25, 0.15)} />
          </rect>
        )}
        <text x={18} y={0} width={270} height={SLOT.field.h} textBaseline="middle" fontFamily={F.ui} fontSize={16} color={C.appMuted} end={props.end}>
          Digite seu nome
          {typed && <Kf p="opacity" k={[[0, 1, E.hold], [typed[0], 1, E.hold], [typed[0] + 0.01, 0], ...(cleared ? ([[clearAt + 0.04, 0, E.out], [clearAt + 0.2, 1]] as Key[]) : [])]} />}
        </text>
        {typed && (
          <>
            <text x={18} y={0} width={270} height={SLOT.field.h} textBaseline="middle" fontFamily={F.ui} fontSize={17} color={C.appText} end={props.end}>
              Ana
              {cleared && <Kf p="opacity" k={[[0, 1, E.hold], [clearAt, 1, E.in], [clearAt + 0.06, 0]]} />}
              <rect clipPath x={-2} y={0} height={SLOT.field.h}>
                <Kf p="width" k={[[0, 0, E.hold], [typed[0], 0, "steps(3)"], [typed[0] + typed[1], 36]]} />
              </rect>
            </text>
            <rect name="Caret" y={15} width={1.8} height={24} fill={C.purple} end={props.end}>
              <Kf p="x" k={[[0, 19, E.hold], [typed[0], 19, "steps(3)"], [typed[0] + typed[1], 52]]} />
              <Kf p="opacity" k={[[0, 0, E.hold], [typed[0] - 0.2, 1, E.hold], [typed[0] + typed[1] + 0.3, 0, E.hold], [typed[0] + typed[1] + 0.55, 1, E.hold], [typed[0] + typed[1] + 0.8, 0]]} />
            </rect>
          </>
        )}
        {field && <Kf p="scale" k={field.scale} />}
        {field && <Kf p="opacity" k={field.opacity} />}
      </Pivot>

      <group name="Button">
        <rect x={SLOT.btnWrap.x} y={SLOT.btnWrap.y} width={SLOT.btnWrap.w} height={SLOT.btnWrap.h} cornerRadius={14} fill={C.purple} end={props.end}>
          <Kf p="x" k={btnX} />
          <Kf p="width" k={btnW} />
          <shadow color={C.purple} blur={16} offsetY={6} opacity={0.35} />
        </rect>
        {t.btnPressAt !== undefined && (
          <rect name="Ripple" x={SLOT.btnWrap.x} y={SLOT.btnWrap.y} width={SLOT.btnWrap.w} height={SLOT.btnWrap.h} cornerRadius={14} fill="#ffffff" end={props.end}>
            <Kf p="x" k={btnX} />
            <Kf p="width" k={btnW} />
            <Kf p="opacity" k={[[0, 0, E.hold], [pressAt, 0, E.out], [pressAt + 0.08, 0.28], [pressAt + 0.45, 0]]} />
          </rect>
        )}
        <text x={SLOT.btnWrap.x} y={SLOT.btnWrap.y} width={SLOT.btnWrap.w} height={SLOT.btnWrap.h} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={16} color="#ffffff" end={props.end}>
          Button
          <Kf p="x" k={btnX} />
          <Kf p="width" k={btnW} />
          <Kf p="opacity" k={textDone ? [[0, 0]] : [[0, 1, E.hold], [textAt, 1, E.in], [textAt + 0.12, 0]]} />
        </text>
        <text x={SLOT.btnWrap.x} y={SLOT.btnWrap.y} width={SLOT.btnWrap.w} height={SLOT.btnWrap.h} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={16} color="#ffffff" end={props.end}>
          Enviar
          <Kf p="x" k={btnX} />
          <Kf p="width" k={btnW} />
          <Kf p="opacity" k={textDone ? [[0, 1]] : [[0, 0, E.hold], [textAt + 0.08, 0, E.out], [textAt + 0.25, 1]]} />
        </text>
        {btn && <Kf p="opacity" k={btn.opacity} />}
        {btn && <Kf p="offsetY" k={[[0, 14, E.hold], [t.btnAt!, 14, E.back], [t.btnAt! + 0.42, 0]]} />}
      </group>

      {t.limpar && (
        <group name="Button Limpar">
          {t.limparPressAt !== undefined && (
            <rect name="Ripple" x={SLOT.limpar.x} y={SLOT.limpar.y} width={SLOT.limpar.w} height={SLOT.limpar.h} cornerRadius={14} fill={C.purple} end={props.end}>
              <Kf p="opacity" k={[[0, 0, E.hold], [t.limparPressAt, 0, E.out], [t.limparPressAt + 0.08, 0.16], [t.limparPressAt + 0.5, 0]]} />
            </rect>
          )}
          <text x={SLOT.limpar.x} y={SLOT.limpar.y} width={SLOT.limpar.w} height={SLOT.limpar.h} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={16} letterSpacing={0.5} color={C.purple} end={props.end}>
            Limpar
          </text>
        </group>
      )}

      {props.showSelections !== false && (
        <>
          {t.imgAt !== undefined && <Selection box={SLOT.img} on={t.imgAt + 0.05} off={t.imgAt + 0.9} />}
          {t.titleAt !== undefined && <Selection box={{ x: 120, y: SLOT.title.y, w: 120, h: SLOT.title.h }} on={t.titleAt + 0.05} off={t.titleAt + 0.9} />}
          {t.fieldAt !== undefined && <Selection box={SLOT.field} on={t.fieldAt + 0.05} off={t.fieldAt + 0.9} />}
          {t.btnAt !== undefined && <Selection box={SLOT.btnWrap} on={t.btnAt + 0.05} off={t.btnAt + 0.9} />}
          {t.btnSelect && <Selection box={SLOT.btnWrap} on={t.btnSelect[0]} off={t.btnSelect[1]} widthKeys={{ x: btnX, w: btnW }} />}
          {t.fieldSelect && <Selection box={SLOT.field} on={t.fieldSelect[0]} off={t.fieldSelect[1]} />}
        </>
      )}
    </group>
  );
}

/** The layout scaled into the editor's canvas preview (224 dp wide). */
export function PreviewLayout(props: { t: AppTimes; end?: number }): JSX.Element {
  const s = 224 / APP.w;
  return (
    <Pivot name="Preview layout" w={APP.w} h={APP.h} scale={s} x={-(APP.w / 2) * (1 - s)} y={-(APP.h / 2) * (1 - s)} end={props.end}>
      <rect x={0} y={0} width={APP.w} height={APP.h} fill={C.appBg} end={props.end} />
      <AppLayout t={props.t} end={props.end} />
    </Pivot>
  );
}

/** Preview coordinates → screen dp, for drop targets and taps. */
export function previewPoint(appX: number, appY: number): [number, number] {
  const s = 224 / APP.w;
  return [120 + appX * s, 178 + appY * s];
}

/** The installed app, full screen: status bar, app bar, layout. */
export function AppScreen(props: { t: AppTimes; end?: number }): JSX.Element {
  return (
    <group name="Olá App (installed)">
      <rect x={0} y={0} width={360} height={780} fill={C.appBg} end={props.end} />
      <rect name="App bar" x={0} y={0} width={360} height={92} fill={C.purple} end={props.end}>
        <linearGradientPaint rotation={0}>
          <colorStop offset={0} color={C.purpleBtn} />
          <colorStop offset={1} color={C.purple2} />
        </linearGradientPaint>
      </rect>
      <text x={20} y={46} fontFamily={F.ui} fontWeight={700} fontSize={20} color="#ffffff" end={props.end}>Olá App</text>
      <group y={70}>
        <AppLayout t={props.t} end={props.end} showSelections={false} />
      </group>
      <StatusBar end={props.end} />
      <SystemNav end={props.end} light />
    </group>
  );
}
