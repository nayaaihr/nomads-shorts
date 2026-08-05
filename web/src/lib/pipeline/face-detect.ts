import { join } from "node:path";
import { runCommand } from "./spawn";

const PYTHON = process.env.NOMADS_PYTHON_BIN || "python3";

// The Python script lives at repo path web/scripts/face-detect.py. In the
// Fly Docker image it's copied to /app/scripts/face-detect.py.
const SCRIPT_PATH = process.env.NOMADS_FACEDETECT_SCRIPT
  || join(process.cwd(), "scripts", "face-detect.py");

export type FaceSample = {
  t: number;
  w: number;  // source frame width in pixels
  h: number;  // source frame height in pixels
  faces: Array<{ x: number; y: number; w: number; h: number }>;
};

// Ask OpenCV to look at N frames of a video and report where faces are.
// Returns [] on any failure (OpenCV not installed, video unreadable,
// script missing) so callers can gracefully fall back to a static crop.
export async function detectFacesAt(
  videoPath: string,
  timestamps: number[],
): Promise<FaceSample[]> {
  try {
    const args = [SCRIPT_PATH, videoPath, ...timestamps.map((t) => t.toFixed(3))];
    const { stdout, stderr } = await runCommand(PYTHON, args);
    if (stderr && stderr.trim()) {
      // Python writes fallback reasons to stderr — surface them so we
      // can see them in fly logs and diagnose why face detection missed.
      console.warn(`[face-detect stderr] ${stderr.trim()}`);
    }
    return JSON.parse(stdout);
  } catch (err) {
    console.warn(`[face-detect error] ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
}

// From face-position samples across a clip, compute the best static
// horizontal x-offset for a 9:16 crop of a landscape source. Weighted
// average of face centers (bigger face = more weight — that's usually
// the main speaker rather than someone in the background).
//
// Returns null if no faces were found in any sample; caller should fall
// back to a centered crop.
export function computeCropOffsetX(
  samples: FaceSample[],
  cropWidth: number,
  sourceWidth: number,
): number | null {
  const centers: Array<{ x: number; weight: number }> = [];
  for (const s of samples) {
    if (!s.faces.length) continue;
    // Pick the largest face in this frame (assumed to be the speaker).
    const largest = [...s.faces].sort((a, b) => b.w * b.h - a.w * a.h)[0];
    centers.push({
      x: largest.x + largest.w / 2,
      weight: largest.w * largest.h,
    });
  }
  if (centers.length === 0) return null;

  const totalWeight = centers.reduce((sum, c) => sum + c.weight, 0);
  const weightedX =
    centers.reduce((sum, c) => sum + c.x * c.weight, 0) / totalWeight;

  // Clamp the crop x so the crop window stays inside the source frame.
  const desiredLeft = weightedX - cropWidth / 2;
  const minX = 0;
  const maxX = Math.max(0, sourceWidth - cropWidth);
  return Math.max(minX, Math.min(maxX, desiredLeft));
}

// Convenience: pick timestamps evenly spaced across a clip window.
export function samplingTimestamps(
  startSeconds: number,
  endSeconds: number,
  count = 5,
): number[] {
  const duration = endSeconds - startSeconds;
  if (duration <= 0 || count < 1) return [startSeconds];
  const step = duration / (count - 1 || 1);
  return Array.from({ length: count }, (_, i) => startSeconds + i * step);
}
