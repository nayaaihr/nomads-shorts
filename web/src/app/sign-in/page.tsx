import Link from "next/link";
import { Scissors } from "lucide-react";
import { SignInForm } from "./sign-in-form";

type SearchParams = { next?: string; error?: string };

export default async function SignInPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const { next, error } = await props.searchParams;

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="flex items-center gap-2 justify-center font-semibold mb-8"
        >
          <Scissors className="size-5" />
          <span>Nomads Shorts</span>
        </Link>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-center">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">
            Continue with Google to save your clips.
          </p>
          {error === "oauth" && (
            <p className="mt-4 rounded-md bg-destructive/10 text-destructive text-sm p-3">
              Sign-in failed. Please try again.
            </p>
          )}
          <div className="mt-6">
            <SignInForm nextPath={next ?? "/dashboard"} />
          </div>
          <p className="mt-6 text-xs text-muted-foreground text-center">
            By continuing you agree to our{" "}
            <Link href="/legal/terms" className="underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
