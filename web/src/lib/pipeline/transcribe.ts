import { getReplicate } from "@/lib/replicate";
import type { Transcript, TranscriptSegment } from "./transcript";

// We use `victor-upmeet/whisperx` on Replicate:
//  - Whisper large-v3 quality (excellent English + Hindi)
//  - Word-level alignment (needed for karaoke-style captions later)
//  - Language auto-detect
// Pin the version so behavior doesn't drift under us.
const WHISPERX_VERSION =
  "victor-upmeet/whisperx:84d2ad2d6194fe98a17d2b60bef1c7f910c46b2f6fd38996ca457afd9c8abfcb";

type WhisperXSegment = {
  start: number;
  end: number;
  text: string;
  words?: Array<{ start?: number; end?: number; word: string; score?: number }>;
};

type WhisperXOutput = {
  detected_language?: string;
  language?: string;
  segments: WhisperXSegment[];
};

// Transcribe audio at a public URL. The URL should be reachable by
// Replicate's servers (i.e. a signed R2 URL, not a localhost URL).
//
// WhisperX transcribes in the source language. A later pipeline step
// (translateSegmentsToEnglish) runs the result through Claude if the
// detected language isn't English. See src/lib/pipeline/translate.ts.
export async function transcribeFromUrl(
  audioUrl: string,
  opts: { hintLanguage?: string; durationSeconds: number } = { durationSeconds: 0 },
): Promise<Transcript> {
  const replicate = getReplicate();

  const output = (await replicate.run(WHISPERX_VERSION, {
    input: {
      audio_file: audioUrl,
      language: opts.hintLanguage ?? undefined,
      align_output: true,
      batch_size: 32,
      diarization: false,
    },
  })) as WhisperXOutput;

  const segments: TranscriptSegment[] = (output.segments ?? []).map((s) => ({
    start: Number(s.start ?? 0),
    end: Number(s.end ?? 0),
    text: String(s.text ?? "").trim(),
    words: (s.words ?? [])
      .filter((w) => w.word && w.start != null && w.end != null)
      .map((w) => ({
        start: Number(w.start),
        end: Number(w.end),
        text: String(w.word).trim(),
      })),
  }));

  return {
    language: output.detected_language ?? output.language ?? opts.hintLanguage ?? "en",
    durationSeconds:
      opts.durationSeconds ||
      (segments.length ? segments[segments.length - 1].end : 0),
    segments,
  };
}
