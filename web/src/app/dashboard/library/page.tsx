import Link from "next/link";
import { getUserOrRedirect } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";

export default async function LibraryPage() {
  const user = await getUserOrRedirect();
  const supabase = await createClient();

  const { data: videos } = await supabase
    .from("videos")
    .select("id, title, source_url, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">My clips</h1>
      <p className="mt-1 text-muted-foreground">
        Every video you&apos;ve submitted and the clips generated from it.
      </p>

      {(!videos || videos.length === 0) ? (
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
        <div className="mt-8 grid gap-3">
          {videos.map((v) => (
            <Link key={v.id} href={`/dashboard/videos/${v.id}`}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {v.title ?? v.source_url}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(v.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={v.status === "ready" ? "default" : "secondary"}
                  >
                    {v.status}
                  </Badge>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
