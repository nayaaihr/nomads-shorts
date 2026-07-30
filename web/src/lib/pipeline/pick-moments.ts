import { z } from "zod";
import { getAnthropic, MOMENT_PICKER_MODEL } from "@/lib/anthropic";
import type { Transcript } from "./transcript";

// What the model is asked to return, one row per clip. Values in seconds.
const clipSpecSchema = z.object({
  start_seconds: z.number().min(0),
  end_seconds: z.number().min(0),
  title: z.string().min(3).max(120),
  hook: z.string().min(5).max(280),
  virality_score: z.number().int().min(0).max(100),
});

const responseSchema = z.object({
  clips: z.array(clipSpecSchema).min(1).max(15),
});

export type PickedClip = z.infer<typeof clipSpecSchema>;

const SYSTEM_PROMPT = `You are a short-form video editor. You read a transcript of a long-form YouTube video and choose the moments most likely to succeed as standalone vertical shorts (Instagram Reels, YouTube Shorts, TikTok).

CRITERIA for a good clip:
- Prefer 25 to 55 seconds. Never shorter than 20. Never longer than 60.
- Starts with a hook: a surprising claim, a question, a bold statement, or the punchline of a joke — never mid-sentence.
- Ends on a resolution, a payoff, or a natural pause — never mid-sentence.
- Self-contained: the viewer doesn't need to know what came before.
- Has emotional or informational payoff: story beats, useful tips, humor, drama, "wait what" moments.

Avoid (soft — deprioritize but don't refuse):
- Intro / outro segments (channel welcome, subscribe reminders)
- Sponsor reads
- Low-energy filler, "as I was saying earlier..." callbacks

OUTPUT — respond with ONLY valid JSON, no prose, no markdown fences:
{
  "clips": [
    {
      "start_seconds": <number>,
      "end_seconds": <number>,
      "title": "<punchy 3-8 word title>",
      "hook": "<one-sentence pitch of why this clip works>",
      "virality_score": <integer 0-100>
    },
    ...
  ]
}

Pick 3 to 10 clips depending on how much clip-worthy material the transcript contains — quality over quantity. Prefer meaty clips over short punchy ones.`;

// Compresses the transcript into a compact numbered form the model can
// scan quickly. Keeps costs down on long videos.
function formatTranscriptForPrompt(t: Transcript): string {
  const lines: string[] = [];
  lines.push(`Language: ${t.language}`);
  lines.push(`Total duration: ${t.durationSeconds.toFixed(1)}s`);
  lines.push("");
  lines.push("Transcript (start_seconds | text):");
  for (const seg of t.segments) {
    lines.push(`${seg.start.toFixed(1)} | ${seg.text.trim()}`);
  }
  return lines.join("\n");
}

// Snap start/end to transcript segment boundaries. Whisper's segments are
// sentence/phrase-shaped, so snapping to their edges keeps clips from
// starting/stopping mid-word. We use a small tolerance window around the
// model's pick — if a segment edge is within ~5 seconds, snap to it;
// otherwise leave the pick alone.
//
// End times we're willing to EXTEND up to ~6s past the model's pick to
// reach a natural stopping point, since the #1 complaint was clips ending
// mid-sentence. We won't extend past 65s total (soft ceiling above the
// nominal 60s max).
function snapToSegments(
  clip: PickedClip,
  segments: TranscriptSegmentLite[],
): PickedClip {
  const EARLY_START_WINDOW = 5;
  const END_SHRINK_WINDOW = 3;
  const END_EXTEND_WINDOW = 6;
  const HARD_MAX_LEN = 65;

  // Snap start: pick the segment START closest to (but not later than) the
  // model's start, within the window.
  const startCandidate = [...segments]
    .filter(
      (s) =>
        s.start <= clip.start_seconds &&
        clip.start_seconds - s.start <= EARLY_START_WINDOW,
    )
    .sort((a, b) => b.start - a.start)[0];
  const newStart = startCandidate ? startCandidate.start : clip.start_seconds;

  // Snap end: prefer a segment END near the model's end.
  const endCandidates = segments
    .map((s) => s.end)
    .filter(
      (e) =>
        e >= clip.end_seconds - END_SHRINK_WINDOW &&
        e <= clip.end_seconds + END_EXTEND_WINDOW &&
        e - newStart <= HARD_MAX_LEN,
    );
  const newEnd =
    endCandidates.length > 0
      ? // Choose the closest segment end to the model's target.
        endCandidates.sort(
          (a, b) => Math.abs(a - clip.end_seconds) - Math.abs(b - clip.end_seconds),
        )[0]
      : clip.end_seconds;

  return { ...clip, start_seconds: newStart, end_seconds: newEnd };
}

type TranscriptSegmentLite = { start: number; end: number; text?: string };

// Some safety guards on the model's picks: clamp to source duration,
// snap to segment boundaries, enforce min/max length, apply intro/outro
// no-fly zones, drop overlapping duplicates.
function sanitizeClips(
  clips: PickedClip[],
  durationSeconds: number,
  segments: TranscriptSegmentLite[],
): PickedClip[] {
  // Skip the first and last 5% of the video (intro/outro no-fly zones).
  const noFlyStart = durationSeconds * 0.05;
  const noFlyEnd = durationSeconds * 0.95;

  const clean = clips
    .map((c) => ({
      ...c,
      start_seconds: Math.max(0, Math.min(c.start_seconds, durationSeconds - 1)),
      end_seconds: Math.max(0, Math.min(c.end_seconds, durationSeconds)),
    }))
    .filter((c) => c.start_seconds >= noFlyStart && c.end_seconds <= noFlyEnd)
    .map((c) => snapToSegments(c, segments))
    .filter((c) => {
      const len = c.end_seconds - c.start_seconds;
      return len >= 20 && len <= 65;
    })
    .sort((a, b) => a.start_seconds - b.start_seconds);

  // Drop overlaps — if two picks overlap, keep the higher-scoring one.
  const kept: PickedClip[] = [];
  for (const c of clean) {
    const overlap = kept.find(
      (k) => c.start_seconds < k.end_seconds && c.end_seconds > k.start_seconds,
    );
    if (!overlap) {
      kept.push(c);
    } else if (c.virality_score > overlap.virality_score) {
      kept[kept.indexOf(overlap)] = c;
    }
  }
  return kept;
}

export async function pickMoments(transcript: Transcript): Promise<PickedClip[]> {
  const anthropic = getAnthropic();

  const response = await anthropic.messages.create({
    model: MOMENT_PICKER_MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: formatTranscriptForPrompt(transcript) }],
  });

  // Response should be a single text block containing JSON.
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Moment picker: model returned no text");
  }

  // Strip accidental markdown fences if the model adds them despite the
  // system prompt asking otherwise.
  const raw = textBlock.text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `Moment picker: model returned non-JSON. First 200 chars: ${raw.slice(0, 200)}`,
    );
  }

  const validated = responseSchema.parse(parsed);
  return sanitizeClips(
    validated.clips,
    transcript.durationSeconds,
    transcript.segments.map((s) => ({ start: s.start, end: s.end, text: s.text })),
  );
}
