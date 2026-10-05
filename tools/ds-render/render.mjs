#!/usr/bin/env node
/* Renders a Diffusion Studio project headlessly.
 *
 *   node tools/ds-render/render.mjs --project skitstudio-promo --scene promo \
 *        --out render/master.webm [--res 1080] [--start 0 --end 60] [--mp4 render/final.mp4]
 *
 * 1. compiles the project with Diffusion Studio's own babel passes (harness/compile.ts)
 * 2. serves a page (Vite, inside the Diffusion Studio monorepo checkout) that mounts
 *    it with @diffusionstudio/reconciler and exports it with @diffusionstudio/encoder
 * 3. drives that page in headless Chromium (Playwright) and writes the file it streams
 * 4. optionally transcodes the master to an H.264/AAC MP4 for delivery (ffmpeg):
 *    this Chromium build has no H.264/AAC encoders, so the master is VP9/Opus.
 */

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, openSync, closeSync, writeSync, readFileSync, statSync, readdirSync, lstatSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve, relative, isAbsolute, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const EDITOR = join(HERE, ".editor");
const HEADLESS = join(EDITOR, "headless");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const project = resolve(arg("project", "skitstudio-promo"));
const sceneId = arg("scene", "promo");
const out = resolve(arg("out", "render/master.webm"));
const mp4 = arg("mp4") ? resolve(arg("mp4")) : null;
const res = Number(arg("res", "1080"));
const start = arg("start") !== undefined ? Number(arg("start")) : undefined;
const end = arg("end") !== undefined ? Number(arg("end")) : undefined;
const bitrate = Number(arg("bitrate", "40000000"));
const audioOnly = process.argv.includes("--audio-only");

if (!existsSync(join(EDITOR, "node_modules"))) {
  console.error("Diffusion Studio checkout missing — run tools/ds-render/setup.sh first.");
  process.exit(1);
}

// 1. Harness into the monorepo (so workspace packages resolve), then compile.
mkdirSync(HEADLESS, { recursive: true });
cpSync(join(HERE, "harness"), HEADLESS, { recursive: true });
const editorRequire = createRequire(join(EDITOR, "package.json"));
const esbuild = editorRequire("esbuild");
await esbuild.build({
  entryPoints: [join(HEADLESS, "compile.ts")],
  outfile: join(HEADLESS, `.compile-${process.pid}.mjs`),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  external: ["esbuild", "@babel/core", "@babel/preset-typescript", "babel-preset-solid"],
  logLevel: "warning",
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
});
const bundlePath = join(HEADLESS, `.project-${process.pid}.js`);
const compiled = spawnSync(process.execPath, [join(HEADLESS, `.compile-${process.pid}.mjs`), project, bundlePath], { stdio: "inherit", cwd: EDITOR });
if (compiled.status !== 0) process.exit(compiled.status ?? 1);

// Fonts the project ships for offline renders (the app fetches Google families itself).
const fontsDir = join(project, "fonts");
const fonts = existsSync(join(fontsDir, "fonts.json"))
  ? JSON.parse(readFileSync(join(fontsDir, "fonts.json"), "utf8")).map((f) => ({ ...f, url: `/__fs/file?path=${encodeURIComponent(`fonts/${f.file}`)}` }))
  : [];

const job = {
  scene: sceneId,
  format: audioOnly ? "ogg" : "webm",
  audioOnly,
  videoCodec: "vp9",
  audioCodec: "opus",
  videoBitrate: bitrate,
  audioBitrate: 320000,
  resolution: res,
  fps: 30,
  start,
  end,
  fonts,
};

// 2. Page server.
function projectPath(p) {
  const abs = isAbsolute(p) ? p : join(project, p);
  if (relative(project, abs).startsWith("..") && !isAbsolute(p)) throw new Error(`outside project: ${p}`);
  return abs;
}

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".webm": "video/webm", ".wav": "audio/wav", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".ttf": "font/ttf", ".woff2": "font/woff2", ".otf": "font/otf" };

let fd = null;
function api() {
  return {
    name: "ds-headless-api",
    configureServer(server) {
      server.middlewares.use(async (req, resp, next) => {
        const url = new URL(req.url, "http://x");
        const send = (code, body, type = "application/json") => {
          resp.statusCode = code;
          resp.setHeader("Content-Type", type);
          resp.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
        };
        try {
          if (url.pathname === "/__job") return send(200, job);
          if (url.pathname === "/__bundle") return send(200, readFileSync(bundlePath, "utf8"), "text/javascript");
          if (url.pathname === "/__fs/list") {
            const p = projectPath(url.searchParams.get("path"));
            if (!existsSync(p) || !statSync(p).isDirectory()) return send(200, []);
            return send(200, readdirSync(p).map((name) => {
              const s = statSync(join(p, name));
              return { name, kind: s.isDirectory() ? "directory" : "file", size: s.size, mtime: Math.floor(s.mtimeMs), link: lstatSync(join(p, name)).isSymbolicLink() || undefined };
            }));
          }
          if (url.pathname === "/__fs/stat") {
            const p = projectPath(url.searchParams.get("path"));
            if (!existsSync(p)) return send(404, "null");
            const s = statSync(p);
            return send(200, { size: s.size, mtime: Math.floor(s.mtimeMs) });
          }
          if (url.pathname === "/__fs/file") {
            const p = projectPath(url.searchParams.get("path"));
            if (!existsSync(p)) return send(404, "missing", "text/plain");
            resp.setHeader("x-mtime", String(Math.floor(statSync(p).mtimeMs)));
            return send(200, readFileSync(p), MIME[extname(p).toLowerCase()] ?? "application/octet-stream");
          }
          if (url.pathname === "/__out/open") {
            mkdirSync(dirname(out), { recursive: true });
            fd = openSync(out, "w");
            return send(200, "{}");
          }
          if (url.pathname === "/__out/write") {
            const position = Number(url.searchParams.get("position"));
            const chunks = [];
            for await (const c of req) chunks.push(c);
            const data = Buffer.concat(chunks);
            writeSync(fd, data, 0, data.length, position);
            return send(200, "{}");
          }
          if (url.pathname === "/__out/close") {
            if (fd !== null) closeSync(fd);
            fd = null;
            return send(200, "{}");
          }
        } catch (error) {
          return send(500, { error: String(error) });
        }
        next();
      });
    },
  };
}

const { createServer } = await import(editorRequire.resolve("vite"));
const server = await createServer({
  configFile: join(HEADLESS, "vite.config.ts"),
  root: HEADLESS,
  plugins: [api()],
  server: { port: 0, host: "127.0.0.1" },
});
await server.listen();
const address = server.httpServer.address();
const pageUrl = `http://127.0.0.1:${address.port}/index.html`;

// 3. Headless Chromium.
let playwright;
try {
  playwright = editorRequire("playwright");
} catch {
  playwright = createRequire("/opt/node22/lib/node_modules/")("playwright");
}
const browser = await playwright.chromium.launch({
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required", "--disable-background-timer-throttling", "--disable-renderer-backgrounding"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("console", (msg) => {
  const text = msg.text();
  if (/\[harness\]|Encoded frames|Export complete|Finalizing|error|Error|warn/i.test(text)) console.log(`  [page] ${text}`);
});
page.on("pageerror", (err) => console.error("  [pageerror]", err.message));

const started = Date.now();
const done = new Promise((resolveDone) => {
  page.exposeFunction("__done", (result) => resolveDone(result));
});
let lastShown = -10;
await page.exposeFunction("__progress", (p) => {
  if (p - lastShown >= 10 || p === 100) {
    lastShown = p;
    console.log(`  render ${p}%  (${((Date.now() - started) / 1000).toFixed(0)}s)`);
  }
});
await page.goto(pageUrl);
const result = await done;
await browser.close();
await server.close();

if (!result.ok) {
  console.error("Render failed:", result.error);
  process.exit(1);
}
console.log(`master → ${relative(process.cwd(), out)} in ${((Date.now() - started) / 1000).toFixed(1)}s`);

// 4. Delivery MP4.
if (mp4) {
  mkdirSync(dirname(mp4), { recursive: true });
  const ff = spawnSync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error", "-i", out,
    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.2",
    "-r", "30", "-g", "60", "-bf", "2",
    "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
    "-movflags", "+faststart", mp4,
  ], { stdio: "inherit" });
  if (ff.status !== 0) process.exit(ff.status ?? 1);
  console.log(`delivery → ${relative(process.cwd(), mp4)}`);
}
