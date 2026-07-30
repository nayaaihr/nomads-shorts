// Nomads Shorts logo mark — a stylised vertical-video frame with a play
// triangle inside. Reads as "short-form video" immediately. Uses the
// theme's `currentColor` so it inherits from surrounding text.

export function LogoMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* Vertical short frame (9:16 rounded rectangle) */}
      <rect x="6" y="2" width="12" height="20" rx="3" />
      {/* Play triangle centered */}
      <path d="M11 9l4 3-4 3V9z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LogoLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold ${className}`}>
      <LogoMark className="size-5" />
      <span>Nomads Shorts</span>
    </span>
  );
}
