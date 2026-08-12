import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep mongoose out of the Turbopack bundle on Vercel — it needs the
  // Node.js runtime with its native bindings.
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;