// Exports the cue sheet (skitstudio-promo/audio/Soundtrack.tsx → CUES) to JSON,
// so sfx_bed.py can mix the effects track from the same source of truth.
//   node tools/audio/export-cues.mjs skitstudio-promo/audio/cues.json
import { writeFileSync, mkdtempSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const require = createRequire(join(ROOT, "tools/ds-render/.editor/package.json"));
const esbuild = require("esbuild");

const dir = mkdtempSync(join(tmpdir(), "cues-"));
const stub = join(dir, "stub.cjs");
writeFileSync(stub, "module.exports = new Proxy({}, { get: () => () => ({}) });");
const entry = join(dir, "entry.ts");
writeFileSync(entry, `import { CUES } from ${JSON.stringify(join(ROOT, "skitstudio-promo/audio/Soundtrack"))};\nprocess.stdout.write(JSON.stringify(CUES));`);
const out = join(dir, "cues.cjs");
await esbuild.build({
  entryPoints: [entry], bundle: true, platform: "node", format: "cjs", outfile: out, logLevel: "error",
  jsx: "automatic", jsxImportSource: "@diffusionstudio/jsx",
  alias: { "solid-js": stub, "solid-js/web": stub, "@diffusionstudio/jsx": stub, "@diffusionstudio/jsx/jsx-runtime": stub },
});
const { execFileSync } = await import("node:child_process");
const json = execFileSync(process.execPath, [out]).toString();
const target = resolve(process.argv[2] ?? join(ROOT, "skitstudio-promo/audio/cues.json"));
writeFileSync(target, JSON.stringify(JSON.parse(json), null, 0).replace(/\],\[/g, "],\n["));
console.log(`cues → ${target} (${JSON.parse(json).length} cues)`);
