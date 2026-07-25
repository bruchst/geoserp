import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pinned so Next never picks a parent lockfile as the workspace root:
  // there are stray lockfiles in directories above this one.
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
