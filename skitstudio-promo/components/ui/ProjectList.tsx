/* SkitStudio home: "Projetos". Recreated from the app's screen in dp. */

import type { JSX } from "solid-js";
import { C, F, I } from "../../lib/theme";
import { E, Kf, Pivot, fade, type Key } from "../../lib/motion";
import { StatusBar, SystemNav } from "./Phone";

export const CARD = { x: 14, y: 108, w: 332, h: 80, gap: 12 };

type Project = { name: string; pkg: string; bar: string };

const PROJECTS: Project[] = [
  { name: "Browser Ia", pkg: "com.example.browseria", bar: C.greenBar },
  { name: "Barbearia", pkg: "com.example.barbearia", bar: C.greenBar },
  { name: "Emulador PS-x Skit", pkg: "com.example.emuladorpsxskit", bar: C.blueBar },
  { name: "Meu Portfólio", pkg: "com.example.meuportfolio", bar: C.greenBar },
  { name: "Cardápio Digital", pkg: "com.example.cardapiodigital", bar: C.greenBar },
];

/** One project card, laid out at (0,0) — 332 × 80. */
export function ProjectCard(props: {
  p: Project;
  end?: number;
  /** clip-reveal the name (typing): [start, duration] */
  typeName?: [number, number];
  /** fade the details in at */
  detailsAt?: number;
  /** press the edit button at */
  editPressAt?: number;
  highlightAt?: number;
}): JSX.Element {
  const nameChars = props.p.name.length;
  const charW = 7.9;
  return (
    <group name={`Card ${props.p.name}`}>
      <rect name="Card bg" x={0} y={0} width={CARD.w} height={CARD.h} cornerRadius={16} fill={C.card} end={props.end}>
        <stroke color={C.border} width={1} />
      </rect>
      {props.highlightAt !== undefined && (
        <rect name="Card highlight" x={0} y={0} width={CARD.w} height={CARD.h} cornerRadius={16} end={props.end}>
          <stroke color={C.purple} width={1.8} />
          <Kf p="opacity" k={[[0, 0, E.hold], [props.highlightAt, 0, E.out], [props.highlightAt + 0.25, 1], [props.highlightAt + 1.4, 1, E.inOut], [props.highlightAt + 2.0, 0.35]]} />
        </rect>
      )}
      <rect name="Accent" x={6} y={18} width={3} height={44} cornerRadius={1.5} fill={props.p.bar} end={props.end} />
      <image name="Icon" src="images/brand/skitstudio-icon.png" x={16} y={12} width={56} height={56} end={props.end} />
      <text name="Name" x={82} y={15} fontFamily={F.ui} fontWeight={700} fontSize={14} color={C.text} end={props.end}>
        {props.p.name}
        {props.typeName && (
          <rect clipPath x={-2} y={-4} height={26} end={props.end}>
            <Kf p="width" k={[[0, 0, E.hold], [props.typeName[0], 0, `steps(${nameChars})`], [props.typeName[0] + props.typeName[1], nameChars * charW + 6]]} />
          </rect>
        )}
      </text>
      {props.typeName && (
        <rect name="Caret" y={16} width={1.4} height={16} fill={C.purpleHi} end={props.end}>
          <Kf p="x" k={[[0, 82, E.hold], [props.typeName[0], 82, `steps(${nameChars})`], [props.typeName[0] + props.typeName[1], 82 + nameChars * charW]]} />
          <Kf p="opacity" k={[[0, 0, E.hold], [props.typeName[0] - 0.05, 1, E.hold], [props.typeName[0] + props.typeName[1] + 0.25, 0, E.hold], [props.typeName[0] + props.typeName[1] + 0.45, 1, E.hold], [props.typeName[0] + props.typeName[1] + 0.65, 0]]} />
        </rect>
      )}
      <group name="Details">
        <text x={82} y={35} fontFamily={F.ui} fontSize={10.5} color={C.muted} end={props.end}>{props.p.pkg}</text>
        <rect x={82} y={52} width={118} height={18} cornerRadius={9} end={props.end}>
          <stroke color="#5e50d8" width={1} />
        </rect>
        <text x={82} y={52} width={118} height={18} textAlign="center" textBaseline="middle" fontFamily={F.ui} fontWeight={500} fontSize={9} color="#9488f5" end={props.end}>
          Android Studio (Java)
        </text>
        {props.detailsAt !== undefined && <Kf p="opacity" k={fade(props.detailsAt, 0.3)} />}
      </group>
      <Pivot name="Edit button" x={248} y={20} w={40} h={40} end={props.end}>
        <rect x={0} y={0} width={40} height={40} cornerRadius={10} fill="#11131c" end={props.end}>
          <stroke color="#252839" width={1} />
        </rect>
        <text x={0} y={0} width={40} height={40} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={20} color={C.purpleHi} end={props.end}>{I.edit}</text>
        {props.editPressAt !== undefined && <Kf p="scale" k={press(props.editPressAt)} />}
      </Pivot>
      <rect x={294} y={20} width={40} height={40} cornerRadius={10} fill={C.redBg} end={props.end}>
        <stroke color="#4a2230" width={1} />
      </rect>
      <text x={294} y={20} width={40} height={40} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={20} color={C.red} end={props.end}>{I.del}</text>
    </group>
  );
}

/** A button press: dip and recover. */
export function press(t: number, depth = 0.92): Key[] {
  return [[0, 1, E.hold], [t - 0.06, 1, E.out], [t + 0.04, depth, E.back], [t + 0.3, 1]];
}

/**
 * The whole "Projetos" screen. Times are the screen's local seconds.
 *  - enterAt: cards rise in
 *  - newAt: "Novo projeto" pressed; the new card is inserted right after
 *  - editAt: the new card's edit button pressed
 */
export function ProjectList(props: { end: number; enterAt: number; newAt: number; editAt: number; newName: string; newPkg: string }): JSX.Element {
  const insert = props.newAt + 0.2;
  return (
    <group name="Projetos screen">
      <rect name="Background" x={0} y={0} width={360} height={780} end={props.end}>
        <linearGradientPaint rotation={90}>
          <colorStop offset={0} color={C.listTop} />
          <colorStop offset={0.55} color="#1a1936" />
          <colorStop offset={1} color={C.listBottom} />
        </linearGradientPaint>
      </rect>

      <group name="Header">
        <rect x={16} y={38} width={44} height={44} cornerRadius={11} fill="#12132a" end={props.end}>
          <stroke color="#272948" width={1} />
        </rect>
        <text x={16} y={38} width={44} height={44} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={24} color={C.purpleHi} end={props.end}>{I.menu}</text>
        <text x={72} y={36} fontFamily={F.ui} fontWeight={700} fontSize={23} color={C.text} end={props.end}>
          SkitStudio
          <textRange start={4} color={C.purple} />
        </text>
        <text x={72} y={66} fontFamily={F.ui} fontSize={11.5} color="#b3aed6" end={props.end}>Crie apps Android no seu dispositivo</text>
        {[I.restore, I.person].map((icon, i) => (
          <>
            <rect x={254 + i * 52} y={38} width={44} height={44} cornerRadius={11} fill="#12132a" end={props.end}>
              <stroke color="#272948" width={1} />
            </rect>
            <text x={254 + i * 52} y={38} width={44} height={44} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={22} color={C.purpleHi} end={props.end}>{icon}</text>
          </>
        ))}
        <Kf p="opacity" k={fade(props.enterAt, 0.4)} />
      </group>

      <group name="Existing cards">
        {PROJECTS.map((p, i) => (
          <group x={CARD.x} y={CARD.y + i * (CARD.h + CARD.gap)}>
            <ProjectCard p={p} end={props.end} />
            <Kf p="opacity" k={fade(props.enterAt + 0.12 + i * 0.06, 0.35)} />
            <Kf p="offsetY" k={[[0, 26, E.hold], [props.enterAt + 0.12 + i * 0.06, 26, E.out], [props.enterAt + 0.6 + i * 0.06, 0], [insert, 0, E.back], [insert + 0.45, CARD.h + CARD.gap]]} />
          </group>
        ))}
      </group>

      <group name="New card" x={CARD.x} y={CARD.y}>
        <Pivot w={CARD.w} h={CARD.h} end={props.end}>
          <ProjectCard
            p={{ name: props.newName, pkg: props.newPkg, bar: C.greenBar }}
            end={props.end}
            typeName={[insert + 0.25, 0.5]}
            detailsAt={insert + 0.75}
            editPressAt={props.editAt}
            highlightAt={insert + 0.1}
          />
          <Kf p="scale" k={[[0, 0.9, E.hold], [insert + 0.05, 0.9, E.back], [insert + 0.5, 1]]} />
          <Kf p="opacity" k={fade(insert + 0.05, 0.25)} />
        </Pivot>
      </group>

      <rect name="List fade" x={0} y={560} width={360} height={110} end={props.end}>
        <linearGradientPaint rotation={90}>
          <colorStop offset={0} color={C.listBottom} opacity={0} />
          <colorStop offset={0.6} color={C.listBottom} opacity={1} />
          <colorStop offset={1} color={C.listBottom} opacity={1} />
        </linearGradientPaint>
      </rect>

      <Pivot name="Novo projeto" x={16} y={598} w={328} h={54} end={props.end}>
        <rect x={0} y={0} width={328} height={54} cornerRadius={27} end={props.end}>
          <linearGradientPaint rotation={0}>
            <colorStop offset={0} color={C.purpleBtn} />
            <colorStop offset={1} color={C.purple2} />
          </linearGradientPaint>
          <shadow color={C.purple} blur={22} offsetY={6} opacity={0.45} />
        </rect>
        <rect x={104} y={13} width={28} height={28} cornerRadius={8} fill="#ffffff" opacity={0.22} end={props.end} />
        <text x={104} y={13} width={28} height={28} textAlign="center" textBaseline="middle" fontFamily={F.icon} fontSize={20} color="#ffffff" end={props.end}>{I.add}</text>
        <text x={142} y={0} width={150} height={54} textBaseline="middle" fontFamily={F.ui} fontWeight={700} fontSize={16} color="#ffffff" end={props.end}>Novo projeto</text>
        <Kf p="scale" k={press(props.newAt, 0.95)} />
        <Kf p="opacity" k={fade(props.enterAt + 0.35, 0.35)} />
      </Pivot>

      <group name="Bottom nav">
        <rect x={0} y={668} width={360} height={72} fill="#181b29" end={props.end}>
          <stroke color="#23263a" width={1} />
        </rect>
        {[
          { icon: I.grid, label: "Projetos", active: true },
          { icon: I.store, label: "Loja" },
          { icon: I.video, label: "Vídeos" },
          { icon: I.person, label: "Perfil" },
        ].map((item, i) => (
          <>
            <text x={i * 90} y={680} width={90} height={30} textAlign="center" fontFamily={F.icon} fontSize={24} color={item.active ? C.purpleHi : "#8d91a8"} end={props.end}>{item.icon}</text>
            <text x={i * 90} y={710} width={90} height={16} textAlign="center" fontFamily={F.ui} fontSize={11} fontWeight={item.active ? 500 : 400} color={item.active ? C.purpleHi : "#8d91a8"} end={props.end}>{item.label}</text>
          </>
        ))}
      </group>
      <rect x={0} y={740} width={360} height={40} fill="#0c0d15" end={props.end} />
      <StatusBar end={props.end} />
      <SystemNav end={props.end} />
    </group>
  );
}
