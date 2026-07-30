import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserOrRedirect } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { VideoStatusRefresher } from "./refresher";

// Force this route to render dynamically on every request so the auto-
// refresher can pick up status changes from the background pipeline.
// Without this, Next.js may serve a cached render even after router.refresh().
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
    .select("id, title, source_url, status, status_message, created_at, duration_seconds")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!video) notFound();

  const { data: clips } = await supabase
    .from("clips")
    .select("id, title, hook, start_seconds, end_seconds, virality_score, storage_key")
    .eq("video_id", id)
    .order("ordinal");

  const isProcessing = video.status !== "ready" && video.status !== "failed";

  return (
    <>
      <VideoStatusRefresher status={video.status} />
      <Link
        href="/dashboard/library"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to library
      </Link>

      <div className="mt-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight truncate">
          {video.title ?? video.source_url}
        </h1>
        <Badge variant={video.status === "ready" ? "default" : "secondary"}>
          {video.status}
        </Badge>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Submitted {new Date(video.created_at).toLocaleString()}
      </p>

      {isProcessing && (
        <Card className="mt-6">
          <CardContent className="py-8 text-center">
            <Loader2 className="size-6 mx-auto animate-spin text-muted-foreground" />
            <p className="mt-3 font-medium">Working on it…</p>
            <p className="text-sm text-muted-foreground">
              {video.status_message ?? "This can take 5–10 minutes for a 30-min source."}
            </p>
          </CardContent>
        </Card>
      )}

      {(!clips || clips.length === 0) && video.status === "ready" && (
        <Card className="mt-6">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            The AI didn&apos;t find any clip-worthy moments in this video.
          </CardContent>
        </Card>
      )}

      {clips && clips.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clips.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {c.title ?? "Untitled clip"}
                </CardTitle>
                {c.hook && (
                  <p className="text-sm text-muted-foreground">{c.hook}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {formatSec(c.start_seconds)} → {formatSec(c.end_seconds)} ·{" "}
                  {(c.end_seconds - c.start_seconds).toFixed(0)}s
                </div>
                {c.storage_key && (
                  <a
                    href={`/api/clips/${c.id}/download`}
                    className="mt-3 inline-block text-sm font-medium underline underline-offset-2"
                  >
                    Download MP4
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function formatSec(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
