import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't pick up a stray lockfile
  // higher up the filesystem.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
