// Illustrated vertical-video mockup used on the landing hero. Purely
// decorative — an inline SVG of a phone-shaped 9:16 frame with a "clip"
// visual + a caption line. Zero dependencies, scales cleanly.

export function VerticalPreview({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 380"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Phone body */}
      <rect x="0" y="0" width="220" height="380" rx="28" fill="#0a0a0a" />
      {/* Screen inset */}
      <rect x="6" y="6" width="208" height="368" rx="24" fill="url(#sky)" />

      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6d365" />
          <stop offset="55%" stopColor="#fda085" />
          <stop offset="100%" stopColor="#f093fb" />
        </linearGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4facfe" />
          <stop offset="100%" stopColor="#00f2fe" />
        </linearGradient>
      </defs>

      {/* Distant mountains */}
      <path
        d="M6 220 L45 175 L80 200 L120 160 L170 210 L214 190 L214 260 L6 260 Z"
        fill="#3a3a5c"
        opacity="0.85"
      />
      <path
        d="M6 245 L60 210 L110 230 L155 200 L214 235 L214 280 L6 280 Z"
        fill="#232342"
        opacity="0.85"
      />

      {/* Water */}
      <rect x="6" y="270" width="208" height="80" fill="url(#sea)" />
      {/* Wave lines */}
      <path
        d="M10 290 Q60 285 110 292 T210 288"
        stroke="#ffffff"
        strokeWidth="1.2"
        opacity="0.35"
        fill="none"
      />
      <path
        d="M10 310 Q60 316 110 308 T210 314"
        stroke="#ffffff"
        strokeWidth="1"
        opacity="0.3"
        fill="none"
      />

      {/* Speaker silhouette (bottom center) */}
      <ellipse cx="110" cy="352" rx="30" ry="18" fill="#1c1c30" />
      <circle cx="110" cy="325" r="16" fill="#1c1c30" />

      {/* Top status pill */}
      <rect x="20" y="20" width="60" height="18" rx="9" fill="#000" opacity="0.55" />
      <text x="30" y="33" fill="#fff" fontSize="10" fontFamily="system-ui" fontWeight="600">
        LIVE
      </text>

      {/* Caption box (TikTok-style, bottom) */}
      <rect x="20" y="290" width="180" height="24" rx="6" fill="#000" opacity="0.7" />
      <text
        x="110"
        y="307"
        fill="#fff"
        fontSize="12"
        fontFamily="system-ui"
        fontWeight="700"
        textAnchor="middle"
      >
        Best sunset in Porto
      </text>

      {/* Home indicator */}
      <rect x="80" y="366" width="60" height="4" rx="2" fill="#fff" opacity="0.55" />
    </svg>
  );
}
