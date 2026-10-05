/* The "Árvore" sub-tab: the view hierarchy as indented rows. */

import type { JSX } from "solid-js";
import { C, F, I } from "../../lib/theme";
import { E, Kf, fade, type Key } from "../../lib/motion";

export const TREE_ROWS = [
  { level: 0, icon: I.linearV, label: "LinearLayout (raiz)" },
  { level: 1, icon: I.image, label: "ImageView (img_saudacao)" },
  { level: 1, icon: I.textView, label: "TextView (txt_titulo)" },
  { level: 1, icon: I.editText, label: "EditText (edt_nome)" },
  { level: 1, icon: I.button, label: "Button (btn_enviar)" },
];

export const TREE = { x: 8, y: 166, rowH: 34, gap: 8, indent: 18 };

export function treeRowCenter(i: number): [number, number] {
  const r = TREE_ROWS[i]!;
  return [TREE.x + r.level * TREE.indent + 150, TREE.y + 8 + i * (TREE.rowH + TREE.gap) + TREE.rowH / 2];
}

/** select: [time, row] — the selection outline moves to that row. */
export function TreeView(props: { end: number; revealAt: number; select: [number, number][]; opacity?: Key[] }): JSX.Element {
  return (
    <group name="Tree view">
      <rect x={TREE.x + TREE.indent / 2 + 6} y={TREE.y + 8 + TREE.rowH} width={1.5} height={4 * (TREE.rowH + TREE.gap) - TREE.rowH / 2 - TREE.gap} fill="#2b2e45" end={props.end}>
        <Kf p="opacity" k={fade(props.revealAt + 0.2, 0.3)} />
      </rect>
      {TREE_ROWS.map((row, i) => {
        const x = TREE.x + row.level * TREE.indent;
        const y = TREE.y + 8 + i * (TREE.rowH + TREE.gap);
        const w = 344 - row.level * TREE.indent;
        const sel: Key[] = [[0, props.select[0]![1] === i ? 1 : 0, E.hold]];
        for (const [t, r] of props.select.slice(1)) sel.push([t, sel[sel.length - 1]![1], E.out], [t + 0.2, r === i ? 1 : 0]);
        return (
          <group name={row.label}>
            {row.level > 0 && <rect x={x - 9} y={y + TREE.rowH / 2} width={9} height={1.5} fill="#2b2e45" end={props.end} />}
            <rect x={x} y={y} width={w} height={TREE.rowH} cornerRadius={9} fill="#11131f" end={props.end}>
              <stroke color="#22253a" width={1} />
            </rect>
            <rect x={x} y={y} width={w} height={TREE.rowH} cornerRadius={9} fill="#1b1645" end={props.end}>
              <stroke color={C.purple} width={1.5} />
              <Kf p="opacity" k={sel} />
            </rect>
            <text x={x + 12} y={y} width={22} height={TREE.rowH} textBaseline="middle" fontFamily={F.icon} fontSize={17} color={C.purpleHi} end={props.end}>{row.icon}</text>
            <text x={x + 36} y={y} width={w - 44} height={TREE.rowH} textBaseline="middle" fontFamily={F.ui} fontSize={12} color="#dfe1ec" end={props.end}>{row.label}</text>
            <Kf p="opacity" k={fade(props.revealAt + i * 0.08, 0.25)} />
            <Kf p="offsetX" k={[[0, -14, E.hold], [props.revealAt + i * 0.08, -14, E.out], [props.revealAt + i * 0.08 + 0.4, 0]]} />
          </group>
        );
      })}
      {props.opacity && <Kf p="opacity" k={props.opacity} />}
    </group>
  );
}
