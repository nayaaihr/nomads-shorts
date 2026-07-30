import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

// Server-side Supabase client — reads/writes the auth cookies via next/headers.
// `cookies()` is async in Next.js 16; callers must await this factory.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabase.url(), env.supabase.anonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `set` throws when called from a Server Component. That's fine when
          // session refresh happens in the proxy — ignore here.
        }
      },
    },
  });
}
