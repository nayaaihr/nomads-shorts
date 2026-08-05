"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type LibraryVideo = {
  id: string;
  title: string | null;
  source_url: string;
  status: string;
  created_at: string;
};

export function LibraryList({ initialVideos }: { initialVideos: LibraryVideo[] }) {
  const router = useRouter();
  const [videos, setVideos] = useState(initialVideos);

  async function deleteVideo(id: string) {
    // Optimistic remove.
    setVideos((vs) => vs.filter((v) => v.id !== id));
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Delete failed");
      toast.success("Video deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      router.refresh(); // restore truth
    }
  }

  if (videos.length === 0) return null;

  return (
    <div className="mt-8 grid gap-3">
      {videos.map((v) => (
        <Card
          key={v.id}
          className="hover:border-primary/50 transition-colors group relative"
        >
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <Link href={`/dashboard/videos/${v.id}`} className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">
                {v.title ?? v.source_url}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(v.created_at).toLocaleString()}
              </p>
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={v.status === "ready" ? "default" : "secondary"}>
                {v.status}
              </Badge>
              <DeleteDialog onConfirm={() => deleteVideo(v.id)} />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

function DeleteDialog({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        aria-label="Delete video"
        className="opacity-40 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        <Trash2 className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this video and all its clips?</DialogTitle>
          <DialogDescription>
            This removes the source, transcript, and every clip generated
            from it. Credits already spent are not refunded — the record
            just goes away.
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
