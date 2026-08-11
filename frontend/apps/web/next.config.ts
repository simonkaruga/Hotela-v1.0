import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@hotela/ui", "@hotela/types", "@hotela/utils", "@hotela/api-client"],
};

export default nextConfig;
