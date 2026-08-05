import { join } from "node:path";
import { unlink } from "node:fs/promises";
import { runCommand } from "./spawn";
import { workDir } from "./paths";
import { writeAssForRange } from "./captions";
import {
  detectFacesAt,
  computeCropOffsetX,
  samplingTimestamps,
} from "./face-detect";
import type { Transcript } from "./transcript";

const FFMPEG = process.env.NOMADS_FFMPEG_BIN || "ffmpeg";

// Caption timing has been unreliable — the Whisper→translate→ffmpeg chain
// drifts and captions appear before the corresponding audio. Disabled by
// default until we can trust the timing end-to-end. Set NOMADS_CAPTIONS=on
// to re-enable while debugging.
const CAPTIONS_ENABLED = process.env.NOMADS_CAPTIONS === "on";

// Extract a poster JPG from the middle of a rendered vertical clip.
// Used as the <video poster> so the clip card shows a still without
// pulling the whole mp4 on page load. Small (JPEG q=3, ~540x960 max).
export async function extractClipThumbnail(
  videoId: string,
  clipId: string,
  clipPath: string,
  clipDurationSeconds: number,
): Promise<string> {
  const outPath = join(workDir(videoId), `clip-${clipId}.jpg`);
  const middle = Math.max(0.1, clipDurationSeconds / 2);
  await runCommand(FFMPEG, [
    "-y",
    "-ss", middle.toFixed(3),
    "-i", clipPath,
    "-frames:v", "1",
    "-vf", "scale=540:-2",
    "-q:v", "3",
    outPath,
  ]);
  return outPath;
}

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

// Cut [start, end] from the source, crop to a 9:16 window centered on the
// detected speaker (falls back to center if no face detected), scale to
// 1080x1920, optionally burn captions.
//
// Reframe strategy: static per-clip face-tracked crop.
//   1. Sample ~5 frames from the clip window via OpenCV
//   2. Take the weighted average x-position of the largest face per sample
//   3. Use that as the crop's horizontal offset (clamped to source bounds)
//   4. If no faces detected → fall back to center crop
//
// Cost: ~0.5–2 seconds of face detection per clip, up front. Meaningfully
// better framing on any talking-head content.
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

  // Face detection — sample 5 evenly-spaced frames in the clip window.
  const samples = await detectFacesAt(
    sourcePath,
    samplingTimestamps(startSeconds, endSeconds, 5),
  );

  // Compute per-clip crop parameters. If OpenCV came back empty (no faces,
  // or opencv-python not installed) we fall back to the ffmpeg expression
  // that centers within iw at render time.
  let cropExpr = "crop=ih*9/16:ih:(iw-ih*9/16)/2:0";
  const firstWithDims = samples.find((s) => s.w > 0 && s.h > 0);
  if (firstWithDims) {
    const sourceW = firstWithDims.w;
    const sourceH = firstWithDims.h;
    const cropW = Math.round(sourceH * 9 / 16);
    const offsetX = computeCropOffsetX(samples, cropW, sourceW);
    if (offsetX !== null) {
      cropExpr = `crop=${cropW}:${sourceH}:${Math.round(offsetX)}:0`;
    }
  }

  const filterSteps = [
    cropExpr,
    "scale=1080:1920",
  ];
  if (CAPTIONS_ENABLED) {
    filterSteps.push(`ass=${escapeForFilter(assPath)}`);
  }
  const filter = filterSteps.join(",");
  const duration = endSeconds - startSeconds;

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
