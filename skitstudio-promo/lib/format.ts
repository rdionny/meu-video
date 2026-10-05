/* The two deliveries share one composition: 16:9 for YouTube and 9:16 for
 * Shorts/Reels/TikTok. Everything that depends on the frame asks the format. */

export type Format = { id: "h" | "v"; w: number; h: number; v: boolean };

export const FH: Format = { id: "h", w: 1920, h: 1080, v: false };
export const FV: Format = { id: "v", w: 1080, h: 1920, v: true };

export function pick<T>(f: Format, h: T, v: T): T {
  return f.v ? v : h;
}

export function center(f: Format): [number, number] {
  return [f.w / 2, f.h / 2];
}

/** Where the phone rests, and the default spot the camera brings details to. */
export function stagePlan(f: Format) {
  return f.v
    ? { phone: { cx: 540, cy: 1235 }, focus: [540, 1250] as [number, number] }
    : { phone: { cx: 1250, cy: 540 }, focus: [1290, 560] as [number, number] };
}
