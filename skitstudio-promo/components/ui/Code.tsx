/* The "Código" tab: file header + code editor with line numbers and syntax
 * colours matching SkitStudio's editor. Lines can fade in or be typed. */

import type { JSX } from "solid-js";
import { C, F, I } from "../../lib/theme";
import { E, Kf, fade, type Key } from "../../lib/motion";

export const CODE = { x: 8, y: 168, w: 344, h: 544, lineH: 15.5, font: 9.2, textX: 36 };
export const CHAR_W = CODE.font * 0.6;

type Range = [start: number, end: number, color: string];

const JAVA_KEYWORDS = new Set([
  "package", "import", "public", "private", "protected", "class", "extends", "implements", "void", "new", "return",
  "static", "final", "super", "this", "if", "else",
]);

/** Java colouring: keywords, types, calls, strings, annotations. */
export function java(line: string): Range[] {
  const out: Range[] = [];
  const re = /"[^"]*"|@\w+|\b[A-Za-z_]\w*\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const w = m[0];
    const s = m.index;
    const e = s + w.length;
    if (w.startsWith('"')) out.push([s, e, C.code.value]);
    else if (w.startsWith("@")) out.push([s, e, C.code.keyword]);
    else if (JAVA_KEYWORDS.has(w)) out.push([s, e, C.code.keyword]);
    else if (/^[A-Z]/.test(w) && w !== "R") out.push([s, e, C.code.type]);
    else if (line[e] === "(") out.push([s, e, C.code.fn]);
  }
  return out;
}

/** XML colouring: tags, attribute names, values, comments. */
export function xml(line: string): Range[] {
  const out: Range[] = [];
  if (/^\s*<!--/.test(line)) return [[0, line.length, C.code.comment]];
  const re = /<\/?[\w.?]+|\/?>|\?>|[\w:]+(?==)|"[^"]*"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const w = m[0];
    const s = m.index;
    const e = s + w.length;
    if (w.startsWith('"')) out.push([s, e, C.code.value]);
    else if (w.startsWith("<") || w.endsWith(">")) out.push([s, e, C.code.tag]);
    else out.push([s, e, C.code.attr]);
  }
  return out;
}

export type CodeLine = {
  text: string;
  /** typed: [start, duration] — characters after the indentation appear one by one */
  type?: [number, number];
};

/**
 * Code view. `revealAt`: lines fade in top-down from this time (stagger
 * `stagger`). `highlight`: a band behind lines [from, to] fading in at time.
 */
export function CodeView(props: {
  end: number;
  file: string;
  lines: CodeLine[];
  lang: "xml" | "java";
  revealAt: number;
  stagger?: number;
  highlight?: { from: number; to: number; at: number };
  opacity?: Key[];
}): JSX.Element {
  const color = props.lang === "xml" ? xml : java;
  const stagger = props.stagger ?? 0.025;
  return (
    <group name={`Code ${props.file}`}>
      <rect x={CODE.x} y={128} width={CODE.w} height={34} cornerRadius={11} fill="#10111b" end={props.end}>
        <stroke color="#22253a" width={1} />
      </rect>
      <text x={18} y={133} fontFamily={F.icon} fontSize={19} color={C.code.value} end={props.end}>{I.code}</text>
      <text x={44} y={128} width={260} height={34} textBaseline="middle" fontFamily={F.ui} fontWeight={500} fontSize={12.5} color="#e8e9f2" end={props.end}>{props.file}</text>
      <text x={330} y={134} fontFamily={F.icon} fontSize={18} color="#aab0c4" end={props.end}>{I.more}</text>

      <rect x={CODE.x} y={CODE.y} width={CODE.w} height={CODE.h} cornerRadius={12} fill={C.code.bg} end={props.end}>
        <stroke color="#1c1e2e" width={1} />
      </rect>
      {props.highlight && (
        <group name="Highlight">
          <rect x={CODE.x + 2} y={CODE.y + 8 + props.highlight.from * CODE.lineH - 2} width={CODE.w - 4} height={(props.highlight.to - props.highlight.from + 1) * CODE.lineH + 4} fill={C.purple} opacity={0.14} end={props.end} />
          <rect x={CODE.x + 2} y={CODE.y + 8 + props.highlight.from * CODE.lineH - 2} width={2.5} height={(props.highlight.to - props.highlight.from + 1) * CODE.lineH + 4} fill={C.purpleHi} end={props.end} />
          <Kf p="opacity" k={fade(props.highlight.at, 0.3)} />
        </group>
      )}
      {props.lines.map((line, i) => {
        const y = CODE.y + 8 + i * CODE.lineH;
        const indent = line.text.length - line.text.trimStart().length;
        const body = line.text.trimStart();
        const x0 = CODE.textX + indent * CHAR_W;
        const typed = line.type;
        const n = body.length;
        return (
          <group name={`L${i + 1}`}>
            <text x={10} y={y} width={20} height={CODE.lineH} textAlign="right" fontFamily={F.mono} fontSize={CODE.font - 0.6} color={C.code.line} end={props.end}>{String(i + 1)}</text>
            {body.length > 0 && (
              <text x={x0} y={y} fontFamily={F.mono} fontSize={CODE.font} color={C.code.plain} end={props.end}>
                {body}
                {color(body).map(([s, e, c]) => (
                  <textRange start={s} end={e} color={c} />
                ))}
                {typed && (
                  <rect clipPath x={-1} y={-3} height={CODE.lineH + 2}>
                    <Kf p="width" k={[[0, 0, E.hold], [typed[0], 0, `steps(${n})`], [typed[0] + typed[1], n * CHAR_W + 4]]} />
                  </rect>
                )}
              </text>
            )}
            {typed && (
              <rect name="Caret" y={y - 1} width={1.3} height={12} fill={C.purpleHi} end={props.end}>
                <Kf p="x" k={[[0, x0, E.hold], [typed[0], x0, `steps(${n})`], [typed[0] + typed[1], x0 + n * CHAR_W]]} />
                <Kf p="opacity" k={[[0, 0, E.hold], [typed[0] - 0.02, 1, E.hold], [typed[0] + typed[1] + 0.02, 0]]} />
              </rect>
            )}
            <Kf p="opacity" k={fade(props.revealAt + i * stagger, 0.2)} />
          </group>
        );
      })}
      <rect clipPath x={CODE.x} y={128} width={CODE.w} height={CODE.y + CODE.h - 128} cornerRadius={12} end={props.end} />
      {props.opacity && <Kf p="opacity" k={props.opacity} />}
    </group>
  );
}

export const XML_LINES: CodeLine[] = [
  `<?xml version="1.0" encoding="utf-8"?>`,
  `<LinearLayout`,
  `    xmlns:android="http://schemas.android.com/apk/res/android"`,
  `    android:layout_width="match_parent"`,
  `    android:layout_height="match_parent"`,
  `    android:orientation="vertical"`,
  `    android:gravity="center_horizontal"`,
  `    android:padding="28dp">`,
  ``,
  `    <ImageView`,
  `        android:id="@+id/img_saudacao"`,
  `        android:layout_width="80dp"`,
  `        android:layout_height="80dp" />`,
  ``,
  `    <TextView`,
  `        android:id="@+id/txt_titulo"`,
  `        android:layout_width="wrap_content"`,
  `        android:layout_height="wrap_content"`,
  `        android:text="Olá!"`,
  `        android:textSize="34sp" />`,
  ``,
  `    <EditText`,
  `        android:id="@+id/edt_nome"`,
  `        android:layout_width="match_parent"`,
  `        android:layout_height="wrap_content"`,
  `        android:hint="Digite seu nome" />`,
  ``,
  `    <Button`,
  `        android:id="@+id/btn_enviar"`,
  `        android:layout_width="match_parent"`,
  `        android:layout_height="wrap_content"`,
  `        android:text="Enviar" />`,
  ``,
  `</LinearLayout>`,
].map((text) => ({ text }));

/** MainActivity.java; lines 14–17 are typed when `typeAt` is given. */
export function javaLines(typeAt?: number): CodeLine[] {
  const base = [
    `package com.example.olaapp;`,
    ``,
    `public class MainActivity extends AppCompatActivity {`,
    ``,
    `    @Override`,
    `    protected void onCreate(Bundle savedInstanceState) {`,
    `        super.onCreate(savedInstanceState);`,
    `        setContentView(R.layout.activity_main);`,
    ``,
    `        EditText edtNome = findViewById(R.id.edt_nome);`,
    `        TextView txtTitulo = findViewById(R.id.txt_titulo);`,
    `        Button btnEnviar = findViewById(R.id.btn_enviar);`,
    ``,
    `        btnEnviar.setOnClickListener(v -> {`,
    `            String nome = edtNome.getText().toString();`,
    `            txtTitulo.setText("Olá, " + nome + "!");`,
    `        });`,
    `    }`,
    `}`,
  ];
  const typed: Record<number, [number, number]> = {};
  if (typeAt !== undefined) {
    // durations proportional to the characters typed
    const lens = [13, 14, 15, 16].map((i) => base[i]!.trim().length);
    const total = 3.0;
    const sum = lens.reduce((a, b) => a + b, 0);
    let t = typeAt;
    [13, 14, 15, 16].forEach((i, k) => {
      const d = (total * lens[k]!) / sum;
      typed[i] = [t, d];
      t += d + 0.06;
    });
  }
  return base.map((text, i) => ({ text, type: typed[i] }));
}
