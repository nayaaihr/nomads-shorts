import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signedGetUrl } from "@/lib/r2";

// GET /api/clips/[id]/download → 302 to a short-lived signed R2 URL.
// The URL includes a Content-Disposition-friendly filename hint so the
// browser saves a nice name instead of a UUID.
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: clip } = await supabase
    .from("clips")
    .select("id, title, storage_key, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!clip || clip.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!clip.storage_key) {
    return NextResponse.json({ error: "Clip not ready" }, { status: 409 });
  }

  const url = await signedGetUrl(clip.storage_key, 5 * 60);
  return NextResponse.redirect(url);
}
