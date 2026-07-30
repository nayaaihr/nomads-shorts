// Runtime env helpers. Server-only values are read on-demand; client-visible
// values must be prefixed with NEXT_PUBLIC_ so Next.js exposes them.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See web/.env.example.`,
    );
  }
  return value;
}

export const env = {
  supabase: {
    url: () => required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: () =>
      required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKey: () =>
      required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
  },
  stripe: {
    secretKey: () => required("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY),
    webhookSecret: () =>
      required("STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET),
    priceIds: {
      starter: () =>
        required("STRIPE_PRICE_STARTER", process.env.STRIPE_PRICE_STARTER),
      creator: () =>
        required("STRIPE_PRICE_CREATOR", process.env.STRIPE_PRICE_CREATOR),
      pro: () => required("STRIPE_PRICE_PRO", process.env.STRIPE_PRICE_PRO),
    },
  },
  siteUrl: () =>
    required("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL),

  // --- Phase 1 (video pipeline) -----------------------------------------
  anthropic: {
    apiKey: () => required("ANTHROPIC_API_KEY", process.env.ANTHROPIC_API_KEY),
  },
  replicate: {
    apiToken: () =>
      required("REPLICATE_API_TOKEN", process.env.REPLICATE_API_TOKEN),
  },
  r2: {
    accountId: () => required("R2_ACCOUNT_ID", process.env.R2_ACCOUNT_ID),
    accessKeyId: () =>
      required("R2_ACCESS_KEY_ID", process.env.R2_ACCESS_KEY_ID),
    secretAccessKey: () =>
      required("R2_SECRET_ACCESS_KEY", process.env.R2_SECRET_ACCESS_KEY),
    bucket: () => required("R2_BUCKET", process.env.R2_BUCKET),
  },
  inngest: {
    eventKey: () => required("INNGEST_EVENT_KEY", process.env.INNGEST_EVENT_KEY),
    signingKey: () =>
      required("INNGEST_SIGNING_KEY", process.env.INNGEST_SIGNING_KEY),
  },
};
