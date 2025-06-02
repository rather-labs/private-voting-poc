import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@aztec/bb.js",
  ],
  outputFileTracingIncludes: {
    '/voting': [
      'node_modules/@aztec/bb.js/dest/node/barretenberg_wasm/**/*',
    ],
  },
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
