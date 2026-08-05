import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// Reusable empty-state block. Illustration is a simple purpose-built SVG
// (no dependencies) that reads as "shorts" — a vertical 9:16 phone frame
// with a play triangle and dashed placeholder rectangles.

type Props = {
  title: string;
  description: string;
  cta?: { label: string; href: string };
  variant?: "video" | "clip" | "generic";
};

export function EmptyState({ title, description, cta, variant = "generic" }: Props) {
  return (
    <div className="rounded-lg border border-dashed bg-card/50 py-14 px-6 text-center">
      <div className="mx-auto w-40">
        <EmptyIllustration variant={variant} />
      </div>
      <h3 className="mt-6 font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>
      {cta && (
        <Link
          href={cta.href}
          className={buttonVariants({ className: "mt-6" })}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function EmptyIllustration({ variant }: { variant: Props["variant"] }) {
  return (
    <svg
      viewBox="0 0 160 120"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-hidden
    >
      <defs>
        <linearGradient id="phone-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--muted)" />
          <stop offset="100%" stopColor="var(--background)" />
        </linearGradient>
      </defs>

      {/* Center phone frame */}
      <rect
        x="66"
        y="10"
        width="28"
        height="100"
        rx="5"
        fill="url(#phone-gradient)"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      {variant === "clip" ? (
        // Dashed placeholder inside — "no clip yet"
        <rect
          x="70"
          y="14"
          width="20"
          height="92"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ) : (
        // Play triangle inside — "no video yet"
        <path
          d="M76 46 L86 60 L76 74 Z"
          fill="currentColor"
          fillOpacity="0.4"
        />
      )}

      {/* Ghost phones on either side */}
      <rect x="12" y="26" width="20" height="68" rx="4" fill="currentColor" fillOpacity="0.06" />
      <rect x="128" y="26" width="20" height="68" rx="4" fill="currentColor" fillOpacity="0.06" />

      {/* Sparkle decoration */}
      <g fill="currentColor" fillOpacity="0.3">
        <circle cx="50" cy="20" r="1.5" />
        <circle cx="110" cy="25" r="1" />
        <circle cx="140" cy="100" r="1.2" />
        <circle cx="22" cy="102" r="1" />
      </g>
    </svg>
  );
}
