/* Scene 7 — Resultado (58–66 s): the installed app running. Type a name,
 * tap "Enviar": the onClick logic written earlier changes the title (with
 * the pop animation Skit AI added), then "Limpar" — the button Skit AI
 * created — resets it. */

import type { JSX } from "solid-js";
import { C, F, I } from "../lib/theme";
import { E, Kf, Pivot, Camera, cam, fade } from "../lib/motion";
import { PhoneRig } from "../components/ui/Phone";
import { AppScreen, SLOT } from "../components/ui/AppScreen";
import { Tap, Headline } from "../components/fx/Fx";
import { center, stagePlan, type Format } from "../lib/format";

const S7 = 58;

const B = { tapField: 59.0, type: 59.25, tapSend: 60.5, change: 61.0, tapLimpar: 63.0, clear: 63.1 };

/** Little bursts around the title when it changes. */
function Sparkles(props: { x: number; y: number; t: number; end: number }): JSX.Element {
  const rays = [
    [-150, -36, C.purpleHi], [150, -30, C.cyan], [-120, 34, C.cyan], [126, 38, C.purpleHi], [-40, -52, C.pink], [52, -50, C.purpleHi], [0, 56, C.cyan], [-176, 4, C.pink], [178, 6, C.purpleHi],
  ] as const;
  return (
    <group name="Sparkles">
      {rays.map(([dx, dy, color], i) => {
        const t = props.t + (i % 3) * 0.03;
        return (
          <Pivot x={props.x - 5} y={props.y - 5} w={10} h={10} rotation={45} end={props.end}>
            <rect x={0} y={0} width={10} height={10} cornerRadius={2} fill={color} end={props.end} />
            <Kf p="offsetX" k={[[0, 0, E.hold], [t, dx * 0.45, E.out], [t + 0.6, dx]]} />
            <Kf p="offsetY" k={[[0, 0, E.hold], [t, dy * 0.45, E.out], [t + 0.6, dy]]} />
            <Kf p="scale" k={[[0, 0, E.hold], [t, 1.3, E.out], [t + 0.6, 0]]} />
            <Kf p="opacity" k={[[0, 0, E.hold], [t, 1, E.in], [t + 0.6, 0]]} />
          </Pivot>
        );
      })}
    </group>
  );
}

export function S7Resultado(props: { f: Format }): JSX.Element {
  const f = props.f;
  const L = (abs: number) => abs - S7;
  const end = 8;
  const p = stagePlan(f).phone;
  const PH = { cx: p.cx, cy: p.cy, s: 1.2 };
  const W = (dx: number, dy: number): [number, number] => [PH.cx + (dx - 180) * PH.s, PH.cy + (dy - 390) * PH.s];
  const c = center(f);
  // detail framing: H keeps the phone right of the headline, V below it
  const near: [number, number] = f.v ? [540, 1260] : [PH.cx, 500];
  const far: [number, number] = f.v ? [540, 1300] : [PH.cx, 620];
  // the vertical frame shows the phone closer (no headline column beside it)
  const rest: [number, number] = f.v ? [540, 1300] : [PH.cx, PH.cy];
  const z = (h: number) => (f.v ? h + (h < 1.3 ? 0.27 : 0.2) : h);
  const field: [number, number] = [180, 70 + SLOT.field.y + SLOT.field.h / 2];
  const send: [number, number] = [180, 70 + SLOT.btnFull.y + SLOT.btnFull.h / 2];
  const limpar: [number, number] = [180, 70 + SLOT.limpar.y + SLOT.limpar.h / 2];
  const title: [number, number] = [180, 70 + SLOT.title.y + SLOT.title.h / 2];
  // vertical: bigger, left-aligned under the headline (the Pivot scales around its centre)
  const bs = f.v ? 1.45 : 1;
  const badge = f.v ? { x: 80 + 125 * (bs - 1), y: 490 + 28 * (bs - 1) } : { x: 1600, y: 140 };
  return (
    <group name="S7 Resultado" start={S7} end={66}>
      <group name="Result phone">
        <PhoneRig cx={PH.cx} cy={PH.cy} scale={PH.s} end={end}>
          <AppScreen
            end={end}
            t={{
              btnTextAt: -1,
              btnWidthAt: -1,
              typeName: [L(B.type), 0.45],
              btnPressAt: L(B.tapSend),
              titleChangeAt: L(B.change),
              limpar: true,
              limparPressAt: L(B.tapLimpar),
              clearAt: L(B.clear),
            }}
          />
          <Sparkles x={title[0]} y={title[1]} t={L(B.change)} end={end} />
          <Tap x={field[0]} y={field[1]} t={L(B.tapField)} end={end} />
          <Tap x={send[0]} y={send[1]} t={L(B.tapSend)} end={end} />
          <Tap x={limpar[0]} y={limpar[1]} t={L(B.tapLimpar)} end={end} />
        </PhoneRig>
      </group>
      <Camera
        name="Result camera"
        start={0}
        end={end}
        w={f.w}
        h={f.h}
        k={[
          [0, cam(W(180, 380), z(1.6), rest, c), E.expo],
          [0.9, cam(W(180, 380), z(1.08), rest, c), E.linear],
          [L(59.6), cam(W(180, 360), z(1.14), rest, c), E.inOut],
          [L(60.9), cam(W(180, 330), z(1.42), near, c), E.linear],
          [L(62.6), cam(W(180, 340), z(1.46), near, c), E.inOut],
          [L(63.3), cam(W(180, 350), z(1.42), near, c), E.linear],
          [L(65.4), cam(W(180, 355), z(1.48), near, c), E.expoIn],
          [8.0, cam(W(180, 360), 0.8, far, c)],
        ]}
      />

      <Pivot name="Installed badge" x={badge.x} y={badge.y} w={250} h={56} end={end}>
        <rect x={0} y={0} width={250} height={56} cornerRadius={28} fill="#0f2418" end={end}>
          <stroke color={C.green} width={1.5} />
          <shadow color={C.green} blur={24} opacity={0.35} />
        </rect>
        <text x={18} y={0} width={32} height={56} textBaseline="middle" fontFamily={F.icon} fontSize={26} color={C.green} end={end}>{I.checkCircle}</text>
        <text x={54} y={0} width={190} height={56} textBaseline="middle" fontFamily={F.ui} fontWeight={600} fontSize={21} color="#c9f7da" end={end}>App instalado</text>
        <Kf p="scale" k={[[0, 0.6 * bs, E.hold], [0.55, 0.6 * bs, E.back], [0.95, bs], [7.35, bs, E.in], [7.6, 0.7 * bs]]} />
        <Kf p="opacity" k={fade(0.55, 0.15, 7.35, 0.25)} />
        <Kf p="offsetY" k={[[0, 0, E.hold], [1.0, 0, E.inOut], [4.0, -12, E.inOut], [7.0, 4]]} />
      </Pivot>

      <rect name="Arrival flash" x={0} y={0} width={f.w} height={f.h} fill="#ffffff" end={1}>
        <Kf p="opacity" k={[[0, 0.9, E.out], [0.45, 0]]} />
      </rect>
    </group>
  );
}

export function S7Titles(props: { f: Format }): JSX.Element {
  return (
    <Headline
      f={props.f}
      y={300}
      kicker="RESULTADO"
      lines={["Seu app,", "funcionando."]}
      sub="Criado, compilado e instalado no próprio celular."
      t={58.6}
      t2={65.4}
      accent={[1]}
    />
  );
}
