import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteObject, r2Keys } from "@/lib/r2";

// DELETE /api/videos/[id]
// Removes the video record, cascades to clips (FK ON DELETE CASCADE), and
// best-effort cleans R2 objects (source, audio, per-clip mp4s).
//
// Best-effort R2 cleanup: if any object delete fails (network hiccup,
// already gone), we don't roll back the DB delete. Orphan R2 objects
// eventually cost pennies at worst.
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership before touching anything.
  const { data: video } = await supabase
    .from("videos")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();
  if (!video || video.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Collect all clip storage keys BEFORE the cascade delete.
  const { data: clips } = await supabase
    .from("clips")
    .select("id, storage_key")
    .eq("video_id", id);

  const admin = createAdminClient();
  const { error } = await admin.from("videos").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fire-and-forget R2 cleanup — don't block the response on it.
  Promise.all([
    deleteObject(r2Keys.source(id)).catch(() => {}),
    deleteObject(r2Keys.audio(id)).catch(() => {}),
    ...(clips ?? []).map((c) =>
      c.storage_key ? deleteObject(c.storage_key).catch(() => {}) : null,
    ),
  ]).catch(() => {});

  return NextResponse.json({ ok: true });
}
