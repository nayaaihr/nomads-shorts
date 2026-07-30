import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";

// All temp files for a single video live under one directory so cleanup
// is a single rm -rf.
export function workDir(videoId: string): string {
  return join(tmpdir(), "nomads-shorts", videoId);
}

export async function ensureWorkDir(videoId: string): Promise<string> {
  const dir = workDir(videoId);
  await mkdir(dir, { recursive: true });
  return dir;
}
