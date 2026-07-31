import type { MetadataRoute } from "next";

const SITE = "https://www.nomadsshorts.com";

// Sitemap for public pages. Auth-gated routes and marketing-only routes
// (like /demo) are intentionally excluded — no SEO value.
//
// Hash-fragment "anchor" URLs (e.g. /#pricing) are NOT included: servers
// never see the fragment, so from Google's perspective they resolve to
// the same page as / and would be treated as duplicates.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE}/`,               lastModified, priority: 1.0, changeFrequency: "weekly" },
    { url: `${SITE}/sign-in`,        lastModified, priority: 0.5, changeFrequency: "yearly"  },
    { url: `${SITE}/legal/terms`,    lastModified, priority: 0.3, changeFrequency: "yearly"  },
    { url: `${SITE}/legal/privacy`,  lastModified, priority: 0.3, changeFrequency: "yearly"  },
  ];
}
