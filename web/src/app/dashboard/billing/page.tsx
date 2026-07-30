import { getUserOrRedirect } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { CREDIT_PACKS } from "@/lib/pricing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check } from "lucide-react";
import { BuyButton } from "./buy-button";

export default async function BillingPage() {
  const user = await getUserOrRedirect();
  const supabase = await createClient();

  const [{ data: profile }, { data: ledger }] = await Promise.all([
    supabase.from("profiles").select("credits").eq("id", user.id).maybeSingle(),
    supabase
      .from("credit_ledger")
      .select("id, amount, reason, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const credits = profile?.credits ?? 0;

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <Badge variant="secondary">
          <Sparkles className="size-3.5 mr-1" />
          {credits} credits
        </Badge>
      </div>
      <p className="mt-1 text-muted-foreground">
        1 credit ≈ 1 minute of source video. Credits never expire.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {CREDIT_PACKS.map((p) => (
          <Card
            key={p.id}
            className={p.id === "creator" ? "border-primary shadow-md" : ""}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{p.name}</CardTitle>
                {p.id === "creator" && <Badge>Most popular</Badge>}
              </div>
              <CardDescription>{p.tagline}</CardDescription>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-semibold">${p.priceUsd}</span>
                <span className="text-muted-foreground text-sm">
                  / {p.credits} credits
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 mb-6">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="size-4 mt-0.5 text-primary shrink-0" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <BuyButton packId={p.id} label={`Get ${p.credits} credits`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        {(!ledger || ledger.length === 0) ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No credit activity yet.
          </p>
        ) : (
          <div className="mt-4 rounded-md border divide-y">
            {ledger.map((row) => (
              <div key={row.id} className="p-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium capitalize">
                    {row.reason.replaceAll("_", " ")}
                  </div>
                  {row.note && (
                    <div className="text-xs text-muted-foreground">{row.note}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </div>
                </div>
                <div
                  className={
                    row.amount >= 0
                      ? "text-primary font-semibold"
                      : "text-muted-foreground font-semibold"
                  }
                >
                  {row.amount >= 0 ? "+" : ""}
                  {row.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
