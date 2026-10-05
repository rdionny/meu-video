/* Skit AI — the assistant inside SkitStudio's editor ("Chat" tab), recreated
 * in dp from the app's screens: Chat / Diff tabs, the model picker, ▶ Compilar,
 * the "Ilimitado" quota, Skit AI messages ("Aplicado no projeto", code
 * blocks, tokens), the prompt bar and the "Salvo:" toast. */

import type { JSX } from "solid-js";
import { C, F, I } from "../../lib/theme";
import { E, Kf, Pivot, fade, type Key } from "../../lib/motion";
import { press } from "./ProjectList";
import { java } from "./Code";

export const CI = {
  attach: "",
  image: "",
  mic: "",
  send: "",
  sparkle: "",
  verified: "",
  copy: "",
  refresh: "",
  editNote: "",
  speaker: "",
  moreH: "",
  eye: "",
  radioOff: "",
  radioOn: "",
  infinity: "",
  database: "",
  hammer: "",
  arrow: "",
};

export const MODELS = [
  "gpt-6.1-sol",
  "claude-opus-4-6-thinking",
  "claude-sonnet-4-6",
  "Gemini 3.8 Flash High",
  "Skit Coder - Infinito",
  "Skit Coder - 3.7",
  "Skit Coder 3.7 - Flash",
  "Skit Coder",
  "Skit Coder - Flash - Fire",
];

/** Geometry the scene needs for taps. */
export const CHAT = {
  subTab: { chat: [95, 141] as [number, number], diff: [265, 141] as [number, number] },
  model: [150, 175] as [number, number],
  compile: [318, 174] as [number, number],
  input: [170, 727] as [number, number],
  send: [337, 727] as [number, number],
  dialog: { x: 22, y: 196, w: 316, rowY0: 262, rowH: 38 },
};

export function modelRow(name: string): [number, number] {
  const i = MODELS.indexOf(name);
  return [CHAT.dialog.x + 150, CHAT.dialog.y + 66 + i * CHAT.dialog.rowH + 16];
}

function Avatar(props: { x: number; y: number; end: number }): JSX.Element {
  return (
    <group name="Skit AI avatar">
      <rect x={props.x} y={props.y} width={24} height={24} cornerRadius={12} fill="#1b1846" end={props.end}>
        <stroke color={C.purple} width={1.4} />
      </rect>
      <text x={props.x} y={props.y} width={24} height={24} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={15} color={C.purpleHi} end={props.end}>{CI.sparkle}</text>
    </group>
  );
}

function Footer(props: { x: number; y: number; w: number; tokens: string; end: number }): JSX.Element {
  return (
    <group name="Message footer">
      <text x={props.x} y={props.y} width={140} height={18} fontFamily={F.icon} fontSize={15} letterSpacing={9} color="#7d8197" end={props.end}>
        {CI.copy + CI.refresh + CI.editNote + CI.speaker + CI.moreH}
      </text>
      <text x={props.x + props.w - 120} y={props.y + 2} width={120} height={14} textAlign="right" fontFamily={F.ui} fontSize={9.5} color="#6f7489" end={props.end}>{props.tokens}</text>
    </group>
  );
}

/** "Chat | Diff" row, the model row with ▶ Compilar, and the quota row. */
export function ChatHeader(props: {
  end: number;
  subTabs: [number, 0 | 1][];
  models: [number, string][];
  compilePressAt?: number;
}): JSX.Element {
  const pill: Key[] = [[0, props.subTabs[0]![1] === 0 ? 10 : 180, E.hold]];
  for (const [t, i] of props.subTabs.slice(1)) pill.push([t, pill[pill.length - 1]![1], E.out], [t + 0.3, i === 0 ? 10 : 180]);
  const label = (index: 0 | 1): Key[] => {
    const k: Key[] = [[0, props.subTabs[0]![1] === index ? "#ffffff" : "#9aa0b4", E.hold]];
    for (const [t, i] of props.subTabs.slice(1)) k.push([t + 0.05, k[k.length - 1]![1], E.out], [t + 0.25, i === index ? "#ffffff" : "#9aa0b4"]);
    return k;
  };
  return (
    <group name="Chat header">
      <rect x={8} y={126} width={344} height={30} cornerRadius={10} fill="#0f1019" end={props.end}>
        <stroke color="#22253a" width={1} />
      </rect>
      <rect name="Chat/Diff pill" y={128} width={170} height={26} cornerRadius={8} fill={C.purple} end={props.end}>
        <Kf p="x" k={pill} />
      </rect>
      <text x={10} y={128} width={170} height={26} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={600} fontSize={12.5} color="#9aa0b4" end={props.end}>
        Chat
        <Kf p="color" k={label(0)} />
      </text>
      <text x={180} y={128} width={170} height={26} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={600} fontSize={12.5} color="#9aa0b4" end={props.end}>
        Diff
        <Kf p="color" k={label(1)} />
      </text>

      <text x={8} y={162} width={50} height={24} textBaseline="middle" fontFamily={F.ui} fontSize={11.5} color="#9aa0b4" end={props.end}>Modelo:</text>
      {props.models.map(([t, name], i) => {
        const next = props.models[i + 1]?.[0];
        return (
          <text x={52} y={162} width={210} height={24} textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={12.5} color={C.purpleHi} end={props.end}>
            {name}
            <Kf p="opacity" k={i === 0 ? (next === undefined ? [[0, 1]] : [[0, 1, E.hold], [next, 1, E.in], [next + 0.1, 0]]) : fade(t, 0.15)} />
          </text>
        );
      })}
      <text x={258} y={162} width={22} height={24} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={20} color="#c3c6da" end={props.end}>{I.expand}</text>
      <Pivot name="Compilar" x={282} y={161} w={72} h={26} end={props.end}>
        <rect x={0} y={0} width={72} height={26} cornerRadius={7} fill="#17134a" end={props.end}>
          <stroke color={C.purple} width={1.4} />
        </rect>
        <text x={0} y={0} width={72} height={26} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={11} color="#e6e3ff" end={props.end}>▶ Compilar</text>
        {props.compilePressAt !== undefined && <Kf p="scale" k={press(props.compilePressAt, 0.88)} />}
      </Pivot>

      <rect x={8} y={192} width={344} height={22} cornerRadius={11} fill="#0f1019" end={props.end}>
        <stroke color="#22253a" width={1} />
      </rect>
      <text x={14} y={192} width={20} height={22} textBaseline="middle" fontFamily={F.icon} fontSize={15} color={C.purpleHi} end={props.end}>{CI.database}</text>
      <text x={34} y={192} width={60} height={22} textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={11.5} color="#e6e7f2" end={props.end}>Ilimitado</text>
      <rect x={96} y={202} width={226} height={2.5} cornerRadius={1.25} fill="#3a3d52" end={props.end} />
      <text x={326} y={192} width={22} height={22} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={16} color="#aab0c4" end={props.end}>{CI.infinity}</text>
    </group>
  );
}

type Line = { text: string; size?: number; color?: string; bold?: boolean; mono?: boolean; h: number };

/** Earlier turns of the conversation, stacked above `bottom` (they scroll in from above). */
function History(props: { bottom: number; end: number }): JSX.Element {
  const end = props.end;
  const gap = 8;
  const bB = props.bottom - gap - 94; // "Compilando o projeto..."
  const bA = bB - gap - 158; // "Aplicado no projeto" + code
  const bU = bA - gap - 40; // an earlier prompt
  const bZ = bU - gap - 80; // tail of an older reply
  const bubble = (y: number, h: number) => (
    <rect x={8} y={y} width={344} height={h} cornerRadius={14} fill="#141526" end={end}>
      <stroke color="#24273b" width={1} />
    </rect>
  );
  const head = (y: number) => (
    <>
      <Avatar x={18} y={y + 10} end={end} />
      <text x={48} y={y + 10} width={60} height={24} textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={12.5} color={C.purpleHi} end={end}>Skit AI</text>
      <text x={98} y={y + 10} width={16} height={24} textBaseline="middle" fontFamily={F.icon} fontSize={13} color={C.purpleHi} end={end}>{CI.verified}</text>
    </>
  );
  return (
    <group name="History">
      {bubble(bZ, 80)}
      <Footer x={18} y={bZ + 56} w={324} tokens="1.120 tokens" end={end} />

      <rect x={180} y={bU} width={128} height={40} cornerRadius={16} end={end}>
        <linearGradientPaint rotation={0}>
          <colorStop offset={0} color={C.purpleBtn} />
          <colorStop offset={1} color={C.purple2} />
        </linearGradientPaint>
      </rect>
      <text x={180} y={bU} width={128} height={40} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontSize={12} color="#ffffff" end={end}>Compile o projeto</text>
      <rect x={316} y={bU + 3} width={34} height={34} cornerRadius={17} fill={C.purple} end={end} />
      <text x={316} y={bU + 3} width={34} height={34} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={20} color="#ffffff" end={end}>{I.person}</text>

      {bubble(bA, 158)}
      {head(bA)}
      <text x={18} y={bA + 42} width={320} height={20} textBaseline="middle" fontFamily={F.ui} fontSize={12.5} color={C.text} end={end}>Aplicado no projeto:</text>
      <text x={18} y={bA + 64} width={318} height={30} fontFamily={F.ui} fontSize={10.5} leading={1.15} color="#c9cbe0" end={end}>• Trecho substituído em: app/src/main/java/com/example/olaapp/MainActivity.java</text>
      <rect x={18} y={bA + 98} width={324} height={26} cornerRadius={10} fill={C.code.bg} end={end}>
        <stroke color="#22253a" width={1} />
      </rect>
      <text x={28} y={bA + 98} width={120} height={26} textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={11} color={C.purpleHi} end={end}>{"</> Código ▾"}</text>
      <Footer x={18} y={bA + 132} w={324} tokens="842 tokens" end={end} />

      {bubble(bB, 94)}
      {head(bB)}
      <text x={18} y={bB + 42} width={320} height={20} textBaseline="middle" fontFamily={F.ui} fontSize={12.5} color={C.text} end={end}>🔨 Compilando o projeto...</text>
      <Footer x={18} y={bB + 68} w={324} tokens="0 tokens" end={end} />
    </group>
  );
}

/**
 * The conversation. The last reply sits at y=224 with earlier turns above
 * it; `scroll` keys move the list (start it low so history fills the view). Times are local seconds.
 */
export function ChatMessages(props: {
  end: number;
  prompt: string;
  sendAt: number;
  thinkAt: number;
  appliedAt: number;
  codeAt: number;
  doneAt: number;
  scroll: Key[];
}): JSX.Element {
  const end = props.end;
  // previous exchange, already in the chat
  const prevY = 224;
  const userY = prevY + 104;
  const aiY = userY + 78;
  const applied: Line[] = [
    { text: "Aplicado no projeto:", h: 20 },
    { text: "• Arquivo salvo: app/src/main/res/anim/titulo_pop.xml", size: 10.5, color: "#c9cbe0", h: 30 },
    { text: "• Trecho substituído em: app/src/main/res/layout/activity_main.xml", size: 10.5, color: "#c9cbe0", h: 30 },
    { text: "• Trecho substituído em: app/src/main/java/com/example/olaapp/MainActivity.java", size: 10.5, color: "#c9cbe0", h: 30 },
  ];
  const code = [
    "Animation pop = AnimationUtils",
    "    .loadAnimation(this, R.anim.titulo_pop);",
    "txtTitulo.startAnimation(pop);",
    "btnLimpar.setOnClickListener(v -> {",
    "    edtNome.setText(\"\");",
    "    txtTitulo.setText(\"Olá!\");",
    "});",
  ];
  let y = aiY + 74;
  const appliedRows = applied.map((line, i) => {
    const row = { ...line, y, t: props.appliedAt + i * 0.28 };
    y += line.h;
    return row;
  });
  const codeY = y + 6;
  const codeH = 30 + code.length * 14 + 8;
  const footerY = codeY + codeH + 10;
  const aiH = footerY + 26 - aiY;
  return (
    <group name="Chat messages">
      <History bottom={prevY} end={end} />
      <group name="Previous reply">
        <rect x={8} y={prevY} width={344} height={96} cornerRadius={14} fill="#141526" end={end}>
          <stroke color="#24273b" width={1} />
        </rect>
        <Avatar x={18} y={prevY + 10} end={end} />
        <text x={48} y={prevY + 10} width={60} height={24} textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={12.5} color={C.purpleHi} end={end}>Skit AI</text>
        <text x={98} y={prevY + 10} width={16} height={24} textBaseline="middle" fontFamily={F.icon} fontSize={13} color={C.purpleHi} end={end}>{CI.verified}</text>
        <text x={18} y={prevY + 42} width={250} height={20} textBaseline="middle" fontFamily={F.ui} fontSize={12.5} color={C.text} end={end}>✅ Build concluído com sucesso</text>
        <text x={18} y={prevY + 66} width={60} height={18} textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={11} color={C.purpleHi} end={end}>v0.0.07</text>
        <rect x={252} y={prevY + 60} width={88} height={26} cornerRadius={13} fill={C.purple} end={end} />
        <text x={252} y={prevY + 60} width={88} height={26} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={600} fontSize={10.5} color="#ffffff" end={end}>Instalar APK</text>
      </group>

      <group name="User prompt">
        <rect x={96} y={userY} width={212} height={62} cornerRadius={16} end={end}>
          <linearGradientPaint rotation={0}>
            <colorStop offset={0} color={C.purpleBtn} />
            <colorStop offset={1} color={C.purple2} />
          </linearGradientPaint>
        </rect>
        <text x={110} y={userY + 9} width={186} height={46} fontFamily={F.ui} fontSize={12} leading={1.18} color="#ffffff" end={end}>{props.prompt}</text>
        <rect x={316} y={userY + 14} width={34} height={34} cornerRadius={17} fill={C.purple} end={end} />
        <text x={316} y={userY + 14} width={34} height={34} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={20} color="#ffffff" end={end}>{I.person}</text>
        <Kf p="opacity" k={fade(props.sendAt, 0.15)} />
        <Kf p="offsetY" k={[[0, 24, E.hold], [props.sendAt, 24, E.out], [props.sendAt + 0.4, 0]]} />
      </group>

      <group name="Skit AI reply">
        <rect x={8} y={aiY} width={344} cornerRadius={14} fill="#141526" end={end}>
          <stroke color="#24273b" width={1} />
          <Kf p="height" k={[[0, 70, E.hold], [props.appliedAt - 0.05, 70, E.out], [props.codeAt, 70 + (codeY - (aiY + 74)) + 10, E.out], [props.codeAt + 0.45, aiH - 26, E.out], [props.doneAt, aiH - 26, E.out], [props.doneAt + 0.25, aiH]]} />
        </rect>
        <Avatar x={18} y={aiY + 10} end={end} />
        <text x={48} y={aiY + 10} width={60} height={24} textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={12.5} color={C.purpleHi} end={end}>Skit AI</text>
        <text x={98} y={aiY + 10} width={16} height={24} textBaseline="middle" fontFamily={F.icon} fontSize={13} color={C.purpleHi} end={end}>{CI.verified}</text>
        <text x={18} y={aiY + 42} width={320} height={20} textBaseline="middle" fontFamily={F.ui} fontSize={12.5} color={C.text} end={end}>
          Inspecionando o projeto...
          <Kf p="opacity" k={[[0, 1, E.hold], [props.appliedAt - 0.1, 1, E.in], [props.appliedAt, 0]]} />
        </text>
        <text x={18} y={aiY + 42} width={320} height={20} textBaseline="middle" fontFamily={F.ui} fontSize={12.5} color={C.text} end={end}>
          Pronto! Animação e botão Limpar adicionados.
          <Kf p="opacity" k={fade(props.appliedAt, 0.15)} />
        </text>
        {appliedRows.map((row) => (
          <text x={18} y={row.y} width={318} height={row.h} fontFamily={F.ui} fontSize={row.size ?? 12.5} leading={1.15} color={row.color ?? C.text} end={end}>
            {row.text}
            <Kf p="opacity" k={fade(row.t, 0.18)} />
            <Kf p="offsetY" k={[[0, 6, E.hold], [row.t, 6, E.out], [row.t + 0.3, 0]]} />
          </text>
        ))}
        <group name="Code block">
          <rect x={18} y={codeY} width={324} height={codeH} cornerRadius={10} fill={C.code.bg} end={end}>
            <stroke color="#22253a" width={1} />
          </rect>
          <text x={28} y={codeY + 8} width={120} height={16} fontFamily={F.ui} fontWeight={700} fontSize={11} color={C.purpleHi} end={end}>{"</> Código ▾"}</text>
          {code.map((line, i) => {
            const indent = line.length - line.trimStart().length;
            const body = line.trimStart();
            return (
              <text x={28 + indent * 5.16} y={codeY + 30 + i * 14} fontFamily={F.mono} fontSize={8.6} color={C.code.plain} end={end}>
                {body}
                {java(body).map(([s, e, c]) => (
                  <textRange start={s} end={e} color={c} />
                ))}
                <Kf p="opacity" k={fade(props.codeAt + 0.15 + i * 0.08, 0.15)} />
              </text>
            );
          })}
          <Kf p="opacity" k={fade(props.codeAt, 0.2)} />
        </group>
        <group name="Footer">
          <Footer x={18} y={footerY} w={324} tokens="1.284 tokens" end={end} />
          <Kf p="opacity" k={fade(props.doneAt, 0.25)} />
        </group>
        <Kf p="opacity" k={fade(props.thinkAt, 0.2)} />
        <Kf p="offsetY" k={[[0, 20, E.hold], [props.thinkAt, 20, E.out], [props.thinkAt + 0.4, 0]]} />
      </group>
      <Kf p="offsetY" k={props.scroll} />
    </group>
  );
}

/** The prompt bar: typed text, send ↔ stop while Skit AI works. */
export function ChatInput(props: { end: number; prompt: string; typeAt: number; typeDur: number; sendAt: number; doneAt: number; focusAt: number }): JSX.Element {
  const end = props.end;
  const n = props.prompt.length;
  const cw = 5.95;
  const visible = 33; // characters that fit; the line scrolls while typing
  const shown = Math.min(n, visible);
  return (
    <group name="Prompt bar">
      <rect x={0} y={700} width={360} height={80} fill={C.app} end={end} />
      <rect x={8} y={710} width={344} height={34} cornerRadius={17} fill="#0f1019" end={end}>
        <stroke color="#23253a" width={1} />
      </rect>
      <rect x={8} y={710} width={344} height={34} cornerRadius={17} end={end}>
        <stroke color={C.purple} width={1.5} />
        <Kf p="opacity" k={fade(props.focusAt, 0.15, props.sendAt, 0.2)} />
      </rect>
      <text x={16} y={710} width={22} height={34} textBaseline="middle" fontFamily={F.icon} fontSize={18} color="#aab0c4" end={end}>{CI.attach}</text>
      <text x={40} y={710} width={22} height={34} textBaseline="middle" fontFamily={F.icon} fontSize={18} color="#aab0c4" end={end}>{CI.image}</text>
      <text x={66} y={710} width={220} height={34} textBaseline="middle" fontFamily={F.ui} fontSize={11.5} color="#8a8fa5" end={end}>
        Peça algo à IA sobre o projeto...
        <Kf p="opacity" k={[[0, 1, E.hold], [props.typeAt, 0, E.hold], [props.sendAt + 0.05, 1]]} />
      </text>
      <group name="Typed prompt">
        <text x={66} y={710} height={34} width={n * cw + 20} textBaseline="middle" fontFamily={F.ui} fontSize={11} color={C.text} end={end}>
          {props.prompt}
          <Kf p="offsetX" k={[[0, 0, E.hold], [props.typeAt + (props.typeDur * visible) / n, 0, `steps(${n - shown})`], [props.typeAt + props.typeDur, -(n - shown) * cw]]} />
        </text>
        <rect clipPath x={64} y={712} height={30}>
          <Kf p="width" k={[[0, 0, E.hold], [props.typeAt, 0, `steps(${shown})`], [props.typeAt + (props.typeDur * visible) / n, shown * cw + 4]]} />
        </rect>
        <rect clipPath x={64} y={712} width={222} height={30} />
        <Kf p="opacity" k={[[0, 1, E.hold], [props.sendAt, 0]]} />
      </group>
      <text x={290} y={710} width={22} height={34} textBaseline="middle" fontFamily={F.icon} fontSize={18} color="#c3c6da" end={end}>{CI.mic}</text>
      <text x={326} y={710} width={22} height={34} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={19} color={C.purpleHi} end={end}>
        {CI.send}
        <Kf p="opacity" k={[[0, 1, E.hold], [props.sendAt + 0.05, 0, E.hold], [props.doneAt, 1]]} />
      </text>
      <rect name="Stop" x={331} y={721} width={12} height={12} cornerRadius={2} fill={C.purple} end={end}>
        <Kf p="opacity" k={[[0, 0, E.hold], [props.sendAt + 0.05, 1, E.hold], [props.doneAt, 0]]} />
      </rect>
      <group name="Pensando">
        <rect x={14} y={688} width={14} height={14} cornerRadius={7} end={end}>
          <stroke color={C.purpleHi} width={2} opacity={0.9} />
        </rect>
        <text x={36} y={686} width={120} height={18} textBaseline="middle" fontFamily={F.ui} fontSize={11.5} color="#c8cbe0" end={end}>Pensando...</text>
        <Kf p="opacity" k={fade(props.sendAt + 0.15, 0.15, props.doneAt - 0.1, 0.2)} />
      </group>
    </group>
  );
}

/** "Modelo" picker: radio list of the models the app offers. */
export function ModelDialog(props: { end: number; openAt: number; pickAt: number; from: string; to: string }): JSX.Element {
  const d = CHAT.dialog;
  const h = 66 + MODELS.length * d.rowH + 40;
  const closeAt = props.pickAt + 0.35;
  return (
    <group name="Model dialog">
      <rect x={0} y={0} width={360} height={780} fill="#000000" end={props.end}>
        <Kf p="opacity" k={[[0, 0, E.hold], [props.openAt, 0, E.out], [props.openAt + 0.2, 0.55], [closeAt, 0.55, E.in], [closeAt + 0.2, 0]]} />
      </rect>
      <Pivot x={d.x} y={d.y} w={d.w} h={h} end={props.end}>
        <rect x={0} y={0} width={d.w} height={h} cornerRadius={20} fill="#1d1f3a" end={props.end}>
          <shadow color="#000000" blur={40} offsetY={14} opacity={0.6} />
        </rect>
        <text x={22} y={18} width={200} height={30} textBaseline="middle" fontFamily={F.ui} fontWeight={500} fontSize={19} color={C.text} end={props.end}>Modelo</text>
        {MODELS.map((name, i) => {
          const y = 66 + i * d.rowH;
          const wasOn = name === props.from;
          const isOn = name === props.to;
          return (
            <group name={name}>
              {isOn && (
                <rect x={8} y={y - 2} width={d.w - 16} height={d.rowH - 4} cornerRadius={10} fill={C.purple} end={props.end}>
                  <Kf p="opacity" k={[[0, 0, E.hold], [props.pickAt - 0.05, 0, E.out], [props.pickAt + 0.05, 0.22], [closeAt, 0.22]]} />
                </rect>
              )}
              <text x={20} y={y} width={24} height={d.rowH - 8} textBaseline="middle" fontFamily={F.icon} fontSize={20} color="#c3c6da" end={props.end}>{CI.radioOff}</text>
              {(wasOn || isOn) && (
                <text x={20} y={y} width={24} height={d.rowH - 8} textBaseline="middle" fontFamily={F.icon} fontSize={20} color={C.purpleHi} end={props.end}>
                  {CI.radioOn}
                  <Kf p="opacity" k={wasOn ? [[0, 1, E.hold], [props.pickAt, 0]] : [[0, 0, E.hold], [props.pickAt, 1]]} />
                </text>
              )}
              <text x={52} y={y} width={220} height={d.rowH - 8} textBaseline="middle" fontFamily={F.ui} fontSize={13} color="#dfe1ec" end={props.end}>{name}</text>
              <text x={52 + name.length * 6.9 + 8} y={y} width={20} height={d.rowH - 8} textBaseline="middle" fontFamily={F.icon} fontSize={14} color="#aab0c4" end={props.end}>{CI.eye}</text>
            </group>
          );
        })}
        <text x={d.w - 80} y={h - 34} width={60} height={22} textAlign="right" textBaseline="middle" fontFamily={F.ui} fontWeight={500} fontSize={12} color={C.purpleHi} end={props.end}>Fechar</text>
        <Kf p="scale" k={[[0, 0.9, E.hold], [props.openAt, 0.9, E.back], [props.openAt + 0.35, 1], [closeAt, 1, E.in], [closeAt + 0.2, 0.94]]} />
        <Kf p="opacity" k={fade(props.openAt, 0.15, closeAt, 0.2)} />
      </Pivot>
    </group>
  );
}

/** "Salvo: <file>" toast, as the app shows after the assistant writes a file. */
export function SavedToast(props: { end: number; t: number; file: string }): JSX.Element {
  return (
    <Pivot name="Saved toast" x={70} y={640} w={220} h={34} end={props.end}>
      <rect x={0} y={0} width={220} height={34} cornerRadius={17} fill="#f4f4fa" end={props.end}>
        <shadow color="#000000" blur={20} offsetY={6} opacity={0.4} />
      </rect>
      <image src="images/brand/skitstudio-icon.png" x={8} y={5} width={24} height={24} end={props.end} />
      <text x={40} y={0} width={170} height={34} textBaseline="middle" fontFamily={F.ui} fontSize={11} color="#4a4866" end={props.end}>{`Salvo: ${props.file}`}</text>
      <Kf p="scale" k={[[0, 0.85, E.hold], [props.t, 0.85, E.back], [props.t + 0.3, 1]]} />
      <Kf p="opacity" k={fade(props.t, 0.15, props.t + 1.2, 0.25)} />
    </Pivot>
  );
}
