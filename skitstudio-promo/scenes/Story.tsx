/* Scenes 2–5 (6 s → 38 s) as one continuous shot on the phone:
 *   2  Novo projeto → editor opens            (6–12)
 *   3  drag components, edit properties       (12–24)
 *   4  Árvore (hierarchy) and the XML code    (24–30)
 *   5  onClick event and the Java logic        (30–38)
 * One camera (an adjustment layer) flies over the phone for the whole shot.
 * Times are written in absolute seconds and converted per group. */

import type { JSX } from "solid-js";
import { C, I } from "../lib/theme";
import { E, Kf, Camera, cam, fade, type CamKey, type Key } from "../lib/motion";
import { STORY } from "../lib/timeline";
import { PhoneRig } from "../components/ui/Phone";
import { ProjectList, CARD } from "../components/ui/ProjectList";
import { EditorChrome, Palette, CanvasPanel, paletteRowY, PALETTE } from "../components/ui/Editor";
import { PreviewLayout, previewPoint, SLOT } from "../components/ui/AppScreen";
import { PropertiesSheet, sheetOpen, tileCenter, tabCenter, eventCenter, TextPopover, OptionsPopover } from "../components/ui/Sheet";
import { TreeView, treeRowCenter } from "../components/ui/Tree";
import { CodeView, XML_LINES, javaLines } from "../components/ui/Code";
import { Tap, Drag, Headline } from "../components/fx/Fx";

/** Where the phone sits (camera at rest) and its dp → px scale. */
export const PHONE = { cx: 1250, cy: 540, s: 1.2 };
/** dp on the phone's screen → frame px at camera rest. */
export function W(dx: number, dy: number): [number, number] {
  return [PHONE.cx + (dx - 180) * PHONE.s, PHONE.cy + (dy - 390) * PHONE.s];
}

const ST = STORY.start; // 6

// ---------------------------------------------------------------- beats (absolute s)
const T = {
  newProject: 7.5,
  edit: 9.5,
  expand: 9.55,
  editorA: 9.75,
  drags: [
    { label: "Imagem", drop: 13.5, slot: [180, 110] as [number, number] },
    { label: "TextView", drop: 15.0, slot: [180, 198] as [number, number] },
    { label: "EditText", drop: 16.5, slot: [180, 277] as [number, number] },
    { label: "Button", drop: 18.0, slot: [180, 352] as [number, number] },
  ],
  selectBtn: 18.75,
  sheetA: 19.0,
  tapTexto: 19.75,
  textPopover: 19.9,
  typeEnviar: 20.1,
  confirm: 20.85,
  btnText: 21.0,
  tapLargura: 21.5,
  optPopover: 21.65,
  pickMatch: 22.2,
  btnWidth: 22.3,
  sheetAClose: 23.1,
  editorB: 24.0,
  tapArvore: 24.25,
  tapTreeBtn: 25.6,
  tapCodigo: 26.5,
  tapVisual: 30.0,
  selectBtn2: 30.5,
  sheetB: 30.75,
  tapEvent: 31.25,
  tapOnClick: 31.9,
  toJava: 32.2,
  typeJava: 32.6,
  highlight: 35.9,
};

function rel(base: number) {
  return (abs: number) => abs - base;
}

// ---------------------------------------------------------------- screens

function ProjectsScreen(): JSX.Element {
  const L = rel(ST);
  const end = 4.6;
  return (
    <group name="Screen · Projetos" start={0} end={end}>
      <ProjectList end={end} enterAt={0} newAt={L(T.newProject)} editAt={L(T.edit)} newName="Olá App" newPkg="com.example.olaapp" />
      <Tap x={180} y={625} t={L(T.newProject)} end={end} />
      <Tap x={CARD.x + 268} y={CARD.y + 40} t={L(T.edit)} end={end} />
    </group>
  );
}

function Expander(): JSX.Element {
  const start = T.expand - ST;
  return (
    <group name="Card → editor" start={start} end={start + 1.2}>
      <rect fill={C.app} end={1.2}>
        <stroke color={C.purple} width={1.5}>
          <Kf p="opacity" k={[[0, 1, E.in], [0.6, 0]]} />
        </stroke>
        <Kf p="x" k={[[0, CARD.x, E.inOut], [0.55, 0]]} />
        <Kf p="y" k={[[0, CARD.y, E.inOut], [0.55, 0]]} />
        <Kf p="width" k={[[0, CARD.w, E.inOut], [0.55, 360]]} />
        <Kf p="height" k={[[0, CARD.h, E.inOut], [0.55, 780]]} />
        <Kf p="cornerRadius" k={[[0, 16, E.inOut], [0.55, 40]]} />
        <Kf p="opacity" k={fade(0, 0.08)} />
      </rect>
    </group>
  );
}

function EditorA(): JSX.Element {
  const base = T.editorA;
  const L = rel(base);
  const end = 24.0 - base;
  const palX = 8 + 49;
  const drags = T.drags.map((d) => {
    const t1 = L(d.drop) - 0.08;
    const t0 = t1 - 0.75;
    const icon = PALETTE[1]!.items.find((i) => i.label === d.label)!.icon;
    return { ...d, t0, t1, icon, a: [palX, paletteRowY(d.label)] as [number, number], b: previewPoint(d.slot[0], d.slot[1]) };
  });
  const btn = previewPoint(180, SLOT.btnWrap.y + SLOT.btnWrap.h / 2);
  return (
    <group name="Screen · Editor (design)" start={base - ST} end={24.0 - ST}>
      <EditorChrome end={end} appName="Olá App" tabs={[[0, 0]]} subtabs={[[0, 0]]} enterAt={0.15} />
      <Palette end={end} enterAt={0.3} presses={drags.map((d) => [d.label, d.t0] as [string, number])} />
      <CanvasPanel end={end} enterAt={0.4}>
        <PreviewLayout
          end={end}
          t={{
            imgAt: L(T.drags[0]!.drop),
            titleAt: L(T.drags[1]!.drop),
            fieldAt: L(T.drags[2]!.drop),
            btnAt: L(T.drags[3]!.drop),
            btnTextAt: L(T.btnText),
            btnWidthAt: L(T.btnWidth),
            btnSelect: [L(T.selectBtn + 0.05), L(T.sheetAClose + 0.1)],
          }}
        />
      </CanvasPanel>
      <PropertiesSheet
        end={end}
        open={sheetOpen(L(T.sheetA), L(T.sheetAClose))}
        ids={[[0, "btn_enviar", I.button]]}
        tabs={[[0, "Basic"]]}
        tilePresses={[["Texto", L(T.tapTexto)], ["Largura", L(T.tapLargura)]]}
      />
      <TextPopover end={end} x={64} y={452} title="Texto" value="Enviar" openAt={L(T.textPopover)} typeAt={L(T.typeEnviar)} typeDur={0.5} confirmAt={L(T.confirm)} />
      <OptionsPopover end={end} x={80} y={400} title="Largura" options={["wrap_content", "match_parent", "100dp"]} selected={0} pick={1} openAt={L(T.optPopover)} pickAt={L(T.pickMatch)} />
      {drags.map((d) => (
        <Drag a={d.a} b={d.b} t0={d.t0} t1={d.t1} icon={d.icon} label={d.label} end={end} />
      ))}
      <Tap x={btn[0]} y={btn[1]} t={L(T.selectBtn)} end={end} />
      <Tap x={tileCenter("Texto")[0]} y={tileCenter("Texto")[1]} t={L(T.tapTexto)} end={end} />
      <Tap x={64 + 182 + 20} y={452 + 36 + 20} t={L(T.confirm)} end={end} />
      <Tap x={tileCenter("Largura")[0]} y={tileCenter("Largura")[1]} t={L(T.tapLargura)} end={end} />
      <Tap x={180} y={400 + 34 + 36 + 16} t={L(T.pickMatch)} end={end} />
    </group>
  );
}

function EditorB(): JSX.Element {
  const base = T.editorB;
  const L = rel(base);
  const end = STORY.end - base;
  const visualVis: Key[] = [
    [0, 1, E.hold], [L(T.tapArvore), 1, E.in], [L(T.tapArvore) + 0.12, 0, E.hold],
    [L(T.tapVisual), 0, E.out], [L(T.tapVisual) + 0.2, 1, E.hold],
    [L(T.toJava), 1, E.in], [L(T.toJava) + 0.15, 0],
  ];
  const subVis: Key[] = [
    [0, 1, E.hold], [L(T.tapCodigo), 1, E.in], [L(T.tapCodigo) + 0.15, 0, E.hold],
    [L(T.tapVisual), 0, E.out], [L(T.tapVisual) + 0.15, 1, E.hold],
    [L(T.toJava), 1, E.in], [L(T.toJava) + 0.15, 0],
  ];
  const btn = previewPoint(180, SLOT.btnFull.y + SLOT.btnFull.h / 2);
  return (
    <group name="Screen · Editor (structure + logic)" start={base - ST} end={STORY.end - ST}>
      <EditorChrome
        end={end}
        appName="Olá App"
        tabs={[[0, 0], [L(T.tapCodigo), 1], [L(T.tapVisual), 0], [L(T.toJava), 1]]}
        subtabs={[[0, 0], [L(T.tapArvore), 1], [L(T.tapVisual), 0]]}
        subtabsOpacity={subVis}
      />
      <Palette end={end} opacity={visualVis} />
      <CanvasPanel end={end} opacity={visualVis}>
        <PreviewLayout end={end} t={{ btnTextAt: -1, btnWidthAt: -1, btnSelect: [L(T.selectBtn2 + 0.05), L(T.toJava)] }} />
      </CanvasPanel>
      <TreeView
        end={end}
        revealAt={L(T.tapArvore) + 0.16}
        select={[[0, 0], [L(T.tapTreeBtn), 4]]}
        opacity={[[0, 0, E.hold], [L(T.tapArvore) + 0.12, 0, E.out], [L(T.tapArvore) + 0.25, 1, E.hold], [L(T.tapCodigo), 1, E.in], [L(T.tapCodigo) + 0.15, 0]]}
      />
      <CodeView
        end={end}
        file="activity_main.xml"
        lang="xml"
        lines={XML_LINES}
        revealAt={L(T.tapCodigo) + 0.1}
        stagger={0.018}
        opacity={[[0, 0, E.hold], [L(T.tapCodigo) + 0.05, 0, E.out], [L(T.tapCodigo) + 0.2, 1, E.hold], [L(T.tapVisual), 1, E.in], [L(T.tapVisual) + 0.15, 0]]}
      />
      <PropertiesSheet
        end={end}
        open={sheetOpen(L(T.sheetB), L(T.toJava))}
        ids={[[0, "btn_enviar", I.button]]}
        tabs={[[0, "Basic"], [L(T.tapEvent), "Event"]]}
        eventPressAt={L(T.tapOnClick)}
      />
      <CodeView
        end={end}
        file="MainActivity.java"
        lang="java"
        lines={javaLines(L(T.typeJava))}
        revealAt={L(T.toJava) + 0.05}
        stagger={0.014}
        highlight={{ from: 13, to: 16, at: L(T.highlight) }}
        opacity={[[0, 0, E.hold], [L(T.toJava), 0, E.out], [L(T.toJava) + 0.15, 1]]}
      />
      <Tap x={265} y={141} t={L(T.tapArvore)} end={end} />
      <Tap x={treeRowCenter(4)[0]} y={treeRowCenter(4)[1]} t={L(T.tapTreeBtn)} end={end} />
      <Tap x={180} y={101} t={L(T.tapCodigo)} end={end} />
      <Tap x={67} y={101} t={L(T.tapVisual)} end={end} />
      <Tap x={btn[0]} y={btn[1]} t={L(T.selectBtn2)} end={end} />
      <Tap x={tabCenter("Event")[0]} y={tabCenter("Event")[1]} t={L(T.tapEvent)} end={end} />
      <Tap x={eventCenter(0)[0]} y={eventCenter(0)[1]} t={L(T.tapOnClick)} end={end} />
    </group>
  );
}

// ---------------------------------------------------------------- camera

function storyCamera(): CamKey[] {
  const L = rel(ST);
  const rest = cam(W(180, 390), 1.0, [PHONE.cx, PHONE.cy]);
  return [
    [L(6.0), cam(W(110, 62), 5.0, [960, 540]), E.out],
    [L(7.3), cam(W(180, 385), 1.32, [PHONE.cx, 540]), E.linear],
    [L(9.4), cam(W(180, 385), 1.38, [PHONE.cx, 540]), E.inOut],
    [L(10.0), cam(W(180, 390), 1.25, [PHONE.cx, PHONE.cy]), E.linear],
    [L(10.4), cam(W(180, 390), 1.27, [PHONE.cx, PHONE.cy]), E.glide],
    [L(12.0), cam(W(185, 322), 1.9, [1290, 560]), E.linear],
    [L(15.0), cam(W(185, 326), 1.94, [1290, 560]), E.linear],
    [L(18.4), cam(W(188, 330), 1.98, [1290, 560]), E.inOut],
    [L(19.3), cam(W(190, 495), 1.75, [1290, 560]), E.linear],
    [L(23.0), cam(W(190, 495), 1.8, [1290, 560]), E.inOut],
    [L(24.0), cam(W(180, 400), 1.5, [1290, 540]), E.inOut],
    [L(24.8), cam(W(180, 300), 2.0, [1290, 540]), E.linear],
    [L(26.4), cam(W(180, 305), 2.05, [1290, 540]), E.inOut],
    [L(27.0), cam(W(185, 300), 2.15, [1300, 540]), E.inOut],
    [L(29.8), cam(W(185, 560), 2.15, [1300, 540]), E.inOut],
    [L(30.6), cam(W(190, 470), 1.9, [1290, 540]), E.linear],
    [L(32.0), cam(W(190, 480), 1.95, [1290, 540]), E.inOut],
    [L(32.6), cam(W(185, 380), 2.3, [1320, 540]), E.linear],
    [L(35.9), cam(W(185, 395), 2.36, [1320, 540]), E.inOut],
    [L(37.2), rest, E.linear],
    [L(37.5), cam(W(180, 390), 1.02, [PHONE.cx, PHONE.cy]), E.in],
    [L(38.0), { x: -2300, y: 0, s: 1.02 }],
  ];
}

// ---------------------------------------------------------------- the shot

export function Story(): JSX.Element {
  return (
    <>
      <group name="Phone story" start={ST} end={STORY.end}>
        <PhoneRig cx={PHONE.cx} cy={PHONE.cy} scale={PHONE.s} end={STORY.end - ST}>
          <ProjectsScreen />
          <Expander />
          <EditorA />
          <EditorB />
        </PhoneRig>
      </group>
      <Camera name="Story camera" start={ST} end={STORY.end} k={storyCamera()} />
      <rect name="Dive flash" x={0} y={0} width={1920} height={1080} fill="#3b23c7" start={ST} end={ST + 0.6}>
        <Kf p="opacity" k={[[0, 0.85, E.out], [0.4, 0]]} />
      </rect>
    </>
  );
}

/** Left-column titles for scenes 2–5 (outside the camera). */
export function StoryTitles(): JSX.Element {
  return (
    <group name="Story titles">
      <Headline y={330} kicker="NOVO PROJETO" lines={["Comece um", "novo projeto"]} t={6.45} t2={11.55} />
      <Headline y={300} kicker="DESIGN" lines={["Arraste", "componentes"]} sub="Monte a tela visualmente." t={12.1} t2={18.25} accent={[1]} />
      <Headline y={300} kicker="PROPRIEDADES" lines={["Ajuste cada", "detalhe"]} sub="Texto, largura, altura e mais." t={18.55} t2={23.5} accent={[1]} />
      <Headline y={300} kicker="ESTRUTURA" lines={["Tudo", "organizado"]} sub="Cada tela em uma árvore de componentes." t={24.3} t2={26.25} accent={[1]} />
      <Headline y={300} kicker="CÓDIGO" lines={["Visual ou", "código"]} sub="O XML do layout, sempre à mão." t={26.6} t2={29.7} accent={[1]} />
      <Headline y={300} kicker="EVENTOS" lines={["Reaja a", "cada toque"]} sub="Escolha o evento do componente." t={30.2} t2={32.35} accent={[1]} />
      <Headline y={300} kicker="LÓGICA" lines={["Programe", "em Java"]} sub="Direto no celular." t={32.6} t2={37.2} accent={[1]} />
    </group>
  );
}

export const STORY_BEATS = T;
