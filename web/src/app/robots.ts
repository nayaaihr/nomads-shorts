import type { MetadataRoute } from "next";

const SITE = "https://www.nomadsshorts.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Don't waste crawl budget on auth-gated pages, API endpoints,
        // or the marketing-only /demo route (which sets its own noindex
        // via metadata too, but this is belt-and-suspenders).
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/api/",
          "/auth/",
          "/sign-out",
          "/demo",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
