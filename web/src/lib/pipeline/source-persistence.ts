import { access, mkdir, writeFile } from "node:fs/promises";
import { constants as FS } from "node:fs";
import { dirname, join } from "node:path";
import { getR2, r2Keys, uploadFromPath } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";
import { workDir } from "./paths";

// Fly's local disk is ephemeral — a deploy or crash wipes /tmp. That
// used to kill in-flight jobs at the render step ("source.mp4: No such
// file or directory"). To make the pipeline survive restarts we mirror
// the downloaded source video to R2 once, then restore it on demand.
//
// Cost: one extra ~200-500 MB upload per video (fast, Fly ↔ R2 both in
// US), and one extra download per machine restart (rare). Big reliability
// win, small bandwidth cost.

export function localSourcePath(videoId: string): string {
  return join(workDir(videoId), "source.mp4");
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, FS.R_OK);
    return true;
  } catch {
    return false;
  }
}

// Called by download-source right after yt-dlp finishes.
export async function persistSourceToR2(
  videoId: string,
  localPath: string,
): Promise<void> {
  await uploadFromPath(r2Keys.source(videoId), localPath, "video/mp4");
}

// Called by every subsequent step that needs the source file locally.
// Fast-path: file already exists on this machine's /tmp → do nothing.
// Slow-path: file missing → stream from R2 back to /tmp.
export async function ensureSourceLocal(videoId: string): Promise<string> {
  const path = localSourcePath(videoId);
  if (await fileExists(path)) return path;

  await mkdir(dirname(path), { recursive: true });
  const r2 = getR2();
  const res = await r2.send(
    new GetObjectCommand({
      Bucket: env.r2.bucket(),
      Key: r2Keys.source(videoId),
    }),
  );
  if (!res.Body) throw new Error(`R2: no body for source ${videoId}`);
  // Stream body → buffer → write. For our max 30-min 1080p videos
  // (~500 MB uncompressed) this fits in memory on shared-cpu-4x's 4 GB.
  // Streaming to disk would be more memory-efficient but adds complexity;
  // upgrade if we ever process bigger sources.
  const buf = Buffer.from(await res.Body.transformToByteArray());
  await writeFile(path, buf);
  return path;
}
