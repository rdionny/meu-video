/* Scene 6b — Skit AI + build (42–58 s). The editor's Chat tab: pick a model,
 * ask in Portuguese, Skit AI edits the project (saves a new animation file,
 * replaces snippets in activity_main.xml and MainActivity.java); the Código
 * tab shows the lines it added; ▶ → the real build steps → "Build
 * concluído ✓" → Instalar APK.
 * Times are absolute seconds (see A), converted per group. */

import type { JSX } from "solid-js";
import { E, Kf, Camera, cam as camAt, fade, type CamKey, type Key } from "../lib/motion";
import { center, stagePlan, type Format } from "../lib/format";
import { PhoneRig, SystemNav } from "../components/ui/Phone";
import { EditorChrome, Palette, CanvasPanel } from "../components/ui/Editor";
import { PreviewLayout } from "../components/ui/AppScreen";
import { ChatHeader, ChatMessages, ChatInput, ModelDialog, SavedToast, CHAT, modelRow } from "../components/ui/Chat";
import { CodeView, AI_JAVA } from "../components/ui/Code";
import { CompileScreen } from "../components/ui/Compile";
import { Tap, Headline } from "../components/fx/Fx";

export const PROMPT = "Anime o título ao enviar e crie um botão Limpar";
const MODEL_FROM = "Gemini 3.8 Flash High";
const MODEL_TO = "Skit Coder - 3.7";

/** Beats, absolute seconds. Cues in audio/Soundtrack.tsx follow these. */
export const A = {
  start: 41.9,
  tapChat: 42.75,
  tapModel: 43.5,
  pickModel: 44.25,
  tapInput: 45.0,
  type: 45.2,
  typeDur: 1.4,
  send: 47.0,
  think: 47.3,
  applied: 48.0,
  code: 49.0,
  done: 49.8,
  toast: 49.95,
  tapCode: 50.75,
  tapPlay: 53.5,
  compile: 53.6,
  steps: [54.05, 54.35, 54.7, 55.1, 55.5, 55.85, 56.2, 57.0],
  buildDone: 57.0,
  install: 57.5,
  end: 58,
};

function phoneOf(f: Format) {
  const p = stagePlan(f).phone;
  const phone = { cx: p.cx, cy: p.cy, s: 1.2 };
  const W = (dx: number, dy: number): [number, number] => [phone.cx + (dx - 180) * phone.s, phone.cy + (dy - 390) * phone.s];
  return { phone, W };
}

function EditorChat(): JSX.Element {
  const L = (abs: number) => abs - A.start;
  const end = A.compile + 0.5 - A.start;
  const tapChat = L(A.tapChat);
  const tapCode = L(A.tapCode);
  const visualOut: Key[] = [[0, 1, E.hold], [tapChat + 0.02, 1, E.in], [tapChat + 0.14, 0]];
  return (
    <group name="Editor · Chat" end={end}>
      <EditorChrome
        end={end}
        appName="Olá App"
        tabs={[[0, 0], [tapChat, 2], [tapCode, 1]]}
        subtabs={[[0, 0]]}
        subtabsOpacity={visualOut}
        playPressAt={L(A.tapPlay)}
      />
      <Palette end={end} opacity={visualOut} />
      <CanvasPanel end={end} opacity={visualOut}>
        <PreviewLayout end={end} t={{ btnTextAt: -1, btnWidthAt: -1 }} />
      </CanvasPanel>

      <group name="Chat">
        <group name="Chat list">
          <ChatMessages
            end={end}
            prompt={PROMPT}
            sendAt={L(A.send)}
            thinkAt={L(A.think)}
            appliedAt={L(A.applied)}
            codeAt={L(A.code)}
            doneAt={L(A.done)}
            scroll={[
              [0, 356, E.hold],
              [L(A.send), 356, E.out],
              [L(A.send) + 0.45, 150, E.hold],
              [L(A.applied), 150, E.out],
              [L(A.applied) + 0.7, 40, E.hold],
              [L(A.code), 40, E.out],
              [L(A.code) + 0.5, -76, E.hold],
              [L(A.done), -76, E.out],
              [L(A.done) + 0.45, -110],
            ]}
          />
          <rect clipPath x={0} y={218} width={360} height={482} end={end} />
        </group>
        <ChatHeader
          end={end}
          subTabs={[[0, 0]]}
          models={[[0, MODEL_FROM], [L(A.pickModel) + 0.1, MODEL_TO]]}
        />
        <ChatInput end={end} prompt={PROMPT} typeAt={L(A.type)} typeDur={A.typeDur} sendAt={L(A.send)} doneAt={L(A.done)} focusAt={L(A.tapInput)} />
        <SystemNav end={end} />
        <ModelDialog end={end} openAt={L(A.tapModel) + 0.05} pickAt={L(A.pickModel)} from={MODEL_FROM} to={MODEL_TO} />
        <SavedToast end={end} t={L(A.toast)} file="activity_main.xml" />
        <Kf p="opacity" k={fade(tapChat + 0.06, 0.18, tapCode + 0.02, 0.12)} />
      </group>

      <CodeView
        end={end}
        file="MainActivity.java"
        lang="java"
        lines={AI_JAVA.lines}
        revealAt={tapCode + 0.08}
        stagger={0.012}
        added={{ lines: AI_JAVA.added, at: tapCode + 0.55, stagger: 0.07 }}
        opacity={[[0, 0, E.hold], [tapCode + 0.02, 0, E.out], [tapCode + 0.16, 1]]}
      />

      <Tap x={293} y={101} t={tapChat} end={end} />
      <Tap x={CHAT.model[0]} y={CHAT.model[1]} t={L(A.tapModel)} end={end} />
      <Tap x={modelRow(MODEL_TO)[0]} y={modelRow(MODEL_TO)[1]} t={L(A.pickModel)} end={end} />
      <Tap x={CHAT.input[0]} y={CHAT.input[1]} t={L(A.tapInput)} end={end} />
      <Tap x={CHAT.send[0]} y={CHAT.send[1]} t={L(A.send)} end={end} />
      <Tap x={180} y={101} t={tapCode} end={end} />
      <Tap x={164 + 2 * 38 + 17} y={51} t={L(A.tapPlay)} end={end} />
    </group>
  );
}

function Build(): JSX.Element {
  const base = A.compile;
  const L = (abs: number) => abs - base;
  const end = A.end - base;
  const steps = A.steps.map((t, i) => [L(t), i] as [number, number]);
  return (
    <group name="Compile" start={base - A.start} end={A.end - A.start}>
      <CompileScreen end={end} app="Olá App" steps={steps} doneAt={L(A.buildDone)} installPressAt={L(A.install)} />
      <Tap x={95} y={718} t={L(A.install)} end={end} />
      <Kf p="offsetY" k={[[0, 780, E.out], [0.4, 0]]} />
    </group>
  );
}

function iaCamera(f: Format): CamKey[] {
  const L = (abs: number) => abs - A.start;
  const { phone, W } = phoneOf(f);
  const c = center(f);
  const focus = stagePlan(f).focus;
  const rest = camAt(W(180, 390), 1.0, [phone.cx, phone.cy], c);
  const at = (dx: number, dy: number, z: number) => camAt(W(dx, dy), z, focus, c);
  // the build screen: whole phone; the vertical frame can afford a closer shot
  const build = (z: number) => (f.v ? camAt(W(180, 400), z + 0.32, [540, 1300], c) : camAt(W(180, 390 - (z - 1) * 40), z, [phone.cx, phone.cy], c));
  return [
    [0, rest, E.inOut],
    [L(42.35), rest, E.inOut],
    [L(43.15), at(180, 330, 1.5), E.linear],
    [L(44.5), at(180, 350, 1.55), E.inOut],
    [L(45.15), at(185, 600, 1.9), E.linear],
    [L(46.75), at(185, 605, 1.96), E.inOut],
    [L(47.5), at(180, 450, 1.8), E.linear],
    [L(48.9), at(180, 470, 1.86), E.inOut],
    [L(49.6), at(180, 520, 1.95), E.linear],
    [L(50.1), at(180, 525, 1.98), E.inOut],
    [L(50.6), at(180, 320, 1.5), E.linear],
    [L(50.95), at(180, 330, 1.52), E.inOut],
    [L(51.6), at(180, 470, 1.95), E.linear],
    [L(52.95), at(180, 480, 2.0), E.inOut],
    [L(53.35), at(230, 220, 1.5), E.inOut],
    [L(54.05), build(1.0), E.linear],
    [L(57.45), build(1.12), E.expoIn],
    [L(58.0), camAt(W(180, 330), 2.8, [phone.cx, phone.cy], c)],
  ];
}

export function S6IA(props: { f: Format }): JSX.Element {
  const f = props.f;
  const { phone } = phoneOf(f);
  const end = A.end - A.start;
  const enter: Key[] = [[0, f.v ? f.h * 0.7 : f.w * 0.6, E.out], [0.6, 0]];
  return (
    <group name="S6 Skit AI + build" start={A.start} end={A.end}>
      <group name="AI phone">
        <PhoneRig cx={phone.cx} cy={phone.cy} scale={phone.s} end={end}>
          <EditorChat />
          <Build />
        </PhoneRig>
        <Kf p={f.v ? "offsetY" : "offsetX"} k={enter} />
      </group>
      <Camera name="AI camera" start={0} end={end} k={iaCamera(f)} w={f.w} h={f.h} />
      <rect name="Install flash" x={0} y={0} width={f.w} height={f.h} fill="#ffffff" end={end}>
        <Kf p="opacity" k={[[0, 0, E.hold], [57.7 - A.start, 0, E.in], [end, 0.9]]} />
      </rect>
    </group>
  );
}

export function S6IATitles(props: { f: Format }): JSX.Element {
  const f = props.f;
  return (
    <group name="Skit AI titles">
      <Headline f={f} y={300} kicker="SKIT AI" lines={["IA integrada", "ao editor"]} sub="Escolha o modelo que vai trabalhar com você." t={42.4} t2={44.85} accent={[1]} />
      <Headline f={f} y={300} kicker="PROMPT" lines={["Peça em", "português"]} sub="Descreva a mudança que você quer no app." t={45.15} t2={47.6} accent={[1]} />
      <Headline f={f} y={300} kicker="NO SEU PROJETO" lines={["A IA aplica", "no código"]} sub="Lê o layout, edita o Java e salva os arquivos." t={47.95} t2={50.5} accent={[1]} />
      <Headline f={f} y={300} kicker="CÓDIGO" lines={["Código de", "verdade"]} sub="O que a IA escreveu fica no seu projeto." t={50.85} t2={53.35} accent={[1]} />
      <Headline f={f} y={360} kicker="BUILD" lines={["Gere o APK"]} sub="Compile e instale no próprio celular." t={54.1} t2={57.35} />
    </group>
  );
}
