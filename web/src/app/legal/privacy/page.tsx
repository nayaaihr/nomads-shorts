import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Privacy Policy — Nomads Shorts",
};

const LAST_UPDATED = "30 July 2026";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-8 space-y-6 text-sm leading-6">
          <Section title="1. Who is responsible for your data">
            <p>
              Nomads Shorts is operated by <strong>Charu Tripathi</strong>, an
              individual sole proprietor based in Zurich, Switzerland
              (&quot;we&quot;, &quot;us&quot;). We are the data controller for the personal
              information we collect through the service.
            </p>
            <p className="mt-3">
              For any privacy-related question or request, email{" "}
              <a
                href="mailto:info@nomadsshorts.com"
                className="underline underline-offset-2"
              >
                info@nomadsshorts.com
              </a>
              .
            </p>
          </Section>

          <Section title="2. What data we collect">
            <p>We collect only what we need to operate the service:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>
                <strong>Account data (via Google sign-in).</strong> Your email
                address, name, and profile picture URL as provided by Google
                when you sign in.
              </li>
              <li>
                <strong>Video processing data.</strong> The YouTube URLs you
                submit, the transcripts we generate, the clip metadata (title,
                start/end timestamps, virality score), and the resulting video
                files.
              </li>
              <li>
                <strong>Billing data.</strong> Your Stripe customer id and a
                ledger of credit purchases and consumption. We do not receive
                or store your credit-card details — those are handled entirely
                by Stripe.
              </li>
              <li>
                <strong>Technical data.</strong> Standard server logs (IP
                address, user agent, request timestamps) retained for a limited
                period for security and debugging.
              </li>
            </ul>
          </Section>

          <Section title="3. Why we use it (legal bases under revFADP / GDPR)">
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>
                <strong>To perform our contract with you</strong> — creating
                your account, processing your submitted videos, delivering
                clips, billing you for credits.
              </li>
              <li>
                <strong>For our legitimate interests</strong> — securing the
                service against fraud and abuse, improving reliability,
                debugging.
              </li>
              <li>
                <strong>To comply with legal obligations</strong> — retaining
                accounting records for the periods required by Swiss law.
              </li>
            </ul>
          </Section>

          <Section title="4. Who we share it with (sub-processors)">
            <p>
              We use these third parties to operate the service. Each acts as a
              processor under our instructions.
            </p>
            <div className="mt-3 rounded-md border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-2">Service</th>
                    <th className="p-2">Purpose</th>
                    <th className="p-2">Where data is processed</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {SUBPROCESSORS.map((s) => (
                    <tr key={s.name}>
                      <td className="p-2 font-medium">{s.name}</td>
                      <td className="p-2">{s.purpose}</td>
                      <td className="p-2">{s.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Where a sub-processor is located outside Switzerland or the EEA,
              we rely on the European Commission&apos;s Standard Contractual
              Clauses (or the sub-processor&apos;s certified equivalents) to
              provide an adequate level of protection for your data.
            </p>
          </Section>

          <Section title="5. How long we keep it">
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>
                <strong>Account and video data:</strong> for as long as your
                account exists.
              </li>
              <li>
                <strong>After you delete your account:</strong> source videos,
                transcripts, and generated clips are deleted from our storage
                within 30 days.
              </li>
              <li>
                <strong>Accounting records (invoices, payments):</strong>{" "}
                retained for ten (10) years as required by Swiss tax law.
              </li>
              <li>
                <strong>Server logs:</strong> retained for up to 90 days.
              </li>
            </ul>
          </Section>

          <Section title="6. Your rights">
            <p>
              Under Swiss data-protection law and, where applicable, the GDPR,
              you have the following rights regarding your personal data:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>the right to access the data we hold about you;</li>
              <li>the right to have inaccurate data corrected;</li>
              <li>
                the right to have your data deleted (subject to legal retention
                obligations);
              </li>
              <li>
                the right to receive your data in a portable, machine-readable
                format;
              </li>
              <li>
                the right to restrict or object to processing based on our
                legitimate interests;
              </li>
              <li>
                the right to withdraw any consent you gave, without affecting
                the lawfulness of processing before withdrawal;
              </li>
              <li>
                the right to lodge a complaint with your local data-protection
                authority (in Switzerland: the FDPIC).
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{" "}
              <a
                href="mailto:info@nomadsshorts.com"
                className="underline underline-offset-2"
              >
                info@nomadsshorts.com
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>
              We use only essential cookies to keep you signed in (Supabase
              session cookie). We do not run any analytics, advertising, or
              tracking cookies at this time. If we add any in the future, we
              will update this policy and, where required, ask for your
              consent.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We use HTTPS for all traffic, encrypt data in transit and at rest
              (via our sub-processors), and follow least-privilege access
              controls. No system is perfect, however — you use the service at
              your own risk. If we become aware of a data breach that affects
              your personal data, we will notify you and the relevant
              authority as required by law.
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              The service is not intended for children under 18. We do not
              knowingly collect personal data from children. If you become
              aware that a child has provided us with personal data, please
              contact us and we will delete it.
            </p>
          </Section>

          <Section title="10. Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time. When we do,
              we will update the &quot;Last updated&quot; date at the top and, for
              material changes, notify you by email or via the service.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              For any question or request regarding this policy, email{" "}
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

const SUBPROCESSORS = [
  {
    name: "Supabase",
    purpose: "Authentication and database",
    location: "European Union",
  },
  {
    name: "Vercel",
    purpose: "Web app hosting",
    location: "United States (Global CDN)",
  },
  {
    name: "Fly.io",
    purpose: "Video processing worker",
    location: "United States",
  },
  {
    name: "Cloudflare R2",
    purpose: "Video and clip storage",
    location: "European Union / Global",
  },
  {
    name: "Stripe",
    purpose: "Payment processing",
    location: "Ireland (EU) and United States",
  },
  {
    name: "Google (OAuth + YouTube Data API)",
    purpose: "Sign-in and YouTube video access",
    location: "United States",
  },
  {
    name: "Anthropic",
    purpose: "AI (moment picking, translation)",
    location: "United States",
  },
  {
    name: "Replicate",
    purpose: "AI (audio transcription with Whisper)",
    location: "United States",
  },
  {
    name: "Inngest",
    purpose: "Background job queue",
    location: "United States",
  },
];

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
