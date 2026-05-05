import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/api/uploads/**",
      },
    ],
  },
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
