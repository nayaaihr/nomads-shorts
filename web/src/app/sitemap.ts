import type { MetadataRoute } from "next";

const SITE = "https://www.nomadsshorts.com";

// Sitemap for public pages. Auth-gated routes and marketing-only routes
// (like /demo) are intentionally excluded — no SEO value.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE}/`,               lastModified, priority: 1.0, changeFrequency: "weekly" },
    { url: `${SITE}/#features`,      lastModified, priority: 0.7, changeFrequency: "monthly" },
    { url: `${SITE}/#pricing`,       lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE}/#faq`,           lastModified, priority: 0.6, changeFrequency: "monthly" },
    { url: `${SITE}/sign-in`,        lastModified, priority: 0.5, changeFrequency: "yearly"  },
    { url: `${SITE}/legal/terms`,    lastModified, priority: 0.3, changeFrequency: "yearly"  },
    { url: `${SITE}/legal/privacy`,  lastModified, priority: 0.3, changeFrequency: "yearly"  },
  ];
}
