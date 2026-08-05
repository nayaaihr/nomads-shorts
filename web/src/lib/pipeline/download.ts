import { join } from "node:path";
import { runCommand } from "./spawn";
import { ensureWorkDir } from "./paths";

// yt-dlp on the user's PATH. Homebrew installs to /opt/homebrew/bin (Apple
// Silicon) or /usr/local/bin (Intel); both should be on PATH for the dev
// server. If not, set NOMADS_YT_DLP_BIN to an absolute path.
const YT_DLP = process.env.NOMADS_YT_DLP_BIN || "yt-dlp";

export type DownloadedVideo = {
  filePath: string;         // local mp4 path
  title: string;
  durationSeconds: number;
  uploader?: string;
};

// Cap to 1080p H.264 mp4. Explicitly prefer H.264 (vcodec^=avc1) over
// newer codecs like AV1 because OpenCV on Debian slim can't decode AV1
// in software fast enough — face detection returns empty frames on AV1
// sources and we lose face-tracked reframing. Fallback formats keep
// H.264 too where possible, then any 1080p as last resort.
const FORMAT = [
  "bestvideo[height<=1080][vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]",
  "bestvideo[height<=1080][vcodec^=avc1]+bestaudio",
  "best[height<=1080][vcodec^=avc1]",
  "best[height<=1080][ext=mp4]",
  "best[height<=1080]",
].join("/");

export async function downloadYouTube(
  videoId: string,        // OUR video id, used to namespace the tmp dir
  youtubeUrl: string,
): Promise<DownloadedVideo> {
  const dir = await ensureWorkDir(videoId);
  const outPath = join(dir, "source.%(ext)s");

  const { stdout } = await runCommand(YT_DLP, [
    "-f", FORMAT,
    "--merge-output-format", "mp4",
    "--no-playlist",
    "--restrict-filenames",
    "--no-progress",
    // Also fetch subtitles when available. Manual subs preferred over
    // auto-generated. If we get any, we can skip the Whisper transcription
    // call entirely — big cost savings.
    //
    // Only request English variants. Hindi subs were causing HTTP 429
    // rate-limit errors from YouTube. Hindi source videos will fall
    // through to Whisper via the /get-transcript step, which already
    // handles that path.
    //
    // --no-abort-on-error keeps the video download alive even if any
    // sub-language 4xx's (transient rate-limiting, etc.).
    "--write-subs",
    "--write-auto-subs",
    "--sub-langs", "en.*,en",
    "--sub-format", "vtt/best",
    "--convert-subs", "vtt",
    "--no-abort-on-error",
    "--print", "after_move:%(filepath)s\t%(title)s\t%(duration)s\t%(uploader)s",
    "-o", outPath,
    youtubeUrl,
  ]);

  // The --print line is what we parse. It's tab-delimited so titles with
  // whitespace survive intact.
  const line = stdout.split("\n").reverse().find((l) => l.includes("\t"));
  if (!line) {
    throw new Error("yt-dlp: could not parse output metadata");
  }
  const [filePath, title, durationStr, uploader] = line.split("\t");
  const durationSeconds = Number(durationStr);
  if (!filePath || !Number.isFinite(durationSeconds)) {
    throw new Error(`yt-dlp: malformed metadata line: ${line}`);
  }

  return {
    filePath,
    title: title?.trim() || "Untitled",
    durationSeconds,
    uploader: uploader?.trim() || undefined,
  };
}
