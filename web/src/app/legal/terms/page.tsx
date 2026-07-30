import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Terms of Service — Nomads Shorts",
};

const LAST_UPDATED = "30 July 2026";

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-8 space-y-6 text-sm leading-6">
          <Section title="1. Who we are">
            <p>
              Nomads Shorts (&quot;Nomads Shorts&quot;, &quot;we&quot;, &quot;us&quot;) is a service
              operated by <strong>Charu Tripathi</strong>, an individual sole
              proprietor based in Zurich, Switzerland. You can reach us at{" "}
              <a
                href="mailto:info@nomadsshorts.com"
                className="underline underline-offset-2"
              >
                info@nomadsshorts.com
              </a>
              .
            </p>
          </Section>

          <Section title="2. What the service does">
            <p>
              Nomads Shorts is a web application that takes long-form video
              content (typically YouTube videos) and generates short vertical
              clips suitable for platforms such as Instagram Reels, YouTube
              Shorts, and TikTok. Generation is powered by third-party AI
              models. Output quality is best-effort and depends on the source
              video.
            </p>
          </Section>

          <Section title="3. Eligibility and account">
            <p>
              You must be at least 18 years old (or the age of majority where
              you live) to use the service. You are responsible for keeping
              your Google account credentials secure and for all activity that
              happens under your account.
            </p>
          </Section>

          <Section title="4. Your content and content rights">
            <p>
              You retain all ownership rights in the videos you submit and the
              clips generated for you. You grant us a limited, non-exclusive
              licence to process your submissions solely to provide the service
              — including downloading source video, transcribing it, generating
              clips, and storing the resulting files.
            </p>
            <p className="mt-3">
              <strong>Important — third-party content.</strong> You represent
              and warrant that you own or have obtained all necessary rights
              (including copyright and any applicable synchronisation or
              performance rights) to any video you submit. If you submit a
              YouTube URL for a video you do not own, you are responsible for
              ensuring your use complies with the platform&apos;s terms and
              applicable copyright law. We do not review submissions for
              compliance and accept no liability for your use of third-party
              content.
            </p>
          </Section>

          <Section title="5. Credits, payment and refunds">
            <p>
              The service operates on a credit system. Credits are purchased in
              packs and consumed as videos are processed (approximately one
              credit per minute of source video). Payments are processed by
              Stripe; we do not receive or store your card details.
            </p>
            <p className="mt-3">
              <strong>Refund policy.</strong> In line with your right of
              withdrawal for digital services under Swiss and EU consumer law,
              you may request a full refund of an unused credit pack within
              fourteen (14) days of purchase by emailing{" "}
              <a
                href="mailto:info@nomadsshorts.com"
                className="underline underline-offset-2"
              >
                info@nomadsshorts.com
              </a>
              . Once credits have been consumed (i.e. once a video has been
              processed) those credits are non-refundable, because the
              underlying AI, storage and bandwidth costs have already been
              incurred. This is a limitation you accept when you purchase.
            </p>
            <p className="mt-3">
              Credits do not expire but they are non-transferable and have no
              cash value.
            </p>
          </Section>

          <Section title="6. Acceptable use">
            <p>You agree not to use the service to:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>process content you do not have the right to use;</li>
              <li>
                generate content that is unlawful, defamatory, harassing,
                threatening, discriminatory, pornographic, or that depicts
                minors sexually;
              </li>
              <li>
                impersonate any person, or misrepresent your affiliation with
                any person or organisation;
              </li>
              <li>
                attempt to reverse-engineer, resell, or provide access to the
                service to third parties without our written consent;
              </li>
              <li>
                circumvent rate limits, credit deductions, or any technical
                measures we put in place;
              </li>
              <li>
                submit malware or use the service to distribute malware.
              </li>
            </ul>
            <p className="mt-3">
              We may suspend or terminate accounts that violate these rules,
              without refund, at our sole discretion.
            </p>
          </Section>

          <Section title="7. Third-party services">
            <p>
              We rely on third parties to operate the service, including but
              not limited to Supabase, Cloudflare, Vercel, Fly.io, Stripe,
              Google, Anthropic, Replicate, and Inngest. Your use of the
              service is also subject to their respective terms and privacy
              practices. We are not responsible for outages, changes, or
              failures of third-party services.
            </p>
          </Section>

          <Section title="8. Availability, changes and termination">
            <p>
              We may modify, suspend, or discontinue the service (or any part
              of it) at any time, with or without notice. If we permanently
              discontinue the service, we will make a reasonable effort to
              refund any unused credits.
            </p>
            <p className="mt-3">
              You may close your account at any time by emailing us. On
              closure, your source videos, transcripts, and clips will be
              deleted from our storage within 30 days, except where retention
              is required by law.
            </p>
          </Section>

          <Section title="9. No warranty">
            <p>
              The service is provided &quot;as is&quot; and &quot;as
              available&quot;, without warranties of any kind, whether express
              or implied, including any implied warranties of merchantability,
              fitness for a particular purpose, non-infringement, or
              uninterrupted operation. We do not warrant that generated clips
              will meet your expectations, that captions will be accurate, or
              that the service will be error-free.
            </p>
          </Section>

          <Section title="10. Limitation of liability">
            <p>
              To the fullest extent permitted by law, our aggregate liability
              to you for any claim arising out of or related to the service is
              limited to the greater of (a) the total amount you paid to us in
              the twelve (12) months preceding the event giving rise to the
              claim, or (b) CHF 100. We are not liable for indirect,
              incidental, consequential, special, or punitive damages,
              including lost profits, lost data, or loss of goodwill.
            </p>
          </Section>

          <Section title="11. Indemnity">
            <p>
              You agree to defend, indemnify and hold us harmless from any
              claim, loss or expense (including reasonable legal fees) arising
              out of your use of the service, your submitted content, or your
              breach of these Terms.
            </p>
          </Section>

          <Section title="12. Governing law and jurisdiction">
            <p>
              These Terms are governed by the substantive laws of Switzerland,
              excluding its conflict-of-law rules and the UN Convention on
              Contracts for the International Sale of Goods. The exclusive
              place of jurisdiction for any dispute arising out of or in
              connection with these Terms is Zurich, Switzerland — subject to
              any mandatory consumer-protection provisions of your country of
              residence.
            </p>
          </Section>

          <Section title="13. Changes to these Terms">
            <p>
              We may update these Terms from time to time. If we make material
              changes, we will notify you by email or via the service. Your
              continued use of the service after the effective date of the
              updated Terms constitutes your acceptance of the changes.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              For any questions about these Terms, email{" "}
              <a
                href="mailto:info@nomadsshorts.com"
                className="underline underline-offset-2"
              >
                info@nomadsshorts.com
              </a>
              .
            </p>
          </Section>
        </div>

        <p className="mt-10 text-sm">
          <Link href="/" className="underline underline-offset-2">
            ← Back home
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-2 text-muted-foreground">{children}</div>
    </section>
  );
}
