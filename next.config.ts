import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jdxbxsufqjiinkfvvbda.supabase.co",
        pathname: "/storage/v1/object/public/catalog-media/**",
      },
    ],
  },
};

export default nextConfig;
