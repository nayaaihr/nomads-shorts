# Fly.io worker image — same Next.js app as Vercel, but also has
# yt-dlp + ffmpeg on the PATH so the video pipeline can actually run.
#
# The worker's job:
#   Inngest cloud → POSTs to /api/inngest → executes process-video steps
#     (download → transcribe → pick → clip → upload → finalize)
#
# Everything else (landing page, dashboard, checkout, etc.) is served by
# Vercel, not this container. But we deploy the SAME code so the /api/inngest
# handler here shares the pipeline modules under src/lib/pipeline.

FROM node:24-slim AS base

# System deps: ffmpeg for video, yt-dlp for downloads, ca-certs for HTTPS,
# python3-pip because yt-dlp is Python.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      ffmpeg \
      python3 \
      python3-pip \
      curl \
    && rm -rf /var/lib/apt/lists/*

# yt-dlp via pip so we get the latest release (Debian's apt version lags).
# opencv-python-headless powers the face-tracking reframe (no GUI deps
# needed — we only use it programmatically).
# --break-system-packages needed on Bookworm+ due to PEP 668.
RUN pip3 install --no-cache-dir --break-system-packages \
      yt-dlp \
      opencv-python-headless \
      numpy

# ---------- deps stage ----------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- build stage ----------
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* env vars must be present at build time — Next.js inlines
# them into the client bundle. Fly injects secrets during build automatically.
RUN npm run build

# ---------- runtime stage ----------
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy the built app and its deps.
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
# Python scripts (face-detect.py) — sit next to node_modules so relative
# path resolution works. Path referenced by src/lib/pipeline/face-detect.ts.
COPY --from=build /app/scripts ./scripts

EXPOSE 3000
CMD ["npm", "start"]
