import { spawn } from "node:child_process";

// Thin wrapper around child_process.spawn that captures stdout/stderr,
// rejects on non-zero exit, and surfaces the tool's own error output.
export function runCommand(
  cmd: string,
  args: string[],
  opts: { cwd?: string; onStderr?: (line: string) => void } = {},
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: opts.cwd });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      const s = chunk.toString();
      stderr += s;
      if (opts.onStderr) {
        for (const line of s.split(/\r?\n/)) if (line) opts.onStderr(line);
      }
    });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        // The useful error from ffmpeg/yt-dlp is always at the END of
        // stderr, not the beginning — take the tail.
        const raw = stderr.trim() || stdout.trim() || `exit ${code}`;
        const tail = raw.length > 3000 ? "…" + raw.slice(-3000) : raw;
        reject(new Error(`${cmd} exited ${code}: ${tail}`));
      }
    });
  });
}
