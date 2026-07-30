import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-16 prose prose-neutral">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">
          Placeholder. Replace before launch — talk to a lawyer, don&apos;t
          copy-paste boilerplate.
        </p>
        <p>
          <Link href="/" className="underline underline-offset-2">
            ← Back home
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
