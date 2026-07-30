import Link from "next/link";
import { getUserOrRedirect } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { NewClipForm } from "./new-clip-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MonitorPlay } from "lucide-react";

export default async function DashboardHome() {
  const user = await getUserOrRedirect();
  const supabase = await createClient();

  const [{ data: profile }, { data: recentVideos }] = await Promise.all([
    supabase.from("profiles").select("credits").eq("id", user.id).maybeSingle(),
    supabase
      .from("videos")
      .select("id, title, source_url, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const credits = profile?.credits ?? 0;

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create a new clip
        </h1>
        <Badge variant="secondary">
          <Sparkles className="size-3.5 mr-1" />
          {credits} credits
        </Badge>
      </div>
      <p className="mt-1 text-muted-foreground">
        Paste a YouTube URL. We&apos;ll pick the best moments and export them as
        vertical shorts with captions.
      </p>

      <div className="mt-8">
        <NewClipForm credits={credits} />
      </div>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Recent videos</h2>
          <Link
            href="/dashboard/library"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all →
          </Link>
        </div>

        {(!recentVideos || recentVideos.length === 0) ? (
          <Card className="mt-4 border-dashed">
            <CardContent className="py-12 text-center">
              <MonitorPlay className="size-8 mx-auto text-muted-foreground" />
              <p className="mt-3 font-medium">No videos yet</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your first submission will show up here. Processing takes a few
                minutes per video.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-3">
            {recentVideos.map((v) => (
              <Card key={v.id}>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {v.title ?? v.source_url}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(v.created_at).toLocaleString()}
                    </p>
                  </div>
                  <VideoStatusBadge status={v.status} />
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function VideoStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    queued:        { label: "Queued",        variant: "secondary" },
    downloading:   { label: "Downloading",   variant: "secondary" },
    transcribing:  { label: "Transcribing",  variant: "secondary" },
    picking:       { label: "Picking moments", variant: "secondary" },
    clipping:      { label: "Clipping",      variant: "secondary" },
    ready:         { label: "Ready",         variant: "default" },
    failed:        { label: "Failed",        variant: "destructive" },
  };
  const info = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}
