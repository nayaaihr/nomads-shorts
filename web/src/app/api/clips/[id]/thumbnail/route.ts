import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signedGetUrl } from "@/lib/r2";

// GET /api/clips/[id]/thumbnail
// Redirects to a signed R2 URL for the JPG. Used as `<video poster=...>`
// so the clip card can show a still image without pulling the mp4 on
// page load. Cached for a while since thumbnails never change.
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: clip } = await supabase
    .from("clips")
    .select("id, user_id, thumbnail_key")
    .eq("id", id)
    .maybeSingle();
  if (!clip || clip.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!clip.thumbnail_key) {
    return NextResponse.json({ error: "No thumbnail" }, { status: 404 });
  }

  const url = await signedGetUrl(clip.thumbnail_key, 60 * 60);
  return NextResponse.redirect(url);
}
