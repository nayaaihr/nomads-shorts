import { notFound } from "next/navigation";
import { getUserOrRedirect } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { LiveVideoDetail } from "./live-detail";

// Server component does the initial fetch + auth check. The client
// component then takes over for polling and interactivity (delete, video
// player). No more hard-reload refresher.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VideoDetailPage(
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const user = await getUserOrRedirect();
  const supabase = await createClient();

  const { data: video } = await supabase
    .from("videos")
    .select(
      "id, title, status, status_message, duration_seconds, source_url",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!video) notFound();

  const { data: clips } = await supabase
    .from("clips")
    .select(
      "id, title, hook, start_seconds, end_seconds, virality_score, storage_key, ordinal",
    )
    .eq("video_id", id)
    .order("ordinal");

  return <LiveVideoDetail initialVideo={video} initialClips={clips ?? []} />;
}
