import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, stripePriceIdFor, packById } from "@/lib/stripe";
import { env } from "@/lib/env";

const bodySchema = z.object({
  packId: z.enum(["starter", "creator", "pro"]),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  const pack = packById(parsed.data.packId);
  if (!pack) return NextResponse.json({ error: "Unknown pack" }, { status: 400 });

  const stripe = getStripe();
  const admin = createAdminClient();

  // Find or create a Stripe customer for this user.
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .maybeSingle();

  let customerId = profile?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: stripePriceIdFor(pack.id), quantity: 1 }],
    success_url: `${env.siteUrl()}/dashboard/billing?purchased=${pack.id}`,
    cancel_url: `${env.siteUrl()}/dashboard/billing?canceled=1`,
    // Metadata is what the webhook uses to grant the right number of credits.
    metadata: {
      supabase_user_id: user.id,
      pack_id: pack.id,
      credits: pack.credits.toString(),
    },
  });

  return NextResponse.json({ url: session.url });
}
