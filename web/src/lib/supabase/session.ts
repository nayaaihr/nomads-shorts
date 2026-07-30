import { createClient } from "@/lib/supabase/server";

// Convenience wrapper for Server Components that need the current user.
// Returns null if not signed in OR if Supabase env vars aren't set yet
// (so the landing page renders during local setup before .env is filled in).
export async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getUserOrRedirect(redirectTo = "/sign-in") {
  const user = await getUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect(redirectTo);
  }
  return user!;
}
