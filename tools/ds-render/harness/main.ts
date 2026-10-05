/* Headless Diffusion Studio export.
 *
 * Does in a plain browser page what the desktop app does when it exports a
 * scene (apps/web/src/engine/capture.ts + context/render.ts): mounts the
 * compiled project into a fresh runtime world with the project's asset
 * library attached, reduces the stage to the scene being exported, and runs
 * @diffusionstudio/encoder over it. The file streams back to the Node driver
 * over HTTP as mediabunny writes it.
 */

import { mount } from "@diffusionstudio/reconciler";
import {
  ChildOf, FramePromises, FrameRate, Fonts, Library, Mode, RenderSurface, Root, Source, Workarea,
  createRuntimeWorld, resetCamera,
} from "@diffusionstudio/runtime";
import { createEncoder } from "@diffusionstudio/encoder";
import { AssetLibrary } from "@diffusionstudio/assets";

import type { FsEntry, ProjectFS } from "@diffusionstudio/assets";
import type { StreamTargetChunk } from "mediabunny";

type Job = {
  scene: string;
  format: "webm" | "mp4" | "ogg";
  audioOnly?: boolean;
  videoCodec: "vp9" | "av1" | "avc";
  audioCodec: "opus" | "aac";
  videoBitrate: number;
  audioBitrate: number;
  resolution: number;
  fps: number;
  /** Optional workarea override, seconds. */
  start?: number;
  end?: number;
  fonts: { family: string; url: string; weight: string; style: string }[];
};

const log = (...args: unknown[]) => {
  console.log("[harness]", ...args);
};

declare global {
  interface Window {
    __done?: (result: { ok: boolean; error?: string; frames?: number }) => void;
    __progress?: (p: number) => void;
  }
}

/** The project folder, as the asset library sees it, served by the driver. */
const httpFS: ProjectFS = {
  async readManifest() {
    // The library re-scans assets/ on every load; the desktop app writes the
    // manifest itself when the project is opened there.
    return null;
  },
  async writeManifest() {},
  async list(source: string): Promise<FsEntry[]> {
    const res = await fetch(`/__fs/list?path=${encodeURIComponent(source)}`);
    return res.ok ? res.json() : [];
  },
  async stat(source: string) {
    const res = await fetch(`/__fs/stat?path=${encodeURIComponent(source)}`);
    return res.ok ? res.json() : null;
  },
  async file(source: string): Promise<File> {
    const res = await fetch(`/__fs/file?path=${encodeURIComponent(source)}`);
    if (!res.ok) throw new Error(`No such file: ${source}`);
    const blob = await res.blob();
    const mtime = Number(res.headers.get("x-mtime") ?? Date.now());
    return new File([blob], source.split("/").pop() ?? "file", { type: blob.type, lastModified: mtime });
  },
  async write() {},
  async remove() {},
};

/** Streams mediabunny's chunks to the driver, which writes them at their offsets. */
const httpTarget = {
  async createWritable(): Promise<WritableStream<StreamTargetChunk>> {
    await fetch("/__out/open", { method: "POST" });
    return new WritableStream<StreamTargetChunk>({
      async write(chunk) {
        const res = await fetch(`/__out/write?position=${chunk.position}`, { method: "POST", body: chunk.data });
        if (!res.ok) throw new Error(`write failed at ${chunk.position}`);
      },
      async close() {
        await fetch("/__out/close", { method: "POST" });
      },
    });
  },
};

async function loadFonts(fonts: Job["fonts"]) {
  for (const f of fonts) {
    const face = new FontFace(f.family, `url(${f.url})`, { weight: f.weight, style: f.style });
    await face.load();
    document.fonts.add(face);
  }
  log(`fonts ready: ${[...new Set(fonts.map((f) => f.family))].join(", ")}`);
}

async function run() {
  const job: Job = await (await fetch("/__job")).json();
  await loadFonts(job.fonts);

  const code = await (await fetch("/__bundle")).text();

  const library = new AssetLibrary(httpFS);
  await library.load();
  log(`library: ${library.list().length} assets`);

  // The canvas the scene draws into (see apps/web/src/engine/capture.ts).
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;
  canvas.style.cssText = "position:fixed;left:0;top:0;z-index:-9999;opacity:0;will-change:opacity;pointer-events:none;";
  document.body.appendChild(canvas);

  const world = createRuntimeWorld("skitstudio-promo");
  world.set(Mode, { value: job.audioOnly ? "offline-audio" : "offline-video" });
  world.set(Library, library);
  world.set(Fonts, { list: [] });
  world.set(RenderSurface, { canvas, ctx: canvas.getContext("2d"), resolution: 1 });
  world.set(FrameRate, { value: job.fps });
  world.set(FramePromises, { list: [] });

  const mounted = mount(code, world);

  // Down to the scene being exported.
  const scene = world.query(Source).find((entity) => {
    const value = entity.get(Source)?.value ?? "";
    return value.endsWith(`:${job.scene}`) || value === job.scene;
  });
  if (!scene) throw new Error(`The project rendered no scene "${job.scene}"`);
  for (const root of world.query(ChildOf(world.get(Root)!))) {
    if (root !== scene) root.destroy();
  }
  resetCamera(world);

  if (job.start !== undefined || job.end !== undefined) {
    const start = Math.round((job.start ?? 0) * job.fps);
    const end = Math.round((job.end ?? 0) * job.fps);
    scene.add(Workarea);
    scene.set(Workarea, { start, end });
    log(`workarea ${start}f–${end}f`);
  }

  const encoder = await createEncoder(world, {
    format: job.format,
    target: httpTarget,
    comment: "SkitStudio promo — made with Diffusion Studio",
    video: { enabled: !job.audioOnly, codec: job.videoCodec, bitrate: job.videoBitrate, resolution: job.resolution, fps: job.fps },
    audio: { codec: job.audioCodec, bitrate: job.audioBitrate, sampleRate: 48000 },
    onProgress(p) {
      window.__progress?.(Math.round((p.progress / p.total) * 100));
    },
  });

  const result = await encoder.render();
  mounted.dispose();
  if (result.type !== "success") {
    throw result.type === "error" ? result.error : new Error("canceled");
  }
}

run().then(
  () => window.__done?.({ ok: true }),
  (error: unknown) => {
    console.error(error);
    window.__done?.({ ok: false, error: error instanceof Error ? `${error.message}\n${error.stack}` : String(error) });
  },
);
