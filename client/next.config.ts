import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@aztec/bb.js",
    "@noir-lang/noir_js",
    "@noir-lang/noir_wasm",
    "@noir-lang/types"
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};
export default nextConfig;
