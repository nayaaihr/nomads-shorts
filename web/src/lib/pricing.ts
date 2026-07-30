export type CreditPack = {
  id: "starter" | "creator" | "pro";
  name: string;
  credits: number;
  priceUsd: number;
  tagline: string;
  perks: string[];
};

// 1 credit = ~1 minute of source video processed.
// Cost target: ~$0.30 in AI+infra per 30-min video, priced at ~$0.10/credit.
export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 60,
    priceUsd: 9,
    tagline: "Try it out",
    perks: [
      "~2 hours of source video",
      "Up to 30 min per upload",
      "1080p vertical export",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    credits: 300,
    priceUsd: 39,
    tagline: "For regular posters",
    perks: [
      "~10 hours of source video",
      "Up to 30 min per upload",
      "1080p vertical export",
      "Priority queue",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    credits: 900,
    priceUsd: 99,
    tagline: "For full-time creators",
    perks: [
      "~30 hours of source video",
      "Up to 30 min per upload",
      "1080p vertical export",
      "Priority queue",
      "Early access to new features",
    ],
  },
];

export const FREE_TRIAL_CREDITS = 15;
