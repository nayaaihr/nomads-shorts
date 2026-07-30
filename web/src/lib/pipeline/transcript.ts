// Normalized transcript shape used across the pipeline. We adapt whatever
// the Whisper provider returns into this so the moment picker and the
// caption generator don't have to know about provider quirks.

export type TranscriptWord = {
  start: number;   // seconds
  end: number;
  text: string;
};

export type TranscriptSegment = {
  start: number;   // seconds
  end: number;
  text: string;
  words?: TranscriptWord[];
};

export type Transcript = {
  language: string;         // "en", "hi", etc.
  durationSeconds: number;
  segments: TranscriptSegment[];
};
