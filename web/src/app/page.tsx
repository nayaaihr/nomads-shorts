import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MonitorPlay,
  Scissors,
  Captions,
  Smartphone,
  Music,
  Sparkles,
  Check,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CREDIT_PACKS, FREE_TRIAL_CREDITS } from "@/lib/pricing";
import { getUser } from "@/lib/supabase/session";

export default async function LandingPage() {
  const user = await getUser();

  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="size-3.5 mr-1" />
            Now in beta — {FREE_TRIAL_CREDITS} free credits on sign-up
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-balance">
            Turn your long videos into
            <br />
            viral shorts.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Paste a YouTube URL. Our AI finds the best moments, reframes them
            for vertical, burns in captions, and hands you clips ready to post
            to Shorts, Reels, and TikTok.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/sign-in" className={buttonVariants({ size: "lg" })}>
              Start free
            </Link>
            <Link
              href="#how-it-works"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              See how it works
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            English &amp; Hindi supported · No credit card required
          </p>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="mx-auto max-w-6xl px-6 pb-24 scroll-mt-20"
        >
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                icon: MonitorPlay,
                title: "Paste a YouTube URL",
                body: "Bring in a video from your own channel (secure OAuth) or paste any public link.",
              },
              {
                step: "2",
                icon: Sparkles,
                title: "AI picks the best moments",
                body: "We transcribe the video, then use an LLM to find 3–10 clip-worthy segments.",
              },
              {
                step: "3",
                icon: Smartphone,
                title: "Download vertical clips",
                body: "Auto-reframed 9:16, styled captions burned in, background music optional.",
              },
            ].map((s) => (
              <Card key={s.step}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {s.step}
                    </div>
                    <s.icon className="size-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-3">{s.title}</CardTitle>
                  <CardDescription>{s.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="mx-auto max-w-6xl px-6 pb-24 scroll-mt-20"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-center">
            Everything you need in one export
          </h2>
          <p className="mt-3 text-muted-foreground text-center max-w-xl mx-auto">
            No editor to learn. No timeline to fuss with. Just clips you can
            post.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Scissors,
                title: "Smart moment detection",
                body: "Claude reads the transcript and picks segments with strong hooks.",
              },
              {
                icon: Smartphone,
                title: "9:16 face-tracking reframe",
                body: "Follows the speaker so heads never leave the frame.",
              },
              {
                icon: Captions,
                title: "Animated captions",
                body: "Word-by-word, TikTok-style. English and Hindi transcription.",
              },
              {
                icon: Music,
                title: "Royalty-free music",
                body: "Optional background tracks safe for monetized posts.",
              },
            ].map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <f.icon className="size-5 text-muted-foreground" />
                  <CardTitle className="mt-3 text-base">{f.title}</CardTitle>
                  <CardDescription>{f.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className="mx-auto max-w-6xl px-6 pb-24 scroll-mt-20"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-center">
            Simple credit packs
          </h2>
          <p className="mt-3 text-muted-foreground text-center max-w-xl mx-auto">
            1 credit ≈ 1 minute of source video. Credits never expire.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {CREDIT_PACKS.map((p) => (
              <Card
                key={p.id}
                className={p.id === "creator" ? "border-primary shadow-md" : ""}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{p.name}</CardTitle>
                    {p.id === "creator" && <Badge>Most popular</Badge>}
                  </div>
                  <CardDescription>{p.tagline}</CardDescription>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold">${p.priceUsd}</span>
                    <span className="text-muted-foreground text-sm">
                      / {p.credits} credits
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    {p.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <Check className="size-4 mt-0.5 text-primary shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/sign-in"
                    className={buttonVariants({ className: "w-full mt-6" })}
                  >
                    Get {p.credits} credits
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
          <Card className="p-10">
            <h3 className="text-2xl font-semibold tracking-tight">
              Made for creators on the move
            </h3>
            <p className="mt-2 text-muted-foreground">
              Built by a travel vlogger for travel vloggers. Get your first
              clips in under 10 minutes.
            </p>
            <Link
              href="/sign-in"
              className={buttonVariants({ size: "lg", className: "mt-6" })}
            >
              Start with {FREE_TRIAL_CREDITS} free credits
            </Link>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
