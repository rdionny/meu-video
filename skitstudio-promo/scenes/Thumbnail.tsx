/* YouTube thumbnail (1920 × 1080): the promo's identity in one still. */

import type { JSX } from "solid-js";
import { C, F, I } from "../lib/theme";
import { PhoneRig } from "../components/ui/Phone";
import { EditorChrome, Palette, CanvasPanel } from "../components/ui/Editor";
import { PreviewLayout } from "../components/ui/AppScreen";
import { PropertiesSheet } from "../components/ui/Sheet";
import { Chip, Glow } from "../components/fx/Fx";

export function Thumbnail(): JSX.Element {
  const end = 2;
  return (
    <scene id="thumbnail" name="Thumbnail (YouTube)" x={3400} width={1920} height={1080} fill={C.ink}>
      <image src="images/bg/plate.png" x={0} y={0} width={1920} height={1080} end={end} />
      <Glow x={420} y={260} r={820} color={C.purpleDeep} end={end} opacity={1} />
      <Glow x={1500} y={760} r={760} color={C.purple} end={end} opacity={0.55} />
      <Glow x={1750} y={1000} r={600} color="#0e7490" end={end} opacity={0.5} />

      <PhoneRig cx={1395} cy={600} scale={1.42} rotation={-7} end={end}>
        <EditorChrome end={end} appName="Olá App" tabs={[[0, 0]]} subtabs={[[0, 0]]} />
        <Palette end={end} />
        <CanvasPanel end={end}>
          <PreviewLayout end={end} t={{ btnTextAt: -1, btnWidthAt: -1, btnSelect: [-1, 99] }} />
        </CanvasPanel>
        <PropertiesSheet end={end} open={[[0, 0]]} ids={[[0, "btn_enviar", I.button]]} tabs={[[0, "Basic"]]} />
      </PhoneRig>

      <Chip icon={I.button} label="Button" x={1010} y={300} tone="solid" end={end} />
      <Chip icon={I.textView} label="TextView" x={1745} y={230} end={end} />
      <Chip icon={I.touch} label="onClick" x={1760} y={870} end={end} />
      <Chip icon={I.code} label="Java" x={1000} y={900} end={end} />

      <image src="images/brand/skitstudio-icon.png" x={110} y={92} width={150} height={150} end={end} />
      <text x={282} y={112} width={600} height={110} fontFamily={F.ui} fontWeight={700} fontSize={92} letterSpacing={-1} color={C.text} end={end}>
        SkitStudio
        <textRange start={4} color={C.purple} />
      </text>
      <text x={104} y={330} width={900} height={170} fontFamily={F.display} fontWeight={800} fontSize={150} letterSpacing={-5} color={C.text} end={end}>
        Crie apps
      </text>
      <text x={104} y={492} width={900} height={170} fontFamily={F.display} fontWeight={800} fontSize={150} letterSpacing={-5} color={C.text} end={end}>
        Android
        <linearGradientPaint rotation={0}>
          <colorStop offset={0} color={C.purpleHi} />
          <colorStop offset={0.75} color={C.cyan} />
        </linearGradientPaint>
      </text>
      <text x={104} y={654} width={900} height={170} fontFamily={F.display} fontWeight={800} fontSize={150} letterSpacing={-5} color={C.text} end={end}>
        no celular
      </text>
      <rect x={110} y={872} width={460} height={78} cornerRadius={39} fill={C.purple} end={end}>
        <shadow color={C.purple} blur={30} offsetY={8} opacity={0.5} />
      </rect>
      <text x={110} y={872} width={460} height={78} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={36} color="#ffffff" end={end}>
        Design · Código · APK
      </text>
    </scene>
  );
}
