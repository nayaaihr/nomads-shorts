"use client";

import { useEffect } from "react";

// While a video is still processing, hard-reload the page every few
// seconds so status changes (queued → downloading → ... → ready) show up
// without the user having to hit reload. Full reload is heavy but is the
// only reliable way to bust Next.js dev-mode server caching for the
// current route data.
export function VideoStatusRefresher({
  status,
  intervalMs = 5000,
}: {
  status: string;
  intervalMs?: number;
}) {
  const isFinal = status === "ready" || status === "failed";

  useEffect(() => {
    if (isFinal) return;
    const id = setInterval(() => {
      window.location.reload();
    }, intervalMs);
    return () => clearInterval(id);
  }, [isFinal, intervalMs]);

  return null;
}
