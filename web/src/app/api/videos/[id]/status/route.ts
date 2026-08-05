import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/videos/[id]/status
// Lightweight polling endpoint used by the video detail page to update
// UI state without a full page reload. Returns just the video's live
// status + its clips.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: video } = await supabase
    .from("videos")
    .select("id, title, status, status_message, duration_seconds, source_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: clips } = await supabase
    .from("clips")
    .select("id, title, hook, start_seconds, end_seconds, virality_score, storage_key, thumbnail_key, ordinal")
    .eq("video_id", id)
    .order("ordinal");

  return NextResponse.json(
    { video, clips: clips ?? [] },
    {
      headers: {
        // Never cache — always fresh.
        "cache-control": "no-store, max-age=0",
      },
    },
  );
}
