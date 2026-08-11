import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@hotela/ui", "@hotela/types", "@hotela/utils", "@hotela/api-client"],
  outputFileTracingRoot: path.join(__dirname, "../../.."),
};

export default nextConfig;
