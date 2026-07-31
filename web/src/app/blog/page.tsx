import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { POSTS } from "./posts";

export const metadata = {
  title: "Blog — tips for turning long videos into shorts",
  description:
    "Guides for creators who want to grow with short-form video: how to clip long YouTube videos, reframe horizontal to vertical, and get more views from every upload.",
};

export default function BlogIndex() {
  const sorted = [...POSTS].sort(
    (a, b) => new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf(),
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-12">
        <header>
          <h1 className="text-4xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Practical guides for creators who want to grow with short-form
            video.
          </p>
        </header>

        <div className="mt-12 space-y-8">
          {sorted.map((p) => (
            <article
              key={p.slug}
              className="pb-8 border-b last:border-b-0"
            >
              <Link href={`/blog/${p.slug}`} className="group block">
                <h2 className="text-xl font-semibold tracking-tight group-hover:underline underline-offset-4">
                  {p.title}
                </h2>
                <p className="mt-2 text-muted-foreground">{p.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(p.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {p.readingMinutes} min read
                </p>
              </Link>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
