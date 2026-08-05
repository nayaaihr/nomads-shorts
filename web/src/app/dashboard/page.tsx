import Link from "next/link";
import { getUserOrRedirect } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { NewClipForm } from "./new-clip-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Film,
  Coins,
  Video as VideoIcon,
  ArrowUpRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const user = await getUserOrRedirect();
  const supabase = await createClient();

  // Batch all reads in parallel.
  const [
    { data: profile },
    { data: recentVideos },
    { count: videoCount },
    { count: clipCount },
  ] = await Promise.all([
    supabase.from("profiles").select("credits, full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("videos")
      .select("id, title, source_url, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("videos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("clips")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const credits = profile?.credits ?? 0;
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const isFirstTime = (videoCount ?? 0) === 0;

  return (
    <>
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isFirstTime ? `Welcome, ${firstName}` : `Hey ${firstName}`}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isFirstTime
              ? "Paste your first YouTube URL below to try it out."
              : "Ready to make more shorts?"}
          </p>
        </div>
        <Badge variant="secondary" className="hidden sm:flex">
          <Sparkles className="size-3.5 mr-1" />
          {credits} credits
        </Badge>
      </div>

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile
          icon={Coins}
          value={credits}
          label="Credits"
        />
        <StatTile
          icon={VideoIcon}
          value={videoCount ?? 0}
          label={(videoCount ?? 0) === 1 ? "Video processed" : "Videos processed"}
        />
        <StatTile
          icon={Film}
          value={clipCount ?? 0}
          label={(clipCount ?? 0) === 1 ? "Clip generated" : "Clips generated"}
        />
      </div>

      {/* New clip form — the main action */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Create a new clip</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a YouTube URL. 5–10 vertical shorts will appear in your
          library in a few minutes.
        </p>
        <div className="mt-4">
          <NewClipForm credits={credits} />
        </div>
      </section>

      {/* Recent videos */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Recent</h2>
          {(recentVideos?.length ?? 0) > 0 && (
            <Link
              href="/dashboard/library"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          )}
        </div>

        {(!recentVideos || recentVideos.length === 0) ? (
          <Card className="mt-4 border-dashed">
            <CardContent className="py-10 text-center">
              <VideoIcon className="size-8 mx-auto text-muted-foreground" />
              <p className="mt-3 font-medium">No videos yet</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your first submission will show up here. Processing takes a
                few minutes per video.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-3">
            {recentVideos.map((v) => (
              <Link
                key={v.id}
                href={`/dashboard/videos/${v.id}`}
                className="block rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {v.title ?? v.source_url}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(v.created_at).toLocaleString()}
                    </div>
                  </div>
                  <VideoStatusBadge status={v.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function VideoStatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    queued: { label: "Queued", variant: "secondary" },
    downloading: { label: "Downloading", variant: "secondary" },
    transcribing: { label: "Transcribing", variant: "secondary" },
    picking: { label: "Picking", variant: "secondary" },
    clipping: { label: "Clipping", variant: "secondary" },
    ready: { label: "Ready", variant: "default" },
    failed: { label: "Failed", variant: "destructive" },
  };
  const info = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}
