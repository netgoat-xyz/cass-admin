import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@netgoat/ui"],
  output: "standalone",
}

export default nextConfig
