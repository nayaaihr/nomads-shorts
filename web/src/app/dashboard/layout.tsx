import Link from "next/link";
import { Scissors, LayoutDashboard, Video, CreditCard, LogOut } from "lucide-react";
import { getUserOrRedirect } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserOrRedirect();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const credits = profile?.credits ?? 0;
  const displayName =
    profile?.full_name ??
    (user.email ? user.email.split("@")[0] : "there");
  const initials = (displayName?.[0] ?? "?").toUpperCase();

  return (
    <div className="flex-1 flex">
      <aside className="hidden md:flex w-60 shrink-0 border-r bg-card flex-col">
        <div className="h-14 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Scissors className="size-5" />
            <span>Nomads Shorts</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
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

        <div className="p-3 border-t space-y-3">
          <div className="rounded-md border p-3 bg-background">
            <div className="text-xs text-muted-foreground">Credit balance</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-lg font-semibold">{credits}</span>
              <Badge variant="secondary" className="text-xs">
                <Link href="/dashboard/billing">Top up</Link>
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground truncate">
                {user.email}
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

      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full">{children}</main>
      </div>
    </div>
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
