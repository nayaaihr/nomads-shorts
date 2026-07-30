import { getAnthropic, MOMENT_PICKER_MODEL } from "@/lib/anthropic";
import type { Transcript, TranscriptSegment } from "./transcript";

// WhisperX doesn't support the `task: "translate"` param that vanilla
// Whisper has. So after transcribing in the source language, if it's not
// already English we send the segments to Claude Haiku for translation.
// Fast (~2s per 100 segments) and preserves segment timing.

const SYSTEM = `You translate transcript segments to natural, spoken English.

Rules:
- Preserve meaning; keep it conversational, not literal.
- One output per input, in the same order.
- Don't merge, split, add, or remove segments.
- Keep segments similar in length so on-screen timing feels right.
- Return ONLY valid JSON, no prose, no markdown fences.

Input shape:
  { "segments": [{ "i": <index>, "text": "<original>" }] }

Output shape (same indices, same order):
  { "segments": [{ "i": <index>, "text": "<english>" }] }`;

type BatchIn = { segments: Array<{ i: number; text: string }> };
type BatchOut = { segments: Array<{ i: number; text: string }> };

// Claude has plenty of context; a single-batch translation is simplest.
// For very long videos (>~500 segments) chunking would be safer, but
// we cap source at 30 min so ~300 segments max.
export async function translateSegmentsToEnglish(
  transcript: Transcript,
): Promise<Transcript> {
  if (transcript.language.toLowerCase().startsWith("en")) {
    return transcript;
  }

  const anthropic = getAnthropic();
  const batch: BatchIn = {
    segments: transcript.segments.map((s, i) => ({ i, text: s.text })),
  };

  const response = await anthropic.messages.create({
    model: MOMENT_PICKER_MODEL,
    max_tokens: 8192,
    system: SYSTEM,
    messages: [{ role: "user", content: JSON.stringify(batch) }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Translator: model returned no text");
  }

  const raw = textBlock.text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  let parsed: BatchOut;
  try {
    parsed = JSON.parse(raw) as BatchOut;
  } catch {
    throw new Error(`Translator: non-JSON response. First 200 chars: ${raw.slice(0, 200)}`);
  }

  // Index-align the translations back onto the original segments so
  // timings and words stay intact.
  const translated = new Map<number, string>();
  for (const s of parsed.segments ?? []) {
    if (typeof s.i === "number" && typeof s.text === "string") {
      translated.set(s.i, s.text);
    }
  }

  const newSegments: TranscriptSegment[] = transcript.segments.map((seg, i) => ({
    ...seg,
    text: translated.get(i) ?? seg.text,
    // The original-language word timings don't map to English words; drop
    // them so caption chunking falls back to segment-level text.
    words: undefined,
  }));

  return {
    ...transcript,
    language: "en",
    segments: newSegments,
  };
}
