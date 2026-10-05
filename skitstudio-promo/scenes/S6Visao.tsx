/* Scene 6 — Visão geral (38–42 s): a fast parallax wall of real SkitStudio
 * screens behind "Design. Lógica. Desenvolvimento." */

import type { JSX } from "solid-js";
import { C, F } from "../lib/theme";
import { E, Kf, Pivot, fade } from "../lib/motion";
import type { Format } from "../lib/format";

const S6 = 38;

type Card = { src: string; x: number; y: number; h: number; rot: number };
type Layer = { name: string; enter: number; drift: number; blur: number; opacity: number; cards: Card[] };

const LAYERS_H: Layer[] = [
  {
    name: "Back", enter: 520, drift: -260, blur: 3, opacity: 0.5,
    cards: [
      { src: "images/screens/editor-arvore.png", x: 980, y: 720, h: 480, rot: -3 },
      { src: "images/screens/compilando.png", x: 1980, y: 360, h: 480, rot: 3 },
      { src: "images/screens/chat-ia-modelos.png", x: 2700, y: 680, h: 480, rot: -2 },
      { src: "images/screens/splash.png", x: 120, y: 300, h: 480, rot: 2 },
    ],
  },
  {
    name: "Mid", enter: 760, drift: -420, blur: 1, opacity: 0.85,
    cards: [
      { src: "images/screens/editor-visual.png", x: 660, y: 450, h: 580, rot: 4 },
      { src: "images/screens/chat-ia-codigo.jpg", x: 1640, y: 640, h: 580, rot: -5 },
      { src: "images/screens/editor-codigo.png", x: 2560, y: 470, h: 580, rot: 6 },
    ],
  },
  {
    name: "Front", enter: 1050, drift: -620, blur: 0, opacity: 1,
    cards: [
      { src: "images/screens/projetos.jpg", x: 260, y: 580, h: 660, rot: -6 },
      { src: "images/screens/codigo-xml.jpg", x: 1250, y: 520, h: 680, rot: 5 },
      { src: "images/screens/chat-ia-build.jpg", x: 2200, y: 570, h: 660, rot: -4 },
    ],
  },
];

const LAYERS_V: Layer[] = [
  {
    name: "Back", enter: 420, drift: -200, blur: 3, opacity: 0.5,
    cards: [
      { src: "images/screens/editor-arvore.png", x: 180, y: 330, h: 520, rot: -3 },
      { src: "images/screens/compilando.png", x: 930, y: 1220, h: 520, rot: 3 },
      { src: "images/screens/chat-ia-modelos.png", x: 1350, y: 520, h: 520, rot: -2 },
      { src: "images/screens/splash.png", x: 300, y: 1700, h: 520, rot: 2 },
    ],
  },
  {
    name: "Mid", enter: 600, drift: -320, blur: 1, opacity: 0.85,
    cards: [
      { src: "images/screens/editor-visual.png", x: 820, y: 420, h: 640, rot: 4 },
      { src: "images/screens/chat-ia-codigo.jpg", x: 230, y: 1200, h: 640, rot: -5 },
      { src: "images/screens/editor-codigo.png", x: 1450, y: 1500, h: 640, rot: 6 },
    ],
  },
  {
    name: "Front", enter: 820, drift: -460, blur: 0, opacity: 1,
    cards: [
      { src: "images/screens/projetos.jpg", x: 300, y: 640, h: 740, rot: -6 },
      { src: "images/screens/codigo-xml.jpg", x: 860, y: 1080, h: 760, rot: 5 },
      { src: "images/screens/chat-ia-build.jpg", x: 420, y: 1640, h: 740, rot: -4 },
      { src: "images/screens/editor-propriedades.png", x: 1400, y: 820, h: 740, rot: 3 },
    ],
  },
];

function ScreenCard(props: { c: Card; t: number }): JSX.Element {
  const h = props.c.h;
  const w = Math.round(h * 0.439);
  const r = h * 0.045;
  return (
    <Pivot name={props.c.src} x={props.c.x - w / 2} y={props.c.y - h / 2} w={w} h={h} rotation={props.c.rot} end={5}>
      <image src={props.c.src} x={0} y={0} width={w} height={h} cornerRadius={r} end={5}>
        <shadow color="#000000" blur={50} offsetY={24} opacity={0.65} />
      </image>
      <rect x={0} y={0} width={w} height={h} cornerRadius={r} end={5}>
        <stroke color="#3a3e5c" width={2} />
      </rect>
      <Kf p="scale" k={[[0, 0.86, E.hold], [props.t, 0.86, E.out], [props.t + 0.7, 1]]} />
    </Pivot>
  );
}

function Word(props: { text: string; y: number; t: number; out: number; w: number; size: number; gradient?: boolean }): JSX.Element {
  return (
    <text x={0} y={props.y} width={props.w} height={150} textAlign="center" textBaseline="middle" fontFamily={F.display} fontWeight={800} fontSize={props.size} letterSpacing={-3} color={C.text} end={5}>
      {props.text}
      {props.gradient && (
        <linearGradientPaint rotation={0}>
          <colorStop offset={0.3} color={C.purpleHi} />
          <colorStop offset={0.7} color={C.cyan} />
        </linearGradientPaint>
      )}
      <shadow color="#000000" blur={40} opacity={0.6} />
      <Kf p="opacity" k={[[0, 0, E.hold], [props.t, 0, E.out], [props.t + 0.06, 1], [props.out, 1, E.in], [props.out + 0.3, 0]]} />
      <Kf p="scale" k={[[0, 1.3, E.hold], [props.t, 1.3, E.expo], [props.t + 0.55, 1], [props.out, 1, E.in], [props.out + 0.3, 1.08]]} />
      <Kf p="blur" k={[[0, 14, E.hold], [props.t, 14, E.out], [props.t + 0.25, 0], [props.out, 0, E.in], [props.out + 0.3, 12]]} />
    </text>
  );
}

export function S6Visao(props: { f: Format }): JSX.Element {
  const f = props.f;
  const layers = f.v ? LAYERS_V : LAYERS_H;
  const size = f.v ? 100 : 132;
  const y0 = f.v ? 740 : 300;
  const step = f.v ? 150 : 160;
  return (
    <group name="S6 Visão geral" start={S6} end={42.5}>
      <group name="Montage" end={4.5}>
        <group name="Screen wall">
          {layers.map((layer, li) => (
            <group name={`${layer.name} layer`} opacity={layer.opacity}>
              {layer.cards.map((c, i) => (
                <ScreenCard c={c} t={0.05 + i * 0.12 + li * 0.04} />
              ))}
              {layer.blur > 0 && <effect type="blur" value={layer.blur} />}
              <Kf p="offsetX" k={[[0, layer.enter, E.out], [0.9, 0, E.linear], [3.7, layer.drift, E.expoIn], [4.2, layer.drift - f.w * 0.8]]} />
            </group>
          ))}
        </group>
        <adjustmentLayer name="Montage camera" start={0} end={4.5} width={f.w} height={f.h}>
          <Kf p="scale" k={[[0, 1.06, E.linear], [4.2, 1.14]]} />
          <Kf p="rotation" k={[[0, -1.5, E.linear], [4.2, 1.2]]} />
        </adjustmentLayer>
        <rect name="Scrim" x={0} y={0} width={f.w} height={f.h} end={4.5}>
          <radialGradientPaint>
            <colorStop offset={0} color="#05060b" opacity={0.82} />
            <colorStop offset={0.55} color="#05060b" opacity={0.45} />
            <colorStop offset={1} color="#05060b" opacity={0.05} />
          </radialGradientPaint>
          <Kf p="opacity" k={fade(0.0, 0.25, 3.6, 0.35)} />
        </rect>
        <Word text="Design." y={y0} t={0.0} out={3.55} w={f.w} size={size} />
        <Word text="Lógica." y={y0 + step} t={1.0} out={3.6} w={f.w} size={size} gradient />
        <Word text="Desenvolvimento." y={y0 + step * 2} t={2.0} out={3.65} w={f.w} size={size} />
        <Kf p="opacity" k={[[0, 1, E.hold], [4.0, 1, E.in], [4.35, 0]]} />
      </group>
    </group>
  );
}
