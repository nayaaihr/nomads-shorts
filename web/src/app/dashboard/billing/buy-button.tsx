"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function BuyButton({
  packId,
  label,
}: {
  packId: "starter" | "creator" | "pro";
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const body = await res.json();
      if (!res.ok || !body.url) throw new Error(body.error ?? "Checkout failed");
      window.location.href = body.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <Button onClick={checkout} disabled={loading} className="w-full">
      {loading ? <Loader2 className="size-4 animate-spin" /> : label}
    </Button>
  );
}
