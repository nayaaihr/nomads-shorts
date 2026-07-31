import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Shared blog article shell. Each post file supplies title, meta, and body
// content — this handles the layout, byline, JSON-LD, and end-of-post CTA.

const SITE = "https://www.nomadsshorts.com";

export type ArticleProps = {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;   // ISO date
  updatedAt?: string;
  readingMinutes: number;
  children: React.ReactNode;
};

export function Article({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  readingMinutes,
  children,
}: ArticleProps) {
  const url = `${SITE}/blog/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url,
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    author: {
      "@type": "Organization",
      name: "Nomads Shorts",
      url: SITE,
    },
    publisher: {
      "@type": "Organization",
      name: "Nomads Shorts",
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/icon.svg`,
      },
    },
    mainEntityOfPage: url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogoMark className="size-4" />
          ← All articles
        </Link>

        <article className="mt-8">
          <header>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
              {title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground text-balance">
              {description}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Published{" "}
              {new Date(publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              · {readingMinutes} min read
            </p>
          </header>

          <div className="mt-10 space-y-6 leading-7 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-2 [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2">
            {children}
          </div>

          <div className="mt-16 rounded-lg border bg-card p-8 text-center">
            <h3 className="text-xl font-semibold">
              Try Nomads Shorts free
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Paste a YouTube URL. Get 5–10 vertical shorts in minutes. No
              editor to learn. 15 free credits on sign-up.
            </p>
            <Link
              href="/sign-in"
              className={buttonVariants({ className: "mt-5" })}
            >
              Start free
            </Link>
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
