/* Scene 6 — Visão geral (38–46 s): a fast parallax wall of real SkitStudio
 * screens behind "Design. Lógica. Desenvolvimento.", then the build: ▶ →
 * "Compilando Olá App" with the real build steps → "Build concluído ✓". */

import type { JSX } from "solid-js";
import { C, F } from "../lib/theme";
import { E, Kf, Pivot, Camera, cam, fade, type Key } from "../lib/motion";
import { PhoneRig } from "../components/ui/Phone";
import { EditorChrome, Palette, CanvasPanel } from "../components/ui/Editor";
import { PreviewLayout } from "../components/ui/AppScreen";
import { CompileScreen } from "../components/ui/Compile";
import { Tap, Headline } from "../components/fx/Fx";

const S6 = 38;

type Card = { src: string; x: number; y: number; h: number; rot: number };
const LAYERS: { name: string; enter: number; drift: number; blur: number; opacity: number; cards: Card[] }[] = [
  {
    name: "Back",
    enter: 520,
    drift: -260,
    blur: 3,
    opacity: 0.5,
    cards: [
      { src: "images/screens/editor-arvore.png", x: 980, y: 720, h: 480, rot: -3 },
      { src: "images/screens/compilando.png", x: 1980, y: 360, h: 480, rot: 3 },
      { src: "images/screens/app-browser-ia.jpg", x: 2700, y: 680, h: 480, rot: -2 },
      { src: "images/screens/splash.png", x: 120, y: 300, h: 480, rot: 2 },
    ],
  },
  {
    name: "Mid",
    enter: 760,
    drift: -420,
    blur: 1,
    opacity: 0.85,
    cards: [
      { src: "images/screens/editor-visual.png", x: 660, y: 450, h: 580, rot: 4 },
      { src: "images/screens/editor-propriedades.png", x: 1640, y: 640, h: 580, rot: -5 },
      { src: "images/screens/editor-codigo.png", x: 2560, y: 470, h: 580, rot: 6 },
    ],
  },
  {
    name: "Front",
    enter: 1050,
    drift: -620,
    blur: 0,
    opacity: 1,
    cards: [
      { src: "images/screens/projetos.jpg", x: 260, y: 580, h: 660, rot: -6 },
      { src: "images/screens/codigo-xml.jpg", x: 1250, y: 520, h: 680, rot: 5 },
      { src: "images/screens/build-concluido.png", x: 2200, y: 570, h: 660, rot: -4 },
    ],
  },
];

function ScreenCard(props: { c: Card; t: number }): JSX.Element {
  const h = props.c.h;
  const w = Math.round(h * 0.439);
  const r = h * 0.045;
  return (
    <Pivot name={props.c.src} x={props.c.x - w / 2} y={props.c.y - h / 2} w={w} h={h} rotation={props.c.rot} end={8}>
      <image src={props.c.src} x={0} y={0} width={w} height={h} cornerRadius={r} end={8}>
        <shadow color="#000000" blur={50} offsetY={24} opacity={0.65} />
      </image>
      <rect x={0} y={0} width={w} height={h} cornerRadius={r} end={8}>
        <stroke color="#3a3e5c" width={2} />
      </rect>
      <Kf p="scale" k={[[0, 0.86, E.hold], [props.t, 0.86, E.out], [props.t + 0.7, 1]]} />
    </Pivot>
  );
}

function Word(props: { text: string; y: number; t: number; out: number; gradient?: boolean }): JSX.Element {
  return (
    <text x={0} y={props.y} width={1920} height={150} textAlign="center" textBaseline="middle" fontFamily={F.display} fontWeight={800} fontSize={132} letterSpacing={-3} color={C.text} end={8}>
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

const BUILD = { start: 41.9, play: 42.5, compile: 42.62, done: 45.0, install: 45.5 };

function BuildPhone(): JSX.Element {
  const base = BUILD.start - S6; // group start, scene-relative
  const L = (abs: number) => abs - BUILD.start;
  const end = 46 - BUILD.start;
  const cL = (abs: number) => abs - BUILD.compile;
  const steps: [number, number][] = [
    [cL(42.65), 0], [cL(42.95), 1], [cL(43.3), 2], [cL(43.7), 3], [cL(44.1), 4], [cL(44.45), 5], [cL(44.75), 6], [cL(BUILD.done), 7],
  ];
  return (
    <group name="Build" start={base} end={8}>
      <group name="Build phone">
        <PhoneRig cx={1250} cy={540} scale={1.2} end={end}>
          <group name="Editor (build)" end={L(BUILD.compile) + 0.5}>
            <EditorChrome end={1.3} appName="Olá App" tabs={[[0, 0]]} subtabs={[[0, 0]]} playPressAt={L(BUILD.play)} />
            <Palette end={1.3} />
            <CanvasPanel end={1.3}>
              <PreviewLayout end={1.3} t={{ btnTextAt: -1, btnWidthAt: -1 }} />
            </CanvasPanel>
            <Tap x={164 + 2 * 38 + 17} y={51} t={L(BUILD.play)} end={1.3} />
          </group>
          <group name="Compile" start={L(BUILD.compile)} end={end}>
            <CompileScreen end={end - L(BUILD.compile)} app="Olá App" steps={steps} doneAt={cL(BUILD.done)} installPressAt={cL(BUILD.install)} />
            <Tap x={95} y={718} t={cL(BUILD.install)} end={end - L(BUILD.compile)} />
            <Kf p="offsetY" k={[[0, 780, E.out], [0.4, 0]]} />
          </group>
        </PhoneRig>
        <Kf p="offsetX" k={[[0, 1100, E.out], [0.6, 0]]} />
      </group>
      <Camera
        name="Build camera"
        start={0}
        end={end}
        k={[
          [0, cam([1250, 540], 1.0), E.inOut],
          [L(42.75), cam([1250, 540], 1.0), E.inOut],
          [L(43.4), cam([1250, 540], 1.1), E.linear],
          [L(45.45), cam([1250, 535], 1.14), E.expoIn],
          [L(46.0), cam([1250, 470], 2.8)],
        ]}
      />
    </group>
  );
}

export function S6Visao(): JSX.Element {
  return (
    <group name="S6 Visão geral" start={S6} end={46}>
      <group name="Montage" end={4.4}>
        <group name="Screen wall">
          {LAYERS.map((layer, li) => (
            <group name={`${layer.name} layer`} opacity={layer.opacity}>
              {layer.cards.map((c, i) => (
                <ScreenCard c={c} t={0.05 + i * 0.12 + li * 0.04} />
              ))}
              {layer.blur > 0 && <effect type="blur" value={layer.blur} />}
              <Kf
                p="offsetX"
                k={[
                  [0, layer.enter, E.out],
                  [0.9, 0, E.linear],
                  [3.7, layer.drift, E.expoIn],
                  [4.2, layer.drift - 1500],
                ]}
              />
            </group>
          ))}
        </group>
        <adjustmentLayer name="Montage camera" start={0} end={4.4} width={1920} height={1080}>
          <Kf p="scale" k={[[0, 1.06, E.linear], [4.2, 1.14]]} />
          <Kf p="rotation" k={[[0, -1.5, E.linear], [4.2, 1.2]]} />
        </adjustmentLayer>
        <rect name="Scrim" x={0} y={0} width={1920} height={1080} end={4.4}>
          <radialGradientPaint>
            <colorStop offset={0} color="#05060b" opacity={0.82} />
            <colorStop offset={0.55} color="#05060b" opacity={0.45} />
            <colorStop offset={1} color="#05060b" opacity={0.05} />
          </radialGradientPaint>
          <Kf p="opacity" k={fade(0.0, 0.25, 3.6, 0.35)} />
        </rect>
        <Word text="Design." y={300} t={0.0} out={3.55} />
        <Word text="Lógica." y={460} t={1.0} out={3.6} gradient />
        <Word text="Desenvolvimento." y={620} t={2.0} out={3.65} />
        <Kf p="opacity" k={[[0, 1, E.hold], [4.0, 1, E.in], [4.35, 0]]} />
      </group>
      <BuildPhone />
      <rect name="Install flash" x={0} y={0} width={1920} height={1080} fill="#ffffff" end={8}>
        <Kf p="opacity" k={[[0, 0, E.hold], [7.7, 0, E.in], [8.0, 0.9]]} />
      </rect>
    </group>
  );
}

export function S6Titles(): JSX.Element {
  return <Headline y={360} kicker="BUILD" lines={["Gere o APK"]} sub="Compile e instale no próprio celular." t={42.3} t2={45.55} />;
}

export type _K = Key;
