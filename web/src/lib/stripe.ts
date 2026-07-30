import Stripe from "stripe";
import { env } from "@/lib/env";
import { CREDIT_PACKS, type CreditPack } from "@/lib/pricing";

// Lazy singleton so we don't fail on `next dev` before .env is filled in.
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  _stripe = new Stripe(env.stripe.secretKey());
  return _stripe;
}

// Map a pack id to its live Stripe Price id (set via env vars, one per pack).
export function stripePriceIdFor(pack: CreditPack["id"]): string {
  switch (pack) {
    case "starter": return env.stripe.priceIds.starter();
    case "creator": return env.stripe.priceIds.creator();
    case "pro":     return env.stripe.priceIds.pro();
  }
}

export function packById(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}
