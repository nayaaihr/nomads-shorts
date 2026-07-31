import type { MetadataRoute } from "next";
import { POSTS } from "./blog/posts";

const SITE = "https://www.nomadsshorts.com";

// Sitemap for public pages. Auth-gated routes and marketing-only routes
// (like /demo) are intentionally excluded — no SEO value.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const blogEntries: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));

  return [
    { url: `${SITE}/`,              lastModified: now, priority: 1.0, changeFrequency: "weekly" },
    { url: `${SITE}/blog`,          lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    ...blogEntries,
    { url: `${SITE}/sign-in`,       lastModified: now, priority: 0.5, changeFrequency: "yearly"  },
    { url: `${SITE}/legal/terms`,   lastModified: now, priority: 0.3, changeFrequency: "yearly"  },
    { url: `${SITE}/legal/privacy`, lastModified: now, priority: 0.3, changeFrequency: "yearly"  },
  ];
}
