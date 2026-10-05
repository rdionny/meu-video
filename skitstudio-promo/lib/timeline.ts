/* The edit's clock. 120 BPM: one beat = 0.5 s, one bar = 2 s. Every scene
 * starts on a bar so cuts land on the music (see tools/audio/music.py, which
 * is arranged against these same numbers). */

export const FPS = 30;
export const BEAT = 0.5;
export const BAR = 2;
export const DURATION = 72;

export const S = {
  abertura: { start: 0, end: 6 },        // hook + logo (impact at 3.0)
  projeto: { start: 6, end: 12 },        // new project → editor
  design: { start: 12, end: 24 },        // components + properties
  estrutura: { start: 24, end: 30 },     // tree + XML
  logica: { start: 30, end: 38 },        // event + Java
  visao: { start: 38, end: 42 },         // overview montage
  ia: { start: 42, end: 54 },            // Skit AI: model, prompt, edits, diff, compile
  build: { start: 54, end: 58 },         // build screen → install
  resultado: { start: 58, end: 66 },     // the app running
  encerramento: { start: 66, end: 72 },  // words + brand lockup (final hit at 68)
};

/** The phone story (scenes 2–5) is one continuous shot: 6 s → 38 s. */
export const STORY = { start: 6, end: 38 };
