"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonitorPlay, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)[\w-]{6,}/i;

export function NewClipForm({ credits }: { credits: number }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const outOfCredits = credits <= 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!YT_REGEX.test(url.trim())) {
      toast.error("That doesn't look like a YouTube URL.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong");
      }
      const { videoId } = await res.json();
      toast.success("Video queued. We'll email you when it's ready.");
      router.push(`/dashboard/videos/${videoId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="url" className="text-sm">
              YouTube URL
            </Label>
            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <MonitorPlay className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading || outOfCredits}
                  className="pl-9"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading || outOfCredits || !url}
                className="min-w-28"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Create clips"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Up to 30 min, 1080p. 1 credit per minute of source video.
            </p>
          </div>

          {outOfCredits && (
            <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
              <AlertCircle className="size-4 mt-0.5 text-amber-600 shrink-0" />
              <div>
                You&apos;re out of credits.{" "}
                <Link
                  href="/dashboard/billing"
                  className="font-medium underline underline-offset-2"
                >
                  Top up
                </Link>{" "}
                to keep creating.
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
