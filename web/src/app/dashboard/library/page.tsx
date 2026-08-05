import { getUserOrRedirect } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/empty-state";
import { LibraryList } from "./library-list";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await getUserOrRedirect();
  const supabase = await createClient();

  const { data: videos } = await supabase
    .from("videos")
    .select("id, title, source_url, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = videos ?? [];

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">My clips</h1>
      <p className="mt-1 text-muted-foreground">
        Every video you&apos;ve submitted and the clips generated from it.
      </p>

      {list.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            variant="video"
            title="No videos yet"
            description="Paste a YouTube URL on the dashboard and your first shorts will appear here in a few minutes."
            cta={{ label: "Create your first clip", href: "/dashboard" }}
          />
        </div>
      ) : (
        <LibraryList initialVideos={list} />
      )}
    </>
  );
}
