import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import type Stripe from "stripe";

// Stripe webhook. Grants credits on `checkout.session.completed`. Idempotent
// via `stripe_event_id` unique index on credit_ledger.
export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const stripe = getStripe();
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, env.stripe.webhookSecret());
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.supabase_user_id;
  const credits = Number(session.metadata?.credits ?? 0);
  const packId = session.metadata?.pack_id ?? "unknown";

  if (!userId || !credits) {
    // Payment succeeded but we can't tell whose account to credit — flag it.
    console.error("Stripe webhook: missing metadata", { eventId: event.id });
    return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Insert ledger row first — the unique constraint on stripe_event_id makes
  // this the idempotency check. If Stripe retries, the second insert fails
  // and we skip the balance update.
  const { error: ledgerError } = await admin.from("credit_ledger").insert({
    user_id: userId,
    amount: credits,
    reason: "purchase",
    stripe_event_id: event.id,
    note: `Purchased ${packId} pack`,
  });

  if (ledgerError) {
    if (ledgerError.code === "23505") {
      // Duplicate — already processed. That's fine.
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("Ledger insert failed", ledgerError);
    return NextResponse.json({ error: ledgerError.message }, { status: 500 });
  }

  // Bump the denormalized balance.
  const { data: profile } = await admin
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .maybeSingle();

  const newBalance = (profile?.credits ?? 0) + credits;
  await admin.from("profiles").update({ credits: newBalance }).eq("id", userId);

  return NextResponse.json({ received: true });
}
