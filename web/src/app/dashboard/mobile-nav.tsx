"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Video, CreditCard, LogOut } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  credits: number;
};

// Mobile-only top bar + slide-in drawer. Desktop keeps the fixed
// sidebar (defined in dashboard/layout.tsx). Uses simple CSS transitions
// and body scroll lock while open — no extra library needed.
export function MobileNav(props: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close automatically when route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when the drawer is open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <>
      {/* Top bar — visible only below md */}
      <header className="md:hidden sticky top-0 z-30 bg-background border-b h-14 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <LogoMark className="size-5" />
          <span>Nomads Shorts</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {props.credits}
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Slide-in drawer */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 right-0 z-50 w-72 bg-card border-l shadow-xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b">
          <span className="font-semibold">Menu</span>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav className="p-3 space-y-1 text-sm">
          <NavLink href="/dashboard" icon={LayoutDashboard}>
            New clip
          </NavLink>
          <NavLink href="/dashboard/library" icon={Video}>
            My clips
          </NavLink>
          <NavLink href="/dashboard/billing" icon={CreditCard}>
            Billing
          </NavLink>
        </nav>

        <div className="p-3 border-t space-y-3 mt-auto absolute bottom-0 left-0 right-0">
          <div className="rounded-md border p-3 bg-background">
            <div className="text-xs text-muted-foreground">Credit balance</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-lg font-semibold">{props.credits}</span>
              <Link
                href="/dashboard/billing"
                className="text-xs font-medium underline underline-offset-2"
              >
                Top up
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              {props.avatarUrl && <AvatarImage src={props.avatarUrl} />}
              <AvatarFallback>
                {(props.displayName?.[0] ?? "?").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {props.displayName}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {props.email}
              </div>
            </div>
            <form action="/sign-out" method="post">
              <button
                type="submit"
                aria-label="Sign out"
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      <Icon className="size-4" />
      <span>{children}</span>
    </Link>
  );
}
