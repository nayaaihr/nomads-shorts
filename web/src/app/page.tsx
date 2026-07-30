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
  Smartphone,
  Music,
  Sparkles,
  Check,
  Zap,
  Clock,
  Globe2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VerticalPreview } from "@/components/vertical-preview";
import { CREDIT_PACKS, FREE_TRIAL_CREDITS } from "@/lib/pricing";
import { getUser } from "@/lib/supabase/session";

export default async function LandingPage() {
  const user = await getUser();

  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />

      <main className="flex-1">
        {/* ─────────────────────────── Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-16 sm:pt-20 pb-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6">
                <Sparkles className="size-3.5 mr-1" />
                {FREE_TRIAL_CREDITS} free credits on sign-up
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-balance">
                Turn one long travel vlog into ten viral shorts.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 text-balance">
                Paste a YouTube URL. Our AI finds the moments worth sharing,
                reframes them for vertical, and hands you clips ready to post
                to Reels, Shorts and TikTok. In minutes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/sign-in"
                  className={buttonVariants({ size: "lg" })}
                >
                  Try it free
                </Link>
                <Link
                  href="#how-it-works"
                  className={buttonVariants({ size: "lg", variant: "outline" })}
                >
                  See how it works
                </Link>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                English &amp; Hindi source videos supported · No card required
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <VerticalPreview className="w-56 sm:w-64 drop-shadow-2xl" />
            </div>
          </div>
        </section>

        {/* ─────────────────────────── How it works */}
        <section
          id="how-it-works"
          className="mx-auto max-w-6xl px-6 py-16 scroll-mt-20 border-t"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-center">
            Three steps. No editor to learn.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                icon: MonitorPlay,
                title: "Paste a YouTube URL",
                body: "Any video from your channel, up to 30 minutes long.",
              },
              {
                step: "2",
                icon: Sparkles,
                title: "AI picks the moments",
                body: "Claude reads the transcript and identifies the punchlines, hooks and story beats worth cutting.",
              },
              {
                step: "3",
                icon: Smartphone,
                title: "Download vertical clips",
                body: "9:16, 1080p, ready to post. No watermark. No queue for hours.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-lg border bg-card p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {s.step}
                  </div>
                  <s.icon className="size-5 text-muted-foreground" />
                </div>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────── Features */}
        <section
          id="features"
          className="mx-auto max-w-6xl px-6 py-16 scroll-mt-20 border-t"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-center">
            Built for creators on the move
          </h2>
          <p className="mt-3 text-muted-foreground text-center max-w-xl mx-auto">
            Everything a travel vlogger needs, nothing they don&apos;t.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Scissors,
                title: "Smart moment detection",
                body: "The AI knows what makes a hook. Cuts don't start mid-sentence.",
              },
              {
                icon: Smartphone,
                title: "9:16 vertical, 1080p",
                body: "Centered on the speaker. Ready for every vertical feed.",
              },
              {
                icon: Zap,
                title: "5-10 clips per video",
                body: "Not one, not fifty. Just the moments that actually work.",
              },
              {
                icon: Globe2,
                title: "English &amp; Hindi",
                body: "Whisper transcribes both. Auto-translates to English if you like.",
              },
              {
                icon: Clock,
                title: "Minutes, not hours",
                body: "A 20-minute vlog is processed in under five minutes.",
              },
              {
                icon: Music,
                title: "Music-ready output",
                body: "Add tracks from your favorite editor — output leaves room for it.",
              },
              {
                icon: MonitorPlay,
                title: "No watermarks",
                body: "It's your content. We keep our branding off it.",
              },
              {
                icon: Sparkles,
                title: "Credits never expire",
                body: "Buy when you're posting, save the rest for next trip.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-lg border bg-card p-4"
              >
                <f.icon className="size-5 text-muted-foreground" />
                <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────── Testimonials (placeholder — swap in real ones) */}
        <section className="mx-auto max-w-6xl px-6 py-16 border-t">
          <h2 className="text-3xl font-semibold tracking-tight text-center">
            What creators are saying
          </h2>
          <p className="mt-3 text-muted-foreground text-center text-sm">
            Real quotes coming as our first users post their clips.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                quote:
                  "I used to spend the whole day after a shoot editing shorts. Now I paste the URL and post while I&apos;m still at the café.",
                name: "Priya M.",
                role: "Travel vlogger, 40k subs",
              },
              {
                quote:
                  "The moment picker actually knows what a hook is. My shorts started hitting 100k+ views after two weeks.",
                name: "David R.",
                role: "Adventure creator",
              },
              {
                quote:
                  "It handles my Hindi voiceover and gives me English captions I can post to my global audience. Nobody else does that.",
                name: "Arjun S.",
                role: "Food + travel channel",
              },
            ].map((t) => (
              <blockquote
                key={t.name}
                className="rounded-lg border bg-card p-6"
              >
                <p className="text-sm leading-relaxed">
                  &ldquo;<span dangerouslySetInnerHTML={{ __html: t.quote }} />&rdquo;
                </p>
                <footer className="mt-4 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{t.name}</span>{" "}
                  · {t.role}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* ─────────────────────────── Pricing */}
        <section
          id="pricing"
          className="mx-auto max-w-6xl px-6 py-16 scroll-mt-20 border-t"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-center">
            Pay for what you use
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

        {/* ─────────────────────────── FAQ */}
        <section
          id="faq"
          className="mx-auto max-w-3xl px-6 py-16 border-t scroll-mt-20"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-center">
            Frequently asked
          </h2>
          <dl className="mt-10 space-y-6">
            {[
              {
                q: "Can I upload videos I didn't make?",
                a: "You can paste any YouTube URL, but you're responsible for having the rights to use the video. If it's not your channel, get permission first.",
              },
              {
                q: "How long does processing take?",
                a: "A 5-minute source takes about 2 minutes to process. A 30-minute vlog takes around 10 minutes. You'll get an email if you want (coming soon) or you can just refresh the page.",
              },
              {
                q: "What languages do you support?",
                a: "The transcription (Whisper large-v3) handles both English and Hindi cleanly. Other languages usually work too — try it and let us know.",
              },
              {
                q: "Is there a watermark on the clips?",
                a: "No. It's your content. We keep our branding out of it.",
              },
              {
                q: "What if the AI misses a good moment?",
                a: "For now, the AI is the only picker. In the next release, you'll be able to manually pick or trim clips yourself.",
              },
              {
                q: "Can I get a refund?",
                a: "Yes — unused credit packs are fully refundable within 14 days. Consumed credits are not, because the underlying AI costs are already paid. See our Terms for details.",
              },
              {
                q: "Do you keep my videos forever?",
                a: "Source videos and generated clips stay in your account for as long as you keep it. If you delete your account, everything is removed within 30 days.",
              },
            ].map((item) => (
              <div key={item.q}>
                <dt className="font-semibold">{item.q}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ─────────────────────────── Final CTA */}
        <section className="mx-auto max-w-4xl px-6 py-16 text-center border-t">
          <h3 className="text-2xl font-semibold tracking-tight">
            Ready to stop dreading the edit?
          </h3>
          <p className="mt-2 text-muted-foreground">
            {FREE_TRIAL_CREDITS} free credits on sign-up. No card required.
            First clips in your library in under 10 minutes.
          </p>
          <Link
            href="/sign-in"
            className={buttonVariants({ size: "lg", className: "mt-6" })}
          >
            Start with {FREE_TRIAL_CREDITS} free credits
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
