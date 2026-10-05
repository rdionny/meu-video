/* Scene 7 — Resultado (46–54 s): the installed app running. Type a name,
 * tap "Enviar", and the onClick logic written earlier changes the title. */

import type { JSX } from "solid-js";
import { C, F, I } from "../lib/theme";
import { E, Kf, Pivot, Camera, cam, fade } from "../lib/motion";
import { PhoneRig } from "../components/ui/Phone";
import { AppScreen, SLOT } from "../components/ui/AppScreen";
import { Tap, Headline } from "../components/fx/Fx";

const S7 = 46;
const PH = { cx: 1230, cy: 540, s: 1.2 };
const W = (dx: number, dy: number): [number, number] => [PH.cx + (dx - 180) * PH.s, PH.cy + (dy - 390) * PH.s];

const B = { tapField: 47.0, type: 47.25, tapSend: 48.5, change: 49.0 };

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

export function S7Resultado(): JSX.Element {
  const L = (abs: number) => abs - S7;
  const end = 8;
  const field: [number, number] = [180, 70 + SLOT.field.y + SLOT.field.h / 2];
  const send: [number, number] = [180, 70 + SLOT.btnFull.y + SLOT.btnFull.h / 2];
  const title: [number, number] = [180, 70 + SLOT.title.y + SLOT.title.h / 2];
  return (
    <group name="S7 Resultado" start={S7} end={54}>
      <group name="Result phone">
        <PhoneRig cx={PH.cx} cy={PH.cy} scale={PH.s} end={end}>
          <AppScreen end={end} t={{ btnTextAt: -1, btnWidthAt: -1, typeName: [L(B.type), 0.45], btnPressAt: L(B.tapSend), titleChangeAt: L(B.change) }} />
          <Sparkles x={title[0]} y={title[1]} t={L(B.change)} end={end} />
          <Tap x={field[0]} y={field[1]} t={L(B.tapField)} end={end} />
          <Tap x={send[0]} y={send[1]} t={L(B.tapSend)} end={end} />
        </PhoneRig>
      </group>
      <Camera
        name="Result camera"
        start={0}
        end={end}
        k={[
          [0, cam(W(180, 380), 1.6, [PH.cx, PH.cy]), E.expo],
          [0.9, cam(W(180, 380), 1.08, [PH.cx, PH.cy]), E.linear],
          [L(47.6), cam(W(180, 360), 1.14, [PH.cx, PH.cy]), E.inOut],
          [L(48.9), cam(W(180, 320), 1.42, [PH.cx, 500]), E.linear],
          [L(53.4), cam(W(180, 325), 1.5, [PH.cx, 500]), E.expoIn],
          [8.0, cam(W(180, 360), 0.8, [PH.cx, 620])],
        ]}
      />

      <Pivot name="Installed badge" x={1600} y={140} w={250} h={56} end={end}>
        <rect x={0} y={0} width={250} height={56} cornerRadius={28} fill="#0f2418" end={end}>
          <stroke color={C.green} width={1.5} />
          <shadow color={C.green} blur={24} opacity={0.35} />
        </rect>
        <text x={18} y={0} width={32} height={56} textBaseline="middle" fontFamily={F.icon} fontSize={26} color={C.green} end={end}>{I.checkCircle}</text>
        <text x={54} y={0} width={190} height={56} textBaseline="middle" fontFamily={F.ui} fontWeight={600} fontSize={21} color="#c9f7da" end={end}>App instalado</text>
        <Kf p="scale" k={[[0, 0.6, E.hold], [0.55, 0.6, E.back], [0.95, 1], [7.35, 1, E.in], [7.6, 0.7]]} />
        <Kf p="opacity" k={fade(0.55, 0.15, 7.35, 0.25)} />
        <Kf p="offsetY" k={[[0, 0, E.hold], [1.0, 0, E.inOut], [4.0, -12, E.inOut], [7.0, 4]]} />
      </Pivot>

      <rect name="Arrival flash" x={0} y={0} width={1920} height={1080} fill="#ffffff" end={1}>
        <Kf p="opacity" k={[[0, 0.9, E.out], [0.45, 0]]} />
      </rect>
    </group>
  );
}

export function S7Titles(): JSX.Element {
  return (
    <Headline
      y={300}
      kicker="RESULTADO"
      lines={["Seu app,", "funcionando."]}
      sub="Criado, compilado e instalado no próprio celular."
      t={46.6}
      t2={53.4}
      accent={[1]}
    />
  );
}
