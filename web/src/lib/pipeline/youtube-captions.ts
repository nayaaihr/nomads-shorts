import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Transcript, TranscriptSegment } from "./transcript";

// Look in the same directory as the downloaded source video for a caption
// file yt-dlp saved. Returns the path and detected language, or null if
// none exists (i.e. YouTube had no captions for this video).
//
// We prefer manual captions ("source.en.vtt") over auto-generated
// ("source.en-orig.vtt"), and English variants over anything else so the
// moment picker gets the highest-quality text.
export async function findCaptionFile(
  videoPath: string,
): Promise<{ path: string; language: string } | null> {
  const dir = dirname(videoPath);
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return null;
  }

  const vttFiles = files.filter((f) => f.startsWith("source.") && f.endsWith(".vtt"));
  if (vttFiles.length === 0) return null;

  // Score each candidate — lower is better.
  const scored = vttFiles.map((f) => {
    const langMatch = f.match(/^source\.([^.]+)\.vtt$/);
    const lang = langMatch?.[1] ?? "und";
    let score = 100;
    // Manual caps don't end in -orig; auto ones typically do.
    const isAuto = /-orig$/.test(lang);
    if (!isAuto) score -= 20;
    if (/^en(?:-|$)/i.test(lang)) score -= 10;
    if (/^hi(?:-|$)/i.test(lang)) score -= 5;
    return { file: f, lang, score };
  });
  scored.sort((a, b) => a.score - b.score);
  const best = scored[0];
  return { path: join(dir, best.file), language: normalizeLang(best.lang) };
}

function normalizeLang(lang: string): string {
  // Strip -orig suffix from auto-captions, and reduce en-US → en, hi-IN → hi.
  const cleaned = lang.replace(/-orig$/, "");
  const short = cleaned.split(/[-_]/)[0].toLowerCase();
  return short || "und";
}

// Parse a WebVTT file into our normalized Transcript shape. Handles both
// YouTube's manual captions (clean, one cue per phrase) and auto-generated
// captions (which often contain overlapping "rolling" text where each new
// cue includes the tail of the previous one plus one new word).
export async function parseVTTFile(
  vttPath: string,
  language: string,
): Promise<Transcript> {
  const raw = await readFile(vttPath, "utf8");
  const cues = parseVTT(raw);
  const segments: TranscriptSegment[] = dedupeRolling(cues).map((c) => ({
    start: c.start,
    end: c.end,
    text: c.text,
  }));
  const durationSeconds = segments.length
    ? segments[segments.length - 1].end
    : 0;
  return { language, durationSeconds, segments };
}

type Cue = { start: number; end: number; text: string };

// Minimal WebVTT parser. Doesn't support cue settings (align, position)
// but reads timestamps + text — which is all we need.
function parseVTT(vtt: string): Cue[] {
  const cues: Cue[] = [];
  const lines = vtt.split(/\r?\n/);
  const timeRe = /^(\d{2}):(\d{2}):(\d{2})[.,](\d{1,3})\s+-->\s+(\d{2}):(\d{2}):(\d{2})[.,](\d{1,3})/;

  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(timeRe);
    if (m) {
      const start = +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000;
      const end = +m[5] * 3600 + +m[6] * 60 + +m[7] + +m[8] / 1000;
      i++;
      const textLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== "") {
        textLines.push(lines[i]);
        i++;
      }
      const text = cleanCaptionText(textLines.join(" "));
      if (text) cues.push({ start, end, text });
    }
    i++;
  }
  return cues;
}

function cleanCaptionText(text: string): string {
  return text
    // Strip inline styling tags <c.colorFFFFFF>, <c>, <00:00:01.500> etc.
    .replace(/<[^>]*>/g, "")
    // Common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

// YouTube's auto-captions often use rolling text: cue N's text is
// "previous phrase + new word", cue N+1 is "previous phrase + new word 2",
// etc. Naive parsing gives massive duplication. This strips the redundant
// prefix from each cue by comparing to the previous.
function dedupeRolling(cues: Cue[]): Cue[] {
  if (cues.length === 0) return cues;
  const out: Cue[] = [];
  let previousText = "";
  for (const c of cues) {
    let text = c.text;
    if (previousText) {
      // Find the longest prefix of `text` that is a suffix of `previousText`.
      // That's the overlap the rolling caption is redisplaying.
      const overlap = longestSuffixMatchingPrefix(previousText, text);
      if (overlap > 0) {
        text = text.slice(overlap).trim();
      }
    }
    if (text) {
      out.push({ start: c.start, end: c.end, text });
    }
    previousText = c.text;
  }
  return out;
}

// Length of the longest suffix of `a` that is also a prefix of `b`.
// Used to detect rolling-caption overlap.
function longestSuffixMatchingPrefix(a: string, b: string): number {
  const maxLen = Math.min(a.length, b.length);
  for (let len = maxLen; len > 0; len--) {
    if (a.slice(a.length - len) === b.slice(0, len)) return len;
  }
  return 0;
}
