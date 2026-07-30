import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="w-full border-b bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <LogoMark className="size-5" />
          <span>Nomads Shorts</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/#features"
            className="px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href={signedIn ? "/dashboard" : "/sign-in"}
            className={buttonVariants({ size: "sm" })}
          >
            {signedIn ? "Dashboard" : "Sign in"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
