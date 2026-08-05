import Link from "next/link";
import { getUserOrRedirect } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Video } from "lucide-react";
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
        <Card className="mt-8 border-dashed">
          <CardContent className="py-16 text-center">
            <Video className="size-8 mx-auto text-muted-foreground" />
            <p className="mt-3 font-medium">Nothing here yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Submit a YouTube URL from the dashboard to generate your first
              shorts.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-sm font-medium underline underline-offset-2"
            >
              Create your first clip →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <LibraryList initialVideos={list} />
      )}
    </>
  );
}
