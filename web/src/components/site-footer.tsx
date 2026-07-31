import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} Nomads Shorts</p>
        <nav className="flex items-center gap-4 flex-wrap justify-center">
          <Link href="/#features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="/#pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <Link href="/legal/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/legal/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
