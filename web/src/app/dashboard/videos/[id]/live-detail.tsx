"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Trash2, Download } from "lucide-react";
import { toast } from "sonner";

type Video = {
  id: string;
  title: string | null;
  status: string;
  status_message: string | null;
  duration_seconds: number | null;
  source_url: string;
};

type Clip = {
  id: string;
  title: string | null;
  hook: string | null;
  start_seconds: number;
  end_seconds: number;
  virality_score: number | null;
  storage_key: string | null;
  thumbnail_key: string | null;
  ordinal: number;
};

type Props = {
  initialVideo: Video;
  initialClips: Clip[];
};

// Client-side live-updating detail view. Polls /api/videos/[id]/status
// every 3s while the video is still processing, updates React state,
// re-renders — no jarring page reload.
export function LiveVideoDetail({ initialVideo, initialClips }: Props) {
  const router = useRouter();
  const [video, setVideo] = useState<Video>(initialVideo);
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [deleting, setDeleting] = useState(false);

  const isFinal = video.status === "ready" || video.status === "failed";

  // Poll the status endpoint while not final.
  useEffect(() => {
    if (isFinal) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/videos/${video.id}/status`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { video: Video; clips: Clip[] };
        setVideo(data.video);
        setClips(data.clips);
      } catch {
        // Transient network error — try again next tick.
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [isFinal, video.id]);

  async function deleteVideo() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/videos/${video.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Delete failed");
      toast.success("Video deleted");
      router.push("/dashboard/library");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  async function deleteClip(clipId: string) {
    // Optimistic: remove from UI immediately.
    setClips((cs) => cs.filter((c) => c.id !== clipId));
    try {
      const res = await fetch(`/api/clips/${clipId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Delete failed");
      toast.success("Clip deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      // Restore on failure — refetch to get truth.
      router.refresh();
    }
  }

  const isProcessing = !isFinal;

  return (
    <>
      <Link
        href="/dashboard/library"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to library
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight truncate">
            {video.title ?? video.source_url}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <VideoStatusBadge status={video.status} />
          <DeleteVideoDialog
            onConfirm={deleteVideo}
            disabled={deleting}
          />
        </div>
      </div>

      {isProcessing && (
        <Card className="mt-6">
          <CardContent className="py-8 text-center">
            <Loader2 className="size-6 mx-auto animate-spin text-muted-foreground" />
            <p className="mt-3 font-medium">Working on it…</p>
            <p className="text-sm text-muted-foreground">
              {video.status_message ??
                "This can take 5–10 minutes for a 30-min source."}
            </p>
          </CardContent>
        </Card>
      )}

      {video.status === "failed" && (
        <Card className="mt-6 border-destructive/50">
          <CardContent className="py-6">
            <p className="font-medium text-destructive">Processing failed</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {video.status_message ??
                "Something went wrong. You can delete this video and try a fresh submission."}
            </p>
          </CardContent>
        </Card>
      )}

      {clips.length === 0 && video.status === "ready" && (
        <Card className="mt-6">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            The AI didn&apos;t find any clip-worthy moments in this video.
          </CardContent>
        </Card>
      )}

      {clips.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {clips.map((c) => (
            <ClipCard key={c.id} clip={c} onDelete={() => deleteClip(c.id)} />
          ))}
        </div>
      )}
    </>
  );
}

function ClipCard({ clip, onDelete }: { clip: Clip; onDelete: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <Card className="overflow-hidden">
      {clip.storage_key ? (
        <video
          controls
          preload="none"
          poster={clip.thumbnail_key ? `/api/clips/${clip.id}/thumbnail` : undefined}
          className="w-full aspect-[9/16] bg-black object-contain"
          src={`/api/clips/${clip.id}/download`}
        />
      ) : (
        <div className="aspect-[9/16] bg-muted flex items-center justify-center text-sm text-muted-foreground">
          Rendering…
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {clip.title ?? "Untitled clip"}
        </CardTitle>
        {clip.hook && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {clip.hook}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">
          {formatSec(clip.start_seconds)} → {formatSec(clip.end_seconds)} ·{" "}
          {(clip.end_seconds - clip.start_seconds).toFixed(0)}s
          {clip.virality_score != null && ` · ${clip.virality_score}/100`}
        </div>
        <div className="mt-3 flex items-center gap-2">
          {clip.storage_key && (
            <a
              href={`/api/clips/${clip.id}/download`}
              download
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              <Download className="size-4" />
              Download
            </a>
          )}
          <Button
            size="sm"
            variant="ghost"
            aria-label="Delete clip"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this clip?</DialogTitle>
                <DialogDescription>
                  The clip file will be removed permanently. You can regenerate
                  it later only by re-submitting the source video.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setConfirmOpen(false);
                    onDelete();
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

function DeleteVideoDialog({
  onConfirm,
  disabled,
}: {
  onConfirm: () => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        aria-label="Delete video"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this video and all its clips?</DialogTitle>
          <DialogDescription>
            This removes the source, transcript, and every clip generated from
            it. Credits already spent are not refunded — but the record goes
            away entirely.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
          >
            Delete everything
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
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
    picking: { label: "Picking moments", variant: "secondary" },
    clipping: { label: "Clipping", variant: "secondary" },
    ready: { label: "Ready", variant: "default" },
    failed: { label: "Failed", variant: "destructive" },
  };
  const info = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

function formatSec(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
