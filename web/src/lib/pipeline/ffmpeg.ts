import { join } from "node:path";
import { unlink } from "node:fs/promises";
import { runCommand } from "./spawn";
import { workDir } from "./paths";
import { writeAssForRange } from "./captions";
import type { Transcript } from "./transcript";

const FFMPEG = process.env.NOMADS_FFMPEG_BIN || "ffmpeg";

// Caption timing has been unreliable — the Whisper→translate→ffmpeg chain
// drifts and captions appear before the corresponding audio. Disabled by
// default until we can trust the timing end-to-end. Set NOMADS_CAPTIONS=on
// to re-enable while debugging.
const CAPTIONS_ENABLED = process.env.NOMADS_CAPTIONS === "on";

// Extract audio-only from the source video, mono, downsampled to 16 kHz —
// smaller upload to Replicate, still perfect for Whisper.
export async function extractAudio(
  videoId: string,
  sourcePath: string,
): Promise<string> {
  const outPath = join(workDir(videoId), "audio.m4a");
  await runCommand(FFMPEG, [
    "-y",
    "-i", sourcePath,
    "-vn",
    "-ac", "1",
    "-ar", "16000",
    "-c:a", "aac",
    "-b:a", "64k",
    outPath,
  ]);
  return outPath;
}

// Cut [start, end] from the source, crop to a centered 9:16 window,
// scale to 1080x1920, burn in styled captions from the transcript.
//
// Reframe strategy: center crop. Simple, no external model, works well
// for talking-head content where the speaker sits center-frame. A real
// face-tracked crop is a later upgrade (probably OpenCV + a smoothing
// filter over face bboxes).
export async function renderVerticalClip(
  videoId: string,
  clipId: string,
  sourcePath: string,
  transcript: Transcript,
  startSeconds: number,
  endSeconds: number,
): Promise<string> {
  const dir = workDir(videoId);
  const assPath = join(dir, `clip-${clipId}.ass`);
  const outPath = join(dir, `clip-${clipId}.mp4`);

  if (CAPTIONS_ENABLED) {
    await writeAssForRange(transcript, startSeconds, endSeconds, assPath);
  }
  // Silence unused-arg lint when captions off.
  void transcript;

  // -ss BEFORE -i: fast seek (keyframe granularity), then -ss AFTER -i is
  // dropped in favor of frame-accurate copy via re-encode. We're
  // re-encoding anyway (crop + captions) so accuracy is preserved.
  //
  // Filter chain:
  //   crop = ih*9/16 : ih         → center-crop to 9:16
  //   scale = 1080:1920           → normalize to output resolution
  //   ass = <file>                → burn subtitles
  const duration = endSeconds - startSeconds;
  // Center crop to 9:16, then scale to 1080x1920, then burn captions.
  // No commas inside any single filter expression (ffmpeg's filter graph
  // parser treats top-level commas as filter separators, so a comma inside
  // a crop expression would break the chain).
  //
  // Tradeoff: source content at the far left/right of the frame (including
  // burned-in text/graphics near the edges) gets cropped off. This is the
  // expected behavior for "fill the frame" mode.
  const filterSteps = [
    "crop=ih*9/16:ih:(iw-ih*9/16)/2:0",
    "scale=1080:1920",
  ];
  if (CAPTIONS_ENABLED) {
    filterSteps.push(`ass=${escapeForFilter(assPath)}`);
  }
  const filter = filterSteps.join(",");

  // Two-stage seek: cheap fast-seek to ~5s before the target (jumps by
  // keyframe), then frame-accurate seek within the input to the exact
  // startSeconds. This is much faster than pure `-ss` after `-i` on long
  // sources, but still frame-accurate — which matters because caption
  // timings are anchored to source-time seconds. Fast seek alone can drift
  // by several frames, which is exactly the "captions appear before the
  // dialogue" symptom.
  const preRoll = Math.min(startSeconds, 5);
  await runCommand(FFMPEG, [
    "-y",
    "-ss", Math.max(0, startSeconds - preRoll).toFixed(3),
    "-i", sourcePath,
    "-ss", preRoll.toFixed(3),
    "-t", duration.toFixed(3),
    "-vf", filter,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "20",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    outPath,
  ]);

  // Clean up the .ass file if we wrote one.
  if (CAPTIONS_ENABLED) {
    await unlink(assPath).catch(() => {});
  }
  return outPath;
}

// ffmpeg filter arg is a comma-and-colon-delimited string. Colons in file
// paths break it, so escape them (and single quotes) per ffmpeg's rules.
function escapeForFilter(path: string): string {
  return path
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'");
}
