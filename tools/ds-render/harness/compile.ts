/* Compiles a Diffusion Studio project folder into the CommonJS bundle the
 * editor mounts — the same pipeline the desktop app runs on open/save
 * (apps/desktop/src/projects.ts → compileProject): esbuild bundling, with
 * project sources run through Diffusion Studio's own babel passes (source
 * stamps, tag canonicalization, @inspect variables) and babel-preset-solid in
 * `universal` mode against @diffusionstudio/jsx.
 *
 * Usage (bundled by render.mjs, run with node):
 *   node compile.mjs <projectDir> <outFile>
 */

import { readFile, realpath, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, relative, sep } from "node:path";

import { build, type Plugin } from "esbuild";
import { transformAsync, type TransformOptions } from "@babel/core";

// Diffusion Studio's compile-time passes, straight from the desktop app.
import { canonicalizeTagsPlugin, inspectPlugin, sourcePlugin } from "../apps/desktop/src/source";

const require = createRequire(import.meta.url);
const RUNTIME_MODULE = "@diffusionstudio/jsx";
const EXTERNAL = ["solid-js", "solid-js/*", RUNTIME_MODULE];
const ENTRY_FILES = ["index.tsx", "index.ts", "index.jsx", "index.js"];

function preset(name: string): unknown {
  const loaded = require(name) as { default?: unknown };
  return loaded.default ?? loaded;
}

const babelOptions = (file: string, filename: string): TransformOptions => ({
  filename,
  babelrc: false,
  configFile: false,
  plugins: [[sourcePlugin, { file }], canonicalizeTagsPlugin, [inspectPlugin, { file }]],
  presets: [
    [preset("babel-preset-solid"), { generate: "universal", moduleName: RUNTIME_MODULE }],
    [preset("@babel/preset-typescript"), { onlyRemoveTypeImports: true }],
  ],
});

function solidLoader(root: string): Plugin {
  return {
    name: "solid-universal",
    setup(b) {
      b.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
        const name = relative(root, args.path);
        if (name.startsWith("..") || name.includes(`${sep}node_modules${sep}`) || name.startsWith(`node_modules${sep}`)) {
          return undefined;
        }
        const source = await readFile(args.path, "utf8");
        const result = await transformAsync(source, babelOptions(name.split(sep).join("/"), args.path));
        return { contents: result?.code ?? "", loader: "js" };
      });
    },
  };
}

async function findEntry(dir: string): Promise<string> {
  try {
    const pkg = JSON.parse(await readFile(join(dir, "package.json"), "utf8")) as { main?: string };
    if (pkg.main) return pkg.main;
  } catch {
    // no package.json: fall through to the defaults
  }
  for (const file of ENTRY_FILES) {
    try {
      await readFile(join(dir, file));
      return file;
    } catch {
      // try the next one
    }
  }
  throw new Error(`No entry file in ${dir}`);
}

async function main() {
  const [dirArg, outArg] = process.argv.slice(2);
  if (!dirArg || !outArg) throw new Error("usage: compile <projectDir> <outFile>");
  const root = await realpath(dirArg);
  const entry = await findEntry(root);
  const result = await build({
    bundle: true,
    write: false,
    format: "cjs",
    platform: "browser",
    target: "chrome130",
    external: EXTERNAL,
    logLevel: "silent",
    entryPoints: [join(root, entry)],
    plugins: [solidLoader(root)],
  });
  await writeFile(outArg, result.outputFiles[0]!.text);
  console.log(`[compile] ${entry} → ${outArg} (${result.outputFiles[0]!.text.length} bytes)`);
}

main().catch((error) => {
  console.error("[compile] failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
