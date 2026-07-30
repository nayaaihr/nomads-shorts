import { writeFile } from "node:fs/promises";
import type { Transcript, TranscriptSegment, TranscriptWord } from "./transcript";

// Generate an ASS subtitle file, styled for TikTok/Reels — big, bold,
// bottom-center with a thick outline for readability over any background.
// We slice the transcript to just the [start, end] window of the clip,
// then rebase timestamps to start at 0.

const HEADER = (widthPx: number, heightPx: number) => `[Script Info]
ScriptType: v4.00+
PlayResX: ${widthPx}
PlayResY: ${heightPx}
ScaledBorderAndShadow: yes
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Inter,72,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,6,2,2,60,60,240,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

function fmtTime(seconds: number): string {
  // ASS uses H:MM:SS.cs (centiseconds).
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const secWhole = Math.floor(sec);
  const cs = Math.round((sec - secWhole) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(secWhole).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function assEscape(text: string): string {
  // Escape braces (special to ASS) and normalize whitespace.
  return text
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Chunk a segment's words into readable caption lines (~3-6 words each).
// If the segment has no word timings, fall back to the segment as one line.
function segmentToLines(
  seg: TranscriptSegment,
): Array<{ start: number; end: number; text: string }> {
  const words = seg.words ?? [];
  if (words.length === 0) {
    return [{ start: seg.start, end: seg.end, text: seg.text }];
  }

  const lines: Array<{ start: number; end: number; text: string }> = [];
  const CHUNK = 5;
  for (let i = 0; i < words.length; i += CHUNK) {
    const group = words.slice(i, i + CHUNK);
    lines.push({
      start: group[0].start,
      end: group[group.length - 1].end,
      text: group.map((w) => w.text).join(" "),
    });
  }
  return lines;
}

export async function writeAssForRange(
  transcript: Transcript,
  clipStart: number,
  clipEnd: number,
  outPath: string,
  canvas = { width: 1080, height: 1920 },
): Promise<void> {
  // Segments that overlap the clip window.
  const overlapping = transcript.segments.filter(
    (s) => s.end > clipStart && s.start < clipEnd,
  );

  const events: string[] = [];
  for (const seg of overlapping) {
    for (const line of segmentToLines(seg)) {
      const s = Math.max(line.start, clipStart) - clipStart;
      const e = Math.min(line.end, clipEnd) - clipStart;
      if (e - s < 0.05) continue;
      events.push(
        `Dialogue: 0,${fmtTime(s)},${fmtTime(e)},Default,,0,0,0,,${assEscape(line.text)}`,
      );
    }
  }

  const content = HEADER(canvas.width, canvas.height) + events.join("\n") + "\n";
  await writeFile(outPath, content, "utf8");
}
