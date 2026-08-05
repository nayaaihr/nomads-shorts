import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteObject } from "@/lib/r2";

// DELETE /api/clips/[id]
// Removes one clip row from the DB + its R2 object. Other clips from the
// same video are untouched.
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

  const { data: clip } = await supabase
    .from("clips")
    .select("id, user_id, storage_key")
    .eq("id", id)
    .maybeSingle();
  if (!clip || clip.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("clips").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (clip.storage_key) {
    deleteObject(clip.storage_key).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
