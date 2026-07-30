import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { inngest } from "@/inngest/client";

// POST /api/videos — user submits a YouTube URL. In Phase 0 we just persist
// the intent; Phase 1 will enqueue the actual video pipeline (Inngest job
// that runs yt-dlp → Whisper → Claude → ffmpeg on the worker).
const bodySchema = z.object({
  url: z.string().url(),
});

const YT_HOSTS = new Set(["youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com"]);

function parseYouTubeId(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (!YT_HOSTS.has(u.hostname)) return null;
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.pathname === "/watch") return u.searchParams.get("v");
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "shorts" || parts[0] === "live") return parts[1] ?? null;
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const youtubeId = parseYouTubeId(parsed.data.url);
  if (!youtubeId) {
    return NextResponse.json(
      { error: "That URL doesn't look like a YouTube video." },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.credits <= 0) {
    return NextResponse.json(
      { error: "Out of credits. Top up to continue." },
      { status: 402 },
    );
  }

  const { data: video, error } = await supabase
    .from("videos")
    .insert({
      user_id: user.id,
      source_url: parsed.data.url,
      source_kind: "youtube_public",
      youtube_video_id: youtubeId,
      status: "queued",
    })
    .select("id")
    .single();

  if (error || !video) {
    return NextResponse.json({ error: error?.message ?? "DB insert failed" }, { status: 500 });
  }

  await inngest.send({
    name: "video/submitted",
    data: { videoId: video.id },
  });

  return NextResponse.json({ videoId: video.id });
}
