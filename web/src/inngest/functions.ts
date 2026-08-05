import { randomUUID } from "node:crypto";
import { rm, stat } from "node:fs/promises";
import { inngest } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import { downloadYouTube } from "@/lib/pipeline/download";
import { extractAudio, renderVerticalClip } from "@/lib/pipeline/ffmpeg";
import { transcribeFromUrl } from "@/lib/pipeline/transcribe";
import { translateSegmentsToEnglish } from "@/lib/pipeline/translate";
import { pickMoments } from "@/lib/pipeline/pick-moments";
import { workDir } from "@/lib/pipeline/paths";
import { uploadFromPath, signedGetUrl, r2Keys } from "@/lib/r2";

// The top-level pipeline. Each `step.run` boundary is a durable checkpoint:
// if any step fails, Inngest retries from that step, not from scratch.
export const processVideo = inngest.createFunction(
  {
    id: "process-video",
    triggers: [{ event: "video/submitted" }],
    concurrency: { limit: 3 },
  },
  async ({ event, step, logger }) => {
    const { videoId } = event.data as { videoId: string };
    const admin = createAdminClient();

    // Small helper so status transitions are always accompanied by a
    // human-readable message and always write via the service role.
    const setStatus = (status: string, message?: string) =>
      admin
        .from("videos")
        .update({ status, status_message: message ?? null, updated_at: new Date().toISOString() })
        .eq("id", videoId);

    // Load the video row so we have the source URL and user_id.
    const video = await step.run("load-video", async () => {
      const { data, error } = await admin
        .from("videos")
        .select("id, user_id, source_url, youtube_video_id, status")
        .eq("id", videoId)
        .single();
      if (error || !data) throw new Error(`Video not found: ${videoId}`);
      return data;
    });

    // ---------------------------------------------------------------
    // 1. Download source video from YouTube.
    // ---------------------------------------------------------------
    const meta = await step.run("download-source", async () => {
      await setStatus("downloading", "Fetching video from YouTube");
      const dl = await downloadYouTube(videoId, video.source_url);
      await admin
        .from("videos")
        .update({
          title: dl.title,
          duration_seconds: Math.round(dl.durationSeconds),
        })
        .eq("id", videoId);
      return { filePath: dl.filePath, durationSeconds: dl.durationSeconds };
    });

    // Enforce the 30-minute cap here (was advertised on the marketing page).
    if (meta.durationSeconds > 30 * 60 + 10) {
      await setStatus(
        "failed",
        `Video is ${Math.round(meta.durationSeconds / 60)} min — the current limit is 30 min.`,
      );
      throw new Error("Video exceeds 30-min limit");
    }

    // ---------------------------------------------------------------
    // 2. Extract audio + upload to R2 so Replicate can fetch it.
    // ---------------------------------------------------------------
    const audioUrl = await step.run("transcribe-upload-audio", async () => {
      await setStatus("transcribing", "Extracting audio");
      const audioPath = await extractAudio(videoId, meta.filePath);
      const audioKey = r2Keys.audio(videoId);
      await uploadFromPath(audioKey, audioPath, "audio/mp4");
      // Signed URL long enough to outlive Replicate's queue + inference.
      return signedGetUrl(audioKey, 60 * 60);
    });

    // ---------------------------------------------------------------
    // 3. Whisper transcription.
    // ---------------------------------------------------------------
    const rawTranscript = await step.run("transcribe-audio", async () => {
      await setStatus("transcribing", "Transcribing with Whisper");
      const t = await transcribeFromUrl(audioUrl, {
        durationSeconds: meta.durationSeconds,
      });
      return t;
    });

    // Translate to English if needed. No-op for already-English videos.
    // Whichever branch, we persist the final English transcript to the DB.
    const transcript = await step.run("translate-transcript", async () => {
      const isEnglish = rawTranscript.language.toLowerCase().startsWith("en");
      const finalT = isEnglish
        ? rawTranscript
        : (await setStatus(
            "transcribing",
            `Translating from ${rawTranscript.language} to English`,
          ),
          await translateSegmentsToEnglish(rawTranscript));
      await admin
        .from("videos")
        .update({ language: finalT.language, transcript: finalT })
        .eq("id", videoId);
      return finalT;
    });

    // ---------------------------------------------------------------
    // 4. Ask Claude to pick 3-10 clip-worthy moments.
    // ---------------------------------------------------------------
    const picks = await step.run("pick-moments", async () => {
      await setStatus("picking", "AI is choosing the best moments");
      return pickMoments(transcript);
    });

    logger.info(`Picked ${picks.length} clips for video ${videoId}`);

    // ---------------------------------------------------------------
    // 5. Render each pick as a vertical mp4 with captions, upload to R2,
    //    write a clips row.
    // ---------------------------------------------------------------
    // IMPORTANT: setStatus wrapped in step.run so it only executes once.
    // Anything outside step.run re-runs on every Inngest replay, including
    // the replay that runs `cleanup` after `finalize` — which was
    // overwriting the "ready" status back to "clipping" (real bug we hit
    // in production).
    await step.run("mark-clipping", async () => {
      await setStatus("clipping", `Rendering ${picks.length} clip(s)`);
    });
    for (let i = 0; i < picks.length; i++) {
      const pick = picks[i];
      await step.run(`render-clip-${i}`, async () => {
        const clipId = randomUUID();
        const outPath = await renderVerticalClip(
          videoId,
          clipId,
          meta.filePath,
          transcript,
          pick.start_seconds,
          pick.end_seconds,
        );
        const clipKey = r2Keys.clip(videoId, clipId);
        await uploadFromPath(clipKey, outPath, "video/mp4");

        await admin.from("clips").insert({
          id: clipId,
          video_id: videoId,
          user_id: video.user_id,
          ordinal: i,
          title: pick.title,
          hook: pick.hook,
          start_seconds: pick.start_seconds,
          end_seconds: pick.end_seconds,
          virality_score: pick.virality_score,
          storage_key: clipKey,
        });
      });
    }

    // ---------------------------------------------------------------
    // 6. Charge credits (1 per minute of source, rounded up) and finalize.
    // ---------------------------------------------------------------
    await step.run("finalize", async () => {
      const creditsCharged = Math.max(1, Math.ceil(meta.durationSeconds / 60));

      const { data: profile } = await admin
        .from("profiles")
        .select("credits")
        .eq("id", video.user_id)
        .maybeSingle();
      const newBalance = Math.max(0, (profile?.credits ?? 0) - creditsCharged);

      // Mark ready FIRST — this is the visible state the user is polling on.
      // The other two writes are accounting; if they fail we'll see them in
      // the run's error surface and can reconcile after.
      const readyRes = await admin
        .from("videos")
        .update({
          status: "ready",
          status_message: null,
          credits_charged: creditsCharged,
        })
        .eq("id", videoId);
      if (readyRes.error) {
        throw new Error(
          `finalize: failed to mark video ready: ${readyRes.error.message}`,
        );
      }

      const balanceRes = await admin
        .from("profiles")
        .update({ credits: newBalance })
        .eq("id", video.user_id);
      if (balanceRes.error) {
        throw new Error(
          `finalize: failed to deduct credits: ${balanceRes.error.message}`,
        );
      }

      const ledgerRes = await admin.from("credit_ledger").insert({
        user_id: video.user_id,
        amount: -creditsCharged,
        reason: "video_processed",
        video_id: videoId,
        note: "Video processed",
      });
      if (ledgerRes.error) {
        throw new Error(
          `finalize: failed to write ledger row: ${ledgerRes.error.message}`,
        );
      }
    });

    // ---------------------------------------------------------------
    // 7. Clean up local tmp files. Best-effort.
    // ---------------------------------------------------------------
    await step.run("cleanup", async () => {
      try {
        await rm(workDir(videoId), { recursive: true, force: true });
      } catch {
        // Ignore.
      }
    });

    return { ok: true, clips: picks.length };
  },
);
