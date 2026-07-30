import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth callback. Supabase redirects here with `?code=...` after the user
// completes Google sign-in; we exchange the code for a session cookie and
// then send them wherever they were headed.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/sign-in?error=oauth", url.origin));
}
